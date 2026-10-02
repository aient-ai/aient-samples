import assert from "node:assert/strict";
import test from "node:test";

import { createGameStore } from "../../src/lib/savedGame.ts";

const STORAGE_KEY = "luffarschack.game.v1";

function createStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    values,
    getItem(key) {
      return values.get(key) ?? null;
    },
    setItem(key, value) {
      values.set(key, value);
    },
    removeItem(key) {
      values.delete(key);
    },
  };
}

const moves = [
  { x: 0, y: 0, player: "X" },
  { x: 1, y: 0, player: "O" },
  { x: -2, y: 3, player: "X" },
];

test("returns null when no game has been saved", () => {
  const store = createGameStore({ getStorage: () => createStorage() });

  assert.equal(store.load(), null);
});

test("round-trips the move list through storage", () => {
  const storage = createStorage();
  const store = createGameStore({ getStorage: () => storage });

  store.save(moves);

  assert.deepEqual(store.load(), { version: 1, moves });
  assert.deepEqual(JSON.parse(storage.values.get(STORAGE_KEY)), {
    version: 1,
    moves,
  });
});

test("treats an existing empty save as no saved game", () => {
  const storage = createStorage({
    [STORAGE_KEY]: JSON.stringify({ version: 1, moves: [] }),
  });
  const store = createGameStore({ getStorage: () => storage });

  assert.equal(store.load(), null);
});

test("saving an empty move list clears the saved game", () => {
  const storage = createStorage();
  const store = createGameStore({ getStorage: () => storage });

  store.save(moves);
  store.save([]);

  assert.equal(store.load(), null);
  assert.equal(storage.values.has(STORAGE_KEY), false);
});

test("clear removes the saved game", () => {
  const storage = createStorage();
  const store = createGameStore({ getStorage: () => storage });

  store.save(moves);
  store.clear();

  assert.equal(store.load(), null);
  assert.equal(storage.values.has(STORAGE_KEY), false);
});

test("ignores corrupt or unrecognised saves", () => {
  for (const value of [
    "{not json",
    JSON.stringify({ version: 2, moves }),
    JSON.stringify({ version: 1, moves: "nope" }),
    JSON.stringify({ version: 1, moves: [{ x: 0, y: 0, player: "Z" }] }),
    JSON.stringify({ version: 1, moves: [{ x: 0.5, y: 0, player: "X" }] }),
  ]) {
    const store = createGameStore({
      getStorage: () => createStorage({ [STORAGE_KEY]: value }),
    });

    assert.equal(store.load(), null, value);
  }
});

test("keeps working when storage is unavailable", () => {
  const throwingStorage = {
    getItem() {
      throw new Error("SecurityError");
    },
    setItem() {
      throw new Error("QuotaExceededError");
    },
    removeItem() {
      throw new Error("SecurityError");
    },
  };

  for (const getStorage of [() => null, () => throwingStorage]) {
    const store = createGameStore({ getStorage });

    assert.doesNotThrow(() => store.save(moves));
    assert.doesNotThrow(() => store.clear());
    assert.equal(store.load(), null);
  }
});
