from abc import ABC, abstractmethod
from app.infrastructure.ai.schemas import AIProjectPlanSchema


class AIClientInterface(ABC):
    """
    Contrato abstracto para proveedores de inferencia LLM.
    Permite alternar entre Google Gemini, Groq, OpenAI u otros
    sin acoplar la lógica de negocio a una librería específica.
    """

    @abstractmethod
    async def generate_project_plan(self, prompt: str) -> AIProjectPlanSchema:
        """
        Envía el texto libre del usuario al LLM y obtiene una respuesta
        estrictamente tipada que cumple con AIProjectPlanSchema.
        """
        pass
