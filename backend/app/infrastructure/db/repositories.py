from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select, or_
from app.infrastructure.db.models import ProjectModel, TaskModel
from app.domain.enums import ProjectStatus, TaskStatus


class ProjectRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(
        self,
        status: Optional[str] = None,
        search: Optional[str] = None
    ) -> List[ProjectModel]:
        stmt = (
            select(ProjectModel)
            .options(joinedload(ProjectModel.tasks))
            .order_by(ProjectModel.created_at.desc())
        )

        if status:
            stmt = stmt.filter(ProjectModel.status == status)

        if search:
            search_pattern = f"%{search.strip()}%"
            stmt = stmt.filter(
                or_(
                    ProjectModel.title.ilike(search_pattern),
                    ProjectModel.description.ilike(search_pattern)
                )
            )

        result = self.db.execute(stmt)
        return list(result.unique().scalars().all())

    def get_by_id(self, project_id: str) -> Optional[ProjectModel]:
        stmt = (
            select(ProjectModel)
            .options(joinedload(ProjectModel.tasks))
            .filter(ProjectModel.id == project_id)
        )
        result = self.db.execute(stmt)
        return result.unique().scalar_one_or_none()

    def create(
        self,
        project_data: Dict[str, Any],
        tasks_data: Optional[List[Dict[str, Any]]] = None
    ) -> ProjectModel:
        project = ProjectModel(**project_data)
        self.db.add(project)
        self.db.flush()  # Para obtener el id generado

        if tasks_data:
            for idx, task_info in enumerate(tasks_data):
                order_val = task_info.get("order", idx + 1)
                task = TaskModel(
                    project_id=project.id,
                    title=task_info["title"],
                    description=task_info.get("description"),
                    priority=task_info.get("priority", "medium"),
                    status=task_info.get("status", TaskStatus.PENDING.value),
                    order=order_val,
                    group_name=task_info.get("group_name", "Fase Principal"),
                    due_date=task_info.get("due_date")
                )
                self.db.add(task)

        self.db.commit()
        self.db.refresh(project)
        return project

    def update(self, project_id: str, update_data: Dict[str, Any]) -> Optional[ProjectModel]:
        project = self.get_by_id(project_id)
        if not project:
            return None

        for key, value in update_data.items():
            if hasattr(project, key) and value is not None:
                setattr(project, key, value)

        self.db.commit()
        self.db.refresh(project)
        return project

    def delete(self, project_id: str) -> bool:
        project = self.get_by_id(project_id)
        if not project:
            return False

        self.db.delete(project)
        self.db.commit()
        return True


class TaskRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, task_id: str) -> Optional[TaskModel]:
        stmt = select(TaskModel).filter(TaskModel.id == task_id)
        return self.db.execute(stmt).scalar_one_or_none()

    def get_by_project(self, project_id: str) -> List[TaskModel]:
        stmt = (
            select(TaskModel)
            .filter(TaskModel.project_id == project_id)
            .order_by(TaskModel.order.asc())
        )
        return list(self.db.execute(stmt).scalars().all())

    def create(self, project_id: str, task_data: Dict[str, Any]) -> TaskModel:
        # Calcular orden por defecto al final de la lista si no viene indicado
        if "order" not in task_data or task_data["order"] is None:
            existing_tasks = self.get_by_project(project_id)
            task_data["order"] = len(existing_tasks) + 1

        task = TaskModel(project_id=project_id, **task_data)
        self.db.add(task)
        self.db.commit()
        self.db.refresh(task)
        return task

    def update(self, task_id: str, update_data: Dict[str, Any]) -> Optional[TaskModel]:
        task = self.get_by_id(task_id)
        if not task:
            return None

        for key, value in update_data.items():
            if hasattr(task, key) and value is not None:
                setattr(task, key, value)

        self.db.commit()
        self.db.refresh(task)
        return task

    def delete(self, task_id: str) -> bool:
        task = self.get_by_id(task_id)
        if not task:
            return False

        self.db.delete(task)
        self.db.commit()
        return True
