from pydantic_settings import BaseSettings
from typing import Optional
from pathlib import Path

class Settings(BaseSettings):
    APP_NAME: str = "RevIntel"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    API_PREFIX: str = "/api"
    
    # Database Settings
    DATABASE_URL: str = "sqlite:///./revintel.db"
    
    # Security
    SECRET_KEY: str = "revintel-secret-key-2026-development"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    
    # AI / LLM Configuration
    LLM_PROVIDER: str = "mock"
    LLM_API_KEY: Optional[str] = None
    LLM_MODEL_NAME: str = "gpt-4o"
    
    # Storage Paths
    UPLOAD_DIR: Path = Path("./data/raw")
    PROCESSED_DIR: Path = Path("./data/processed")
    SAMPLE_DIR: Path = Path("./data/sample")
    MODEL_DIR: Path = Path("./models")
    
    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
