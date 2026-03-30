from collections import deque
from dataclasses import dataclass, field

CORRIDORS = [("A","B"),("B","C"),("C","D"),("D","E"),("A","C"),("C","E")]
BLOCKS    = {"A","B","C","D","E"}

def _adj():
    g = {b: [] for b in BLOCKS}
    for a, b in CORRIDORS: g[a].append(b); g[b].append(a)
    return g

ADJ = _adj()

@dataclass
class PathResult:
    found: bool
    path: list = field(default_factory=list)
    steps: int = 0
    formatted: str = ""

def find_path(src: str, dst: str) -> PathResult:
    s, d = src.upper().strip(), dst.upper().strip()
    if s not in BLOCKS or d not in BLOCKS:
        return PathResult(found=False, formatted=f"Unknown block(s): {src}, {dst}.")
    if s == d:
        return PathResult(found=True, path=[s], steps=0, formatted="Already there.")
    visited, queue = {s}, deque([[s]])
    while queue:
        path = queue.popleft(); node = path[-1]
        for nb in ADJ[node]:
            if nb == d:
                full = path + [nb]
                steps = len(full) - 1
                return PathResult(found=True, path=full, steps=steps, formatted=" → ".join(full) + f" ({steps} step{'s' if steps>1 else ''})")
            if nb not in visited: visited.add(nb); queue.append(path + [nb])
    return PathResult(found=False, formatted=f"No path from {s} to {d}.")