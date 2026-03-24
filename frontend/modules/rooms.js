export function generateRooms(){

const blocks = {
A:[1,15],
B:[16,30],
C:[31,45],
D:[46,60],
E:[61,75]
};

const rooms = {};

for(let block in blocks){

let [start,end] = blocks[block];

for(let floor=0; floor<=7; floor++){

for(let r=start; r<=end; r++){

let roomNumber;

if(floor === 0){
roomNumber = "G" + String(r).padStart(2,"0");
}else{
roomNumber = floor + String(r).padStart(2,"0");
}

let index = r - start;

rooms[roomNumber] = {
block,
offsetX: (index % 5) * 20 + 10,
offsetY: Math.floor(index / 5) * 20 + 10,
floor
};

}

}

}

return rooms;

}