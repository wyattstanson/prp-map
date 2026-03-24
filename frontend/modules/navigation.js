import { getRoomPosition, getBlockCenter } from "./utils.js";

export function highlight(ctx, blocks, room){

const pos = getRoomPosition(blocks, room);

ctx.fillStyle = "yellow";
ctx.fillRect(pos.x, pos.y, 15, 15);

}

export function drawPath(ctx, blocks, startBlock, room){

const start = getBlockCenter(blocks[startBlock]);
const end = getRoomPosition(blocks, room);

ctx.strokeStyle = "red";
ctx.lineWidth = 4;

ctx.beginPath();
ctx.moveTo(start.x, start.y);
ctx.lineTo(end.x, end.y);
ctx.stroke();

}