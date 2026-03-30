import { resolveRoom } from "./rooms.js";

const API = "http://127.0.0.1:5000/chat";

let msgsEl, inputEl, sendEl, onFoundCb;

export function initChat(elements, callbacks) {
  msgsEl   = elements.msgs;
  inputEl  = elements.input;
  sendEl   = elements.send;
  onFoundCb = callbacks.onRoomFound || (() => {});

  sendEl.addEventListener("click", send);
  inputEl.addEventListener("keydown", e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } });
}

export function addMessage(role, html) {
  const wrap = document.createElement("div"); wrap.className = `msg ${role}`;
  const av   = document.createElement("div"); av.className = "msg-av"; av.textContent = role === "bot" ? "N" : "U";
  const bub  = document.createElement("div"); bub.className = "msg-bub"; bub.innerHTML = html;
  wrap.appendChild(av); wrap.appendChild(bub);
  msgsEl.appendChild(wrap); msgsEl.scrollTop = msgsEl.scrollHeight;
  return wrap;
}

async function send() {
  const val = inputEl.value.trim(); if (!val) return;
  inputEl.value = ""; setLocked(true);
  addMessage("user", val);
  const typing = addMessage("bot", '<div class="typing"><span></span><span></span><span></span></div>');
  let data = null;
  try {
    const res = await fetch(API, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: val }), signal: AbortSignal.timeout(3000),
    });
    if (res.ok) data = await res.json();
  } catch { data = resolveRoom(val); }
  typing.remove();
  if (data) {
    const txt = data.valid
      ? fmt(`Room **${data.room}** → **${data.block || data.blockId} Block** (${data.subtitle || ""}), ${data.floor_label || data.floorLabel}. Index ${data.room_index || data.roomIndex} in range ${data.range_start || data.rangeStart}–${data.range_end || data.rangeEnd}.`)
      : fmt(data.reply || "Something went wrong.");
    addMessage("bot", txt);
    if (data.valid) onFoundCb(data);
  }
  setLocked(false); inputEl.focus();
}

function fmt(t) {
  return t
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/\n/g, "<br>");
}

function setLocked(v) { inputEl.disabled = v; sendEl.disabled = v; sendEl.style.opacity = v ? ".5" : "1"; }