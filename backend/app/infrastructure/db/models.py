import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.domain.enums import ProjectStatus, TaskPriority, TaskStatus


def generate_uuid() -> str:
    return str(uuid.uuid4())


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class ProjectModel(Base):
    __tablename__ = "projects"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(20), nullable=False, default=ProjectStatus.ACTIVE.value)
    raw_prompt = Column(Text, nullable=True)
    estimated_completion_days = Column(Integer, nullable=True, default=7)
    target_date = Column(DateTime(timezone=True), nullable=True)
    user_id = Column(String(50), nullable=False, default="meli")
    created_at = Column(DateTime(timezone=True), nullable=False, default=utc_now)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=utc_now, onupdate=utc_now)

    # Relación uno a muchos con eliminación en cascada
    tasks = relationship(
        "TaskModel",
        back_populates="project",
        cascade="all, delete-orphan",
        order_by="TaskModel.order.asc()"
    )

    __table_args__ = (
        Index("idx_projects_status", "status"),
        Index("idx_projects_user_id", "user_id"),
        Index("idx_projects_created_at", "created_at"),
    )

    @property
    def total_tasks(self) -> int:
        return len(self.tasks) if self.tasks else 0

    @property
    def completed_tasks(self) -> int:
        if not self.tasks:
            return 0
        return sum(1 for t in self.tasks if t.status == TaskStatus.COMPLETED.value)

    @property
    def progress_percentage(self) -> float:
        if self.total_tasks == 0:
            return 0.0
        return round((self.completed_tasks / self.total_tasks) * 100, 1)


class TaskModel(Base):
    __tablename__ = "tasks"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    priority = Column(String(20), nullable=False, default=TaskPriority.MEDIUM.value)
    status = Column(String(20), nullable=False, default=TaskStatus.PENDING.value)
    order = Column(Integer, nullable=False, default=0)
    group_name = Column(String(100), nullable=True, default="Fase Principal")
    due_date = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=utc_now)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=utc_now, onupdate=utc_now)

    project = relationship("ProjectModel", back_populates="tasks")

    __table_args__ = (
        Index("idx_tasks_project_id", "project_id"),
        Index("idx_tasks_order", "project_id", "order"),
    )
