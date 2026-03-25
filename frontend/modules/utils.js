export function getBlockCenter(block){
  return { x: block.x + 60, y: block.y + 40 };
}

export function getRoomPosition(blocks, room){
  const block = blocks[room.block];
  return {
    x: block.x + room.offsetX,
    y: block.y + room.offsetY
  };
}