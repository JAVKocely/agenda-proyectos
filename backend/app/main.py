from contextlib import asynccontextmanager
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Inicialización de tablas en la base de datos
    logger.info("Inicializando esquemas de base de datos (%s)...", settings.DATABASE_URL)
    Base.metadata.create_all(bind=engine)
    logger.info("Esquemas de base de datos listos.")
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

# Configuración de CORS
origins = settings.cors_origins_list
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
