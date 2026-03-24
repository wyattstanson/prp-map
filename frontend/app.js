import {generateRooms} from "./modules/rooms.js";
import {drawMap} from "./modules/map.js";
import {highlight, drawPath} from "./modules/navigation.js";
import {setupChat} from "./modules/chat.js";

const canvas = document.getElementById("map");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const blocks = {
A:{x:500,y:420},
B:{x:350,y:260},
C:{x:500,y:180},
D:{x:650,y:260},
E:{x:500,y:560}
};

const rooms = generateRooms();

function draw(){
drawMap(ctx, blocks);
}

draw();

setupChat(rooms, draw, highlight, drawPath, blocks, ctx);