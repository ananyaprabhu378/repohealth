from sqlalchemy import create_engine
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings
import logging

logger = logging.getLogger("aethergraph")

def create_resilient_engine():
    pg_uri = settings.SQLALCHEMY_DATABASE_URI
    if pg_uri and "postgresql" in pg_uri:
        try:
            # Short timeout connect parameters to fail fast if PG is unreachable
            logger.info("Attempting connection to PostgreSQL...")
            pg_engine = create_engine(pg_uri, pool_pre_ping=True, connect_args={"connect_timeout": 3})
            # Test actual connection
            with pg_engine.connect() as conn:
                pass
            logger.info("Successfully connected to PostgreSQL database.")
            return pg_engine
        except OperationalError:
            logger.warning("PostgreSQL database is offline or unreachable. Falling back to local SQLite.")

    # SQLite Fallback Engine
    sqlite_uri = "sqlite:///./aethergraph.db"
    logger.info(f"Using local SQLite database: {sqlite_uri}")
    return create_engine(sqlite_uri, connect_args={"check_same_thread": False})

engine = create_resilient_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

