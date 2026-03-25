import { CORRIDORS, BLOCK_IDS } from "./rooms.js";

function buildAdjacencyList() {
  const adj = new Map();

  BLOCK_IDS.forEach((id) => adj.set(id, []));

  CORRIDORS.forEach(({ from, to }) => {
    adj.get(from).push(to);
    adj.get(to).push(from);
  });

  return adj;
}

const ADJACENCY = buildAdjacencyList();

export function findShortestPath(fromId, toId) {
  const from = fromId.toUpperCase().trim();
  const to   = toId.toUpperCase().trim();

  if (!ADJACENCY.has(from) || !ADJACENCY.has(to)) {
    return { path: [], found: false, steps: 0 };
  }

  if (from === to) {
    return { path: [from], found: true, steps: 0 };
  }

  const visited  = new Set([from]);
  const queue    = [[from]];

  while (queue.length > 0) {
    const current = queue.shift();
    const node    = current[current.length - 1];

    for (const neighbor of ADJACENCY.get(node)) {
      if (neighbor === to) {
        const fullPath = [...current, neighbor];
        return { path: fullPath, found: true, steps: fullPath.length - 1 };
      }

      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push([...current, neighbor]);
      }
    }
  }

  return { path: [], found: false, steps: 0 };
}

export function formatPathResult(result) {
  if (!result.found) {
    return "No path found between these blocks.";
  }
  if (result.steps === 0) {
    return "You're already at the destination!";
  }
  const arrow = result.path.join(" → ");
  const step  = result.steps === 1 ? "1 step" : `${result.steps} steps`;
  return `${arrow} · ${step}`;
}

export function getActiveEdges(path) {
  const edges = new Set();
  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i];
    const b = path[i + 1];
    edges.add([a, b].sort().join("-"));
  }
  return edges;
}

export function isValidBlock(id) {
  return ADJACENCY.has(id?.toUpperCase()?.trim());
}