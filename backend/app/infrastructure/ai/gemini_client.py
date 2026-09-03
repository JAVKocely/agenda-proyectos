import json
import logging
from google import genai
from google.genai import types
from pydantic import ValidationError

from app.core.config import settings
from app.infrastructure.ai.client_interface import AIClientInterface
from app.infrastructure.ai.schemas import AIProjectPlanSchema
from app.infrastructure.ai.prompt_templates import (
    SYSTEM_PROJECT_PLANNER_PROMPT,
    format_user_prompt
)

logger = logging.getLogger(__name__)


class GeminiAIClient(AIClientInterface):
    """
    Implementación directa con Google Gemini API usando el SDK oficial google-genai.
    Utiliza Structured Outputs estrictos mediante response_schema = AIProjectPlanSchema.
    """

    def __init__(self, api_key: str = "", model_name: str = ""):
        self.api_key = api_key or settings.GEMINI_API_KEY
        self.model_name = model_name or settings.GEMINI_MODEL
        if self.api_key:
            self.client = genai.Client(api_key=self.api_key)
        else:
            self.client = None

    async def generate_project_plan(self, prompt: str) -> AIProjectPlanSchema:
        if not self.api_key or not self.client:
            raise ValueError(
                "GEMINI_API_KEY no está configurada en las variables de entorno. "
                "Por favor, añade tu clave en el archivo .env."
            )

        user_content = format_user_prompt(prompt)

        try:
            logger.info("Enviando petición a Gemini con Structured Outputs (%s)...", self.model_name)
            response = await self.client.aio.models.generate_content(
                model=self.model_name,
                contents=user_content,
                config=types.GenerateContentConfig(
                    system_instruction=SYSTEM_PROJECT_PLANNER_PROMPT,
                    response_mime_type="application/json",
                    response_schema=AIProjectPlanSchema,
                    temperature=0.2,
                )
            )

            raw_text = response.text
            if not raw_text:
                raise ValueError("Gemini devolvió una respuesta vacía.")

            # Validar e instanciar el esquema tipado de Pydantic
            data = json.loads(raw_text)
            validated_plan = AIProjectPlanSchema.model_validate(data)
            return validated_plan

        except ValidationError as ve:
            logger.error("Error de validación en la salida estructurada de Gemini: %s", ve)
            raise ValueError(f"La respuesta de la IA no cumplió con el esquema estricto: {ve}") from ve
        except Exception as e:
            logger.error("Error al comunicarse con Gemini API: %s", str(e))
            raise RuntimeError(f"Fallo en llamada a Gemini API: {str(e)}") from e
