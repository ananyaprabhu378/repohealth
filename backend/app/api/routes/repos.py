from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List

from app.core.database import get_db
import app.models.repo as models
from app.services.ingestion import IngestionService

router = APIRouter(prefix="/repos", tags=["repositories"])

class RepoCreate(BaseModel):
    url: str

class RepoResponse(BaseModel):
    id: str
    name: str
    owner: str
    status: str

    class Config:
        orm_mode = True

@router.post("/", response_model=RepoResponse)
def ingest_repo(repo_in: RepoCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    # 1. Register repo in DB immediately with status 'pending'
    parts = repo_in.url.rstrip(".git").split("/")
    if len(parts) < 2:
        raise HTTPException(status_code=400, detail="Invalid Git URL")
    
    owner = parts[-2]
    repo_name = parts[-1]
    repo_id = f"{owner}/{repo_name}"

    db_repo = db.query(models.Repository).filter(models.Repository.id == repo_id).first()
    if not db_repo:
        db_repo = models.Repository(
            id=repo_id,
            url=repo_in.url,
            name=repo_name,
            owner=owner,
            status="pending"
        )
        db.add(db_repo)
        db.commit()
        db.refresh(db_repo)
    elif db_repo.status in ("completed", "failed"):
        # Clear old cached 100-commit limits to make way for the new 1000-commit deep analysis
        db.query(models.GraphEdge).filter(models.GraphEdge.commit_hash.in_(
            db.query(models.Commit.hash).filter(models.Commit.repo_id == repo_id)
        )).delete(synchronize_session=False)
        db.query(models.GraphNode).filter(models.GraphNode.commit_hash.in_(
            db.query(models.Commit.hash).filter(models.Commit.repo_id == repo_id)
        )).delete(synchronize_session=False)
        db.query(models.Commit).filter(models.Commit.repo_id == repo_id).delete(synchronize_session=False)
        db_repo.status = "pending"
        db.commit()

    # 2. Trigger background task for ingestion
    service = IngestionService(db)
    background_tasks.add_task(service.ingest_repository, repo_in.url)

    return db_repo

@router.get("/", response_model=List[RepoResponse])
def get_repos(db: Session = Depends(get_db)):
    return db.query(models.Repository).all()

@router.get("/{owner}/{repo}", response_model=RepoResponse)
def get_repo(owner: str, repo: str, db: Session = Depends(get_db)):
    repo_id = f"{owner}/{repo}"
    db_repo = db.query(models.Repository).filter(models.Repository.id == repo_id).first()
    if not db_repo:
        raise HTTPException(status_code=404, detail="Repository not found")
    return db_repo

import redis.asyncio as aioredis
from sse_starlette.sse import EventSourceResponse
import json
import asyncio

@router.get("/{owner}/{repo}/progress")
async def stream_ingestion_progress(owner: str, repo: str):
    repo_id = f"{owner}/{repo}"
    r = aioredis.Redis(host='localhost', port=6379, db=0)

    async def event_generator():
        pubsub = r.pubsub()
        try:
            await pubsub.subscribe(f"progress_channel:{repo_id}")
            
            # Check initial state
            initial = await r.get(f"progress:{repo_id}")
            if initial:
                yield {
                    "event": "message",
                    "data": initial.decode('utf-8')
                }

            while True:
                # Check for message in non-blocking async way
                message = await pubsub.get_message(ignore_subscribe_messages=True, timeout=1.0)
                if message:
                    yield {
                        "event": "message",
                        "data": message['data'].decode('utf-8')
                    }
                await asyncio.sleep(0.5)
        except Exception as e:
            yield {
                "event": "message",
                "data": json.dumps({"current": 0, "total": 100, "status": f"failed: {str(e)}"})
            }
        finally:
            try:
                await pubsub.unsubscribe()
                await r.close()
            except Exception:
                pass

    return EventSourceResponse(event_generator())


