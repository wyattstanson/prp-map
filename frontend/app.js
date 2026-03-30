import { initMap, resize as mapResize, center as mapCenter,
         setSelected, setPath, clearPath, setHighlight,
         zoomIn, zoomOut } from "./modules/map.js";

import { initInterior, open as openInterior,
         close as closeInterior, resizeCanvas as intResize } from "./modules/interior.js";

import { initChat, addMessage } from "./modules/chat.js";

import { BLOCK_CONFIG, BLOCK_IDS, FLOOR_OPTIONS } from "./modules/rooms.js";

import { findPath, formatPath, isValidBlock } from "./modules/navigation.js";

const $ = id => document.getElementById(id);

const mapCanvas   = $("mapCanvas");
const mapWrap     = $("mapWrap");
const tooltipEl   = $("tooltip");
const floorGrid   = $("floorGrid");
const floorBadge  = $("floorBadge");
const mapHint     = $("mapHint");
const infoEmpty   = $("infoEmpty");
const infoContent = $("infoContent");
const infoName    = $("infoName");
const infoMeta    = $("infoMeta");
const infoTags    = $("infoTags");
const legendList  = $("legendList");
const navFrom     = $("navFrom");
const navTo       = $("navTo");
const pathResult  = $("pathResult");
const loaderEl    = $("loader");

document.addEventListener("DOMContentLoaded", () => {
  buildLegend();
  buildFloorGrid();

  initMap(mapCanvas, mapWrap, tooltipEl, {
    onClick: onBlockClick,
    onHover: () => {},
  });

  initInterior(
    {
      interior: $("interior"),
      canvas:   $("intCanvas"),
      floors:   $("intFloors"),
      info:     $("intInfo"),
      title:    $("intTitleBlock"),
      backBtn:  $("intBack"),
    },
    { onClose: onInteriorClose }
  );

  initChat(
    { msgs: $("chatMsgs"), input: $("chatInput"), send: $("chatSend") },
    { onRoomFound: onRoomFound }
  );

  $("btnNav").addEventListener("click",  runNavigation);
  $("btnClr").addEventListener("click",  clearNavigation);
  $("btnZoomIn").addEventListener("click",  zoomIn);
  $("btnZoomOut").addEventListener("click", zoomOut);
  $("btnReset").addEventListener("click",   () => { mapResize(); mapCenter(); });

  ["navFrom","navTo"].forEach(id => {
    const el = $(id);
    el.addEventListener("input",   () => { el.value = el.value.toUpperCase().replace(/[^A-E]/g, ""); });
    el.addEventListener("keydown", e  => { if (e.key === "Enter") runNavigation(); });
  });

  setTimeout(() => { loaderEl.classList.add("out"); setTimeout(() => loaderEl.remove(), 520); }, 820);
  setTimeout(() => mapHint.classList.add("gone"), 5000);
  mapCanvas.addEventListener("mousedown", () => mapHint.classList.add("gone"), { once: true });
});

function buildLegend() {
  BLOCK_IDS.forEach(id => {
    const b = BLOCK_CONFIG[id];
    const item = document.createElement("div"); item.className = "legend-item";
    const sw = document.createElement("div"); sw.className = "legend-swatch"; sw.style.background = b.color;
    const lbl = document.createElement("span"); lbl.textContent = `${id} — ${b.subtitle.split("·")[0].trim()}`;
    item.appendChild(sw); item.appendChild(lbl); legendList.appendChild(item);
  });
}

function buildFloorGrid() {
  FLOOR_OPTIONS.forEach(({ v, l }) => {
    const btn = document.createElement("button");
    btn.className = "floor-btn" + (v === -1 ? " active" : "");
    btn.textContent = l; btn.dataset.v = v;
    btn.addEventListener("click", () => {
      floorGrid.querySelectorAll(".floor-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      floorBadge.textContent = v === -1 ? "All Floors" : v === 0 ? "Ground Floor" : `Floor ${v}`;
    });
    floorGrid.appendChild(btn);
  });
}

function onBlockClick(id) {
  if (!id) { showInfoEmpty(); return; }
  showInfoBlock(id);
  setSelected(id);
  openInterior(id);
}

function onInteriorClose() {
  setSelected(null);
  showInfoEmpty();
}

function showInfoEmpty() {
  infoEmpty.classList.remove("hidden");
  infoContent.classList.add("hidden");
}

function showInfoBlock(id) {
  const b = BLOCK_CONFIG[id];
  infoEmpty.classList.add("hidden");
  infoContent.classList.remove("hidden");
  infoName.textContent = b.label; infoName.style.color = b.color;
  infoMeta.innerHTML = `${b.subtitle}<br>Rooms ${b.rs}–${b.re} per floor · 8 floors`;
  infoTags.innerHTML = "";
  b.tags.forEach(t => {
    const s = document.createElement("span"); s.className = "tag ac"; s.textContent = t; infoTags.appendChild(s);
  });
}

function onRoomFound(data) {
  setHighlight(data.block); setSelected(data.block);
  showInfoBlock(data.block);
  const fl = data.floor;
  floorGrid.querySelectorAll(".floor-btn").forEach(b => b.classList.toggle("active", parseInt(b.dataset.v) === fl));
  floorBadge.textContent = fl === 0 ? "Ground Floor" : `Floor ${fl}`;
  openInterior(data.block);
  setTimeout(() => setHighlight(null), 3000);
}

function runNavigation() {
  const f = navFrom.value.trim().toUpperCase();
  const t = navTo.value.trim().toUpperCase();
  if (!f || !t) { showPathResult("Enter both blocks (A–E).", false); return; }
  if (!isValidBlock(f) || !isValidBlock(t)) { showPathResult("Use A through E only.", false); return; }
  const path = findPath(f, t);
  if (!path) { showPathResult("No path found.", false); return; }
  setPath(path);
  showPathResult(formatPath(path), true);
}

function clearNavigation() {
  navFrom.value = ""; navTo.value = "";
  pathResult.classList.add("hidden");
  clearPath();
}

function showPathResult(text, ok) {
  pathResult.classList.remove("hidden", "err");
  if (!ok) pathResult.classList.add("err");
  pathResult.textContent = text;
}