import pytest
from pydantic import ValidationError
from app.services.ai_planner_service import AIPlannerService
from app.infrastructure.ai.schemas import AIProjectPlanSchema, AITaskPlanSchema
from tests.conftest import MockAIClient


def test_schema_validates_correctly():
    valid_data = {
        "title": "Renovación Portal Web",
        "description": "Rediseño completo de la web corporativa en React y FastAPI.",
        "estimated_completion_days": 10,
        "tasks": [
            {
                "title": "Arquitectura y Wireframes",
                "description": "Diseñar los componentes visuales principales.",
                "priority": "high",
                "order": 1
            }
        ]
    }
    plan = AIProjectPlanSchema.model_validate(valid_data)
    assert plan.title == valid_data["title"]
    assert plan.estimated_completion_days == 10
    assert len(plan.tasks) == 1


def test_schema_rejects_missing_fields():
    invalid_data = {
        "title": "Proyecto Incompleto",
    }
    with pytest.raises(ValidationError):
        AIProjectPlanSchema.model_validate(invalid_data)


def test_schema_rejects_invalid_priority():
    invalid_data = {
        "title": "Proyecto Test",
        "description": "Prueba",
        "estimated_completion_days": 5,
        "tasks": [
            {
                "title": "Tarea 1",
                "description": "Desc",
                "priority": "super_mega_urgent",
                "order": 1
            }
        ]
    }
    with pytest.raises(ValidationError):
        AIProjectPlanSchema.model_validate(invalid_data)


@pytest.mark.anyio
async def test_ai_planner_service_generates_and_persists_project(db_session):
    mock_client = MockAIClient()
    service = AIPlannerService(db=db_session, ai_client=mock_client)

    raw_input = "Quiero hacer una tienda de café con stripe y catalogo"
    created_project = await service.generate_and_create_project(raw_input)

    assert created_project.id is not None
    assert created_project.title == "E-Commerce Especializado de Café"
    assert created_project.raw_prompt == raw_input
    assert created_project.estimated_completion_days == 14
    assert created_project.target_date is not None
    assert len(created_project.tasks) == 3

    # Verificar cálculo de tareas ordenadas
    tasks = created_project.tasks
    assert tasks[0].order == 1
    assert tasks[0].priority == "high"
    assert tasks[1].order == 2
    assert tasks[1].priority == "urgent"
    assert tasks[2].order == 3


def test_ai_endpoint_generates_project(client, monkeypatch):
    """Prueba el endpoint HTTP /api/v1/ai/generate-project mockeando el cliente de IA."""
    mock_client = MockAIClient()
    monkeypatch.setattr("app.services.ai_planner_service.get_ai_client", lambda: mock_client)

    response = client.post(
        "/api/v1/ai/generate-project",
        json={"prompt": "Desarrollar una app móvil de entrega de comida a domicilio con geolocalización"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "E-Commerce Especializado de Café"
    assert data["estimated_completion_days"] == 14
    assert len(data["tasks"]) == 3
    assert data["progress_percentage"] == 0.0
