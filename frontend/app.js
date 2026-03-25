import { initMap, resizeCanvas, centerView, setSelectedBlock,
         setActiveFloor, setActivePath, clearActivePath,
         zoomIn, zoomOut, setHighlightedRoom } from "./modules/map.js";

import { initChat, appendMessage }             from "./modules/chat.js";

import { BLOCK_CONFIG }                        from "./modules/rooms.js";

import { findShortestPath, formatPathResult,
         getActiveEdges, isValidBlock }        from "./modules/navigation.js";

import { getFloorOptions }                     from "./modules/rooms.js";

const canvasEl       = document.getElementById("mapCanvas");
const canvasWrap     = document.getElementById("canvasWrap");
const tooltipEl      = createTooltip();

const floorGridEl    = document.getElementById("floorGrid");
const mapFloorBadge  = document.getElementById("mapFloorBadge");
const canvasHint     = document.getElementById("canvasHint");

const infoPanelEmpty   = document.getElementById("infoPanelEmpty");
const infoPanelContent = document.getElementById("infoPanelContent");
const infoBlockName    = document.getElementById("infoBlockName");
const infoMeta         = document.getElementById("infoMeta");
const infoTags         = document.getElementById("infoTags");
const legendItems      = document.getElementById("legendItems");

const navFromEl      = document.getElementById("navFrom");
const navToEl        = document.getElementById("navTo");
const btnNavigate    = document.getElementById("btnNavigate");
const btnClear       = document.getElementById("btnClear");
const pathResult     = document.getElementById("pathResult");

const btnZoomIn      = document.getElementById("btnZoomIn");
const btnZoomOut     = document.getElementById("btnZoomOut");
const btnReset       = document.getElementById("btnReset");
const btnToggle3D    = document.getElementById("btnToggle3D");

const chatMessages   = document.getElementById("chatMessages");
const chatInputEl    = document.getElementById("chatInput");
const btnSend        = document.getElementById("btnSend");

let currentFloor = -1;
let is3D         = false;

document.addEventListener("DOMContentLoaded", () => {
  showLoadingScreen().then(bootstrap);
});

async function bootstrap() {
  buildLegend();
  buildFloorSelector();
  initMap(canvasEl, tooltipEl, {
    onClick: handleBlockClick,
    onHover: handleBlockHover,
  });
  initChat(
    { messages: chatMessages, input: chatInputEl, sendBtn: btnSend },
    { onRoomLocated: handleRoomLocated }
  );
  attachToolbarListeners();
  attachNavListeners();
  fadeHint();
}

function showLoadingScreen() {
  const overlay = document.createElement("div");
  overlay.className = "loading-overlay";
  overlay.innerHTML = `
    <div class="loading-logo">PRP<em>Nav</em></div>
    <div class="loading-bar-wrap"><div class="loading-bar"></div></div>
    <div class="loading-text">Initialising campus map…</div>
  `;
  document.body.appendChild(overlay);

  return new Promise((resolve) => {
    setTimeout(() => {
      overlay.classList.add("hidden");
      setTimeout(() => overlay.remove(), 500);
      resolve();
    }, 1000);
  });
}

function createTooltip() {
  const el = document.createElement("div");
  el.className = "map-tooltip";
  el.innerHTML = `<div class="tooltip-name"></div><div class="tooltip-sub"></div>`;
  document.body.appendChild(el);
  return el;
}

function buildLegend() {
  Object.values(BLOCK_CONFIG).forEach((cfg) => {
    const item  = document.createElement("div");
    item.className = "legend-item";
    const swatch = document.createElement("div");
    swatch.className = "legend-swatch";
    swatch.style.background = cfg.color;
    const label = document.createElement("span");
    label.textContent = `${cfg.id} Block — ${cfg.subtitle.split("·")[0].trim()}`;
    item.appendChild(swatch);
    item.appendChild(label);
    legendItems.appendChild(item);
  });
}

function buildFloorSelector() {
  const options = getFloorOptions();
  options.forEach(({ value, label }) => {
    const btn = document.createElement("button");
    btn.className = "floor-btn" + (value === -1 ? " active" : "");
    btn.textContent = label;
    btn.dataset.floor = value;
    btn.addEventListener("click", () => selectFloor(value));
    floorGridEl.appendChild(btn);
  });
}

function selectFloor(floor) {
  currentFloor = floor;
  setActiveFloor(floor);

  mapFloorBadge.textContent =
    floor === -1 ? "All Floors" : floor === 0 ? "Ground Floor" : `Floor ${floor}`;

  floorGridEl.querySelectorAll(".floor-btn").forEach((btn) => {
    btn.classList.toggle("active", Number(btn.dataset.floor) === floor);
  });
}

function handleBlockClick(blockId) {
  if (!blockId) {
    infoPanelEmpty.classList.remove("hidden");
    infoPanelContent.classList.add("hidden");
    return;
  }
  const cfg = BLOCK_CONFIG[blockId];
  infoPanelEmpty.classList.add("hidden");
  infoPanelContent.classList.remove("hidden");

  infoBlockName.textContent  = cfg.label;
  infoBlockName.style.color  = cfg.color;
  infoMeta.innerHTML =
    `${cfg.subtitle}<br>` +
    `Rooms ${cfg.rangeStart}–${cfg.rangeEnd} per floor · 8 floors`;

  infoTags.innerHTML = "";
  cfg.tags.forEach((tag) => {
    const span = document.createElement("span");
    span.className = "tag accent";
    span.textContent = tag;
    infoTags.appendChild(span);
  });
}

function handleBlockHover(_blockId) {}

function handleRoomLocated(data) {
  if (!data.valid) return;

  setHighlightedRoom(data.block);
  setSelectedBlock(data.block);
  handleBlockClick(data.block);

  selectFloor(data.floor);

  setTimeout(() => setHighlightedRoom(null), 3000);
}

function attachNavListeners() {
  btnNavigate.addEventListener("click", runNavigation);
  btnClear.addEventListener("click", clearNavigation);

  [navFromEl, navToEl].forEach((el) => {
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter") runNavigation();
    });
    el.addEventListener("input", () => {
      el.value = el.value.toUpperCase().replace(/[^A-E]/g, "");
    });
  });
}

function runNavigation() {
  const from = navFromEl.value.trim().toUpperCase();
  const to   = navToEl.value.trim().toUpperCase();

  if (!from || !to) {
    showPathResult("Enter both a start and destination block.", false);
    return;
  }
  if (!isValidBlock(from) || !isValidBlock(to)) {
    showPathResult("Use block letters A through E only.", false);
    return;
  }

  const result = findShortestPath(from, to);
  const text   = formatPathResult(result);
  showPathResult(text, result.found);

  if (result.found) {
    const edges = getActiveEdges(result.path);
    setActivePath(result.path, edges);
  }
}

function clearNavigation() {
  navFromEl.value = "";
  navToEl.value   = "";
  pathResult.classList.add("hidden");
  clearActivePath();
}

function showPathResult(text, success) {
  pathResult.classList.remove("hidden");
  pathResult.textContent = text;
  pathResult.style.borderColor = success
    ? "rgba(110, 231, 192, 0.25)"
    : "rgba(240, 100, 100, 0.25)";
  pathResult.style.background = success
    ? "rgba(110, 231, 192, 0.08)"
    : "rgba(240, 100, 100, 0.08)";
  pathResult.style.color = success ? "var(--accent2)" : "var(--danger)";
}

function attachToolbarListeners() {
  btnZoomIn.addEventListener("click",  zoomIn);
  btnZoomOut.addEventListener("click", zoomOut);
  btnReset.addEventListener("click",   () => { resizeCanvas(); centerView(); });
  btnToggle3D.addEventListener("click", () => {
    is3D = !is3D;
    btnToggle3D.classList.toggle("active", is3D);
    selectFloor(is3D ? -1 : currentFloor);
    appendMessage("bot",
      is3D
        ? "3D stacked view enabled — showing floor depth illusion."
        : "Switched back to flat floor view."
    );
  });
}

function fadeHint() {
  setTimeout(() => canvasHint.classList.add("faded"), 4000);
  canvasEl.addEventListener("mousedown", () => canvasHint.classList.add("faded"), { once: true });
}