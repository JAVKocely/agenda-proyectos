from contextlib import asynccontextmanager
import logging
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
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
    Asegura que las tablas y columnas añadidas recientemente (como user_id, tasks.assigned_to, etc.)
    existan en la base de datos de forma independiente y tolerante a fallos.
    """
    is_postgres = "postgres" in engine.url.drivername

    if is_postgres:
        statements = [
            "ALTER TABLE projects ADD COLUMN IF NOT EXISTS user_id VARCHAR(50) DEFAULT 'meli';",
            "CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects (user_id);",
            "ALTER TABLE tasks ADD COLUMN IF NOT EXISTS estimated_duration VARCHAR(50) DEFAULT '1 día';",
            "ALTER TABLE tasks ADD COLUMN IF NOT EXISTS assigned_to VARCHAR(50);",
            """
            CREATE TABLE IF NOT EXISTS users (
                id VARCHAR(50) PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                color VARCHAR(50) DEFAULT 'indigo',
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            );
            """,
            """
            INSERT INTO users (id, name, color)
            VALUES 
                ('meli', 'MELI', 'fuchsia'),
                ('jhon', 'JHON', 'cyan')
            ON CONFLICT (id) DO NOTHING;
            """
        ]
    else:
        statements = [
            "ALTER TABLE projects ADD COLUMN user_id VARCHAR(50) DEFAULT 'meli';",
            "ALTER TABLE tasks ADD COLUMN estimated_duration VARCHAR(50) DEFAULT '1 día';",
            "ALTER TABLE tasks ADD COLUMN assigned_to VARCHAR(50);",
            """
            CREATE TABLE IF NOT EXISTS users (
                id VARCHAR(50) PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                color VARCHAR(50) DEFAULT 'indigo',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            """,
            """
            INSERT OR IGNORE INTO users (id, name, color)
            VALUES 
                ('meli', 'MELI', 'fuchsia'),
                ('jhon', 'JHON', 'cyan');
            """
        ]

    for sql in statements:
        try:
            with engine.begin() as conn:
                conn.execute(text(sql))
        except Exception as e:
            # En SQLite un ALTER TABLE repetido arroja error 'duplicate column', lo cual es esperado
            logger.debug("Sentencia de migración finalizada/omitida: %s (%s)", sql[:30].strip(), e)

    logger.info("Migraciones automáticas verificadas para %s.", "PostgreSQL" if is_postgres else "SQLite")


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

# Configuración de CORS con soporte universal garantizado para cualquier dominio (mml.solutions, Vercel, localhost)
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://.*",
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


@app.get("/diagnostic", tags=["Sistema"])
def diagnostic():
    """
    Endpoint de diagnóstico para inspeccionar columnas reales en la base de datos y forzar migración.
    """
    run_auto_migrations()
    cols = {}
    with engine.connect() as conn:
        for t in ["projects", "tasks", "users"]:
            try:
                res = conn.execute(text(f"SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '{t}';"))
                cols[t] = [dict(row._mapping) for row in res]
            except Exception as e:
                cols[t] = str(e)
    return {"status": "ok", "columns": cols}


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    import traceback
    error_trace = traceback.format_exc()
    logger.error("Error no controlado en %s: %s\n%s", request.url.path, exc, error_trace)
    return JSONResponse(
        status_code=500,
        content={
            "detail": str(exc),
            "path": request.url.path,
            "error_type": type(exc).__name__,
        }
    )
