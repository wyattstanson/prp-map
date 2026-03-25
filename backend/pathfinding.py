from collections import deque
from dataclasses import dataclass, field
from typing import Optional

CORRIDORS: list[tuple[str, str]] = [
    ("A", "C"),
    ("B", "C"),
    ("C", "D"),
    ("C", "E"),
    ("A", "B"),
    ("D", "E"),
]

VALID_BLOCKS = {"A", "B", "C", "D", "E"}

def _build_adjacency(corridors: list[tuple[str, str]]) -> dict[str, list[str]]:
    adj: dict[str, list[str]] = {b: [] for b in VALID_BLOCKS}
    for a, b in corridors:
        adj[a].append(b)
        adj[b].append(a)
    return adj

_ADJACENCY = _build_adjacency(CORRIDORS)

@dataclass
class PathResult:
    found:     bool
    path:      list[str]  = field(default_factory=list)
    steps:     int        = 0
    formatted: str        = ""

def find_shortest_path(from_block: str, to_block: str) -> PathResult:
    src = from_block.strip().upper()
    dst = to_block.strip().upper()

    if src not in VALID_BLOCKS or dst not in VALID_BLOCKS:
        return PathResult(
            found=False,
            formatted=f"Unknown block(s): {from_block}, {to_block}. Use A–E.",
        )

    if src == dst:
        return PathResult(
            found=True,
            path=[src],
            steps=0,
            formatted="Already at the destination.",
        )

    visited = {src}
    queue   = deque([[src]])

    while queue:
        current_path = queue.popleft()
        node         = current_path[-1]

        for neighbor in _ADJACENCY[node]:
            if neighbor == dst:
                full_path = current_path + [neighbor]
                return PathResult(
                    found=True,
                    path=full_path,
                    steps=len(full_path) - 1,
                    formatted=_format_path(full_path),
                )
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(current_path + [neighbor])

    return PathResult(
        found=False,
        formatted=f"No path found from {src} to {dst}.",
    )

def _format_path(path: list[str]) -> str:
    arrow = " → ".join(path)
    steps = len(path) - 1
    step_label = "1 step" if steps == 1 else f"{steps} steps"
    return f"{arrow} ({step_label})"

if __name__ == "__main__":
    test_cases = [
        ("A", "D"),
        ("B", "E"),
        ("A", "A"),
        ("E", "B"),
        ("A", "E"),
    ]
    for src, dst in test_cases:
        result = find_shortest_path(src, dst)
        print(f"{src} → {dst}: {result.formatted}")