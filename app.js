import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160/build/three.module.js";
import {OrbitControls} from "https://cdn.jsdelivr.net/npm/three@0.160/examples/jsm/controls/OrbitControls.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b1220);

const camera = new THREE.PerspectiveCamera(
75,
window.innerWidth/window.innerHeight,
0.1,
2000
);

camera.position.set(120,80,120);

const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(window.innerWidth,window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera,renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enablePan = true;

window.addEventListener("resize",()=>{
camera.aspect = window.innerWidth/window.innerHeight;
camera.updateProjectionMatrix();
renderer.setSize(window.innerWidth,window.innerHeight);
});

const light = new THREE.DirectionalLight(0xffffff,1.2);
light.position.set(200,300,200);
scene.add(light);

scene.add(new THREE.AmbientLight(0xffffff,0.6));

const ground = new THREE.Mesh(
new THREE.PlaneGeometry(1000,1000),
new THREE.MeshStandardMaterial({color:0x111827})
);

ground.rotation.x = -Math.PI/2;
scene.add(ground);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const tooltip = document.getElementById("tooltip");

const roomMeshes = [];

const blockRanges = {
A:[1,15],
B:[16,30],
C:[31,45],
D:[46,60],
E:[61,75]
};

function createBlock(name,start,end,x){

const block = new THREE.Group();

const building = new THREE.Mesh(

new THREE.BoxGeometry(40,60,40),

new THREE.MeshPhysicalMaterial({
color:0x3b82f6,
metalness:0.5,
roughness:0.2,
transparent:true,
opacity:0.9
})

);

building.position.y = 30;
block.add(building);

for(let floor=0;floor<=7;floor++){

for(let r=start;r<=end;r++){

const room = new THREE.Mesh(

new THREE.BoxGeometry(2,2,2),

new THREE.MeshStandardMaterial({
color:0xffffaa,
emissive:0xffffaa,
emissiveIntensity:1
})

);

room.position.set(
-14 + (r-start)*2,
5 + floor*6,
21
);

room.userData.room = generateRoom(floor,r);

roomMeshes.push(room);

building.add(room);

}

}

block.position.x = x;
scene.add(block);

}

function generateRoom(floor,room){

if(floor===0){
return "G"+String(room).padStart(2,"0");
}

return floor+String(room).padStart(2,"0");

}

let spacing = 70;

createBlock("A",1,15,-2*spacing);
createBlock("B",16,30,-spacing);
createBlock("C",31,45,0);
createBlock("D",46,60,spacing);
createBlock("E",61,75,2*spacing);

window.addEventListener("mousemove",(event)=>{

mouse.x = (event.clientX/window.innerWidth)*2 -1;
mouse.y = -(event.clientY/window.innerHeight)*2 +1;

raycaster.setFromCamera(mouse,camera);

const intersects = raycaster.intersectObjects(roomMeshes);

if(intersects.length>0){

const obj = intersects[0].object;

tooltip.style.display="block";
tooltip.innerHTML = obj.userData.room;

tooltip.style.left = event.clientX + "px";
tooltip.style.top = event.clientY + "px";

}else{

tooltip.style.display="none";

}

});

document.getElementById("focusBtn").onclick = ()=>{

smoothMove(new THREE.Vector3(120,80,120));

};

document.getElementById("nightBtn").onclick = ()=>{

if(scene.background.getHex()==0x0b1220){
scene.background = new THREE.Color(0x000000);
}else{
scene.background = new THREE.Color(0x0b1220);
}

};

function smoothMove(target){

const start = camera.position.clone();
let progress = 0;

function move(){

progress += 0.02;

camera.position.lerpVectors(start,target,progress);

if(progress<1){
requestAnimationFrame(move);
}

}

move();

}

function animate(){

requestAnimationFrame(animate);

controls.update();

renderer.render(scene,camera);

}

animate();
