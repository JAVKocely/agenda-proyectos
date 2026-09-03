from datetime import datetime
from typing import Optional, List, Literal
from pydantic import BaseModel, Field, ConfigDict
from app.api.schemas.task_dtos import TaskCreateRequest, TaskResponse


class ProjectCreateRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=150)
    description: Optional[str] = None
    status: Literal["active", "paused", "completed"] = "active"
    user_id: Optional[str] = "meli"
    estimated_completion_days: Optional[int] = Field(default=7, ge=1)
    target_date: Optional[datetime] = None
    tasks: Optional[List[TaskCreateRequest]] = None


class ProjectUpdateRequest(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=150)
    description: Optional[str] = None
    status: Optional[Literal["active", "paused", "completed"]] = None
    estimated_completion_days: Optional[int] = Field(default=None, ge=1)
    target_date: Optional[datetime] = None


class ProjectSummaryResponse(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    status: str
    user_id: str = "meli"
    estimated_completion_days: Optional[int] = None
    target_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    total_tasks: int
    completed_tasks: int
    progress_percentage: float

    model_config = ConfigDict(from_attributes=True)


class ProjectDetailResponse(ProjectSummaryResponse):
    raw_prompt: Optional[str] = None
    tasks: List[TaskResponse] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)
