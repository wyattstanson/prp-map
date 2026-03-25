# PRP Navigator

An interactive campus navigation system that combines a visual map, chat-based room lookup, and shortest-path routing. Built using Flask for the backend and a modular JavaScript frontend with canvas rendering.

---

## Overview

PRP Navigator is designed to help users quickly locate rooms and navigate between blocks within a campus. It provides both a conversational interface and a graphical map, making it intuitive and efficient to use.

---

## Features

* Shortest path navigation between campus blocks using BFS
* Chat-based room lookup (e.g. `742`, `G05`)
* Interactive canvas map with zoom, pan, and hover
* Block selection with detailed information panel
* Floor-based filtering and 3D stacked visualization
* Real-time highlighting of blocks and navigation paths

---

## Architecture

The project is structured into two main components:

### Backend (Flask)

* Handles room parsing and validation
* Resolves room to block and floor
* Computes shortest path between blocks
* Exposes REST APIs

### Frontend (Vanilla JS + Canvas)

* Renders the campus map
* Handles user interaction (click, hover, zoom, pan)
* Communicates with backend APIs
* Displays chat responses and navigation results

---

## Project Structure

```
prp-navigator/
│
├── backend/
│   ├── app.py
│   ├── logic.py
│   ├── pathfinding.py
│
├── frontend/
│   ├── index.html
│   ├── app.js
│   ├── modules/
│   │   ├── map.js
│   │   ├── chat.js
│   │   ├── navigation.js
│   │   ├── rooms.js
│   │   ├── utils.js
│
└── README.md
```

---

## API Endpoints

### POST `/chat`

Resolve a room number into block and floor information.

Request:

```json
{ "message": "742" }
```

Response:

```json
{
  "valid": true,
  "room": "742",
  "floor": 7,
  "block": "D"
}
```

---

### POST `/navigate`

Find shortest path between blocks.

Request:

```json
{ "from": "A", "to": "D" }
```

Response:

```json
{
  "found": true,
  "path": ["A", "C", "D"],
  "steps": 2
}
```

---

### GET `/blocks`

Returns metadata for all blocks.

---

### GET `/health`

Health check endpoint.

---

## How It Works

1. The user enters a room number or block navigation request.
2. The frontend sends a request to the Flask backend.
3. The backend:

   * Parses the input
   * Validates it
   * Computes the result (room lookup or shortest path)
4. The frontend updates:

   * Map visualization
   * Highlighted blocks
   * Chat response

---

## Running Locally

### 1. Start Backend

```bash
cd backend
python app.py
```

Server runs at:

```
http://127.0.0.1:5000
```

---

### 2. Run Frontend

Open `frontend/index.html` in a browser
or use Live Server in VS Code.

---

## Example Usage

* Enter `742` in chat to locate a room
* Enter `A → D` using navigation inputs to see the shortest path
* Click on blocks to view details
* Toggle floor view for different levels

---

## Future Improvements

* Deploy frontend and backend
* Add mobile responsiveness
* Improve path visualization with animations
* Add search suggestions and autocomplete
* Integrate real campus data

---

## License

This project is for educational and demonstration purposes.

