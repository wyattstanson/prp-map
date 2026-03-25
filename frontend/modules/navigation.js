import { getRoomPosition, getBlockCenter } from "./utils.js";

const graph = {
A:["C"],
B:["C"],
C:["A","B","D","E"],
D:["C"],
E:["C"]
};

function findPath(start,end){

let queue=[[start]];
let visited=new Set();

while(queue.length){

let path=queue.shift();
let node=path[path.length-1];

if(node===end) return path;

if(!visited.has(node)){
visited.add(node);
for(let n of graph[node]){
queue.push([...path,n]);
}
}

}

return [];
}

export function highlight(ctx, blocks, room){

const pos = getRoomPosition(blocks, room);

ctx.fillStyle = "yellow";
ctx.fillRect(pos.x,pos.y,12,12);

}

export function drawPath(ctx, blocks, startBlock, room){

const pathBlocks = findPath(startBlock, room.block);

ctx.strokeStyle = "red";
ctx.lineWidth = 4;

ctx.beginPath();

for(let i=0;i<pathBlocks.length;i++){

let c = getBlockCenter(blocks[pathBlocks[i]]);

if(i===0) ctx.moveTo(c.x,c.y);
else ctx.lineTo(c.x,c.y);

}

ctx.stroke();

/* final */
const end = getRoomPosition(blocks, room);
const last = getBlockCenter(blocks[pathBlocks[pathBlocks.length-1]]);

ctx.beginPath();
ctx.moveTo(last.x,last.y);
ctx.lineTo(end.x,end.y);
ctx.stroke();

}