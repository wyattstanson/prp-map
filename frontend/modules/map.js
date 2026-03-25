import {
  hexagonPoints,
  pointInPolygon,
  hexToRgba,
  adjustBrightness,
  lerp,
  clamp,
} from "./utils.js";
import { BLOCK_CONFIG, BLOCK_IDS, CORRIDORS } from "./rooms.js";

const HEX_RADIUS     = 82;
const HEX_ROTATION   = 30;
const FLOOR_OFFSET_Y = 6;
const FLOOR_OFFSET_X = 2;
const CORRIDOR_WIDTH = 14;
const ACTIVE_PATH_COLOR = "#6ee7c0";
const GRID_COLOR     = "rgba(82, 160, 255, 0.045)";
const GRID_SIZE      = 48;

let canvas, ctx;
let width = 0, height = 0;

let panX = 0, panY = 0;
let scale = 1;
const MIN_SCALE = 0.4;
const MAX_SCALE = 2.8;

let isDragging = false;
let dragStart  = { x: 0, y: 0 };
let panStart   = { x: 0, y: 0 };

let hoveredBlock   = null;
let selectedBlock  = null;
let activeFloor    = -1;
let activePath     = [];
let activeEdges    = new Set();
let highlightedRoom = null;

let onBlockClick  = null;
let onBlockHover  = null;
let tooltipEl     = null;

let animFrame     = null;
let needsRedraw   = true;

export function initMap(canvasEl, tooltipElement, callbacks) {
  canvas     = canvasEl;
  ctx        = canvas.getContext("2d");
  tooltipEl  = tooltipElement;
  onBlockClick = callbacks.onClick || (() => {});
  onBlockHover = callbacks.onHover || (() => {});

  resizeCanvas();
  centerView();
  attachInputListeners();
  startRenderLoop();
}

export function resizeCanvas() {
  const rect = canvas.parentElement.getBoundingClientRect();
  const dpr  = window.devicePixelRatio || 1;
  width  = rect.width;
  height = rect.height;
  canvas.width  = width  * dpr;
  canvas.height = height * dpr;
  canvas.style.width  = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  needsRedraw = true;
}

export function centerView() {
  panX = width  / 2;
  panY = height / 2;
  scale = 1;
  needsRedraw = true;
}

export function setSelectedBlock(blockId) {
  selectedBlock = blockId;
  needsRedraw = true;
}

export function setActiveFloor(floor) {
  activeFloor = floor;
  needsRedraw = true;
}

export function setActivePath(pathArray, edgeSet) {
  activePath  = pathArray;
  activeEdges = edgeSet || new Set();
  needsRedraw = true;
}

export function clearActivePath() {
  activePath  = [];
  activeEdges = new Set();
  needsRedraw = true;
}

export function setHighlightedRoom(blockId) {
  highlightedRoom = blockId;
  needsRedraw = true;
}

export function zoomIn()    { applyZoom(1.2, width / 2, height / 2); }
export function zoomOut()   { applyZoom(0.83, width / 2, height / 2); }

function logicalToCanvas(lx, ly) {
  const unitScale = Math.min(width, height) * 0.22;
  return {
    x: panX + lx * unitScale * scale,
    y: panY + ly * unitScale * scale,
  };
}

function scaledRadius() {
  return HEX_RADIUS * scale;
}

function blockCenter(blockId) {
  const cfg = BLOCK_CONFIG[blockId];
  return logicalToCanvas(cfg.logicalX, cfg.logicalY);
}

function blockHexPoints(blockId, floorDepth = 0) {
  const c = blockCenter(blockId);
  const r = scaledRadius();
  const fx = floorDepth * FLOOR_OFFSET_X * scale;
  const fy = floorDepth * FLOOR_OFFSET_Y * scale;
  return hexagonPoints(c.x + fx, c.y - fy, r, HEX_ROTATION);
}

function hitTestBlocks(px, py) {
  for (let i = BLOCK_IDS.length - 1; i >= 0; i--) {
    const id     = BLOCK_IDS[i];
    const points = blockHexPoints(id, 0);
    if (pointInPolygon(px, py, points)) return id;
  }
  return null;
}

function applyZoom(factor, cx, cy) {
  const newScale = clamp(scale * factor, MIN_SCALE, MAX_SCALE);
  const ratio    = newScale / scale;
  panX = cx + (panX - cx) * ratio;
  panY = cy + (panY - cy) * ratio;
  scale = newScale;
  needsRedraw = true;
}

function attachInputListeners() {
  canvas.addEventListener("mousedown", onMouseDown);
  canvas.addEventListener("mousemove", onMouseMove);
  canvas.addEventListener("mouseup",   onMouseUp);
  canvas.addEventListener("mouseleave", onMouseLeave);
  canvas.addEventListener("wheel",     onWheel, { passive: false });
  canvas.addEventListener("click",     onClick);
  window.addEventListener("resize",    () => { resizeCanvas(); centerView(); });
}

function canvasCoords(e) {
  const rect = canvas.getBoundingClientRect();
  return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

function onMouseDown(e) {
  isDragging = true;
  dragStart  = canvasCoords(e);
  panStart   = { x: panX, y: panY };
  canvas.style.cursor = "grabbing";
}

function onMouseMove(e) {
  const pos = canvasCoords(e);

  if (isDragging) {
    panX = panStart.x + (pos.x - dragStart.x);
    panY = panStart.y + (pos.y - dragStart.y);
    needsRedraw = true;
    return;
  }

  const hit = hitTestBlocks(pos.x, pos.y);
  if (hit !== hoveredBlock) {
    hoveredBlock = hit;
    canvas.style.cursor = hit ? "pointer" : "grab";
    onBlockHover(hit);
    needsRedraw = true;
  }

  if (hit && tooltipEl) {
    const cfg = BLOCK_CONFIG[hit];
    tooltipEl.querySelector(".tooltip-name").textContent = cfg.label;
    tooltipEl.querySelector(".tooltip-sub").textContent  = cfg.subtitle;
    tooltipEl.style.left = `${e.clientX + 14}px`;
    tooltipEl.style.top  = `${e.clientY - 8}px`;
    tooltipEl.classList.add("visible");
  } else if (tooltipEl) {
    tooltipEl.classList.remove("visible");
  }
}

function onMouseUp() {
  isDragging = false;
  canvas.style.cursor = hoveredBlock ? "pointer" : "grab";
}

function onMouseLeave() {
  isDragging = false;
  hoveredBlock = null;
  if (tooltipEl) tooltipEl.classList.remove("visible");
  canvas.style.cursor = "grab";
  needsRedraw = true;
}

function onClick(e) {
  const pos = canvasCoords(e);
  const hit = hitTestBlocks(pos.x, pos.y);
  if (hit) {
    setSelectedBlock(hit === selectedBlock ? null : hit);
    onBlockClick(hit === selectedBlock ? null : hit);
  }
}

function onWheel(e) {
  e.preventDefault();
  const pos    = canvasCoords(e);
  const factor = e.deltaY < 0 ? 1.12 : 0.89;
  applyZoom(factor, pos.x, pos.y);
}

function startRenderLoop() {
  function loop() {
    if (needsRedraw) {
      draw();
      needsRedraw = false;
    }
    animFrame = requestAnimationFrame(loop);
  }
  loop();
}

function draw() {
  ctx.clearRect(0, 0, width, height);
  drawGrid();
  drawCorridors();
  drawBlocks();
}

function drawGrid() {
  ctx.strokeStyle = GRID_COLOR;
  ctx.lineWidth   = 1;

  const offsetX = panX % (GRID_SIZE * scale);
  const offsetY = panY % (GRID_SIZE * scale);

  for (let x = offsetX; x < width; x += GRID_SIZE * scale) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = offsetY; y < height; y += GRID_SIZE * scale) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}

function drawCorridors() {
  CORRIDORS.forEach(({ from, to }) => {
    const a       = blockCenter(from);
    const b       = blockCenter(to);
    const edgeKey = [from, to].sort().join("-");
    const isActive = activeEdges.has(edgeKey);

    ctx.save();
    ctx.lineWidth   = (CORRIDOR_WIDTH + 4) * scale;
    ctx.strokeStyle = "rgba(0, 0, 0, 0.35)";
    ctx.lineCap     = "round";
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();

    ctx.lineWidth   = CORRIDOR_WIDTH * scale;
    ctx.strokeStyle = isActive
      ? hexToRgba(ACTIVE_PATH_COLOR, 0.45)
      : "rgba(30, 50, 80, 0.7)";
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();

    ctx.lineWidth   = 1.5 * scale;
    ctx.strokeStyle = isActive
      ? hexToRgba(ACTIVE_PATH_COLOR, 0.8)
      : "rgba(82, 130, 180, 0.2)";
    ctx.setLineDash([6 * scale, 6 * scale]);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
    ctx.setLineDash([]);

    if (isActive) {
      drawPathArrow(a, b);
    }

    ctx.restore();
  });
}

function drawPathArrow(a, b) {
  const mx     = (a.x + b.x) / 2;
  const my     = (a.y + b.y) / 2;
  const angle  = Math.atan2(b.y - a.y, b.x - a.x);
  const size   = 10 * scale;

  ctx.save();
  ctx.translate(mx, my);
  ctx.rotate(angle);
  ctx.fillStyle = ACTIVE_PATH_COLOR;
  ctx.beginPath();
  ctx.moveTo( size, 0);
  ctx.lineTo(-size * 0.6,  size * 0.5);
  ctx.lineTo(-size * 0.6, -size * 0.5);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawBlocks() {
  const floorsToShow =
    activeFloor === -1
      ? [0]
      : [activeFloor];

  BLOCK_IDS.forEach((id) => {
    const cfg       = BLOCK_CONFIG[id];
    const isHovered  = id === hoveredBlock;
    const isSelected = id === selectedBlock;
    const isInPath   = activePath.includes(id);
    const isHighlighted = id === highlightedRoom;

    const floorDepths = activeFloor === -1
      ? [3, 2, 1, 0]
      : [0];

    floorDepths.forEach((depth, idx) => {
      const isTop = idx === floorDepths.length - 1;
      drawSingleHex(id, cfg, depth, isTop, {
        hovered: isHovered,
        selected: isSelected,
        inPath: isInPath,
        highlighted: isHighlighted,
        stackIndex: idx,
        stackTotal: floorDepths.length,
      });
    });

    drawBlockLabel(id, cfg, floorDepths[floorDepths.length - 1], {
      hovered: isHovered,
      selected: isSelected,
      inPath: isInPath,
    });
  });
}

function drawSingleHex(id, cfg, depth, isTop, flags) {
  const pts   = blockHexPoints(id, depth);
  const color = cfg.color;

  ctx.save();

  if (depth === 0) {
    ctx.shadowColor   = hexToRgba(color, 0.25);
    ctx.shadowBlur    = (flags.selected || flags.inPath) ? 28 * scale : 14 * scale;
    ctx.shadowOffsetY = 4 * scale;
  }

  const fillAlpha = isTop
    ? flags.selected || flags.inPath ? 0.75 : flags.hovered ? 0.65 : 0.45
    : 0.2 - depth * 0.04;

  const fillColor = flags.highlighted
    ? adjustBrightness(color, 1.4)
    : flags.selected
    ? color
    : flags.inPath
    ? adjustBrightness(color, 1.15)
    : color;

  ctx.fillStyle = hexToRgba(fillColor, fillAlpha);
  ctx.beginPath();
  pts.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  ctx.strokeStyle = flags.selected
    ? color
    : flags.inPath
    ? ACTIVE_PATH_COLOR
    : hexToRgba(color, flags.hovered ? 0.9 : 0.4);
  ctx.lineWidth   = (flags.selected || flags.inPath ? 2.5 : 1.5) * scale;
  ctx.stroke();

  if (isTop && (flags.hovered || flags.selected)) {
    ctx.strokeStyle = hexToRgba(color, 0.6);
    ctx.lineWidth   = 1 * scale;
    const shrunk    = hexagonPoints(
      (pts.reduce((s, p) => s + p.x, 0) / 6),
      (pts.reduce((s, p) => s + p.y, 0) / 6),
      scaledRadius() * 0.82,
      HEX_ROTATION
    );
    ctx.beginPath();
    shrunk.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
    ctx.closePath();
    ctx.stroke();
  }

  ctx.restore();
}

function drawBlockLabel(id, cfg, topDepth, flags) {
  const c  = blockCenter(id);
  const fy = topDepth * FLOOR_OFFSET_Y * scale;
  const fx = topDepth * FLOOR_OFFSET_X * scale;
  const cx = c.x + fx;
  const cy = c.y - fy;

  ctx.save();

  const letterSize = clamp(26 * scale, 14, 38);
  ctx.font         = `800 ${letterSize}px 'Syne', sans-serif`;
  ctx.textAlign    = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle    = flags.selected || flags.inPath
    ? "#ffffff"
    : flags.hovered
    ? hexToRgba(cfg.color, 0.95)
    : hexToRgba(cfg.color, 0.75);

  ctx.shadowColor  = "rgba(0,0,0,0.6)";
  ctx.shadowBlur   = 8;
  ctx.fillText(id, cx, cy - letterSize * 0.25);

  const subSize   = clamp(9 * scale, 7, 12);
  ctx.font        = `400 ${subSize}px 'DM Mono', monospace`;
  ctx.fillStyle   = hexToRgba(cfg.color, flags.selected ? 0.9 : 0.55);
  ctx.shadowBlur  = 4;
  const subtitle  = cfg.subtitle.split("·")[0].trim();
  ctx.fillText(subtitle, cx, cy + letterSize * 0.55);

  ctx.restore();
}