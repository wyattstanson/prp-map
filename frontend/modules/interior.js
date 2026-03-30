import { hexToRgba, roundRect, easeInOut, loadImage, clamp } from "./utils.js";
import { BLOCK_CONFIG } from "./rooms.js";

const INT_IMG_SRC = "assets/prp_interior.jpg";
const INT_ASPECT  = 2000 / 1125;

const FLOOR_TINTS = [
  "rgba(255,220,150,0.08)", "rgba(200,230,255,0.07)", "rgba(220,255,220,0.06)",
  "rgba(255,200,200,0.07)", "rgba(200,220,255,0.06)", "rgba(255,230,180,0.07)",
  "rgba(220,200,255,0.07)", "rgba(200,255,230,0.06)",
];

let intEl, canvas, ctx, floorsEl, infoEl, titleEl;
let intImg = null, intLoaded = false;
let isOpen = false, curBlock = null, curFloor = 1;
let iW = 0, iH = 0;
let zoom = 1, panX = 0, panY = 0;
let drag = false, dsx = 0, dsy = 0, psx = 0, psy = 0;
let ndr = true;

let animT = 0, animActive = false;
let particles = [];
let lastTs = 0;
let onCloseCb = null;

export function initInterior(elements, callbacks) {
  intEl    = elements.interior;
  canvas   = elements.canvas;
  ctx      = canvas.getContext("2d");
  floorsEl = elements.floors;
  infoEl   = elements.info;
  titleEl  = elements.title;
  onCloseCb = callbacks.onClose || (() => {});

  loadImage(INT_IMG_SRC).then(img => { intImg = img; intLoaded = true; }).catch(() => {});

  elements.backBtn.addEventListener("click", close);
  attachEvents();
  (function loop(ts) {
    const dt = Math.min((ts - lastTs) / 1000, 0.05); lastTs = ts;
    if (animActive) { animT = Math.min(animT + dt * 1.3, 1); if (animT >= 1) animActive = false; }
    if (isOpen && (ndr || animActive || particles.length > 0)) { draw(); ndr = false; }
    requestAnimationFrame(loop);
  })();
}

export function open(blockId) {
  curBlock = blockId; curFloor = 1;
  zoom = 1; panX = 0; panY = 0;
  isOpen = true;
  intEl.classList.add("open");
  titleEl.textContent = BLOCK_CONFIG[blockId].label;
  updateInfo();
  buildFloorButtons();
  spawnParticles();
  animT = 0; animActive = true; ndr = true;
  resizeCanvas();
}

export function close() {
  isOpen = false;
  intEl.classList.remove("open");
  onCloseCb();
}

export function resizeCanvas() {
  const dpr = devicePixelRatio || 1;
  iW = intEl.clientWidth; iH = intEl.clientHeight;
  canvas.width = iW * dpr; canvas.height = iH * dpr;
  canvas.style.width = iW + "px"; canvas.style.height = iH + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ndr = true;
}

function buildFloorButtons() {
  floorsEl.innerHTML = "";
  [{ v:0,l:"G" }, ...[1,2,3,4,5,6,7].map(i => ({ v:i, l:String(i) }))].forEach(({ v, l }) => {
    const btn = document.createElement("button");
    btn.className = "ifl-btn" + (v === curFloor ? " active" : "");
    btn.textContent = l;
    btn.addEventListener("click", () => {
      curFloor = v;
      floorsEl.querySelectorAll(".ifl-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      updateInfo();
      zoom = 1; panX = 0; panY = 0;
      spawnParticles(); animT = 0; animActive = true; ndr = true;
    });
    floorsEl.appendChild(btn);
  });
}

function updateInfo() {
  const b = BLOCK_CONFIG[curBlock];
  const fl = curFloor === 0 ? "Ground Floor" : `Floor ${curFloor}`;
  const rs = curFloor === 0 ? `G${String(b.rs).padStart(2,"0")}` : curFloor * 100 + b.rs;
  const re = curFloor === 0 ? `G${String(b.re).padStart(2,"0")}` : curFloor * 100 + b.re;
  infoEl.innerHTML = `<strong>${b.label} — ${fl}</strong><br>Rooms ${rs}–${re} · ${b.subtitle}`;
}

function spawnParticles() {
  particles = Array.from({ length: 55 }, () => ({
    x: Math.random() * iW, y: Math.random() * iH,
    vx: (Math.random() - .5) * 1.2, vy: (Math.random() - .5) * .8 - .3,
    r: Math.random() * 2 + .5, life: 1,
    decay: Math.random() * .015 + .008,
    alpha: Math.random() * .5 + .2,
  }));
}

function attachEvents() {
  canvas.addEventListener("mousedown", e => { drag = true; dsx = e.clientX; dsy = e.clientY; psx = panX; psy = panY; canvas.style.cursor = "grabbing"; });
  canvas.addEventListener("mousemove", e => { if (drag) { panX = psx + (e.clientX - dsx); panY = psy + (e.clientY - dsy); ndr = true; } });
  canvas.addEventListener("mouseup",   () => { drag = false; canvas.style.cursor = "grab"; });
  canvas.addEventListener("mouseleave",() => { drag = false; canvas.style.cursor = "grab"; });
  canvas.addEventListener("wheel", e => {
    e.preventDefault();
    const r = canvas.getBoundingClientRect(), cx = e.clientX - r.left, cy = e.clientY - r.top;
    const f = e.deltaY < 0 ? 1.1 : 0.91, ns = clamp(zoom * f, .5, 5), ratio = ns / zoom;
    panX = cx + (panX - cx) * ratio; panY = cy + (panY - cy) * ratio; zoom = ns; ndr = true;
  }, { passive: false });
  window.addEventListener("resize", () => { if (isOpen) resizeCanvas(); });
}

function draw() {
  ctx.clearRect(0, 0, iW, iH);
  if (!intLoaded) { ctx.fillStyle = "#090e18"; ctx.fillRect(0, 0, iW, iH); return; }

  const ease = easeInOut(animT);
  const drawZoom = animActive ? 0.85 + ease * 0.15 : 1;
  const cx = iW / 2, cy = iH / 2;
  let dW, dH;
  if (iW / iH > INT_ASPECT) { dW = iW; dH = iW / INT_ASPECT; } else { dH = iH; dW = iH * INT_ASPECT; }
  dW *= zoom * drawZoom; dH *= zoom * drawZoom;
  const dx = cx - dW / 2 + panX, dy = cy - dH / 2 + panY;

  ctx.save();
  ctx.globalAlpha = animActive ? 0.3 + ease * 0.7 : 1;
  if (animActive) { ctx.filter = `blur(${(1 - ease) * 7}px)`; }
  ctx.drawImage(intImg, dx, dy, dW, dH);
  ctx.filter = "none"; ctx.globalAlpha = 1;

  ctx.fillStyle = FLOOR_TINTS[curFloor % FLOOR_TINTS.length];
  ctx.fillRect(0, 0, iW, iH);

  const vig = ctx.createRadialGradient(cx, cy, iH * .25, cx, cy, iH * .88);
  vig.addColorStop(0, "transparent"); vig.addColorStop(1, "rgba(0,0,0,0.55)");
  ctx.fillStyle = vig; ctx.fillRect(0, 0, iW, iH);

  if (animActive) {
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.life -= p.decay;
      ctx.save(); ctx.globalAlpha = p.life * p.alpha;
      ctx.fillStyle = `rgba(255,240,200,1)`;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    });
    particles = particles.filter(p => p.life > 0);
  }

  for (let y = 0; y < iH; y += 3) {
    ctx.fillStyle = "rgba(0,0,0,0.022)"; ctx.fillRect(0, y, iW, 1);
  }

  ctx.restore();
}