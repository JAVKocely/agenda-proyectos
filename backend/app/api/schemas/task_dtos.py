from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, Field, ConfigDict


class TaskCreateRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    priority: Literal["low", "medium", "high", "urgent"] = "medium"
    status: Literal["pending", "in_progress", "stuck", "completed"] = "pending"
    group_name: Optional[str] = "Fase Principal"
    estimated_duration: Optional[str] = "1 día"
    order: Optional[int] = Field(default=None, ge=1)
    due_date: Optional[datetime] = None


class TaskUpdateRequest(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    description: Optional[str] = None
    priority: Optional[Literal["low", "medium", "high", "urgent"]] = None
    status: Optional[Literal["pending", "in_progress", "stuck", "completed"]] = None
    group_name: Optional[str] = None
    estimated_duration: Optional[str] = None
    order: Optional[int] = Field(default=None, ge=1)
    due_date: Optional[datetime] = None


class TaskResponse(BaseModel):
    id: str
    project_id: str
    title: str
    description: Optional[str] = None
    priority: str
    status: str
    group_name: Optional[str] = "Fase Principal"
    estimated_duration: Optional[str] = "1 día"
    order: int
    due_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
