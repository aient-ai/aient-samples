import assert from "node:assert/strict";
import test from "node:test";

import { selectWinningRun } from "../../src/lib/winningLine.ts";

const horizontalLine = (length) =>
  Array.from({ length }, (_, x) => [x, 0]);

test("selects a complete five-cell run when the winning move is last", () => {
  const line = horizontalLine(5);

  assert.deepEqual(selectWinningRun(line, [4, 0], 5), line);
});

test("keeps the winning move in bounds at either end of an overlong run", () => {
  const line = horizontalLine(7);

  assert.deepEqual(selectWinningRun(line, [1, 0], 5), line.slice(1, 6));
  assert.deepEqual(selectWinningRun(line, [6, 0], 5), line.slice(2, 7));
});

test("rejects an invalid winning-line invariant", () => {
  assert.throws(
    () => selectWinningRun(horizontalLine(4), [3, 0], 5),
    /shorter than the requested run/
  );
  assert.throws(
    () => selectWinningRun(horizontalLine(5), [8, 0], 5),
    /does not contain the anchor cell/
  );
});