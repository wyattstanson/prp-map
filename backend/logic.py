import re

floor_map = {

    "G": {
        "A": range(43,54),
        "B": range(60,68),
        "C": range(1,29),
        "D": range(68,73),
        "E": range(31,40)
    },

    "1": {
        "A": range(146,153),
        "B": range(163,172),
        "C": range(101,132),
        "D": range(172,177),
        "E": range(131,146)
    }

}

def generate_upper_floor():
    return {
        "A": range(1,16),
        "B": range(16,31),
        "C": range(31,46),
        "D": range(46,61),
        "E": range(61,76)
    }

def find_block(floor, room_index):

    if floor in floor_map:
        blocks = floor_map[floor]
    else:
        blocks = generate_upper_floor()

    for b, rng in blocks.items():
        if room_index in rng:
            return b

    return None


def process_query(text):

    match = re.search(r'\d+', text)
    if not match:
        return None

    room_str = match.group()

    if room_str.startswith("G"):
        floor = "G"
        room_index = int(room_str[1:])
    else:
        floor = room_str[0]
        room_index = int(room_str[1:])   # 🔥 FIX

    block = find_block(floor, room_index)

    return {
        "room": room_str,
        "floor": floor,
        "block": block
    }