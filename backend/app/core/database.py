from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from app.core.config import settings

db_url = settings.DATABASE_URL
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

# Ajustar argumentos de conexión según el motor de base de datos
connect_args = {}
if db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    db_url,
    connect_args=connect_args,
    echo=(settings.ENVIRONMENT == "development_debug"),
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """
    Generador de sesión de base de datos para inyección de dependencias en FastAPI.
    Garantiza el cierre adecuado de la sesión tras cada petición.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
