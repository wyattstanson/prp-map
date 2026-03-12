import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.160/examples/jsm/controls/OrbitControls.js";

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

window.addEventListener("resize",()=>{
camera.aspect = window.innerWidth/window.innerHeight;
camera.updateProjectionMatrix();
renderer.setSize(window.innerWidth,window.innerHeight);
});

const sun = new THREE.DirectionalLight(0xffffff,1.3);
sun.position.set(200,300,200);
scene.add(sun);

scene.add(new THREE.AmbientLight(0xffffff,0.6));

const ground = new THREE.Mesh(
new THREE.PlaneGeometry(1000,1000),
new THREE.MeshStandardMaterial({color:0x0f172a})
);

ground.rotation.x = -Math.PI/2;
scene.add(ground);

const blocks = ["A","B","C","D","E"];

function createBlock(name,x){

const block = new THREE.Group();

const building = new THREE.Mesh(

new THREE.BoxGeometry(28,28,28),

new THREE.MeshPhysicalMaterial({
color:0x3b82f6,
metalness:0.6,
roughness:0.2,
transparent:true,
opacity:0.85
})

);

building.position.y = 14;
block.add(building);

const corridor = new THREE.Mesh(

new THREE.BoxGeometry(30,2,6),

new THREE.MeshStandardMaterial({color:0x1e293b})

);

corridor.position.y = 1;
corridor.position.z = 20;

block.add(corridor);

createWindows(building);

block.position.x = x;

scene.add(block);

}

function createWindows(building){

for(let i=0;i<8;i++){

for(let j=0;j<6;j++){

const windowMesh = new THREE.Mesh(

new THREE.BoxGeometry(1.5,1.5,0.2),

new THREE.MeshStandardMaterial({color:0xffffaa,emissive:0xffffaa,emissiveIntensity:1})

);

windowMesh.position.set(-10 + i*3,4 + j*3,14.1);

building.add(windowMesh);

}

}

}

let startX = -80;

blocks.forEach(b=>{

createBlock(b,startX);

startX += 40;

});

const grid = new THREE.GridHelper(1000,100,0x444444,0x222222);
scene.add(grid);

function animate(){

requestAnimationFrame(animate);

controls.update();

renderer.render(scene,camera);

}

animate();
}
