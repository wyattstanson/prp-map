# PRP Navigator

PRP Navigator is an interactive 3D visualization and navigation system for the PRP academic complex at VIT Vellore. The project models the building layout using five blocks (A–E), each containing multiple floors and room ranges. Users can explore the campus environment in 3D, search for specific rooms, and visualize navigation paths between rooms.

---

## Overview

Large academic buildings such as the PRP complex can be difficult to navigate, especially for new students or visitors. PRP Navigator provides a digital 3D representation of the building layout that allows users to explore blocks, floors, and rooms interactively.

The system integrates spatial visualization with room mapping to simplify navigation and demonstrate how 3D interfaces can assist in indoor navigation within large institutional infrastructures.

---

## Features

• Interactive 3D visualization of the PRP building layout
• Five building blocks (A, B, C, D, and E)
• Ground floor plus seven additional floors per block
• Fifteen rooms per floor generated dynamically
• Room search functionality that identifies the correct block and floor
• Hover detection displaying room numbers
• First-person walk mode for corridor exploration
• Toggleable night mode visualization
• Shortest path navigation between rooms
• Interactive camera controls including zoom and rotation

---

## Building Layout

The PRP complex is modeled using five blocks, each associated with a specific range of room numbers.

| Block | Room Range |
| ----- | ---------- |
| A     | 01 – 15    |
| B     | 16 – 30    |
| C     | 31 – 45    |
| D     | 46 – 60    |
| E     | 61 – 75    |

Each block contains eight levels: Ground floor plus seven upper floors.

Example for A Block:

| Floor  | Rooms     |
| ------ | --------- |
| Ground | G01 – G15 |
| 1st    | 101 – 115 |
| 2nd    | 201 – 215 |
| 3rd    | 301 – 315 |
| 4th    | 401 – 415 |
| 5th    | 501 – 515 |
| 6th    | 601 – 615 |
| 7th    | 701 – 715 |

---

## Technology Stack

• JavaScript (ES6+)
• Three.js for 3D rendering
• WebGL for graphics rendering
• HTML5 and CSS3
• OrbitControls and PointerLockControls for navigation

---

## Installation

Clone the repository:

```
git clone https://github.com/yourusername/prp-navigator.git
```

Navigate to the project directory:

```
cd prp-navigator
```

Run the project by opening the main file:

```
index.html
```

Alternatively, run a simple local server:

```
python -m http.server
```

Then open:

```
http://localhost:8000
```

---

## Usage

Explore the 3D campus using mouse-based navigation.

Mouse drag rotates the camera around the campus environment.
Scroll wheel controls zooming.

Walk Mode allows first-person exploration inside corridors.

To search for a room, enter a room number such as:

```
742
```

The system automatically determines the corresponding block and floor and navigates to the location.

For navigation between rooms, enter a start and destination room to visualize the route.

---

## Project Statistics

• 5 building blocks
• 8 floors per block
• 15 rooms per floor
• 600 rooms generated dynamically

---

## Future Improvements

• Accurate architectural layout of the PRP complex
• Corridor and staircase modeling
• Advanced pathfinding using A* algorithm
• Mini-map based navigation
• Room information panels
• Augmented reality navigation integration

---

## License

This project is intended for educational and demonstration purposes.

---

## Author

Developed as a 3D campus navigation prototype for modeling building layouts and indoor navigation concepts at VIT Vellore.
