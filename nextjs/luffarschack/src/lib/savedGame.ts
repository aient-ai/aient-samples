export type Player = "X" | "O";

export type Move = {
  x: number;
  y: number;
  player: Player;
};

export type SavedGame = {
  version: 1;
  moves: [Move, ...Move[]];
};

const SAVED_GAME_STORAGE_KEY = "luffarschack.game.v1";

type GameStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

type GameStoreOptions = {
  getStorage?: () => GameStorage | null;
};

function getBrowserStorage(): GameStorage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function isMove(value: unknown): value is Move {
  return (
    typeof value === "object" &&
    value !== null &&
    "x" in value &&
    Number.isInteger(value.x) &&
    "y" in value &&
    Number.isInteger(value.y) &&
    "player" in value &&
    (value.player === "X" || value.player === "O")
  );
}

function readSavedGame(value: string | null): SavedGame | null {
  if (!value) return null;

  try {
    const game: unknown = JSON.parse(value);
    if (
      typeof game === "object" &&
      game !== null &&
      "version" in game &&
      game.version === 1 &&
      "moves" in game &&
      Array.isArray(game.moves) &&
      game.moves.length > 0 &&
      game.moves.every(isMove)
    ) {
      return game as SavedGame;
    }
  } catch {
    // A corrupt save is treated the same as no save.
  }

  return null;
}

export function createGameStore({
  getStorage = getBrowserStorage,
}: GameStoreOptions = {}) {
  return {
    load(): SavedGame | null {
      try {
        return readSavedGame(
          getStorage()?.getItem(SAVED_GAME_STORAGE_KEY) ?? null,
        );
      } catch {
        return null;
      }
    },

    save(moves: readonly Move[]): void {
      try {
        const storage = getStorage();
        const [firstMove, ...remainingMoves] = moves;
        if (!firstMove) {
          storage?.removeItem(SAVED_GAME_STORAGE_KEY);
          return;
        }

        const game: SavedGame = {
          version: 1,
          moves: [firstMove, ...remainingMoves],
        };
        storage?.setItem(SAVED_GAME_STORAGE_KEY, JSON.stringify(game));
      } catch {
        // The game keeps working without persistence when storage is blocked or full.
      }
    },

    clear(): void {
      try {
        getStorage()?.removeItem(SAVED_GAME_STORAGE_KEY);
      } catch {
        // Nothing to clear when storage is unavailable.
      }
    },
  };
}

export const gameStore = createGameStore();
