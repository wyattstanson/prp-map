export function drawMap(ctx, blocks){

ctx.clearRect(0,0,window.innerWidth,window.innerHeight);

for(let b in blocks){

let block = blocks[b];

ctx.fillStyle = "#3b82f6";
ctx.fillRect(block.x,block.y,120,80);

ctx.fillStyle = "white";
ctx.font = "14px Arial";
ctx.fillText("Block "+b,block.x+25,block.y+45);

}

}