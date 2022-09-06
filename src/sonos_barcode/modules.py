from typing import List
import urllib.parse

from sqlalchemy.orm import Session
from soco import SoCo
from soco.music_library import MusicLibrary
from soco.data_structures import DidlItem

from .db import Barcode
from .settings import settings


def get_status(zp: SoCo) -> dict:
    coordinator = zp.group.coordinator
    track = coordinator.get_current_track_info()
    transport = zp.get_current_transport_info()

    if coordinator.is_playing_radio:
        play_mode = "RADIO"
    elif coordinator.is_playing_line_in:
        play_mode = "LINEIN"
    elif coordinator.is_playing_tv:
        play_mode = "TV"
    else:
        play_mode = "QUEUE"

    media = zp.get_current_media_info()
    if media["uri"].startswith("x-sonosapi-stream"):
        album_art_uri = f"http://{settings.zone_player}:1400/getaa?s=1&u={urllib.parse.quote(media['uri'], safe='')}"
        album = media["channel"]
    else:
        album = track["album"]
        album_art_uri = track["album_art"]

    return {
        "transport_state": transport["current_transport_state"],
        "player_name": zp.player_name,
        "coordinator_name": coordinator.player_name,
        "playlist_position": track["playlist_position"],
        "title": track["title"],
        "artist": track["artist"],
        "album": album,
        "album_art_uri": album_art_uri,
        "uri": track["uri"],
        "position": track["position"],
        "duration": track["duration"],
        "volume": zp.volume,
        "group_volume": zp.group.volume,
        "members": len(zp.group.members),
        "play_mode": play_mode,
    }


def get_queue(zp: SoCo) -> List[dict]:
    coordinator = zp.group.coordinator
    queue = coordinator.get_queue(full_album_art_uri=True)
    return [item.to_dict() for item in queue]


def get_barcode(db: Session, barcode: str) -> Barcode:
    return db.query(Barcode).filter(Barcode.barcode == barcode).first()


def save_barcode(db: Session, barcode: str, entity: str) -> Barcode:
    barcode_model = Barcode(barcode=barcode, entity=entity)

    db.add(barcode_model)
    db.commit()

    return barcode_model


def play_album(zp: SoCo, music_library: MusicLibrary, album: str):
    item = DidlItem(item_id=album, parent_id="DUMMY", title="DUMMY")
    coordinator = zp.group.coordinator
    coordinator.clear_queue()
    for playable in music_library.browse(ml_item=item):
        coordinator.add_to_queue(playable)
    coordinator.play_from_queue(0)
