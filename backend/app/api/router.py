from fastapi import APIRouter
from app.api.endpoints import projects, tasks, ai, users

api_router = APIRouter()

api_router.include_router(projects.router)
api_router.include_router(tasks.router)
api_router.include_router(ai.router)
api_router.include_router(users.router)
