import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.ai_planner_service import AIPlannerService
from app.api.schemas.ai_dtos import AIGenerateProjectRequest
from app.api.schemas.project_dtos import ProjectDetailResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ai", tags=["Agente IA"])


@router.post("/generate-project", response_model=ProjectDetailResponse, status_code=status.HTTP_201_CREATED)
async def generate_project_from_prompt(
    payload: AIGenerateProjectRequest,
    db: Session = Depends(get_db)
):
    """
    Agente Organizador de Proyectos:
    Recibe notas o alcance en texto libre, invoca al LLM mediante Structured Outputs
    con esquema estricto (JSON Schema), crea el proyecto con sus tareas ordenadas
    y retorna la entidad completa lista para ser consumida por el cliente.
    """
    service = AIPlannerService(db)
    try:
        project = await service.generate_and_create_project(payload.prompt)
        return project
    except ValueError as ve:
        logger.warning("Petición rechazada en generación con IA: %s", ve)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )
    except RuntimeError as re:
        logger.error("Error en servicio de IA: %s", re)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(re)
        )
    except Exception as e:
        logger.error("Error inesperado en endpoint de IA: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ocurrió un error inesperado al procesar el proyecto con IA: {str(e)}"
        )
