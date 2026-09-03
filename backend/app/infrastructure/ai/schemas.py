from typing import List, Literal
from pydantic import BaseModel, Field


class AITaskPlanSchema(BaseModel):
    title: str = Field(
        ...,
        description="Título de la tarea o acción concreta a ejecutar",
        max_length=200
    )
    description: str = Field(
        ...,
        description="Descripción detallada, criterios de aceptación o pasos clave de la tarea"
    )
    priority: Literal["low", "medium", "high", "urgent"] = Field(
        default="medium",
        description="Prioridad de la tarea según su urgencia o impacto en el proyecto"
    )
    group_name: str = Field(
        default="Fase 1: Preparación",
        description="Fase o grupo temático al que pertenece la tarea (ej: 'Estrategia', 'Desarrollo', 'Lanzamiento')"
    )
    order: int = Field(
        ...,
        description="Secuencia lógica u orden cronológico de ejecución (comenzando en 1)",
        ge=1
    )
    estimated_duration: str = Field(
        default="1 día",
        description="Estimación de duración de ejecución de la tarea (ej: '4 horas', '1 día', '2 días', '1 semana')"
    )
    estimated_days: int = Field(
        default=1,
        description="Días aproximados para calcular la fecha límite secuencial de esta tarea (mínimo 1)",
        ge=1
    )


class AIProjectPlanSchema(BaseModel):
    title: str = Field(
        ...,
        description="Título conciso, representativo y profesional para el proyecto",
        max_length=150
    )
    description: str = Field(
        ...,
        description="Resumen ejecutivo del alcance, objetivos principales y metas esperadas"
    )
    estimated_completion_days: int = Field(
        ...,
        description="Estimación realista del total de días necesarios para completar el proyecto",
        ge=1
    )
    tasks: List[AITaskPlanSchema] = Field(
        ...,
        description="Lista ordenada y completa de tareas necesarias para lograr el proyecto"
    )
