from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Database
    database_url: str = "sqlite:///./todo.db"
    
    # JWT
    secret_key: str = "your-secret-key-here"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # Application
    app_name: str = "Todo List API"
    debug: bool = True
    api_v1_prefix: str = "/v1"
    
    class Config:
        env_file = ".env"


settings = Settings()
