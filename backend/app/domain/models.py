from dataclasses import dataclass, field
from datetime import datetime, date
from typing import Optional, List
from app.domain.enums import ProjectStatus, TaskPriority, TaskStatus


@dataclass
class TaskDomain:
    id: str
    project_id: str
    title: str
    order: int
    description: Optional[str] = None
    priority: TaskPriority = TaskPriority.MEDIUM
    status: TaskStatus = TaskStatus.PENDING
    due_date: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


@dataclass
class ProjectDomain:
    id: str
    title: str
    status: ProjectStatus = ProjectStatus.ACTIVE
    description: Optional[str] = None
    raw_prompt: Optional[str] = None
    estimated_completion_days: Optional[int] = None
    target_date: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    tasks: List[TaskDomain] = field(default_factory=list)

    @property
    def total_tasks(self) -> int:
        return len(self.tasks)

    @property
    def completed_tasks(self) -> int:
        return sum(1 for t in self.tasks if t.status == TaskStatus.COMPLETED)

    @property
    def progress_percentage(self) -> float:
        if self.total_tasks == 0:
            return 0.0
        return round((self.completed_tasks / self.total_tasks) * 100, 1)
