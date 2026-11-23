// Cloudflare Worker: dispatch the existing mobile weather data pipelines every 5 minutes.
// The Python importers continue to run on GitHub Actions; the Worker does not claim to
// compute a new analysis merely by dispatching a job.
const REPOSITORY = "colinheinz07-spec/Wetter-App-Mobile";
const WORKFLOWS = Object.freeze([
  "mobile-radar.yml",
  "mobile-observations.yml",
  "mobile-live.yml",
  "mobile-warnings.yml"
]);
const BASE = `https://api.github.com/repos/${REPOSITORY}/actions/workflows/`;
const ACTIVE = new Set(["queued", "in_progress", "waiting", "pending", "requested"]);
const MIN_DISPATCH_GAP_MS = 4 * 60 * 1000;

function headers(token) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "wetter-live-updater"
  };
}

async function github(token, path, options = {}) {
  const response = await fetch(BASE + path, {
    ...options,
    headers: { ...headers(token), ...options.headers },
    signal: AbortSignal.timeout(12000)
  });
  if (!response.ok) {
    // Never log authorization headers or the secret, including on failure.
    throw new Error(`GitHub API ${response.status} for ${path.split("?")[0]}`);
  }
  if (response.status === 204) return null;
  return response.json();
}

async function workflowStatus(name, token) {
  const response = await github(token, `${encodeURIComponent(name)}/runs?per_page=15`);
  const runs = Array.isArray(response?.workflow_runs) ? response.workflow_runs : [];
  return { name, runs };
}

async function dispatchOne(name, token, now) {
  const { runs } = await workflowStatus(name, token);
  const running = runs.some(run => ACTIVE.has(run.status));
  if (running) return { name, result: "already_running" };
  const latest = runs.reduce((a, b) =>
    Date.parse(a?.created_at || 0) > Date.parse(b?.created_at || 0) ? a : b, null);
  if (latest && Number.isFinite(Date.parse(latest.created_at)) &&
      now - Date.parse(latest.created_at) < MIN_DISPATCH_GAP_MS) {
    return { name, result: "recently_started" };
  }
  await github(token, `${encodeURIComponent(name)}/dispatches`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ref: "main" })
  });
  return { name, result: "dispatched" };
}

async function executeTick(env, now = Date.now()) {
  if (!env?.GITHUB_TOKEN) throw new Error("GITHUB_TOKEN secret is missing");
  const results = await Promise.allSettled(
    WORKFLOWS.map(name => dispatchOne(name, env.GITHUB_TOKEN, now))
  );
  const successes = [], errors = [];
  results.forEach((r, i) => {
    if (r.status === "fulfilled") successes.push(r.value);
    else errors.push({ workflow: WORKFLOWS[i], error: String(r.reason?.message || r.reason) });
  });
  const summary = { at: new Date(now).toISOString(), successes, errors };
  console.log("weather-pipeline-tick", JSON.stringify(summary));
  // A Cloudflare "success" event must not conceal failed GitHub API calls.
  if (errors.length) throw new Error(`${errors.length} GitHub workflow dispatch errors; see weather-pipeline-tick`);
  return summary;
}

async function health(env) {
  if (!env?.GITHUB_TOKEN) return Response.json({
    status: "configuration_missing", githubConfigured: false
  }, { status: 503, headers: { "Cache-Control": "no-store" } });
  const checks = await Promise.allSettled(
    WORKFLOWS.map(name => workflowStatus(name, env.GITHUB_TOKEN))
  );
  const workflows = checks.map((r, i) => {
    const name = WORKFLOWS[i];
    if (r.status === "rejected") return { name, error: String(r.reason?.message || r.reason) };
    const latest = r.value.runs[0];
    const latestSuccessful = r.value.runs.find(run => run.conclusion === "success");
    return {
      name,
      lastStartedAt: latest?.created_at || null,
      lastEvent: latest?.event || null,
      lastStatus: latest?.status || null,
      lastConclusion: latest?.conclusion || null,
      lastSuccessfulAt: latestSuccessful?.created_at || null
    };
  });
  const bad = workflows.some(x => x.error);
  return Response.json({
    status: bad ? "github_error" : "connected",
    githubConfigured: true,
    cron: "*/5 * * * *",
    note: "A successful dispatch is not proof that fresh data was published.",
    workflows
  }, { status: bad ? 502 : 200, headers: { "Cache-Control": "no-store" } });
}

export default {
  async fetch(request, env) {
    const path = new URL(request.url).pathname;
    if (request.method !== "GET") return new Response("Method not allowed", { status: 405 });
    if (path === "/" || path === "/health") return health(env);
    return new Response("Not found", { status: 404 });
  },
  async scheduled(_controller, env) {
    await executeTick(env);
  }
};
