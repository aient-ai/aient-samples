import type { Player } from "./savedGame";

export type Board = ReadonlyMap<string, Player>;

export type Cell = {
  x: number;
  y: number;
};

const WIN_LENGTH = 5;
const DIRECTIONS = [
  [1, 0],
  [0, 1],
  [1, 1],
  [1, -1],
] as const;

// Defending is weighted slightly below attacking, so the computer completes
// its own five before blocking yours.
const DEFENSE_WEIGHT = 0.9;

function cellKey(x: number, y: number): string {
  return `${x},${y}`;
}

// Length of the run `player` would have through (x, y) along one direction.
function runThrough(
  board: Board,
  x: number,
  y: number,
  dx: number,
  dy: number,
  player: Player
): number {
  let run = 1;
  for (const sign of [1, -1]) {
    for (let i = 1; i < WIN_LENGTH; i++) {
      if (board.get(cellKey(x + sign * dx * i, y + sign * dy * i)) !== player) {
        break;
      }
      run++;
    }
  }
  return Math.min(run, WIN_LENGTH);
}

function scoreCell(board: Board, x: number, y: number, player: Player): number {
  const opponent: Player = player === "X" ? "O" : "X";
  let score = 0;
  for (const [dx, dy] of DIRECTIONS) {
    score += 10 ** runThrough(board, x, y, dx, dy, player);
    score += DEFENSE_WEIGHT * 10 ** runThrough(board, x, y, dx, dy, opponent);
  }
  return score;
}

// Empty cells touching at least one stone, in a stable order.
function candidateCells(board: Board): Cell[] {
  const seen = new Set<string>();
  const cells: Cell[] = [];
  for (const key of board.keys()) {
    const [x, y] = key.split(",").map(Number);
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const nx = x + dx;
        const ny = y + dy;
        const neighbour = cellKey(nx, ny);
        if (board.has(neighbour) || seen.has(neighbour)) continue;
        seen.add(neighbour);
        cells.push({ x: nx, y: ny });
      }
    }
  }
  return cells;
}

export function chooseComputerMove(board: Board, player: Player): Cell {
  return candidateCells(board)
    .map((cell) => ({ cell, score: scoreCell(board, cell.x, cell.y, player) }))
    .reduce((best, candidate) =>
      candidate.score > best.score ? candidate : best
    ).cell;
}
