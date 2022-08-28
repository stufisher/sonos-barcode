from sqlalchemy.orm import Session
from soco import SoCo
from soco.music_library import MusicLibrary
from soco.data_structures import DidlItem

from .db import Barcode


def get_status(zp: SoCo):
    coordinator = zp.group.coordinator
    track = coordinator.get_current_track_info()
    transport = zp.get_current_transport_info()
    return {
        "transport_state": transport["current_transport_state"],
        "player_name": zp.player_name,
        "coordinator_name": coordinator.player_name,
        "title": track["title"],
        "artist": track["artist"],
        "album": track["album"],
        "album_art_uri": track["album_art"],
        "uri": track["uri"],
        "position": track["position"],
        "duration": track["duration"],
        "volume": zp.volume,
        "group_volume": zp.group.volume,
        "members": len(zp.group.members),
    }


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
