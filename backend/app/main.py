from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
import app.models.repo as models
import app.models.user as user_models

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AetherGraph - Temporal Intelligence Engine API",
    version="0.1.0"
)

from app.api.routes import repos, metrics, graph, predictions, auth

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1")
app.include_router(repos.router, prefix="/api/v1")
app.include_router(metrics.router, prefix="/api/v1")
app.include_router(graph.router, prefix="/api/v1")
app.include_router(predictions.router, prefix="/api/v1")

@app.get("/")
def read_root():
    return {"message": "Welcome to AetherGraph API"}

@app.get("/health")
def health_check():
    return {"status": "ok"}
