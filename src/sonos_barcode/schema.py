from enum import Enum
from typing import Optional, TypeVar, Generic, List
from pydantic import BaseModel
from pydantic.main import ModelMetaclass


T = TypeVar("T")


class Paged(BaseModel, Generic[T]):
    """Page a model result set"""

    total: int
    results: List[T]
    skip: Optional[int]
    limit: Optional[int]

    @property
    def first(self) -> T:
        return self.results[0]


def paginated(model: ModelMetaclass) -> ModelMetaclass:
    class PaginatedModel(BaseModel):
        total: int
        results: list[model]

    cls_name = f"Paginated<{model.__name__}>"
    PaginatedModel.__name__ = cls_name
    PaginatedModel.__qualname__ = cls_name

    return PaginatedModel


class QueueItem(BaseModel):
    item_id: str
    creator: str
    title: str
    album: str
    album_art_uri: str
    original_track_number: int


class PlayMode(str, Enum):
    LINEIN = "LINEIN"
    QUEUE = "QUEUE"
    RADIO = "RADIO"
    TV = "TV"


class Status(BaseModel):
    player_name: str
    coordinator_name: str
    title: str
    artist: str
    album: str
    album_art_uri: str
    playlist_position: int
    uri: str
    position: str
    duration: str
    transport_state: str
    volume: int
    group_volume: int
    members: int
    play_mode: PlayMode


class StatusChange(BaseModel):
    play: Optional[bool]
    pause: Optional[bool]
    previous: Optional[bool]
    next: Optional[bool]
    isolate: Optional[bool]
    join: Optional[bool]
    volume: Optional[int]
    group_volume: Optional[int]


class EANAlbumNew(BaseModel):
    barcode: str
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
