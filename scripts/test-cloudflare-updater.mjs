import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import worker from "../cloudflare/wetter-live-updater.mjs";

const config = JSON.parse(readFileSync(new URL("../cloudflare/wrangler.jsonc", import.meta.url), "utf8"));
assert.deepEqual(config.triggers.crons, ["*/5 * * * *"]);
assert.equal(config.name, "wetter-live-updater");

const expected = ["mobile-radar.yml", "mobile-observations.yml", "mobile-live.yml", "mobile-warnings.yml"];
const token = "fixture-not-real";
let posts = [], checks = [];
const now = Date.now();

function fixture({ running = null, recent = null, fail = null } = {}) {
  posts = [];
  checks = [];
  globalThis.fetch = async (url, options = {}) => {
    assert.match(options.headers?.Authorization || "", /^Bearer fixture-not-real$/);
    const pathname = new URL(url).pathname;
    const name = expected.find(x => pathname.includes("/" + x + "/"));
    assert.ok(name, "Unexpected GitHub workflow " + pathname);
    if (options.method === "POST") {
      posts.push(name);
      if (name === fail) return new Response("Forbidden", { status: 403 });
      return new Response(null, { status: 204 });
    }
    checks.push(name);
    const runs = name === running
      ? [{ status: "in_progress", created_at: new Date(now - 20 * 60000).toISOString() }]
      : name === recent
        ? [{ status: "completed", conclusion: "success", created_at: new Date(now).toISOString() }]
        : [];
    return Response.json({ workflow_runs: runs });
  };
}

const originalFetch = globalThis.fetch;
const originalLog = console.log;
const originalError = console.error;
try {
  console.log = () => {};
  console.error = () => {};
  const absent = await worker.fetch(new Request("https://example.test/health"), {});
  assert.equal(absent.status, 503);
  assert.equal((await absent.json()).githubConfigured, false);
  await assert.rejects(() => worker.scheduled({}, {}), /GITHUB_TOKEN/);

  fixture();
  await worker.scheduled({}, { GITHUB_TOKEN: token });
  assert.deepEqual(new Set(posts), new Set(expected));
  assert.equal(checks.length, 4);
  const healthy = await worker.fetch(new Request("https://example.test/health"), { GITHUB_TOKEN: token });
  assert.equal(healthy.status, 200);
  const health = await healthy.json();
  assert.equal(health.githubConfigured, true);
  assert.equal(health.workflows.length, expected.length);

  fixture({ running: "mobile-live.yml", recent: "mobile-radar.yml" });
  await worker.scheduled({}, { GITHUB_TOKEN: token });
  assert.deepEqual(new Set(posts), new Set(["mobile-observations.yml", "mobile-warnings.yml"]));

  fixture({ fail: "mobile-radar.yml" });
  await assert.rejects(() => worker.scheduled({}, { GITHUB_TOKEN: token }), /dispatch errors/);
} finally {
  globalThis.fetch = originalFetch;
  console.log = originalLog;
  console.error = originalError;
}
console.log("Cloudflare weather updater tests passed");
