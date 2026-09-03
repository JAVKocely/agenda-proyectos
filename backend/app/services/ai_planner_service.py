from datetime import datetime, timedelta, timezone
from typing import Optional
from sqlalchemy.orm import Session
from app.infrastructure.ai.client_interface import AIClientInterface
from app.infrastructure.ai import get_ai_client
from app.infrastructure.db.repositories import ProjectRepository
from app.infrastructure.db.models import ProjectModel


class AIPlannerService:
    """
    Caso de uso: Descomposición de ideas no estructuradas y creación automática
    del proyecto y sus tareas en la base de datos a partir del Structured Output del LLM.
    """

    def __init__(self, db: Session, ai_client: Optional[AIClientInterface] = None):
        self.db = db
        self.ai_client = ai_client or get_ai_client()
        self.project_repo = ProjectRepository(db)

    async def generate_and_create_project(self, raw_prompt: str, user_id: str = "meli") -> ProjectModel:
        cleaned_prompt = raw_prompt.strip()
        if not cleaned_prompt:
            raise ValueError("El texto o alcance del proyecto no puede estar vacío.")

        # 1. Obtener estructuración validada desde el LLM
        plan = await self.ai_client.generate_project_plan(cleaned_prompt)

        # 2. Calcular fecha objetivo estimada
        target_date = datetime.now(timezone.utc) + timedelta(days=plan.estimated_completion_days)

        # 3. Mapear datos del proyecto con aislamiento de usuario
        project_dict = {
            "title": plan.title,
            "description": plan.description,
            "raw_prompt": cleaned_prompt,
            "estimated_completion_days": plan.estimated_completion_days,
            "target_date": target_date,
            "status": "active",
            "user_id": user_id
        }

        # 4. Mapear datos de tareas ordenadas
        tasks_dict_list = [
            {
                "title": task.title,
                "description": task.description,
                "priority": task.priority,
                "order": task.order,
                "group_name": getattr(task, "group_name", "Fase 1: Preparación") or "Fase 1: Preparación",
                "status": "pending"
            }
            for task in plan.tasks
        ]

        # 5. Persistir atómicamente en la base de datos
        created_project = self.project_repo.create(
            project_data=project_dict,
            tasks_data=tasks_dict_list
        )

        return created_project
