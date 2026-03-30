from dataclasses import dataclass
from typing import Optional

BLOCK_CONFIG = {
    "A": {"label": "A Block", "subtitle": "Classrooms · SHINE",     "range_start": 1,  "range_end": 15},
    "B": {"label": "B Block", "subtitle": "Classrooms",              "range_start": 16, "range_end": 30},
    "C": {"label": "C Block", "subtitle": "Central Hub · Washrooms", "range_start": 31, "range_end": 45},
    "D": {"label": "D Block", "subtitle": "PRP AC Canteen",          "range_start": 46, "range_end": 60},
    "E": {"label": "E Block", "subtitle": "Labs · Computing",        "range_start": 61, "range_end": 75},
}

@dataclass
class RoomResult:
    valid: bool
    room: str = ""
    floor: int = -1
    floor_label: str = ""
    room_index: int = -1
    block: str = ""
    block_label: str = ""
    subtitle: str = ""
    range_start: int = -1
    range_end: int = -1
    reply: str = ""

def parse_room(raw: str):
    text = raw.strip().upper()
    if text.startswith("G"):
        idx = int(text[1:]) if text[1:].isdigit() else -1
        if idx < 1 or idx > 75: return None
        return (0, idx, f"G{idx:02d}", "Ground Floor")
    if not text.isdigit(): return None
    n = int(text)
    if n < 100:
        if n < 1 or n > 75: return None
        return (0, n, f"G{n:02d}", "Ground Floor")
    floor = int(text[0]); idx = int(text[1:])
    if floor < 1 or floor > 7 or idx < 1 or idx > 75: return None
    return (floor, idx, f"{floor}{idx:02d}", f"Floor {floor}")

def resolve_room(raw: str) -> RoomResult:
    p = parse_room(raw)
    if not p:
        return RoomResult(valid=False, reply=f'"{raw}" is not a valid room number. Try 742 or G05.')
    floor, idx, room_str, floor_label = p
    block_id = next((k for k, v in BLOCK_CONFIG.items() if v["range_start"] <= idx <= v["range_end"]), None)
    if not block_id:
        return RoomResult(valid=False, reply=f"Room index {idx} is out of range (1–75).")
    cfg = BLOCK_CONFIG[block_id]
    return RoomResult(
        valid=True, room=room_str, floor=floor, floor_label=floor_label,
        room_index=idx, block=block_id, block_label=cfg["label"],
        subtitle=cfg["subtitle"], range_start=cfg["range_start"], range_end=cfg["range_end"],
        reply=f"Room {room_str} is in {cfg['label']} ({cfg['subtitle']}), {floor_label}."
    )