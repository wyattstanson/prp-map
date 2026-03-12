import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160/build/three.module.js";
import {OrbitControls} from "https://cdn.jsdelivr.net/npm/three@0.160/examples/jsm/controls/OrbitControls.js";
import {PointerLockControls} from "https://cdn.jsdelivr.net/npm/three@0.160/examples/jsm/controls/PointerLockControls.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0f172a);

const camera = new THREE.PerspectiveCamera(
75,
window.innerWidth/window.innerHeight,
0.1,
2000
);

camera.position.set(80,60,80);

const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(window.innerWidth,window.innerHeight);
document.body.appendChild(renderer.domElement);

const orbit = new OrbitControls(camera,renderer.domElement);
orbit.enableDamping=true;

const walkControls = new PointerLockControls(camera,document.body);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

let walkMode=false;

const tooltip=document.getElementById("tooltip");

const blocks={};
const roomMeshes={};

const blockRanges={
A:[1,15],
B:[16,30],
C:[31,45],
D:[46,60],
E:[61,75]
};

initLights();
createGround();
createCampus();

animate();

function initLights(){

const sun=new THREE.DirectionalLight(0xffffff,1.2);
sun.position.set(100,200,100);

scene.add(sun);
scene.add(new THREE.AmbientLight(0xffffff,0.6));

}

function createGround(){

const ground=new THREE.Mesh(

new THREE.PlaneGeometry(500,500),
new THREE.MeshStandardMaterial({color:0x1e293b})

);

ground.rotation.x=-Math.PI/2;
scene.add(ground);

}

function createCampus(){

let x=-40;

for(const block in blockRanges){

createBlock(block,blockRanges[block],x);
x+=20;

}

}

function createBlock(name,range,x){

const group=new THREE.Group();

for(let floor=0;floor<=7;floor++){

for(let r=range[0];r<=range[1];r++){

const mesh=new THREE.Mesh(

new THREE.BoxGeometry(2,1,2),

new THREE.MeshStandardMaterial({
color:0x60a5fa,
transparent:true,
opacity:0.85
})

);

mesh.position.set((r-range[0])*2.2-15,floor*1.2,0);

mesh.userData={
block:name,
floor:floor,
room:generateRoom(floor,r)
};

group.add(mesh);
roomMeshes[mesh.userData.room]=mesh;

}

}

group.position.x=x;
scene.add(group);

blocks[name]=group;

}

function generateRoom(floor,room){

if(floor===0)
return "G"+String(room).padStart(2,"0");

return floor+String(room).padStart(2,"0");

}

document.addEventListener("mousemove",e=>{

mouse.x=(e.clientX/window.innerWidth)*2-1;
mouse.y=-(e.clientY/window.innerHeight)*2+1;

raycaster.setFromCamera(mouse,camera);

const hits=raycaster.intersectObjects(scene.children,true);

if(hits.length>0){

const obj=hits[0].object;

if(obj.userData.room){

tooltip.style.display="block";
tooltip.innerHTML=obj.userData.room;

tooltip.style.left=e.clientX+"px";
tooltip.style.top=e.clientY+"px";

}else{
tooltip.style.display="none";
}

}

});

document.getElementById("nightBtn").onclick=()=>{

scene.background = new THREE.Color(
scene.background.getHex()==0x0f172a ? 0x000000 : 0x0f172a
);

};

document.getElementById("walkBtn").onclick=()=>{

walkMode=!walkMode;

if(walkMode){

orbit.enabled=false;
walkControls.lock();

}else{

orbit.enabled=true;
walkControls.unlock();

}

};

document.getElementById("pathBtn").onclick=()=>{

const start=document.getElementById("startRoom").value;
const end=document.getElementById("endRoom").value;

findPath(start,end);

};

function findPath(start,end){

if(!roomMeshes[start]||!roomMeshes[end]){

alert("Invalid rooms");
return;

}

const startPos=roomMeshes[start].position.clone();
const endPos=roomMeshes[end].position.clone();

const pathGeom=new THREE.BufferGeometry().setFromPoints([
startPos,
endPos
]);

const line=new THREE.Line(
pathGeom,
new THREE.LineBasicMaterial({color:0xff0000})
);

scene.add(line);

}

function animate(){

requestAnimationFrame(animate);

orbit.update();

renderer.render(scene,camera);

}
