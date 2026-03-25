from flask import Flask, request, jsonify, Response
from flask_cors import CORS

from logic       import resolve_room, BLOCK_CONFIG
from pathfinding import find_shortest_path

app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": "*"}})

@app.get("/health")
def health() -> tuple[Response, int]:
    return jsonify({"status": "ok", "service": "prp-navigator"}), 200

@app.get("/blocks")
def blocks() -> tuple[Response, int]:
    return jsonify({"blocks": BLOCK_CONFIG}), 200

@app.post("/chat")
def chat() -> tuple[Response, int]:
    body = request.get_json(silent=True)

    if not body or "message" not in body:
        return jsonify({
            "valid": False,
            "reply": "Request must include a 'message' field with a room number.",
        }), 400

    raw_input = str(body["message"]).strip()
    if not raw_input:
        return jsonify({
            "valid": False,
            "reply": "Room number cannot be empty.",
        }), 400

    result = resolve_room(raw_input)

    return jsonify(_room_result_to_dict(result)), 200

@app.post("/navigate")
def navigate() -> tuple[Response, int]:
    body = request.get_json(silent=True)

    if not body or "from" not in body or "to" not in body:
        return jsonify({
            "found": False,
            "formatted": "Request must include 'from' and 'to' block IDs.",
        }), 400

    from_block = str(body["from"]).strip().upper()
    to_block   = str(body["to"]).strip().upper()

    result = find_shortest_path(from_block, to_block)

    return jsonify({
        "found":     result.found,
        "path":      result.path,
        "steps":     result.steps,
        "formatted": result.formatted,
    }), 200

def _room_result_to_dict(result) -> dict:
    return {
        "valid":       result.valid,
        "room":        result.room,
        "floor":       result.floor,
        "floor_label": result.floor_label,
        "room_index":  result.room_index,
        "block":       result.block,
        "block_label": result.block_label,
        "subtitle":    result.subtitle,
        "range_start": result.range_start,
        "range_end":   result.range_end,
        "reply":       result.reply,
    }

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)