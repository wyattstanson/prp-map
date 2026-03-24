import re

blocks = {
"A": range(1,16),
"B": range(16,31),
"C": range(31,46),
"D": range(46,61),
"E": range(61,76)
}

def find_block(room):
    room = int(room)

    for block, rng in blocks.items():
        if room in rng:
            return block

    return None

def process_query(text):
    match = re.search(r'\d+', text)

    if not match:
        return None

    room = match.group()
    block = find_block(room)

    return {"room": room, "block": block}