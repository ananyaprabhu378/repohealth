from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional

from app.core.database import get_db
import app.models.repo as models

router = APIRouter(prefix="/graph", tags=["graph"])

class Node(BaseModel):
    id: str
    type: str
    complexity: Optional[float]
    churn: Optional[int]

class Edge(BaseModel):
    source: str
    target: str
    type: str
    weight: Optional[float]

class GraphResponse(BaseModel):
    nodes: List[Node]
    edges: List[Edge]

@router.get("/{owner}/{repo}/commit/{commit_hash}", response_model=GraphResponse)
def get_temporal_graph(owner: str, repo: str, commit_hash: str, db: Session = Depends(get_db)):
    """Get the knowledge graph for a specific commit."""
    repo_id = f"{owner}/{repo}"
    
    db_commit = db.query(models.Commit).filter(
        models.Commit.repo_id == repo_id,
        models.Commit.hash == commit_hash
    ).first()

    if not db_commit:
        raise HTTPException(status_code=404, detail="Commit not found")

    nodes = [
        Node(
            id=n.node_id, 
            type=n.node_type, 
            complexity=n.complexity, 
            churn=n.churn
        ) for n in db_commit.nodes
    ]

    edges = [
        Edge(
            source=e.source_id,
            target=e.target_id,
            type=e.edge_type,
            weight=e.weight
        ) for e in db_commit.edges
    ]

    return GraphResponse(nodes=nodes, edges=edges)
