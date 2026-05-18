import os
from git import Repo
from pydriller import Repository as PyDrillerRepository
from sqlalchemy.orm import Session
import app.models.repo as models
from app.core.config import settings
from app.services.analysis import AnalysisService
import json
import redis

# Connect to redis to store ingestion progress for SSE
try:
    r_client = redis.Redis(host='localhost', port=6379, db=0)
except Exception:
    r_client = None

class IngestionService:
    def __init__(self, db: Session):
        self.db = db
        self.analysis_service = AnalysisService()

    def set_progress(self, repo_id: str, current: int, total: int, status: str):
        if r_client:
            try:
                progress_data = {
                    "current": current,
                    "total": total,
                    "status": status
                }
                r_client.set(f"progress:{repo_id}", json.dumps(progress_data))
                r_client.publish(f"progress_channel:{repo_id}", json.dumps(progress_data))
            except Exception:
                pass

    def ingest_repository(self, git_url: str):
        os.makedirs(settings.REPOS_DIR, exist_ok=True)
        
        parts = git_url.rstrip(".git").split("/")
        if len(parts) < 2:
            raise ValueError("Invalid Git URL")
        
        owner = parts[-2]
        repo_name = parts[-1]
        repo_id = f"{owner}/{repo_name}"

        # 1. Register or update repo in DB
        db_repo = self.db.query(models.Repository).filter(models.Repository.id == repo_id).first()
        if not db_repo:
            db_repo = models.Repository(
                id=repo_id,
                url=git_url,
                name=repo_name,
                owner=owner,
                status="analyzing"
            )
            self.db.add(db_repo)
            self.db.commit()
            self.db.refresh(db_repo)
        else:
            db_repo.status = "analyzing"
            self.db.commit()

        # 2. Clone or pull repo
        local_path = os.path.join(settings.REPOS_DIR, repo_name)
        self.set_progress(repo_id, 0, 100, "cloning")
        try:
            if not os.path.exists(local_path):
                Repo.clone_from(git_url, local_path)
            else:
                repo = Repo(local_path)
                origin = repo.remotes.origin
                origin.pull()
        except Exception as e:
            db_repo.status = "failed"
            self.db.commit()
            self.set_progress(repo_id, 0, 100, f"failed: {str(e)}")
            return db_repo

        # 3. Analyze commits dynamically (Limit to last 100 for safety, but can handle large)
        self.set_progress(repo_id, 10, 100, "parsing_commits")
        
        commits_to_process = []
        try:
            for commit in PyDrillerRepository(local_path).traverse_commits():
                commits_to_process.append(commit)
        except Exception as e:
            db_repo.status = "failed"
            self.db.commit()
            self.set_progress(repo_id, 0, 100, f"failed: {str(e)}")
            return db_repo

        total_commits = len(commits_to_process)
        # Scale to process max 1000 commits to support large 500+ commit repositories fully
        processed_commits = commits_to_process[-1000:]
        total_to_process = len(processed_commits)

        # Simple tracking of file complexities and co-change weights
        file_complexities = {}
        co_changes = {}

        for idx, commit in enumerate(processed_commits):
            # Check if commit already parsed
            db_commit = self.db.query(models.Commit).filter(models.Commit.hash == commit.hash).first()
            if db_commit:
                continue

            self.set_progress(repo_id, idx + 1, total_to_process, f"Analyzing commit {commit.hash[:8]}")

            # Calculate modified files (differential analysis)
            modified_files = []
            complexity_sum = 0
            complexity_count = 0

            for m_file in commit.modified_files:
                if m_file.new_path:
                    modified_files.append(m_file.new_path)
                    # Calculate complexity for Python files
                    if m_file.new_path.endswith(".py") and m_file.content:
                        # Write temp content for radon analysis
                        temp_file_path = os.path.join(local_path, m_file.new_path)
                        res = self.analysis_service.analyze_python_file(temp_file_path)
                        if res:
                            file_complexities[m_file.new_path] = res["complexity"]
                    elif m_file.new_path.endswith((".js", ".ts", ".tsx")):
                        # Dummy complexity based on line count for JS/TS
                        lines = len(m_file.source_code.splitlines()) if m_file.source_code else 0
                        file_complexities[m_file.new_path] = max(1.0, lines / 100.0)

            # Build co-change edges
            for i in range(len(modified_files)):
                for j in range(i + 1, len(modified_files)):
                    f1, f2 = sorted([modified_files[i], modified_files[j]])
                    edge_key = (f1, f2)
                    co_changes[edge_key] = co_changes.get(edge_key, 0.0) + 1.0

            # Calculate commit metrics
            for f in modified_files:
                if f in file_complexities:
                    complexity_sum += file_complexities[f]
                    complexity_count += 1

            avg_complexity = complexity_sum / complexity_count if complexity_count > 0 else 1.0
            
            # Simple Health Score formula: start at 100, subtract based on churn and complexity
            churn = len(modified_files)
            health_score = max(10, 100 - (avg_complexity * 3) - (churn * 0.5))

            db_commit = models.Commit(
                hash=commit.hash,
                repo_id=repo_id,
                author_name=commit.author.name,
                author_email=commit.author.email,
                message=commit.msg,
                timestamp=commit.committer_date,
                health_score=health_score,
                complexity=avg_complexity,
                churn=churn
            )
            self.db.add(db_commit)

            # Add nodes for current commit
            for f in modified_files:
                db_node = models.GraphNode(
                    commit_hash=commit.hash,
                    node_id=f,
                    node_type="file",
                    complexity=file_complexities.get(f, 1.0),
                    churn=churn
                )
                self.db.add(db_node)

            # Add edges for current commit
            for (source, target), weight in co_changes.items():
                db_edge = models.GraphEdge(
                    commit_hash=commit.hash,
                    source_id=source,
                    target_id=target,
                    edge_type="co-changed",
                    weight=weight
                )
                self.db.add(db_edge)

            # Commit periodically to show streaming updates
            if idx % 50 == 0:
                self.db.commit()

        self.db.commit()

        # Update repo status to completed
        db_repo.status = "completed"
        self.db.commit()

        self.set_progress(repo_id, total_to_process, total_to_process, "completed")
        return db_repo
