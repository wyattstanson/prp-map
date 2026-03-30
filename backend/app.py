from flask import Flask, request, jsonify
from flask_cors import CORS
from logic import resolve_room, BLOCK_CONFIG
from pathfinding import find_path

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

@app.get("/health")
def health():
    return jsonify({"status": "ok"}), 200

@app.get("/blocks")
def blocks():
    return jsonify({"blocks": BLOCK_CONFIG}), 200

@app.post("/chat")
def chat():
    body = request.get_json(silent=True)
    if not body or "message" not in body:
        return jsonify({"valid": False, "reply": "Missing 'message' field."}), 400
    raw = str(body["message"]).strip()
    if not raw:
        return jsonify({"valid": False, "reply": "Empty input."}), 400
    r = resolve_room(raw)
    return jsonify({
        "valid": r.valid, "room": r.room, "floor": r.floor, "floor_label": r.floor_label,
        "room_index": r.room_index, "block": r.block, "block_label": r.block_label,
        "subtitle": r.subtitle, "range_start": r.range_start, "range_end": r.range_end,
        "reply": r.reply,
    }), 200

@app.post("/navigate")
def navigate():
    body = request.get_json(silent=True)
    if not body or "from" not in body or "to" not in body:
        return jsonify({"found": False, "formatted": "Missing 'from' or 'to'."}), 400
    r = find_path(str(body["from"]), str(body["to"]))
    return jsonify({"found": r.found, "path": r.path, "steps": r.steps, "formatted": r.formatted}), 200

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)