const IDENTITY_STORAGE_KEY = "luffarschack.telemetry.identity.v1";

type IdentityStorage = Pick<Storage, "getItem" | "setItem">;

type PersistedIdentity = {
  version: 1;
  installationId: string;
  pseudonym: {
    pseudoId: string;
    accountId: null;
  };
};

export type BrowserIdentity = {
  installationId: string;
  pseudoId: string;
};

type IdentityResolverOptions = {
  getStorage?: () => IdentityStorage | null;
  createId?: () => string;
};

function getBrowserStorage(): IdentityStorage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function createRandomId(): string {
  if (typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0"));

  return [
    hex.slice(0, 4).join(""),
    hex.slice(4, 6).join(""),
    hex.slice(6, 8).join(""),
    hex.slice(8, 10).join(""),
    hex.slice(10).join(""),
  ].join("-");
}

function readPersistedIdentity(value: string | null): PersistedIdentity | null {
  if (!value) return null;

  try {
    const identity: unknown = JSON.parse(value);
    if (
      typeof identity === "object" &&
      identity !== null &&
      "version" in identity &&
      identity.version === 1 &&
      "installationId" in identity &&
      typeof identity.installationId === "string" &&
      identity.installationId.length > 0 &&
      "pseudonym" in identity &&
      typeof identity.pseudonym === "object" &&
      identity.pseudonym !== null &&
      "pseudoId" in identity.pseudonym &&
      typeof identity.pseudonym.pseudoId === "string" &&
      identity.pseudonym.pseudoId.length > 0 &&
      "accountId" in identity.pseudonym &&
      identity.pseudonym.accountId === null
    ) {
      return identity as PersistedIdentity;
    }
  } catch {
    // Corrupt or unavailable persistence is replaced with a fresh anonymous identity.
  }

  return null;
}

export function createBrowserIdentityResolver({
  getStorage = getBrowserStorage,
  createId = createRandomId,
}: IdentityResolverOptions = {}): () => BrowserIdentity {
  let inMemoryIdentity: PersistedIdentity | null = null;

  return () => {
    if (inMemoryIdentity) {
      return {
        installationId: inMemoryIdentity.installationId,
        pseudoId: inMemoryIdentity.pseudonym.pseudoId,
      };
    }

    let storage: IdentityStorage | null = null;
    try {
      storage = getStorage();
      inMemoryIdentity = readPersistedIdentity(
        storage?.getItem(IDENTITY_STORAGE_KEY) ?? null,
      );
    } catch {
      storage = null;
    }

    if (!inMemoryIdentity) {
      inMemoryIdentity = {
        version: 1,
        installationId: createId(),
        pseudonym: {
          pseudoId: createId(),
          accountId: null,
        },
      };

      try {
        storage?.setItem(
          IDENTITY_STORAGE_KEY,
          JSON.stringify(inMemoryIdentity),
        );
      } catch {
        // Keep the identity for this document when storage is blocked or full.
      }
    }

    return {
      installationId: inMemoryIdentity.installationId,
      pseudoId: inMemoryIdentity.pseudonym.pseudoId,
    };
  };
}

export const resolveBrowserIdentity = createBrowserIdentityResolver();