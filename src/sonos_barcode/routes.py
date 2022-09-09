import random
import string

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import HTMLResponse
from soco import SoCo
from soco.music_library import MusicLibrary
from sqlalchemy.orm import Session

from .settings import settings
from .db import get_db
from . import schema
from . import modules as crud
from . import qr


router = APIRouter()
zone_player = SoCo(settings.zone_player)
music_library = MusicLibrary(zone_player)


@router.get("/status", response_model=schema.Status)
def get_status() -> schema.Status:
    return crud.get_status(zone_player)


@router.put("/status", response_model=schema.Status)
def update_status(status: schema.StatusChange) -> schema.Status:
    if status.play:
        zone_player.group.coordinator.play()

    if status.pause:
        zone_player.group.coordinator.pause()

    if status.next:
        zone_player.group.coordinator.next()

    if status.previous:
        zone_player.group.coordinator.previous()

    if status.isolate:
        zone_player.unjoin()

    if status.join:
        for visible_zone in zone_player.visible_zones:
            if visible_zone.player_name in settings.zones_to_join:
                visible_zone.join(zone_player)

    if status.volume:
        zone_player.volume = status.volume

    if status.group_volume:
        zone_player.group.volume = status.group_volume

    return crud.get_status(zone_player)


@router.get("/queue", response_model=schema.paginated(schema.QueueItem))
def get_queue() -> schema.Paged[schema.QueueItem]:
    queue = crud.get_queue(zone_player)
    return {"total": len(queue), "results": queue}


@router.get("/artists", response_model=schema.paginated(schema.Artist))
def get_artists(search_term: str) -> schema.Paged[schema.Artist]:
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
def get_albums(artist: str) -> schema.Paged[schema.Album]:
    albums = music_library.get_albums_for_artist(artist, full_album_art_uri=True)
    return {"total": len(albums), "results": [album.to_dict() for album in albums]}


@router.post("/albums")
def play_album(album: schema.PlayAlbum) -> schema.PlayAlbum:
    if album.item_id == "random":
        letter = random.choice(string.ascii_lowercase)
        albums = music_library.get_albums(search_term=letter, complete_result=True)
        try:
            album_dict = random.choice(albums).to_dict()
            album.item_id = album_dict["item_id"]
        except IndexError:
            raise HTTPException(status_code=400, detail="Couldnt load random album")

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


@router.get("/generate", response_class=HTMLResponse)
def generate_barcodes(
    rows: int = 14,
    per_row: int = 8,
    offset: int = 0,
    label: bool = True,
    template: qr.PageTemplates = "single",
) -> HTMLResponse:
    page = qr.generate_page(
        "sb", rows=rows, per_row=per_row, offset=offset, label=label, template=template
    )

    return HTMLResponse(page)
