import { freeze } from "./utils.js";

export const BLOCK_CONFIG = freeze({
  A: {
    id: "A",
    label: "A Block",
    subtitle: "Classrooms · SHINE",
    color: "#4fa3f7",
    rangeStart: 1,
    rangeEnd: 15,
    logicalX: -1.9,
    logicalY: 0.85,
    tags: ["Classrooms", "SHINE", "School of Healthcare"],
  },
  B: {
    id: "B",
    label: "B Block",
    subtitle: "Classrooms",
    color: "#6ee7c0",
    rangeStart: 16,
    rangeEnd: 30,
    logicalX: -1.4,
    logicalY: -0.85,
    tags: ["Classrooms"],
  },
  C: {
    id: "C",
    label: "C Block",
    subtitle: "Central Hub · Washrooms",
    color: "#f7c948",
    rangeStart: 31,
    rangeEnd: 45,
    logicalX: 0.0,
    logicalY: -0.15,
    tags: ["Washrooms", "Central Hub"],
  },
  D: {
    id: "D",
    label: "D Block",
    subtitle: "PRP AC Canteen",
    color: "#b47ef7",
    rangeStart: 46,
    rangeEnd: 60,
    logicalX: 1.7,
    logicalY: -0.85,
    tags: ["Canteen", "AC Zone", "PRP"],
  },
  E: {
    id: "E",
    label: "E Block",
    subtitle: "Labs · Computing",
    color: "#f06464",
    rangeStart: 61,
    rangeEnd: 75,
    logicalX: 1.6,
    logicalY: 0.9,
    tags: ["Computing Labs", "IT Block"],
  },
});

export const BLOCK_IDS = Object.keys(BLOCK_CONFIG);

export const FLOOR_COUNT = 8;

export const ROOMS_PER_FLOOR = 15;

export const CORRIDORS = freeze([
  { from: "A", to: "C" },
  { from: "B", to: "C" },
  { from: "C", to: "D" },
  { from: "C", to: "E" },
  { from: "A", to: "B" },
  { from: "D", to: "E" },
]);

export function parseRoomNumber(input) {
  const str = String(input).trim().toUpperCase();

  if (str.startsWith("G")) {
    const idx = parseInt(str.slice(1), 10);
    if (isNaN(idx) || idx < 1 || idx > 75) return null;
    return { floor: 0, roomIndex: idx };
  }

  const num = parseInt(str, 10);
  if (isNaN(num) || num < 1) return null;

  if (num <= 75) {
    return { floor: 0, roomIndex: num };
  }

  const digits = str.length;
  if (digits < 3) return null;

  const floor = parseInt(str[0], 10);
  const roomIndex = parseInt(str.slice(1), 10);

  if (floor < 1 || floor > 7) return null;
  if (roomIndex < 1 || roomIndex > 75) return null;

  return { floor, roomIndex };
}

export function roomIndexToBlock(roomIndex) {
  for (const [id, cfg] of Object.entries(BLOCK_CONFIG)) {
    if (roomIndex >= cfg.rangeStart && roomIndex <= cfg.rangeEnd) {
      return id;
    }
  }
  return null;
}

export function lookupRoom(input) {
  const parsed = parseRoomNumber(input);

  if (!parsed) {
    return {
      valid: false,
      reply: `"${input}" doesn't look like a valid room number. Try something like 742 or G05.`,
    };
  }

  const { floor, roomIndex } = parsed;
  const blockId = roomIndexToBlock(roomIndex);

  if (!blockId) {
    return {
      valid: false,
      reply: `Room index ${roomIndex} is out of range (1–75). Each block has 15 rooms.`,
    };
  }

  const cfg = BLOCK_CONFIG[blockId];
  const floorLabel = floor === 0 ? "Ground Floor" : `Floor ${floor}`;
  const roomStr =
    floor === 0
      ? `G${String(roomIndex).padStart(2, "0")}`
      : `${floor}${String(roomIndex).padStart(2, "0")}`;

  return {
    valid: true,
    room: roomStr,
    floor,
    floorLabel,
    block: blockId,
    blockLabel: cfg.label,
    blockSubtitle: cfg.subtitle,
    reply:
      `Room **${roomStr}** is in **${cfg.label}** (${cfg.subtitle}), ` +
      `${floorLabel}. Room index ${roomIndex} falls within the ` +
      `${blockId} Block range (${cfg.rangeStart}–${cfg.rangeEnd}).`,
  };
}

export function getFloorOptions() {
  return [
    { value: -1, label: "All" },
    { value: 0,  label: "G" },
    ...Array.from({ length: 7 }, (_, i) => ({
      value: i + 1,
      label: String(i + 1),
    })),
  ];
}