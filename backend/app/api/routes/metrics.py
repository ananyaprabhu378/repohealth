from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from app.core.database import get_db
import app.models.repo as models

router = APIRouter(prefix="/metrics", tags=["metrics"])

class CommitMetrics(BaseModel):
    hash: str
    message: str
    timestamp: datetime
    author_name: Optional[str]
    author_email: Optional[str]
    health_score: Optional[float]
    complexity: Optional[float]
    churn: Optional[int]

    class Config:
        orm_mode = True

@router.get("/{owner}/{repo}/health", response_model=List[CommitMetrics])
def get_health_timeline(owner: str, repo: str, db: Session = Depends(get_db)):
    """Get the health score and metrics over time (by commit) for a repository."""
    repo_id = f"{owner}/{repo}"
    
    # Check if repo exists
    db_repo = db.query(models.Repository).filter(models.Repository.id == repo_id).first()
    if not db_repo:
        raise HTTPException(status_code=404, detail="Repository not found")

    # Get commits ordered by timestamp
    commits = db.query(models.Commit)\
        .filter(models.Commit.repo_id == repo_id)\
        .order_by(models.Commit.timestamp.asc())\
        .all()
    
    return commits
