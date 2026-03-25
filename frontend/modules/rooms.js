export function generateRooms(){

const rooms = {};

function addRange(block, floor, start, end){

for(let i=start; i<=end; i++){

let roomNo = floor === "G"
? "G" + String(i).padStart(2,"0")
: String(i);

let index = i % 10;

rooms[roomNo] = {
block,
offsetX: (index % 5) * 25 + 20,
offsetY: Math.floor(index / 5) * 25 + 20,
floor
};

}

}

/* G */
addRange("A","G",43,53);
addRange("B","G",60,67);
addRange("C","G",1,28);
addRange("D","G",68,72);
addRange("E","G",31,39);

/* 1 */
addRange("A","1",146,152);
addRange("B","1",163,171);
addRange("C","1",101,131);
addRange("D","1",172,176);
addRange("E","1",131,145);

return rooms;
}