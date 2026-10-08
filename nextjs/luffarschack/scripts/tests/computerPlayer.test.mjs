import assert from "node:assert/strict";
import test from "node:test";

import { chooseComputerMove } from "../../src/lib/computerPlayer.ts";

const board = (stones) =>
  new Map(stones.map(([x, y, player]) => [`${x},${y}`, player]));

for (const player of ["X", "O"]) {
  test(`opens at the origin on an empty board as ${player}`, () => {
    const state = board([]);

    assert.deepEqual(chooseComputerMove(state, player), { x: 0, y: 0 });
    assert.equal(state.size, 0);
  });
}

test("replies next to a lone opening stone", () => {
  const move = chooseComputerMove(board([[0, 0, "X"]]), "O");

  assert.ok(Math.abs(move.x) <= 1 && Math.abs(move.y) <= 1, JSON.stringify(move));
  assert.notDeepEqual(move, { x: 0, y: 0 });
});

test("completes its own five", () => {
  const move = chooseComputerMove(
    board([
      [0, 0, "O"],
      [1, 0, "O"],
      [2, 0, "O"],
      [3, 0, "O"],
      [0, 1, "X"],
      [1, 1, "X"],
      [2, 1, "X"],
      [5, 5, "X"],
    ]),
    "O"
  );

  assert.ok(
    (move.x === 4 || move.x === -1) && move.y === 0,
    JSON.stringify(move)
  );
});

test("prefers winning over blocking", () => {
  const move = chooseComputerMove(
    board([
      [0, 0, "O"],
      [0, 1, "O"],
      [0, 2, "O"],
      [0, 3, "O"],
      [2, 0, "X"],
      [3, 0, "X"],
      [4, 0, "X"],
      [5, 0, "X"],
    ]),
    "O"
  );

  assert.ok(
    move.x === 0 && (move.y === 4 || move.y === -1),
    JSON.stringify(move)
  );
});

test("blocks an open four", () => {
  const move = chooseComputerMove(
    board([
      [0, 0, "X"],
      [1, 1, "X"],
      [2, 2, "X"],
      [3, 3, "X"],
      [0, 1, "O"],
      [5, 0, "O"],
      [7, 2, "O"],
    ]),
    "O"
  );

  assert.ok(
    (move.x === 4 && move.y === 4) || (move.x === -1 && move.y === -1),
    JSON.stringify(move)
  );
});

test("never picks an occupied cell", () => {
  const stones = [];
  for (let x = -2; x <= 2; x++) {
    for (let y = -2; y <= 2; y++) {
      if (x !== 0 || y !== 0) stones.push([x, y, (x + y) % 2 ? "X" : "O"]);
    }
  }
  const state = board(stones);

  const move = chooseComputerMove(state, "X");

  assert.equal(state.has(`${move.x},${move.y}`), false, JSON.stringify(move));
});
