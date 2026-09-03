from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from app.infrastructure.db.repositories import ProjectRepository, TaskRepository
from app.infrastructure.db.models import ProjectModel, TaskModel


class ProjectService:
    def __init__(self, db: Session):
        self.project_repo = ProjectRepository(db)
        self.task_repo = TaskRepository(db)

    def list_projects(
        self,
        status: Optional[str] = None,
        search: Optional[str] = None,
        user_id: Optional[str] = None
    ) -> List[ProjectModel]:
        return self.project_repo.get_all(status=status, search=search, user_id=user_id)

    def get_project(self, project_id: str, user_id: Optional[str] = None) -> Optional[ProjectModel]:
        return self.project_repo.get_by_id(project_id, user_id=user_id)

    def create_project(
        self,
        project_data: Dict[str, Any],
        tasks_data: Optional[List[Dict[str, Any]]] = None,
        user_id: Optional[str] = None
    ) -> ProjectModel:
        if user_id:
            project_data["user_id"] = user_id
        return self.project_repo.create(project_data, tasks_data)

    def update_project(
        self,
        project_id: str,
        update_data: Dict[str, Any]
    ) -> Optional[ProjectModel]:
        return self.project_repo.update(project_id, update_data)

    def delete_project(self, project_id: str) -> bool:
        return self.project_repo.delete(project_id)

    # Métodos de tareas
    def get_task(self, task_id: str) -> Optional[TaskModel]:
        return self.task_repo.get_by_id(task_id)

    def add_task(self, project_id: str, task_data: Dict[str, Any]) -> Optional[TaskModel]:
        project = self.project_repo.get_by_id(project_id)
        if not project:
            return None
        return self.task_repo.create(project_id, task_data)

    def update_task(self, task_id: str, update_data: Dict[str, Any]) -> Optional[TaskModel]:
        return self.task_repo.update(task_id, update_data)

    def delete_task(self, task_id: str) -> bool:
        return self.task_repo.delete(task_id)
