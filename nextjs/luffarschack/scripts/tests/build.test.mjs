import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { delimiter, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const build = fileURLToPath(new URL("../build.mjs", import.meta.url));
const runtime = "data:text/javascript;base64," + Buffer.from(readFileSync(new URL("../../src/lib/env.ts", import.meta.url), "utf8")).toString("base64");

function fixture(t, variables = {}, envFile = "") {
  const cwd = mkdtempSync(join(tmpdir(), "luffarschack-build-test-"));
  t.after(() => rmSync(cwd, { recursive: true, force: true }));
  const bin = join(cwd, "bin");
  mkdirSync(bin);
  const log = join(cwd, "commands.jsonl");
  for (const name of ["next", "aient-sourcemaps"]) {
    writeFileSync(join(bin, name), `#!${process.execPath}\nrequire('node:fs').appendFileSync(process.env.TEST_LOG, JSON.stringify({command:${JSON.stringify(name)},args:process.argv.slice(2),commit:process.env.COMMIT_SHA,browserCommit:process.env.NEXT_PUBLIC_COMMIT_SHA,uploadKeyPresent:!!process.env.AIENT_API_KEY})+'\\n');\n`, { mode: 0o755 });
  }
  if (envFile) writeFileSync(join(cwd, ".env.local"), envFile);
  const env = { PATH: bin + delimiter + process.env.PATH, NODE_ENV: "production", TEST_LOG: log, ...variables };
  const result = spawnSync(process.execPath, [build], { cwd, env, encoding: "utf8" });
  let calls = [];
  try { calls = readFileSync(log, "utf8").trim().split("\n").map(JSON.parse); } catch (error) { if (error.code !== "ENOENT") throw error; }
  return { result, calls };
}

test("documented .env.local supplies metadata and upload key before the build", (t) => {
  const { result, calls } = fixture(t, {}, "COMMIT_SHA=local-commit\nAIENT_API_KEY=test-upload-key\n");
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(calls.map((x) => x.command), ["next", "aient-sourcemaps", "aient-sourcemaps"]);
  for (const call of calls) {
    assert.equal(call.commit, "local-commit");
    assert.equal(call.browserCommit, "local-commit");
    assert.equal(call.uploadKeyPresent, true);
  }
  assert.equal(calls[1].args[1], ".next/static");
  assert.equal(calls[2].args[1], ".next/server");
  assert.ok(calls.slice(1).every((x) => x.args.includes("--fail-on-empty")));
});

test("exported deployment values take precedence over .env.local", (t) => {
  const { result, calls } = fixture(t, { COMMIT_SHA: "deployment-commit", AIENT_API_KEY: "test-upload-key" }, "COMMIT_SHA=local-commit\n");
  assert.equal(result.status, 0, result.stderr);
  assert.ok(calls.every((x) => x.commit === "deployment-commit"));
});

test("a conflicting browser release fails before building", (t) => {
  const { result, calls } = fixture(t, { COMMIT_SHA: "server", NEXT_PUBLIC_COMMIT_SHA: "browser" });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /must match/);
  assert.equal(calls.length, 0);
});

test("production requires an upload key while preview explicitly skips uploads", (t) => {
  const production = fixture(t, { VERCEL: "1", VERCEL_ENV: "production", VERCEL_GIT_COMMIT_SHA: "vercel-commit" });
  assert.notEqual(production.result.status, 0);
  assert.match(production.result.stderr, /AIENT_API_KEY is required/);
  const preview = fixture(t, { VERCEL: "1", VERCEL_ENV: "preview", VERCEL_GIT_COMMIT_SHA: "vercel-commit" });
  assert.equal(preview.result.status, 0, preview.result.stderr);
  assert.deepEqual(preview.calls.map((x) => x.command), ["next"]);
  assert.match(preview.result.stderr, /Skipping Aient source-map upload/);
});

test("server runtime uses the same Vercel release defaults as the build", () => {
  const result = spawnSync(process.execPath, ["--input-type=module", "-e", `const {SERVER_TELEMETRY}=await import(${JSON.stringify(runtime)});console.log(JSON.stringify(SERVER_TELEMETRY.release));`], { encoding: "utf8", env: { NODE_ENV: "production", VERCEL_ENV: "production", VERCEL_GIT_COMMIT_SHA: "vercel-commit", VERCEL_GIT_COMMIT_REF: "main" } });
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout), { commit: "vercel-commit", branch: "main", environment: "prod" });
});
