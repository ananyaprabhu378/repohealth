from pydantic_settings import BaseSettings
import os
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "AetherGraph"
    
    # Database
    POSTGRES_SERVER: str = os.getenv("POSTGRES_SERVER", "localhost")
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "aethergraph")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "aethergraph_password")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "aethergraph")
    
    @property
    def SQLALCHEMY_DATABASE_URI(self) -> Optional[str]:
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}/{self.POSTGRES_DB}"

    # LLM Settings
    OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY")

    # Ingestion Settings
    REPOS_DIR: str = os.getenv("REPOS_DIR", "./.aethergraph/repos")

settings = Settings()
