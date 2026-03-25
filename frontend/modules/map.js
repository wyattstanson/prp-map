export function drawMap(ctx, blocks, floor){

ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);


const floors = 7;
const offsetZ = 14;


const baseX = ctx.canvas.width * 0.65;
const baseY = ctx.canvas.height * 0.55;


const colors = {
A:"#f97316",
B:"#22c55e",
C:"#eab308",
D:"#3b82f6",
E:"#a855f7"
};


function drawHex(x,y,size,color,depth){

ctx.beginPath();
ctx.moveTo(x, y - size);
ctx.lineTo(x + size, y - size/2);
ctx.lineTo(x + size, y + size/2);
ctx.lineTo(x, y + size);
ctx.lineTo(x - size, y + size/2);
ctx.lineTo(x - size, y - size/2);
ctx.closePath();


ctx.fillStyle = shade(color, depth * 6);
ctx.fill();

ctx.strokeStyle = "#020617";
ctx.lineWidth = 1;
ctx.stroke();
}


function shade(color, percent){
let num = parseInt(color.slice(1),16),
amt = Math.round(2.55 * percent),
R = (num >> 16) + amt,
G = (num >> 8 & 0x00FF) + amt,
B = (num & 0x0000FF) + amt;

return "#" + (
0x1000000 +
(R<255?R<1?0:R:255)*0x10000 +
(G<255?G<1?0:G:255)*0x100 +
(B<255?B<1?0:B:255)
).toString(16).slice(1);
}


const layout = {
A:{x:-220,y:150},
B:{x:-150,y:-150},
C:{x:0,y:0},
D:{x:200,y:-150},
E:{x:260,y:150}  
};


for(let f=0; f<floors; f++){

let depth = floors - f;

for(let key in layout){

let pos = layout[key];

let x = baseX + pos.x;
let y = baseY + pos.y - f * offsetZ;

drawHex(x,y,70,colors[key],depth);


if(f === floors-1){
ctx.fillStyle = "white";
ctx.font = "14px Inter";
ctx.fillText("Block " + key, x-35, y+5);
}

}

}


ctx.strokeStyle = "#94a3b8";
ctx.lineWidth = 5;

function connect(a,b){
ctx.beginPath();
ctx.moveTo(a.x,a.y);
ctx.lineTo(b.x,b.y);
ctx.stroke();
}

const top = {};
for(let k in layout){
top[k] = {
x: baseX + layout[k].x,
y: baseY + layout[k].y - (floors-1)*offsetZ
};
}

connect(top.A, top.C);
connect(top.B, top.C);
connect(top.C, top.D);
connect(top.C, top.E);


ctx.fillStyle = "#e5e7eb";
ctx.font = "18px Inter";
ctx.fillText("Floor: " + floor, 20, 30);

}