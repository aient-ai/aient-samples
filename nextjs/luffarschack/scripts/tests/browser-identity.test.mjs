import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { trace } from "@opentelemetry/api";
import { SeverityNumber } from "@opentelemetry/api-logs";
import { registerOTelBrowser } from "@aient/otel-browser";
import ts from "typescript";

const identitySource = readFileSync(
  new URL("../../src/lib/browserIdentity.ts", import.meta.url),
  "utf8",
);
const identityModule =
  "data:text/javascript;base64," +
  Buffer.from(
    ts.transpileModule(identitySource, {
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText,
  ).toString("base64");
const { createBrowserIdentityResolver } = await import(identityModule);

function createStorage() {
  const values = new Map();
  return {
    getItem(key) {
      return values.get(key) ?? null;
    },
    setItem(key, value) {
      values.set(key, value);
    },
  };
}

function createIds(...ids) {
  return () => {
    const id = ids.shift();
    assert.ok(id, "identity generation exceeded the test's expected calls");
    return id;
  };
}

function signalAttributes(signal) {
  return Object.fromEntries(
    signal.attributes.map(({ key, value }) => [key, value.stringValue]),
  );
}

async function captureIdentity(identity, name, requests) {
  const sdk = registerOTelBrowser({
    serviceName: "luffarschack-identity-test",
    exporterUrl: "https://capture.invalid",
    publishableKey: "test-publishable-key",
    release: { commit: "a".repeat(40), branch: "main", environment: "prod" },
    instrumentations: [],
    captureUnhandledErrors: false,
    installationId: identity.installationId,
    user: { pseudoId: identity.pseudoId },
  });

  trace.getTracer("identity-test").startSpan(`${name}-span`).end();
  sdk.getLogger("identity-test").emit({
    severityNumber: SeverityNumber.INFO,
    body: `${name}-log`,
  });
  await sdk.forceFlush();
  await sdk.shutdown();

  const traceRequest = requests.find((request) =>
    request.body.resourceSpans?.some(({ scopeSpans }) =>
      scopeSpans.some(({ spans }) => spans.some((span) => span.name === `${name}-span`)),
    ),
  );
  const logRequest = requests.find((request) =>
    request.body.resourceLogs?.some(({ scopeLogs }) =>
      scopeLogs.some(({ logRecords }) =>
        logRecords.some((record) => record.body.stringValue === `${name}-log`),
      ),
    ),
  );

  assert.ok(traceRequest, `${name} span was not exported`);
  assert.ok(logRequest, `${name} log was not exported`);

  const span = traceRequest.body.resourceSpans
    .flatMap(({ scopeSpans }) => scopeSpans)
    .flatMap(({ spans }) => spans)
    .find((candidate) => candidate.name === `${name}-span`);
  const log = logRequest.body.resourceLogs
    .flatMap(({ scopeLogs }) => scopeLogs)
    .flatMap(({ logRecords }) => logRecords)
    .find((candidate) => candidate.body.stringValue === `${name}-log`);

  assert.equal(signalAttributes(span)["enduser.pseudo.id"], identity.pseudoId);
  assert.equal(signalAttributes(log)["enduser.pseudo.id"], identity.pseudoId);
  for (const signal of [span, log]) {
    assert.equal(signalAttributes(signal)["enduser.id"], undefined);
  }
  for (const [request, resources] of [
    [traceRequest, traceRequest.body.resourceSpans],
    [logRequest, logRequest.body.resourceLogs],
  ]) {
    assert.equal(request.authorization, "Bearer test-publishable-key");
    const attributes = signalAttributes(resources[0].resource);
    assert.equal(attributes["app.installation.id"], identity.installationId);
    assert.equal(attributes["service.name"], "luffarschack-identity-test");
    assert.equal(attributes["deployment.commit_sha"], "a".repeat(40));
    assert.equal(attributes["deployment.commit_ref"], "main");
    assert.equal(attributes["deployment.environment"], "prod");
  }
}

test("anonymous identity persists across reload and remount and is exported on spans and logs", { timeout: 10000 }, async () => {
  const storage = createStorage();
  const firstIdentity = createBrowserIdentityResolver({
    getStorage: () => storage,
    createId: createIds("installation-id", "pseudo-id"),
  })();
  const reloadedIdentity = createBrowserIdentityResolver({
    getStorage: () => storage,
    createId: () => assert.fail("reload should reuse the persisted identity"),
  })();

  assert.deepEqual(reloadedIdentity, firstIdentity);
  assert.notEqual(firstIdentity.installationId, firstIdentity.pseudoId);

  const requests = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    requests.push({
      url: String(url), body: JSON.parse(init.body),
      authorization: new Headers(init.headers).get("authorization"),
    });
    return new Response(null, { status: 200 });
  };

  try {
    await captureIdentity(firstIdentity, "initial", requests);
    await captureIdentity(reloadedIdentity, "reload", requests);
    // SDK cleanup/remount must not rotate application-owned identity.
    await captureIdentity(reloadedIdentity, "remount", requests);
  } finally {
    globalThis.fetch = originalFetch;
  }

  assert.ok(requests.some(({ url }) => url.endsWith("/v1/traces")));
  assert.ok(requests.some(({ url }) => url.endsWith("/v1/logs")));
});

test("blocked persistence keeps separate stable IDs for the document lifetime", () => {
  const resolveIdentity = createBrowserIdentityResolver({
    getStorage: () => ({
      getItem() {
        throw new Error("storage blocked");
      },
      setItem() {
        throw new Error("storage blocked");
      },
    }),
    createId: createIds("memory-installation", "memory-pseudo"),
  });

  const firstIdentity = resolveIdentity();
  assert.deepEqual(resolveIdentity(), firstIdentity);
  assert.notEqual(firstIdentity.installationId, firstIdentity.pseudoId);
});