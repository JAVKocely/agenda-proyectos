from contextlib import asynccontextmanager
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.core.config import settings
from app.core.database import engine, Base
from app.infrastructure.db.models import ProjectModel, TaskModel  # noqa: F401
from app.api.router import api_router

# Configuración de Logging estructurado
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger(__name__)


def run_auto_migrations():
    """
    Asegura que las columnas añadidas recientemente (como user_id)
    existan en la base de datos (PostgreSQL/SQLite) sin necesidad de migraciones manuales.
    """
    try:
        with engine.begin() as conn:
            # Para PostgreSQL (Neon)
            if "postgres" in engine.url.drivername:
                conn.execute(text("ALTER TABLE projects ADD COLUMN IF NOT EXISTS user_id VARCHAR(50) DEFAULT 'meli';"))
                conn.execute(text("CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects (user_id);"))
                logger.info("Migración automática: columna user_id verificada en PostgreSQL.")
            else:
                # Para SQLite local
                try:
                    conn.execute(text("ALTER TABLE projects ADD COLUMN user_id VARCHAR(50) DEFAULT 'meli';"))
                except Exception:
                    pass  # Columna ya existe
    except Exception as e:
        logger.error("Error al verificar/migrar columnas de base de datos: %s", e)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Inicialización de esquemas y auto-migración
    logger.info("Inicializando esquemas de base de datos (%s)...", settings.DATABASE_URL)
    Base.metadata.create_all(bind=engine)
    run_auto_migrations()
    logger.info("Esquemas y columnas de base de datos listos.")
    yield
    logger.info("Cerrando aplicación...")


app = FastAPI(
    title="Agenda y Seguimiento de Proyectos con IA",
    description=(
        "Backend API modular con arquitectura limpia y agente organizador asistido por LLM "
        "con Structured Outputs (JSON Schema estricto)."
    ),
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configuración de CORS con soporte garantizado para producción y desarrollo
origins = list(settings.cors_origins_list)
for domain in ["https://www.mml.solutions", "https://mml.solutions"]:
    if domain not in origins:
        origins.append(domain)

if not origins or settings.ENVIRONMENT == "development":
    origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar enrutador v1 y en la raíz para máxima compatibilidad
app.include_router(api_router, prefix="/api/v1")
app.include_router(api_router)


@app.get("/health", tags=["Sistema"])
def health_check():
    """
    Endpoint de verificación de salud del servicio.
    """
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
        "ai_provider": settings.AI_PROVIDER
    }
