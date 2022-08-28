from typing import List, Optional
from pydantic import BaseSettings


class Settings(BaseSettings):
    sqlalchemy_database_url: str
    zone_player: str
    cors: bool = True
    device_name: str
    zones_to_join: Optional[List[str]] = []

    class Config:
        env_file = ".env"


settings = Settings()
