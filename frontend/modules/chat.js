let messagesEl = null;
let inputEl    = null;
let sendBtnEl  = null;

let onRoomLocated = null;

const API_URL = "http://127.0.0.1:5000/chat";

export function initChat(els, callbacks) {
  messagesEl   = els.messages;
  inputEl      = els.input;
  sendBtnEl    = els.sendBtn;
  onRoomLocated = callbacks.onRoomLocated || (() => {});

  sendBtnEl.addEventListener("click", handleSend);
  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  });
}

export function appendMessage(role, text) {
  const wrap = document.createElement("div");
  wrap.className = `chat-msg ${role}`;

  const avatar = document.createElement("div");
  avatar.className = "msg-avatar";
  avatar.textContent = role === "bot" ? "N" : "U";

  const bubble = document.createElement("div");
  bubble.className = "msg-bubble";
  bubble.innerHTML = formatMessageText(text);

  wrap.appendChild(avatar);
  wrap.appendChild(bubble);
  messagesEl.appendChild(wrap);
  scrollToBottom();

  return wrap;
}

function showTypingIndicator() {
  const wrap = appendMessage("bot", "");
  wrap.querySelector(".msg-bubble").innerHTML = `
    <div class="typing-indicator">
      <span></span><span></span><span></span>
    </div>`;
  scrollToBottom();
  return {
    remove: () => {
      if (wrap.parentElement) wrap.parentElement.removeChild(wrap);
    },
  };
}

async function handleSend() {
  const raw = inputEl.value.trim();
  if (!raw) return;

  inputEl.value = "";
  setInputLocked(true);
  appendMessage("user", raw);

  const typing = showTypingIndicator();

  try {
    const data = await sendToBackend(raw);
    typing.remove();
    appendMessage("bot", formatBotReply(data));
    if (data.valid) {
      onRoomLocated(data);
    }
  } catch (err) {
    typing.remove();
    appendMessage("bot", `Connection error — is the Flask server running?\n\`${err.message}\``);
  } finally {
    setInputLocked(false);
    inputEl.focus();
  }
}

async function sendToBackend(message) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

function formatBotReply(data) {
  if (!data.valid) {
    return data.reply || "I couldn't understand that. Try a room number like `742`.";
  }
  return (
    `Found **${data.room}** — ` +
    `**${data.block} Block** (${data.subtitle || ""}) · ${data.floor_label}. ` +
    `Room index **${data.room_index}** falls in range ${data.range_start}–${data.range_end}.`
  );
}

function formatMessageText(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/\n/g, "<br>");
}

function scrollToBottom() {
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function setInputLocked(locked) {
  inputEl.disabled   = locked;
  sendBtnEl.disabled = locked;
  sendBtnEl.style.opacity = locked ? "0.5" : "1";
}