from typing import Optional
from pydantic import BaseModel
from pydantic.main import ModelMetaclass


def paginated(model: ModelMetaclass) -> ModelMetaclass:
    class PaginatedModel(BaseModel):
        total: int
        results: list[model]

    cls_name = f"Paginated<{model.__name__}>"
    PaginatedModel.__name__ = cls_name
    PaginatedModel.__qualname__ = cls_name

    return PaginatedModel


class Status(BaseModel):
    player_name: str
    coordinator_name: str
    title: str
    artist: str
    album: str
    album_art_uri: str
    uri: str
    position: str
    duration: str
    transport_state: str


class StatusChange(BaseModel):
    play: Optional[bool]
    pause: Optional[bool]
    previous: Optional[bool]
    next: Optional[bool]
    isolate: Optional[bool]
    join: Optional[bool]


class EANAlbumNew(BaseModel):
    barcode: int
    entity: str


class EANAlbum(EANAlbumNew):
    class Config:
        orm_mode = True


class PlayAlbum(BaseModel):
    item_id: str


class Artist(BaseModel):
    item_id: str
    title: str

    class Config:
        extra = "ignore"


class Album(BaseModel):
    item_id: str
    title: str
    album_art_uri: str

    class Config:
        extra = "ignore"


class Message(BaseModel):
    message: str
