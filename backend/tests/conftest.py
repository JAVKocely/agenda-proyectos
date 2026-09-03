import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient

from app.core.database import Base, get_db
from app.main import app
from app.infrastructure.ai.client_interface import AIClientInterface
from app.infrastructure.ai.schemas import AIProjectPlanSchema, AITaskPlanSchema

# Base de datos en memoria compartida mediante StaticPool
TEST_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        session = TestingSessionLocal()
        try:
            yield session
        finally:
            session.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


class MockAIClient(AIClientInterface):
    """Cliente simulado de IA para pruebas unitarias sin dependencias externas."""
    def __init__(self, plan_to_return: AIProjectPlanSchema = None):
        self.plan_to_return = plan_to_return or AIProjectPlanSchema(
            title="E-Commerce Especializado de Café",
            description="Plataforma de venta directa de café de especialidad con suscripciones recurrentes.",
            estimated_completion_days=14,
            tasks=[
                AITaskPlanSchema(
                    title="Diseñar wireframes y flujo de checkout",
                    description="Crear prototipos de alta fidelidad en Figma para versión móvil y desktop.",
                    priority="high",
                    order=1
                ),
                AITaskPlanSchema(
                    title="Configurar pasarela Stripe y webhooks",
                    description="Integrar cobros por tarjeta y eventos de suscripción.",
                    priority="urgent",
                    order=2
                ),
                AITaskPlanSchema(
                    title="Desplegar catálogo y pruebas E2E",
                    description="Cargar primeros 10 productos y validar flujo de compra completo.",
                    priority="medium",
                    order=3
                )
            ]
        )

    async def generate_project_plan(self, prompt: str) -> AIProjectPlanSchema:
        if "error_forzado" in prompt:
            raise ValueError("Error simulado de LLM")
        return self.plan_to_return
