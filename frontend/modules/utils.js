export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function hexToRgba(hex, alpha = 1) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function hexagonPoints(cx, cy, r, rotationDeg = 0) {
  const rotRad = (rotationDeg * Math.PI) / 180;
  return Array.from({ length: 6 }, (_, i) => {
    const angle = rotRad + (Math.PI / 3) * i;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  });
}

export function pointInPolygon(px, py, vertices) {
  let inside = false;
  const n = vertices.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = vertices[i].x, yi = vertices[i].y;
    const xj = vertices[j].x, yj = vertices[j].y;
    const intersects =
      yi > py !== yj > py &&
      px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}

export function freeze(obj) {
  return Object.freeze(obj);
}

export function debounce(fn, wait) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}

export function blockLabel(block, floor, startRoom, endRoom) {
  const floorStr = floor === 0 ? "Ground" : `Floor ${floor}`;
  return `${block} Block · ${floorStr} · Rooms ${startRoom}–${endRoom}`;
}

export function adjustBrightness(hex, factor) {
  const r = clamp(Math.round(parseInt(hex.slice(1, 3), 16) * factor), 0, 255);
  const g = clamp(Math.round(parseInt(hex.slice(3, 5), 16) * factor), 0, 255);
  const b = clamp(Math.round(parseInt(hex.slice(5, 7), 16) * factor), 0, 255);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}