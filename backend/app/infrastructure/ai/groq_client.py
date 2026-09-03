import json
import logging
import httpx
from pydantic import ValidationError

from app.core.config import settings
from app.infrastructure.ai.client_interface import AIClientInterface
from app.infrastructure.ai.schemas import AIProjectPlanSchema
from app.infrastructure.ai.prompt_templates import (
    SYSTEM_PROJECT_PLANNER_PROMPT,
    format_user_prompt
)

logger = logging.getLogger(__name__)


class GroqAIClient(AIClientInterface):
    """
    Implementación directa para Groq Cloud API usando HTTP REST estándar (httpx).
    Utiliza baja latencia y modo JSON forzado validado contra AIProjectPlanSchema.
    """

    GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

    def __init__(self, api_key: str = "", model_name: str = ""):
        self.api_key = api_key or settings.GROQ_API_KEY
        self.model_name = model_name or settings.GROQ_MODEL

    async def generate_project_plan(self, prompt: str) -> AIProjectPlanSchema:
        if not self.api_key:
            raise ValueError(
                "GROQ_API_KEY no está configurada en las variables de entorno (.env)."
            )

        user_content = format_user_prompt(prompt)
        # Inyectar el schema JSON en las instrucciones para asegurar formato estricto
        schema_json = json.dumps(AIProjectPlanSchema.model_json_schema(), indent=2)
        system_with_schema = f"{SYSTEM_PROJECT_PLANNER_PROMPT}\n\nEsquema JSON obligatorio que debes satisfacer:\n{schema_json}"

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": self.model_name,
            "messages": [
                {"role": "system", "content": system_with_schema},
                {"role": "user", "content": user_content}
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.2
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                response = await client.post(self.GROQ_URL, json=payload, headers=headers)
                response.raise_for_status()
                data = response.json()
                content = data["choices"][0]["message"]["content"]
                parsed_json = json.loads(content)
                return AIProjectPlanSchema.model_validate(parsed_json)
            except httpx.HTTPStatusError as e:
                logger.error("Error HTTP de Groq (%s): %s", e.response.status_code, e.response.text)
                raise RuntimeError(f"Error de Groq API ({e.response.status_code}): {e.response.text}") from e
            except ValidationError as ve:
                logger.error("Respuesta de Groq no se ajusta al esquema: %s", ve)
                raise ValueError(f"Validación de esquema falló para Groq: {ve}") from ve
            except Exception as e:
                logger.error("Fallo general en cliente Groq: %s", str(e))
                raise RuntimeError(f"Fallo en llamada a Groq: {str(e)}") from e
