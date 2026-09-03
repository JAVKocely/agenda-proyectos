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
    Utiliza Structured Outputs estrictos mediante response_schema = AIProjectPlanSchema
    con estrategia de reintentos con modelos de respaldo.
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
                "Por favor, añade tu clave en el archivo .env o en el panel de Render."
            )

        user_content = format_user_prompt(prompt)

        # Modelos candidatos con fallback automático en caso de deprecación
        candidate_models = [self.model_name]
        for fallback in ["gemini-3.6-flash", "gemini-2.0-flash", "gemini-1.5-flash"]:
            if fallback not in candidate_models:
                candidate_models.append(fallback)

        last_error = None

        for model in candidate_models:
            try:
                logger.info("Enviando petición a Gemini con Structured Outputs (modelo: %s)...", model)
                response = await self.client.aio.models.generate_content(
                    model=model,
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
                    raise ValueError(f"Gemini devolvió una respuesta vacía con {model}.")

                data = json.loads(raw_text)
                return AIProjectPlanSchema.model_validate(data)

            except ValidationError as ve:
                logger.error("Error de validación en la salida estructurada de Gemini: %s", ve)
                raise ValueError(f"La respuesta de la IA no cumplió con el esquema estricto: {ve}") from ve
            except Exception as e:
                err_str = str(e)
                logger.warning("Fallo al invocar modelo %s: %s", model, err_str)
                last_error = e
                # Si el modelo no existe o fue descontinuado, intentamos con el siguiente
                if "404" in err_str or "NOT_FOUND" in err_str or "no longer available" in err_str:
                    continue
                else:
                    break

        if last_error:
            logger.error("Todos los modelos candidatos de Gemini fallaron: %s", str(last_error))
            raise RuntimeError(f"Fallo en llamada a Gemini API: {str(last_error)}") from last_error

        raise RuntimeError("No se pudo generar el plan del proyecto con Gemini.")
