export function setupChat(rooms, draw, highlight, drawPath, blocks, ctx){

const messages = document.getElementById("messages");
const input = document.getElementById("chatInput");
const button = document.getElementById("sendBtn");

function addMessage(text, type){
const div = document.createElement("div");
div.classList.add("message", type);
div.innerText = text;
messages.appendChild(div);
messages.scrollTop = messages.scrollHeight;
}

async function sendMessage(){

const userText = input.value.trim();
if(!userText) return;

addMessage(userText, "user");
input.value = "";
input.focus();

try{

const res = await fetch("http://localhost:5000/chat",{
method:"POST",
headers:{"Content-Type":"application/json"},
body: JSON.stringify({message:userText})
});

const data = await res.json();

addMessage(data.reply, "bot");

if(data.room){
const room = rooms[data.room];
if(room){
draw();
highlight(ctx,blocks,room);
drawPath(ctx,blocks,"A",room);
}
}

}catch(err){
addMessage("Server error. Start backend.", "bot");
}

}

button.onclick = sendMessage;

input.addEventListener("keydown",(e)=>{
if(e.key === "Enter") sendMessage();
});

addMessage("Hi. Ask a room number (e.g. 742)", "bot");

}