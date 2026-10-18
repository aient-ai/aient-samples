import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { delimiter, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const build = fileURLToPath(new URL("../build.mjs", import.meta.url));
const runtime = "data:text/javascript;base64," + Buffer.from(readFileSync(new URL("../../src/lib/env.ts", import.meta.url), "utf8")).toString("base64");
const config = new URL("../../next.config.mjs", import.meta.url).href;
const commit = "a".repeat(40);
const otherCommit = "b".repeat(40);

function fixture(t, variables = {}, envFile = "") {
  const cwd = mkdtempSync(join(tmpdir(), "luffarschack-build-test-"));
  t.after(() => rmSync(cwd, { recursive: true, force: true }));
  const bin = join(cwd, "bin");
  mkdirSync(bin);
  const log = join(cwd, "commands.jsonl");
  for (const name of ["next", "aient-sourcemaps"]) {
    writeFileSync(join(bin, name), `#!${process.execPath}\nrequire('node:fs').appendFileSync(process.env.TEST_LOG, JSON.stringify({command:${JSON.stringify(name)},args:process.argv.slice(2),commit:process.env.COMMIT_SHA,browserCommit:process.env.NEXT_PUBLIC_COMMIT_SHA,branch:process.env.COMMIT_REF,browserBranch:process.env.NEXT_PUBLIC_COMMIT_REF,environment:process.env.AIENT_ENV,browserEnvironment:process.env.NEXT_PUBLIC_AIENT_ENV,buildDate:process.env.BUILD_DATE,uploadKeyPresent:!!process.env.AIENT_API_KEY})+'\\n');\nif(process.env.TEST_FAIL_COMMAND===${JSON.stringify(name)})process.exit(17);\n`, { mode: 0o755 });
  }
  if (envFile) writeFileSync(join(cwd, ".env.local"), envFile);
  const env = { PATH: bin + delimiter + process.env.PATH, NODE_ENV: "production", TEST_LOG: log, ...variables };
  const result = spawnSync(process.execPath, [build], { cwd, env, encoding: "utf8" });
  let calls = [];
  try { calls = readFileSync(log, "utf8").trim().split("\n").map(JSON.parse); } catch (error) { if (error.code !== "ENOENT") throw error; }
  return { result, calls, cwd };
}

test("documented .env.local supplies metadata and upload key before the build", (t) => {
  const { result, calls, cwd } = fixture(t, {}, `COMMIT_SHA=${commit}\nAIENT_API_KEY=test-upload-key\n`);
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(calls.map((x) => x.command), ["next", "aient-sourcemaps", "aient-sourcemaps"]);
  for (const call of calls) {
    assert.equal(call.commit, commit);
    assert.equal(call.browserCommit, commit);
    assert.equal(call.environment, "prod");
    assert.equal(call.browserEnvironment, "prod");
    assert.ok(Number.isFinite(Date.parse(call.buildDate)));
  }
  assert.equal(calls[0].uploadKeyPresent, false);
  assert.ok(calls.slice(1).every((x) => x.uploadKeyPresent));
  assert.equal(calls[1].args[1], ".next/static");
  assert.equal(calls[2].args[1], ".next/server");
  assert.ok(calls[1].args.includes("/_next/static"));
  assert.ok(calls[2].args.includes(join(cwd, ".next/server")));
  assert.ok(calls.slice(1).every((x) => x.args.includes("--fail-on-empty")));
});

test("exported deployment values take precedence over .env.local", (t) => {
  const { result, calls } = fixture(t, { COMMIT_SHA: commit, AIENT_API_KEY: "test-upload-key" }, `COMMIT_SHA=${otherCommit}\n`);
  assert.equal(result.status, 0, result.stderr);
  assert.ok(calls.every((x) => x.commit === commit));
});

test("a conflicting browser release fails before building", (t) => {
  const { result, calls } = fixture(t, { COMMIT_SHA: commit, NEXT_PUBLIC_COMMIT_SHA: otherCommit });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /must match/);
  assert.equal(calls.length, 0);
});

test("production requires an upload key while preview explicitly skips uploads", (t) => {
  const production = fixture(t, { VERCEL: "1", VERCEL_ENV: "production", VERCEL_GIT_COMMIT_SHA: commit });
  assert.notEqual(production.result.status, 0);
  assert.match(production.result.stderr, /AIENT_API_KEY is required/);
  assert.equal(production.calls.length, 0);
  const preview = fixture(t, { VERCEL: "1", VERCEL_ENV: "preview", VERCEL_GIT_COMMIT_SHA: commit });
  assert.equal(preview.result.status, 0, preview.result.stderr);
  assert.deepEqual(preview.calls.map((x) => x.command), ["next"]);
  assert.match(preview.result.stderr, /Skipping Aient source-map upload/);
});

test("server runtime uses the same Vercel release defaults as the build", () => {
  const result = spawnSync(process.execPath, ["--input-type=module", "-e", `const {SERVER_TELEMETRY}=await import(${JSON.stringify(runtime)});console.log(JSON.stringify(SERVER_TELEMETRY.release));`], { encoding: "utf8", env: { NODE_ENV: "production", VERCEL_ENV: "production", VERCEL_GIT_COMMIT_SHA: commit, VERCEL_GIT_COMMIT_REF: "main" } });
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout), { commit, branch: "main", environment: "prod" });
});

test("missing, short, and placeholder commits fail before building", (t) => {
  for (const value of ["", "a".repeat(12), "unknown", "g".repeat(40)]) {
    const { result, calls } = fixture(t, { COMMIT_SHA: value });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /required|40-character Git SHA/);
    assert.equal(calls.length, 0);
  }
});

test("Vercel release, service names, and bundle prefixes match both uploads", (t) => {
  const { result, calls } = fixture(t, {
    VERCEL: "1", VERCEL_ENV: "production", VERCEL_GIT_COMMIT_SHA: commit,
    VERCEL_GIT_COMMIT_REF: "main", AIENT_API_KEY: "test-upload-key",
    OTEL_SERVICE_NAME: "server", NEXT_PUBLIC_OTEL_SERVICE_NAME: "browser",
  });
  assert.equal(result.status, 0, result.stderr);
  assert.ok(calls.every((x) => x.branch === "main" && x.browserBranch === "main"));
  assert.ok(calls[1].args.includes("browser"));
  assert.ok(calls[2].args.includes("server"));
  assert.ok(calls[2].args.includes("/var/task/.next/server"));
  for (const call of calls.slice(1)) {
    assert.equal(call.args[call.args.indexOf("--commit") + 1], commit);
  }
});

test("relocated artifacts can override the server bundle prefix", (t) => {
  const { result, calls } = fixture(t, {
    COMMIT_SHA: commit, AIENT_API_KEY: "test-upload-key",
    AIENT_SERVER_BUNDLE_PREFIX: "/app/.next/server",
  });
  assert.equal(result.status, 0, result.stderr);
  assert.ok(calls[2].args.includes("/app/.next/server"));
});

test("build and upload failures fail the production command", (t) => {
  for (const command of ["next", "aient-sourcemaps"]) {
    const { result, calls } = fixture(t, {
      COMMIT_SHA: commit, AIENT_API_KEY: "test-upload-key", TEST_FAIL_COMMAND: command,
    });
    assert.equal(result.status, 17);
    assert.equal(calls.length, command === "next" ? 1 : 2);
  }
});

test("Next config retains maps and bakes only public release metadata", () => {
  const result = spawnSync(process.execPath, ["--input-type=module", "-e", `const {default:config}=await import(${JSON.stringify(config)});console.log(JSON.stringify(config));`], {
    encoding: "utf8",
    env: {
      COMMIT_SHA: commit, NEXT_PUBLIC_COMMIT_SHA: commit,
      COMMIT_REF: "main", NEXT_PUBLIC_COMMIT_REF: "main",
      AIENT_ENV: "prod", NEXT_PUBLIC_AIENT_ENV: "prod",
      AIENT_API_KEY: "test-upload-key", AIENT_PUBLISHABLE_KEY: "test-ingest-key",
    },
  });
  assert.equal(result.status, 0, result.stderr);
  const actual = JSON.parse(result.stdout);
  assert.equal(actual.productionBrowserSourceMaps, true);
  assert.equal(actual.experimental.serverSourceMaps, true);
  assert.deepEqual(actual.env, {
    COMMIT_SHA: commit, NEXT_PUBLIC_COMMIT_SHA: commit,
    COMMIT_REF: "main", NEXT_PUBLIC_COMMIT_REF: "main",
    AIENT_ENV: "prod", NEXT_PUBLIC_AIENT_ENV: "prod",
  });
  assert.ok(!result.stdout.includes("test-upload-key"));
  assert.ok(!result.stdout.includes("test-ingest-key"));
});
