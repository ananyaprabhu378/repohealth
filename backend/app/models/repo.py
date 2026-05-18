from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime

class Repository(Base):
    __tablename__ = "repositories"

    id = Column(String, primary_key=True, index=True) # e.g. owner/repo
    url = Column(String, unique=True, index=True)
    name = Column(String)
    owner = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    status = Column(String, default="pending") # pending, analyzing, completed, failed
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True) # Optional for public repos, required for private ones

    commits = relationship("Commit", back_populates="repository")

class Commit(Base):
    __tablename__ = "commits"

    hash = Column(String, primary_key=True, index=True)
    repo_id = Column(String, ForeignKey("repositories.id"), index=True)
    author_name = Column(String)
    author_email = Column(String)
    message = Column(String)
    timestamp = Column(DateTime)
    
    # Pre-calculated health at this commit
    health_score = Column(Float, nullable=True)
    complexity = Column(Float, nullable=True)
    churn = Column(Integer, nullable=True)

    repository = relationship("Repository", back_populates="commits")
    nodes = relationship("GraphNode", back_populates="commit")
    edges = relationship("GraphEdge", back_populates="commit")

class GraphNode(Base):
    __tablename__ = "graph_nodes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    commit_hash = Column(String, ForeignKey("commits.hash"), index=True)
    node_id = Column(String, index=True) # file path or function name
    node_type = Column(String) # file, function, module, developer
    complexity = Column(Float, nullable=True)
    churn = Column(Integer, default=0)

    commit = relationship("Commit", back_populates="nodes")

class GraphEdge(Base):
    __tablename__ = "graph_edges"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    commit_hash = Column(String, ForeignKey("commits.hash"), index=True)
    source_id = Column(String, index=True)
    target_id = Column(String, index=True)
    edge_type = Column(String) # imports, co-changed
    weight = Column(Float, default=1.0)

    commit = relationship("Commit", back_populates="edges")
