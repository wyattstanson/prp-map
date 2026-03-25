from dataclasses import dataclass
from typing import Optional

BLOCK_CONFIG: dict[str, dict] = {
    "A": {
        "label":      "A Block",
        "subtitle":   "Classrooms · SHINE",
        "range_start": 1,
        "range_end":  15,
    },
    "B": {
        "label":      "B Block",
        "subtitle":   "Classrooms",
        "range_start": 16,
        "range_end":  30,
    },
    "C": {
        "label":      "C Block",
        "subtitle":   "Central Hub · Washrooms",
        "range_start": 31,
        "range_end":  45,
    },
    "D": {
        "label":      "D Block",
        "subtitle":   "PRP AC Canteen",
        "range_start": 46,
        "range_end":  60,
    },
    "E": {
        "label":      "E Block",
        "subtitle":   "Labs · Computing",
        "range_start": 61,
        "range_end":  75,
    },
}

FLOOR_COUNT  = 8
MAX_INDEX    = 75
MIN_INDEX    = 1

@dataclass
class ParsedRoom:
    floor:       int
    room_index:  int
    room_str:    str
    floor_label: str


@dataclass
class RoomLookupResult:
    valid:        bool
    room:         str           = ""
    floor:        int           = -1
    floor_label:  str           = ""
    room_index:   int           = -1
    block:        str           = ""
    block_label:  str           = ""
    subtitle:     str           = ""
    range_start:  int           = -1
    range_end:    int           = -1
    reply:        str           = ""


def parse_room_number(raw: str) -> Optional[ParsedRoom]:
    text = raw.strip().upper()

    if text.startswith("G"):
        digits = text[1:]
        if not digits.isdigit():
            return None
        index = int(digits)
        if not (MIN_INDEX <= index <= MAX_INDEX):
            return None
        return ParsedRoom(
            floor=0,
            room_index=index,
            room_str=f"G{index:02d}",
            floor_label="Ground Floor",
        )

    if not text.isdigit():
        return None

    number = int(text)

    if number < 100:
        if not (MIN_INDEX <= number <= MAX_INDEX):
            return None
        return ParsedRoom(
            floor=0,
            room_index=number,
            room_str=f"G{number:02d}",
            floor_label="Ground Floor",
        )

    floor      = int(text[0])
    room_index = int(text[1:])

    if not (1 <= floor <= FLOOR_COUNT - 1):
        return None
    if not (MIN_INDEX <= room_index <= MAX_INDEX):
        return None

    return ParsedRoom(
        floor=floor,
        room_index=room_index,
        room_str=f"{floor}{room_index:02d}",
        floor_label=f"Floor {floor}",
    )


def room_index_to_block(room_index: int) -> Optional[str]:
    for block_id, cfg in BLOCK_CONFIG.items():
        if cfg["range_start"] <= room_index <= cfg["range_end"]:
            return block_id
    return None


def resolve_room(raw_input: str) -> RoomLookupResult:
    parsed = parse_room_number(raw_input)

    if parsed is None:
        return RoomLookupResult(
            valid=False,
            reply=(
                f'"{raw_input}" is not a valid room number. '
                f"Try formats like 742 (floor 7, room index 42), "
                f"115 (floor 1, room 15), or G05 (ground floor, room 5)."
            ),
        )

    block_id = room_index_to_block(parsed.room_index)

    if block_id is None:
        return RoomLookupResult(
            valid=False,
            reply=(
                f"Room index {parsed.room_index} is out of range. "
                f"Valid indices are {MIN_INDEX}–{MAX_INDEX} "
                f"(15 rooms per block, 5 blocks)."
            ),
        )

    cfg = BLOCK_CONFIG[block_id]

    reply = (
        f"Room {parsed.room_str} is in {cfg['label']} "
        f"({cfg['subtitle']}), {parsed.floor_label}. "
        f"Room index {parsed.room_index} falls within the "
        f"{block_id} Block range ({cfg['range_start']}–{cfg['range_end']})."
    )

    return RoomLookupResult(
        valid=True,
        room=parsed.room_str,
        floor=parsed.floor,
        floor_label=parsed.floor_label,
        room_index=parsed.room_index,
        block=block_id,
        block_label=cfg["label"],
        subtitle=cfg["subtitle"],
        range_start=cfg["range_start"],
        range_end=cfg["range_end"],
        reply=reply,
    )