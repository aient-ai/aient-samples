export type Coordinate = readonly [number, number];

export function selectWinningRun(
  winLine: readonly Coordinate[],
  anchor: Coordinate,
  length: number
): Coordinate[] {
  if (winLine.length < length) {
    throw new RangeError("Winning line is shorter than the requested run");
  }

  const anchorIndex = winLine.findIndex(
    ([x, y]) => x === anchor[0] && y === anchor[1]
  );
  if (anchorIndex === -1) {
    throw new Error("Winning line does not contain the anchor cell");
  }

  const startIndex = Math.min(anchorIndex, winLine.length - length);
  return winLine.slice(startIndex, startIndex + length);
}