from app.core.config import settings
from app.infrastructure.ai.client_interface import AIClientInterface
from app.infrastructure.ai.gemini_client import GeminiAIClient
from app.infrastructure.ai.groq_client import GroqAIClient


def get_ai_client() -> AIClientInterface:
    """
    Factoría de clientes de IA según la variable de entorno AI_PROVIDER.
    Desacopla la lógica de negocio del proveedor específico.
    """
    provider = settings.AI_PROVIDER.lower().strip()
    if provider == "groq":
        return GroqAIClient()
    return GeminiAIClient()
