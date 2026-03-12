import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160/build/three.module.js";
import {OrbitControls} from "https://cdn.jsdelivr.net/npm/three@0.160/examples/jsm/controls/OrbitControls.js";

/* scene */

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b1220);

/* camera */

const camera = new THREE.PerspectiveCamera(
60,
window.innerWidth/window.innerHeight,
0.1,
1000
);

camera.position.set(80,60,80);

/* renderer */

const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(window.innerWidth,window.innerHeight);
document.body.appendChild(renderer.domElement);

/* controls */

const controls = new OrbitControls(camera,renderer.domElement);
controls.enableDamping = true;

/* lighting */

const sun = new THREE.DirectionalLight(0xffffff,1.5);
sun.position.set(100,200,100);
scene.add(sun);

scene.add(new THREE.AmbientLight(0xffffff,0.6));

/* ground */

const ground = new THREE.Mesh(

new THREE.PlaneGeometry(500,500),
new THREE.MeshStandardMaterial({color:0x111827})

);

ground.rotation.x = -Math.PI/2;
scene.add(ground);

/* grid */

const grid = new THREE.GridHelper(500,50,0x444444,0x222222);
scene.add(grid);

/* building generator */

function createBlock(x,z){

const block = new THREE.Mesh(

new THREE.BoxGeometry(25,40,25),

new THREE.MeshStandardMaterial({color:0x3b82f6})

);

block.position.set(x,20,z);

scene.add(block);

}

/* arrange blocks similar to PRP */

createBlock(-40,0);
createBlock(-15,20);
createBlock(15,20);
createBlock(40,0);
createBlock(0,-20);

/* load room coordinates */

let rooms = {};

fetch("rooms.json")
.then(res => res.json())
.then(data => {

rooms = data;

});

/* search room */

document.getElementById("goBtn").onclick = () => {

const roomNumber = document.getElementById("roomInput").value;

const room = rooms[roomNumber];

if(!room){
alert("Room not found");
return;
}

camera.position.set(
room.x + 20,
room.y + 20,
room.z + 20
);

controls.target.set(
room.x,
room.y,
room.z
);

};

/* resize */

window.addEventListener("resize",()=>{

camera.aspect = window.innerWidth/window.innerHeight;
camera.updateProjectionMatrix();
renderer.setSize(window.innerWidth,window.innerHeight);

});

/* animation */

function animate(){

requestAnimationFrame(animate);

controls.update();

renderer.render(scene,camera);

}

animate();
