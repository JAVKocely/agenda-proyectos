from pydantic import BaseModel, Field


class AIGenerateProjectRequest(BaseModel):
    prompt: str = Field(
        ...,
        min_length=5,
        max_length=10000,
        description="Ideas desestructuradas, notas sueltas o alcance en bruto del proyecto"
    )
