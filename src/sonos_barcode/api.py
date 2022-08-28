from typing import Optional, Generic, TypeVar, List
import asyncio

# import evdev
from fastapi import FastAPI, APIRouter, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi_socketio import SocketManager
from pydantic import BaseModel
from soco import SoCo
from soco.music_library import MusicLibrary
from sqlalchemy.orm import Session

from .settings import settings
from .db import SessionLocal
from . import schema
from . import modules as crud

app = FastAPI()
socket_manager = SocketManager(app=app, cors_allowed_origins=[])

if settings.cors:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


router = APIRouter()
zone_player = SoCo(settings.zone_player)
music_library = MusicLibrary(zone_player)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# https://gist.github.com/JoachimL/1629f701fdb38427091710fc0caef67d
# https://github.com/tiangolo/fastapi/issues/2713
async def reader():
    device = None
    for listed_device in evdev.list_devices():
        device_instance = evdev.InputDevice(listed_device)
        if device_instance.name == settings.device_name:
            device = device_instance

    if not device:
        raise RuntimeError(f"Couldnt find input device: {settings.device_name}")

    while True:
        for event in device.read_loop():
            if event.type == evdev.ecodes.EV_KEY and event.value == 1:
                keycode = evdev.categorize(event).keycode
                if keycode == "KEY_ENTER":
                    print("Read barcode:", current_barcode)
                    await app.sio.emit("barcode", current_barcode)
                    current_barcode = ""
                else:
                    current_barcode += keycode[4:]


# @app.on_event("startup")
# async def app_startup():
#     asyncio.create_task(reader())


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


@router.get("/status", response_model=schema.Status)
def get_status() -> schema.Status:
    return crud.get_status(zone_player)


@router.put("/status", response_model=schema.Status)
def update_status(status: schema.StatusChange) -> schema.Status:
    if status.play:
        zone_player.play()

    if status.pause:
        zone_player.pause()

    if status.next:
        zone_player.next()

    if status.previous:
        zone_player.previous()

    if status.isolate:
        zone_player.unjoin()

    if status.join:
        for visible_zone in zone_player.visible_zones:
            if visible_zone.player_name in settings.zones_to_join:
                visible_zone.join(zone_player)

    return crud.get_status(zone_player)


@router.get("/artists", response_model=schema.paginated(schema.Artist))
def get_artists(search_term: str) -> Paged[schema.Artist]:
    artists = music_library.get_album_artists(
        search_term=search_term, complete_result=True
    )
    return {
        "total": len(artists),
        "results": [
            artist.to_dict()
            for artist in artists
            if artist.title.lower().startswith(search_term.lower())
        ],
    }


@router.get("/albums", response_model=schema.paginated(schema.Album))
def get_albums(artist: str) -> Paged[schema.Album]:
    albums = music_library.get_albums_for_artist(artist, full_album_art_uri=True)
    return {"total": len(albums), "results": [album.to_dict() for album in albums]}


@router.post("/albums")
def play_album(album: schema.PlayAlbum) -> schema.PlayAlbum:
    crud.play_album(zone_player, music_library, album.item_id)
    return {"item_id": album.item_id}


@router.post("/barcode", response_model=schema.EANAlbum)
def save_barcode(
    ean: schema.EANAlbumNew, db: Session = Depends(get_db)
) -> schema.EANAlbum:
    barcode = crud.save_barcode(db, **ean.dict())
    if barcode:
        crud.play_album(zone_player, music_library, barcode.entity)
        return barcode


@router.get("/barcode/{barcode}", response_model=schema.EANAlbum)
def get_barcode(barcode: str, db: Session = Depends(get_db)) -> schema.EANAlbum:
    barcode = crud.get_barcode(db, barcode)
    if barcode:
        crud.play_album(zone_player, music_library, barcode.entity)
        return barcode
    else:
        raise HTTPException(status_code=404, detail="Barcode not found")


app.include_router(router)
