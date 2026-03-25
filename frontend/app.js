import {generateRooms} from "./modules/rooms.js";
import {drawMap} from "./modules/map.js";
import {highlight, drawPath} from "./modules/navigation.js";
import {setupChat} from "./modules/chat.js";

const canvas = document.getElementById("map");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let currentFloor = "G";

window.setFloor = function(floor){
  currentFloor = floor;
  draw();
};

/* 🔥 BETTER POSITIONS (aligned to image) */
const blocks = {
A:{x:520,y:520},
B:{x:420,y:250},
C:{x:700,y:320},
D:{x:950,y:260},
E:{x:880,y:580}
};

const rooms = generateRooms();

function draw(){
  drawMap(ctx, blocks, currentFloor);
}

draw();

setupChat(rooms, draw, highlight, drawPath, blocks, ctx);