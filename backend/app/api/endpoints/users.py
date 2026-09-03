import re
import uuid
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field, ConfigDict
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.infrastructure.db.repositories import UserRepository

router = APIRouter(prefix="/users", tags=["Usuarios"])


class UserResponse(BaseModel):
    id: str
    name: str
    color: Optional[str] = "indigo"
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class UserCreateRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=50, description="Nombre del usuario o equipo")
    color: Optional[str] = Field("indigo", description="Color o tema para avatar")


def slugify_name(name: str) -> str:
    """Genera un identificador normalizado seguro a partir del nombre."""
    slug = re.sub(r'[^a-zA-Z0-9]+', '-', name.strip().lower()).strip('-')
    if not slug:
        slug = f"user-{uuid.uuid4().hex[:6]}"
    return slug[:40]


@router.get("", response_model=List[UserResponse])
def list_users(db: Session = Depends(get_db)):
    """
    Retorna la lista de usuarios registrados en el sistema.
    """
    repo = UserRepository(db)
    return repo.get_all()


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(payload: UserCreateRequest, db: Session = Depends(get_db)):
    """
    Registra un nuevo usuario con base de datos y consola aislada.
    """
    repo = UserRepository(db)
    clean_name = payload.name.strip()
    base_slug = slugify_name(clean_name)

    # Verificar si el ID ya existe y desambiguar si es necesario
    user_id = base_slug
    existing = repo.get_by_id(user_id)
    if existing:
        user_id = f"{base_slug}-{uuid.uuid4().hex[:4]}"

    created = repo.create(
        user_id=user_id,
        name=clean_name,
        color=payload.color or "indigo"
    )
    return created
