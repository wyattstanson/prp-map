export const BLOCK_CONFIG = {
  A: { id: "A", label: "A Block", subtitle: "Classrooms · SHINE",      color: "#4fa3f7", rs: 1,  re: 15, tags: ["Classrooms", "SHINE", "Healthcare"] },
  B: { id: "B", label: "B Block", subtitle: "Classrooms",               color: "#6ee7c0", rs: 16, re: 30, tags: ["Classrooms"] },
  C: { id: "C", label: "C Block", subtitle: "Central Hub · Washrooms",  color: "#f7c948", rs: 31, re: 45, tags: ["Washrooms", "Central Hub"] },
  D: { id: "D", label: "D Block", subtitle: "PRP AC Canteen",           color: "#b47ef7", rs: 46, re: 60, tags: ["Canteen", "AC Zone"] },
  E: { id: "E", label: "E Block", subtitle: "Labs · Computing",         color: "#f06464", rs: 61, re: 75, tags: ["Computing Labs", "IT Block"] },
};

export const BLOCK_IDS = ["A", "B", "C", "D", "E"];

export const BLOCK_POLYGONS = {
  A: [[0.005,0.42],[0.14,0.34],[0.19,0.37],[0.19,0.99],[0.005,0.99]],
  B: [[0.10,0.13],[0.28,0.06],[0.37,0.13],[0.37,0.61],[0.18,0.66],[0.10,0.59]],
  C: [[0.28,0.04],[0.50,0.00],[0.72,0.04],[0.715,0.39],[0.50,0.42],[0.285,0.39]],
  D: [[0.63,0.13],[0.80,0.06],[0.90,0.13],[0.90,0.59],[0.72,0.66],[0.63,0.61]],
  E: [[0.81,0.34],[0.995,0.42],[0.995,0.99],[0.81,0.99],[0.81,0.37]],
};

export const BLOCK_CENTERS = {
  A: [0.09, 0.63],
  B: [0.23, 0.34],
  C: [0.50, 0.21],
  D: [0.77, 0.34],
  E: [0.91, 0.63],
};

export const CORRIDORS = [
  ["A","B"], ["B","C"], ["C","D"], ["D","E"], ["A","C"], ["C","E"],
];

export const FLOOR_OPTIONS = [
  { v: -1, l: "All" }, { v: 0, l: "G" },
  ...([1,2,3,4,5,6,7].map(i => ({ v: i, l: String(i) }))),
];

export function parseRoom(raw) {
  const s = String(raw).trim().toUpperCase();
  if (s.startsWith("G")) {
    const i = parseInt(s.slice(1));
    if (isNaN(i) || i < 1 || i > 75) return null;
    return { floor: 0, idx: i, str: "G" + String(i).padStart(2, "0"), fl: "Ground Floor" };
  }
  const n = parseInt(s);
  if (isNaN(n)) return null;
  if (n < 100) {
    if (n < 1 || n > 75) return null;
    return { floor: 0, idx: n, str: "G" + String(n).padStart(2, "0"), fl: "Ground Floor" };
  }
  const floor = parseInt(s[0]), idx = parseInt(s.slice(1));
  if (floor < 1 || floor > 7 || idx < 1 || idx > 75) return null;
  return { floor, idx, str: `${floor}${String(idx).padStart(2, "0")}`, fl: `Floor ${floor}` };
}

export function resolveRoom(raw) {
  const p = parseRoom(raw);
  if (!p) return { valid: false, reply: `"${raw}" is not a valid room number. Try 742 or G05.` };
  const bid = BLOCK_IDS.find(id => p.idx >= BLOCK_CONFIG[id].rs && p.idx <= BLOCK_CONFIG[id].re);
  if (!bid) return { valid: false, reply: `Room index ${p.idx} is out of range (1–75).` };
  const b = BLOCK_CONFIG[bid];
  return {
    valid: true, room: p.str, floor: p.floor, floorLabel: p.fl,
    roomIndex: p.idx, block: bid, blockLabel: b.label, subtitle: b.subtitle,
    rangeStart: b.rs, rangeEnd: b.re,
    reply: `Room **${p.str}** → **${b.label}** (${b.subtitle}), ${p.fl}. Index ${p.idx} in range ${b.rs}–${b.re}.`,
  };
}