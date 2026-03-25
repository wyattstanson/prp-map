from flask import Flask, request, jsonify
from flask_cors import CORS
from logic import process_query

app = Flask(__name__)
CORS(app)

@app.route("/chat", methods=["POST"])
def chat():

    text = request.json["message"]
    result = process_query(text)

    if not result:
        return jsonify({"reply":"Invalid room"})

    return jsonify({
        "reply": f"Room {result['room']} → Block {result['block']} (Floor {result['floor']})",
        "room": result["room"],
        "block": result["block"],
        "floor": result["floor"]
    })

if __name__ == "__main__":
    app.run(debug=True)