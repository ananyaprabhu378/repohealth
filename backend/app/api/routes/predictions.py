from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List

from app.core.database import get_db
import app.models.repo as models
from app.services.llm import LLMService

router = APIRouter(prefix="/predict", tags=["predictions"])

class PRDiff(BaseModel):
    files_changed: int
    insertions: int
    deletions: int
    modules_affected: List[str]

class PredictionResponse(BaseModel):
    risk_level: str
    predicted_health_change: float
    narrative: str

@router.post("/{owner}/{repo}", response_model=PredictionResponse)
def predict_pr_impact(owner: str, repo: str, diff: PRDiff, db: Session = Depends(get_db)):
    """
    Predicts the health impact of a PR before it merges.
    Uses purely statistical diff metadata to generate a sparse LLM narrative.
    """
    # 1. Simple heuristic risk calculation
    risk = "Low"
    health_drop = 0.0

    if diff.files_changed > 50 or diff.insertions > 1000:
        risk = "High"
        health_drop = -5.5
    elif diff.files_changed > 15 or len(diff.modules_affected) > 3:
        risk = "Medium"
        health_drop = -2.1

    # 2. Generate Narrative
    llm = LLMService()
    narrative = llm.generate_narrative(
        event_type="Pre-merge PR Impact",
        metadata={
            "files_changed": diff.files_changed,
            "insertions": diff.insertions,
            "modules_affected": diff.modules_affected,
            "calculated_risk": risk
        }
    )

    return PredictionResponse(
        risk_level=risk,
        predicted_health_change=health_drop,
        narrative=narrative
    )
