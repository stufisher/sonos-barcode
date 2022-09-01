from typing import List, Optional
from pydantic import BaseSettings, validator


class Settings(BaseSettings):
    sqlalchemy_database_url: str
    zone_player: str
    cors: bool = True
    device_name: str
    zones_to_join: Optional[List[str]] = []
    vendor_id: str  # in hex
    product_id: str  # in hex

    @validator("vendor_id", pre=True, always=True)
    def set_vendor_id(cls, v, values, **kwargs):
        return int(v, 16)

    @validator("product_id", pre=True, always=True)
    def set_product_id(cls, v, values, **kwargs):
        return int(v, 16)

    class Config:
        env_file = ".env"


settings = Settings()
