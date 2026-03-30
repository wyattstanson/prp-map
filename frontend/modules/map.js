import { hexToRgba, pointInPolygon, roundRect, clamp, loadImage } from "./utils.js";
import { BLOCK_CONFIG, BLOCK_IDS, BLOCK_POLYGONS, BLOCK_CENTERS } from "./rooms.js";

const EXT_IMG_SRC  = "assets/prp.jpg";
const ACTIVE_COLOR = "#6ee7c0";

let canvas, ctx, wrap, tooltipEl;
let extImg = null, extLoaded = false;
let iX = 0, iY = 0, iW = 0, iH = 0;
let panX = 0, panY = 0, zoom = 1;
const ZOOM_MIN = 0.5, ZOOM_MAX = 4;
let drag = false, dsx = 0, dsy = 0, psx = 0, psy = 0;
let hovId = null, selId = null, pathArr = [], hlId = null;
let ndr = true;
let onClickCb = null, onHoverCb = null;

export function initMap(canvasEl, wrapEl, tooltipElement, callbacks) {
  canvas    = canvasEl;
  ctx       = canvas.getContext("2d");
  wrap      = wrapEl;
  tooltipEl = tooltipElement;
  onClickCb = callbacks.onClick || (() => {});
  onHoverCb = callbacks.onHover || (() => {});

  loadImage(EXT_IMG_SRC).then(img => {
    extImg = img; extLoaded = true; ndr = true;
  }).catch(() => { extLoaded = false; ndr = true; });

  resize(); center(); attachEvents();
  (function loop() { if (ndr) { draw(); ndr = false; } requestAnimationFrame(loop); })();
}

export function resize() {
  const dpr = devicePixelRatio || 1, w = wrap.clientWidth, h = wrap.clientHeight;
  canvas.width = w * dpr; canvas.height = h * dpr;
  canvas.style.width = w + "px"; canvas.style.height = h + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ndr = true;
}

export function center() {
  const w = wrap.clientWidth, h = wrap.clientHeight, asp = 696 / 413;
  if (w / h > asp) { iH = h; iW = h * asp; } else { iW = w; iH = w / asp; }
  iX = (w - iW) / 2; iY = (h - iH) / 2; panX = 0; panY = 0; zoom = 1; ndr = true;
}

export function setSelected(id)        { selId = id;   ndr = true; }
export function setPath(arr)           { pathArr = arr; ndr = true; }
export function clearPath()            { pathArr = [];  ndr = true; }
export function setHighlight(id)       { hlId = id;     ndr = true; }
export function zoomIn()               { applyZoom(1.18, wrap.clientWidth / 2, wrap.clientHeight / 2); }
export function zoomOut()              { applyZoom(0.85, wrap.clientWidth / 2, wrap.clientHeight / 2); }

function f2p(fx, fy) {
  return { x: iX + panX + fx * iW * zoom, y: iY + panY + fy * iH * zoom };
}
function poly(id)  { return BLOCK_POLYGONS[id].map(([x, y]) => f2p(x, y)); }
function center2(id) { const [x, y] = BLOCK_CENTERS[id]; return f2p(x, y); }

function hitTest(px, py) {
  for (let i = BLOCK_IDS.length - 1; i >= 0; i--)
    if (pointInPolygon(px, py, poly(BLOCK_IDS[i]))) return BLOCK_IDS[i];
  return null;
}

function applyZoom(f, cx, cy) {
  const ns = clamp(zoom * f, ZOOM_MIN, ZOOM_MAX), r = ns / zoom;
  panX = cx - iX + (panX - (cx - iX)) * r;
  panY = cy - iY + (panY - (cy - iY)) * r;
  zoom = ns; ndr = true;
}

function rc(e) { const r = canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }

function attachEvents() {
  canvas.addEventListener("mousedown", e => {
    drag = true; const p = rc(e); dsx = p.x; dsy = p.y; psx = panX; psy = panY; canvas.style.cursor = "grabbing";
  });
  canvas.addEventListener("mousemove", e => {
    const p = rc(e);
    if (drag) { panX = psx + (p.x - dsx); panY = psy + (p.y - dsy); ndr = true; return; }
    const h = hitTest(p.x, p.y);
    if (h !== hovId) { hovId = h; canvas.style.cursor = h ? "pointer" : "grab"; onHoverCb(h); ndr = true; }
    if (h) {
      const b = BLOCK_CONFIG[h];
      tooltipEl.querySelector(".tt-name").textContent = b.label;
      tooltipEl.querySelector(".tt-sub").textContent  = b.subtitle + "  —  click to explore";
      tooltipEl.style.left = (e.clientX + 14) + "px";
      tooltipEl.style.top  = (e.clientY - 8) + "px";
      tooltipEl.classList.add("on");
    } else { tooltipEl.classList.remove("on"); }
  });
  canvas.addEventListener("mouseup",    () => { drag = false; canvas.style.cursor = hovId ? "pointer" : "grab"; });
  canvas.addEventListener("mouseleave", () => { drag = false; hovId = null; tooltipEl.classList.remove("on"); canvas.style.cursor = "grab"; ndr = true; });
  canvas.addEventListener("click", e => {
    const p = rc(e), h = hitTest(p.x, p.y);
    const next = h && h !== selId ? h : null;
    selId = next; ndr = true; onClickCb(next);
  });
  canvas.addEventListener("wheel", e => {
    e.preventDefault(); const p = rc(e); applyZoom(e.deltaY < 0 ? 1.12 : 0.89, p.x, p.y);
  }, { passive: false });
  window.addEventListener("resize", () => { resize(); center(); });
}

function draw() {
  const w = wrap.clientWidth, h = wrap.clientHeight;
  ctx.clearRect(0, 0, w, h);
  drawSky(w, h);
  if (extLoaded) {
    ctx.save(); ctx.shadowColor = "rgba(0,0,0,.25)"; ctx.shadowBlur = 18; ctx.shadowOffsetY = 5;
    ctx.drawImage(extImg, iX + panX, iY + panY, iW * zoom, iH * zoom); ctx.restore();
  }
  drawOverlays();
  if (pathArr.length > 1) drawPathLines();
  drawLabels(w, h);
  drawCompass(w);
}

function drawSky(w, h) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, "#9ecfee"); g.addColorStop(.35, "#c8e6f8");
  g.addColorStop(.65, "#ddf0f8"); g.addColorStop(1, "#c0d8be");
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
}

function drawOverlays() {
  BLOCK_IDS.forEach(id => {
    const isH = id === hovId, isS = id === selId, isP = pathArr.includes(id), isHL = id === hlId;
    if (!isH && !isS && !isP && !isHL) return;
    const pts = poly(id), b = BLOCK_CONFIG[id];
    ctx.save();
    ctx.beginPath(); pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)); ctx.closePath();
    const fa = isS ? .38 : isP ? .3 : isHL ? .42 : isH ? .18 : 0;
    if (fa > 0) { ctx.fillStyle = hexToRgba(b.color, fa); ctx.fill(); }
    const sc = isP ? ACTIVE_COLOR : b.color, sa = isS || isP ? .9 : isHL ? 1 : .65;
    ctx.shadowColor = hexToRgba(sc, .65); ctx.shadowBlur = isS || isHL ? 26 : 14;
    ctx.strokeStyle = hexToRgba(sc, sa); ctx.lineWidth = isS || isP ? 3 : 2; ctx.lineJoin = "round"; ctx.stroke();
    ctx.shadowBlur = 0; ctx.lineWidth = 1.5; ctx.stroke();
    if (isS) drawCorners(pts, b.color);
    ctx.restore();
  });
}

function drawCorners(pts, color) {
  const xs = pts.map(p => p.x), ys = pts.map(p => p.y);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const s = Math.min((x1 - x0) * .07, 15);
  [[x0,y0,1,1],[x1,y0,-1,1],[x0,y1,1,-1],[x1,y1,-1,-1]].forEach(([x,y,dx,dy]) => {
    ctx.save(); ctx.strokeStyle = hexToRgba(color, 1); ctx.lineWidth = 2; ctx.lineCap = "square";
    ctx.beginPath(); ctx.moveTo(x + dx * s, y); ctx.lineTo(x, y); ctx.lineTo(x, y + dy * s); ctx.stroke(); ctx.restore();
  });
}

function drawPathLines() {
  for (let i = 0; i < pathArr.length - 1; i++) {
    const a = center2(pathArr[i]), b = center2(pathArr[i + 1]);
    ctx.save();
    ctx.strokeStyle = "rgba(0,0,0,.35)"; ctx.lineWidth = 7; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    ctx.shadowColor = hexToRgba(ACTIVE_COLOR, .7); ctx.shadowBlur = 13;
    ctx.strokeStyle = hexToRgba(ACTIVE_COLOR, .9); ctx.lineWidth = 3.5;
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    ctx.shadowBlur = 0; ctx.setLineDash([6, 5]);
    ctx.strokeStyle = "rgba(255,255,255,.5)"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); ctx.setLineDash([]);
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, ang = Math.atan2(b.y - a.y, b.x - a.x), s = 8;
    ctx.shadowColor = hexToRgba(ACTIVE_COLOR, .8); ctx.shadowBlur = 8; ctx.fillStyle = ACTIVE_COLOR;
    ctx.translate(mx, my); ctx.rotate(ang);
    ctx.beginPath(); ctx.moveTo(s, 0); ctx.lineTo(-s * .6, s * .5); ctx.lineTo(-s * .6, -s * .5); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  pathArr.forEach(id => {
    const c = center2(id); ctx.save();
    ctx.shadowColor = hexToRgba(ACTIVE_COLOR, .8); ctx.shadowBlur = 11; ctx.fillStyle = ACTIVE_COLOR;
    ctx.beginPath(); ctx.arc(c.x, c.y, 5, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0; ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();
  });
}

function drawLabels() {
  BLOCK_IDS.forEach(id => {
    const b = BLOCK_CONFIG[id], c = center2(id);
    const isS = id === selId, isP = pathArr.includes(id), isH = id === hovId;
    const pw = Math.max(35 * zoom, 30), ph = Math.max(18 * zoom, 16);
    ctx.save(); ctx.shadowColor = "rgba(0,0,0,.5)"; ctx.shadowBlur = 9;
    ctx.fillStyle = isS || isP ? hexToRgba(b.color, .9) : isH ? hexToRgba(b.color, .7) : "rgba(5,12,24,.72)";
    roundRect(ctx, c.x - pw / 2, c.y - ph / 2, pw, ph, ph / 2); ctx.fill();
    ctx.shadowBlur = 0; ctx.strokeStyle = hexToRgba(b.color, isS || isP ? 1 : .5); ctx.lineWidth = 1.5;
    roundRect(ctx, c.x - pw / 2, c.y - ph / 2, pw, ph, ph / 2); ctx.stroke();
    const fs = clamp(11 * zoom, 9, 14);
    ctx.font = `800 ${fs}px Syne,sans-serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillStyle = isS || isP ? "#fff" : hexToRgba(b.color, .95); ctx.fillText(id, c.x, c.y);
    ctx.restore();
  });
}

function drawCompass(w) {
  const x = w - 40, y = 28, r = 14;
  ctx.save(); ctx.globalAlpha = .7;
  ctx.fillStyle = "rgba(5,12,24,.6)"; ctx.beginPath(); ctx.arc(x, y + r, r + 4, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,.2)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x, y + r, r + 4, 0, Math.PI * 2); ctx.stroke();
  ctx.font = "bold 8px Syne,sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillStyle = "#f7c948"; ctx.fillText("N", x, y + r - r * .55);
  ctx.fillStyle = "rgba(255,255,255,.55)";
  ctx.fillText("S", x, y + r + r * .55); ctx.fillText("W", x - r * .58, y + r); ctx.fillText("E", x + r * .58, y + r);
  ctx.restore();
}