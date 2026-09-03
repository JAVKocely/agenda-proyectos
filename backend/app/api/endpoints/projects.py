from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, Header
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.project_service import ProjectService
from app.api.schemas.project_dtos import (
    ProjectSummaryResponse,
    ProjectDetailResponse,
    ProjectCreateRequest,
    ProjectUpdateRequest
)
from app.api.schemas.task_dtos import TaskCreateRequest, TaskResponse

router = APIRouter(prefix="/projects", tags=["Proyectos"])


def get_current_user_id(x_user_id: Optional[str] = Header("meli", alias="X-User-Id")) -> str:
    """Extrae y normaliza el identificador de usuario (meli o jhon)."""
    return (x_user_id or "meli").strip().lower()


@router.get("", response_model=List[ProjectSummaryResponse])
def list_projects(
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = Query(None),
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Lista todos los proyectos aislados para el usuario activo (MELI o JHON)
    con métricas de progreso computadas en tiempo real.
    """
    service = ProjectService(db)
    return service.list_projects(status=status_filter, search=search, user_id=user_id)


@router.post("", response_model=ProjectDetailResponse, status_code=status.HTTP_201_CREATED)
def create_project(
    payload: ProjectCreateRequest,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Crea un proyecto manual en la consola del usuario autenticado (MELI o JHON).
    """
    service = ProjectService(db)
    project_data = payload.model_dump(exclude={"tasks"}, exclude_unset=True)
    project_data["user_id"] = user_id
    tasks_data = [t.model_dump() for t in payload.tasks] if payload.tasks else None
    created = service.create_project(project_data=project_data, tasks_data=tasks_data, user_id=user_id)
    return created


@router.get("/{project_id}", response_model=ProjectDetailResponse)
def get_project_detail(
    project_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Obtiene la vista detallada de un proyecto, verificando pertenencia al usuario.
    """
    service = ProjectService(db)
    project = service.get_project(project_id, user_id=user_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Proyecto con id '{project_id}' no encontrado o no pertenece a tu espacio de trabajo."
        )
    return project


@router.patch("/{project_id}", response_model=ProjectDetailResponse)
def update_project(
    project_id: str,
    payload: ProjectUpdateRequest,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Actualiza título, descripción, estado o fechas límite de un proyecto del usuario.
    """
    service = ProjectService(db)
    existing = service.get_project(project_id, user_id=user_id)
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Proyecto con id '{project_id}' no encontrado."
        )
    update_data = payload.model_dump(exclude_unset=True)
    updated = service.update_project(project_id, update_data)
    return updated


@router.delete("/{project_id}", status_code=status.HTTP_200_OK)
def delete_project(
    project_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Elimina un proyecto y todas sus tareas asociadas en cascada.
    """
    service = ProjectService(db)
    existing = service.get_project(project_id, user_id=user_id)
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Proyecto con id '{project_id}' no encontrado."
        )
    service.delete_project(project_id)
    return {"detail": "Proyecto y tareas asociadas eliminados correctamente."}


@router.post("/{project_id}/tasks", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def add_task_to_project(
    project_id: str,
    payload: TaskCreateRequest,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Añade una nueva tarea o fase a un proyecto existente del usuario.
    """
    service = ProjectService(db)
    existing = service.get_project(project_id, user_id=user_id)
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Proyecto con id '{project_id}' no encontrado."
        )
    task_data = payload.model_dump(exclude_unset=True)
    created_task = service.add_task(project_id, task_data)
    return created_task
