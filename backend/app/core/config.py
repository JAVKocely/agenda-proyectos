from typing import List
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Configuración global del sistema cargada desde variables de entorno (.env).
    Garantiza validación estricta al iniciar el servidor (Fail-Fast).
    """
    ENVIRONMENT: str = "development"
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    
    # Base de datos: Por defecto SQLite para ejecución inmediata sin dependencias
    DATABASE_URL: str = "sqlite:///./agenda.db"
    
    # CORS: Orígenes permitidos separados por coma o lista
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173"
    
    # Proveedor de Inteligencia Artificial
    AI_PROVIDER: str = "gemini"  # "gemini" | "groq"
    
    # Claves y modelos de LLMs
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.5-flash"
    
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.3-70b-versatile"

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
