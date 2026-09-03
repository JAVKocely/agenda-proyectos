from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.project_service import ProjectService
from app.api.schemas.task_dtos import TaskResponse, TaskUpdateRequest

router = APIRouter(prefix="/tasks", tags=["Tareas"])


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(
    task_id: str,
    db: Session = Depends(get_db)
):
    """
    Obtiene los datos de una tarea individual.
    """
    service = ProjectService(db)
    task = service.get_task(task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tarea con id '{task_id}' no encontrada."
        )
    return task


@router.patch("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: str,
    payload: TaskUpdateRequest,
    db: Session = Depends(get_db)
):
    """
    Actualiza estado (pending, in_progress, completed), prioridad, título u orden de la tarea.
    Permite el recálculo reactivo de avance al marcar como 'completed'.
    """
    service = ProjectService(db)
    update_data = payload.model_dump(exclude_unset=True)
    updated = service.update_task(task_id, update_data)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tarea con id '{task_id}' no encontrada."
        )
    return updated


@router.delete("/{task_id}", status_code=status.HTTP_200_OK)
def delete_task(
    task_id: str,
    db: Session = Depends(get_db)
):
    """
    Elimina una tarea individual del proyecto.
    """
    service = ProjectService(db)
    deleted = service.delete_task(task_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tarea con id '{task_id}' no encontrada."
        )
    return {"detail": "Tarea eliminada correctamente."}
