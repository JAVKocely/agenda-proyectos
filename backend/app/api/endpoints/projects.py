from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
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


@router.get("", response_model=List[ProjectSummaryResponse])
def list_projects(
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Lista todos los proyectos con métricas de progreso computadas.
    Permite filtrar por estado (active, paused, completed) y búsqueda textual.
    """
    service = ProjectService(db)
    return service.list_projects(status=status_filter, search=search)


@router.post("", response_model=ProjectDetailResponse, status_code=status.HTTP_201_CREATED)
def create_project(
    payload: ProjectCreateRequest,
    db: Session = Depends(get_db)
):
    """
    Crea un proyecto de forma manual, opcionalmente con un conjunto inicial de tareas.
    """
    service = ProjectService(db)
    project_data = payload.model_dump(exclude={"tasks"}, exclude_unset=True)
    tasks_data = [t.model_dump() for t in payload.tasks] if payload.tasks else None
    created = service.create_project(project_data=project_data, tasks_data=tasks_data)
    return created


@router.get("/{project_id}", response_model=ProjectDetailResponse)
def get_project_detail(
    project_id: str,
    db: Session = Depends(get_db)
):
    """
    Obtiene la vista detallada de un proyecto, incluyendo sus tareas ordenadas y progreso.
    """
    service = ProjectService(db)
    project = service.get_project(project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Proyecto con id '{project_id}' no encontrado."
        )
    return project


@router.patch("/{project_id}", response_model=ProjectDetailResponse)
def update_project(
    project_id: str,
    payload: ProjectUpdateRequest,
    db: Session = Depends(get_db)
):
    """
    Actualiza título, descripción, estado o fechas límite de un proyecto.
    """
    service = ProjectService(db)
    update_data = payload.model_dump(exclude_unset=True)
    updated = service.update_project(project_id, update_data)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Proyecto con id '{project_id}' no encontrado."
        )
    return updated


@router.delete("/{project_id}", status_code=status.HTTP_200_OK)
def delete_project(
    project_id: str,
    db: Session = Depends(get_db)
):
    """
    Elimina un proyecto y todas sus tareas asociadas en cascada.
    """
    service = ProjectService(db)
    deleted = service.delete_project(project_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Proyecto con id '{project_id}' no encontrado."
        )
    return {"detail": "Proyecto y tareas asociadas eliminados correctamente."}


@router.post("/{project_id}/tasks", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def add_task_to_project(
    project_id: str,
    payload: TaskCreateRequest,
    db: Session = Depends(get_db)
):
    """
    Añade una nueva tarea o fase a un proyecto existente.
    """
    service = ProjectService(db)
    task_data = payload.model_dump(exclude_unset=True)
    created_task = service.add_task(project_id, task_data)
    if not created_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Proyecto con id '{project_id}' no encontrado."
        )
    return created_task
