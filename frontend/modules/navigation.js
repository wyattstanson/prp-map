import { BLOCK_IDS, CORRIDORS } from "./rooms.js";

function buildAdj() {
  const adj = {};
  BLOCK_IDS.forEach(id => (adj[id] = []));
  CORRIDORS.forEach(([a, b]) => { adj[a].push(b); adj[b].push(a); });
  return adj;
}

const ADJ = buildAdj();

export function findPath(src, dst) {
  if (!ADJ[src] || !ADJ[dst]) return null;
  if (src === dst) return [src];
  const visited = new Set([src]), queue = [[src]];
  while (queue.length) {
    const path = queue.shift(), node = path[path.length - 1];
    for (const nb of ADJ[node]) {
      if (nb === dst) return [...path, nb];
      if (!visited.has(nb)) { visited.add(nb); queue.push([...path, nb]); }
    }
  }
  return null;
}

export function formatPath(path) {
  if (!path) return null;
  const steps = path.length - 1;
  return `${path.join(" → ")} · ${steps === 1 ? "1 step" : steps + " steps"}`;
}

export function isValidBlock(id) {
  return !!ADJ[id?.toUpperCase()?.trim()];
}