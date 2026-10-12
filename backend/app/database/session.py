from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.utils.config import settings
from app.database.base import Base

# Support SQLite connect args if needed
connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    # Import all models to ensure they are registered on Base.metadata
    from app.models import domain  # noqa
    Base.metadata.create_all(bind=engine)
