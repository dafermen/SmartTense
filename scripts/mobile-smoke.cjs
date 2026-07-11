const { spawn, spawnSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");
const appPort = Number(process.env.SMARTTENSE_E2E_PORT || 5174);
const appUrl = `http://127.0.0.1:${appPort}/`;
const cdpPort = Number(process.env.SMARTTENSE_CDP_PORT || 9400 + Math.floor(Math.random() * 500));
const viteBin = path.join(projectRoot, "node_modules", "vite", "bin", "vite.js");
const chromePath = findChromePath();
const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), "smarttense-mobile-smoke-"));

if (typeof fetch !== "function" || typeof WebSocket !== "function") {
  console.error("This smoke test requires a recent Node.js runtime with global fetch and WebSocket.");
  process.exit(1);
}

if (!chromePath) {
  console.error("Chrome was not found. Set SMARTTENSE_CHROME_PATH to the Chrome executable path.");
  process.exit(1);
}

function findChromePath() {
  if (process.env.SMARTTENSE_CHROME_PATH && fs.existsSync(process.env.SMARTTENSE_CHROME_PATH)) {
    return process.env.SMARTTENSE_CHROME_PATH;
  }

  const candidates = process.platform === "win32"
    ? [
        "C:/Program Files/Google/Chrome/Application/chrome.exe",
        "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe"
      ]
    : [
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        "/usr/bin/google-chrome",
        "/usr/bin/google-chrome-stable",
        "/usr/bin/chromium",
        "/usr/bin/chromium-browser"
      ];

  return candidates.find((candidate) => fs.existsSync(candidate)) || "";
}

function makeVerbs(count) {
  return Array.from({ length: count }, (_, index) => {
    const n = String(index + 1).padStart(3, "0");
    return {
      id: `bulk-${n}`,
      label: `to practice ${n}`,
      meaningEs: `practicar ${n}`,
      base: `practice${n}`,
      third: `practices${n}`,
      past: `practiced${n}`,
      participle: `practiced${n}`,
      gerund: `practicing${n}`,
      object: `task ${n}`,
      objectEs: `tarea ${n}`
    };
  });
}

const syntheticData = {
  schemaVersion: 1,
  updatedAt: "2026-07-11-synthetic-qa",
  verbs: makeVerbs(500)
};
const syntheticBody = Buffer.from(JSON.stringify(syntheticData), "utf8").toString("base64");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function startDevServer() {
  const server = spawn(
    process.execPath,
    [viteBin, "--host", "127.0.0.1", "--port", String(appPort), "--strictPort"],
    {
      cwd: projectRoot,
      env: { ...process.env, BROWSER: "none" },
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true
    }
  );

  let output = "";
  server.stdout.on("data", (chunk) => { output += chunk.toString(); });
  server.stderr.on("data", (chunk) => { output += chunk.toString(); });
  server.output = () => output;
  return server;
}

function stopProcessTree(child) {
  if (!child || child.killed) return;
  if (process.platform === "win32") {
    spawnSync("taskkill", ["/pid", String(child.pid), "/T", "/F"], { stdio: "ignore" });
    return;
  }
  child.kill("SIGTERM");
}

async function removeTempDir(dir) {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    try {
      fs.rmSync(dir, { recursive: true, force: true });
      return;
    } catch (error) {
      if (attempt === 19) {
        console.warn(`Could not remove temporary Chrome profile: ${error.message}`);
        return;
      }
      await sleep(500);
    }
  }
}

async function waitForUrl(url, timeoutMs, getErrorContext) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) return response;
    } catch (_) {
      // Keep polling until Vite or Chrome finishes booting.
    }
    await sleep(250);
  }
  throw new Error(`Timed out waiting for ${url}\n${getErrorContext ? getErrorContext() : ""}`);
}

async function waitForChrome() {
  const response = await waitForUrl(`http://127.0.0.1:${cdpPort}/json/version`, 15000);
  return response.json();
}

class CDP {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.nextId = 1;
    this.pending = new Map();
    this.handlers = new Map();
  }

  async open() {
    await new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
    });
    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.id && this.pending.has(message.id)) {
        const { resolve, reject } = this.pending.get(message.id);
        this.pending.delete(message.id);
        if (message.error) reject(new Error(message.error.message));
        else resolve(message.result || {});
        return;
      }

      if (message.method && this.handlers.has(message.method)) {
        for (const handler of this.handlers.get(message.method)) handler(message.params || {});
      }
    };
  }

  on(method, handler) {
    if (!this.handlers.has(method)) this.handlers.set(method, []);
    this.handlers.get(method).push(handler);
  }

  send(method, params = {}) {
    const id = this.nextId++;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }));
  }

  close() {
    this.ws.close();
  }
}

async function evaluate(cdp, expression) {
  const result = await cdp.send("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true
  });
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text || "Runtime evaluation failed");
  }
  return result.result ? result.result.value : undefined;
}

async function waitFor(cdp, expression, timeoutMs = 10000) {
  const deadline = Date.now() + timeoutMs;
  let lastValue;
  while (Date.now() < deadline) {
    lastValue = await evaluate(cdp, expression);
    if (lastValue) return lastValue;
    await sleep(250);
  }
  let bodyText = "";
  try {
    bodyText = await evaluate(cdp, `document.body ? document.body.innerText.slice(0, 1200) : ''`);
  } catch (_) {
    bodyText = "Body text unavailable";
  }
  throw new Error(`Timed out waiting for expression: ${expression}; last=${JSON.stringify(lastValue)}\nBody:\n${bodyText}`);
}

async function clickByText(cdp, text) {
  const expected = JSON.stringify(text.toLowerCase());
  return evaluate(cdp, `(() => {
    const expected = ${expected};
    const elements = [...document.querySelectorAll('button, a, [role="button"]')];
    const target = elements.find((element) => (element.innerText || element.textContent || '').trim().toLowerCase() === expected);
    if (!target) return false;
    target.click();
    return true;
  })()`);
}

async function clickAndWait(cdp, label, expression) {
  const clicked = await clickByText(cdp, label);
  if (!clicked) throw new Error(`Could not find navigation control: ${label}`);
  await waitFor(cdp, expression);
}

async function main() {
  const server = startDevServer();
  let chrome;
  let cdp;

  try {
    await waitForUrl(appUrl, 20000, () => server.output());

    chrome = spawn(chromePath, [
      "--headless=new",
      "--disable-gpu",
      "--no-first-run",
      "--disable-extensions",
      `--remote-debugging-port=${cdpPort}`,
      `--user-data-dir=${userDataDir}`,
      "--window-size=390,844",
      "about:blank"
    ], { stdio: "ignore", windowsHide: true });

    await waitForChrome();
    const targetResponse = await fetch(`http://127.0.0.1:${cdpPort}/json/new?${encodeURIComponent("about:blank")}`, { method: "PUT" });
    const target = await targetResponse.json();
    cdp = new CDP(target.webSocketDebuggerUrl);
    await cdp.open();

    const browserProblems = [];
    cdp.on("Runtime.exceptionThrown", (params) => {
      browserProblems.push(params.exceptionDetails?.text || "Runtime exception");
    });
    cdp.on("Runtime.consoleAPICalled", (params) => {
      if (params.type === "error") {
        const message = params.args?.map((arg) => arg.value || arg.description || "").join(" ");
        browserProblems.push(message || "Console error");
      }
    });
    cdp.on("Fetch.requestPaused", (params) => {
      if (params.request.url.includes("/data/verbs.json")) {
        cdp.send("Fetch.fulfillRequest", {
          requestId: params.requestId,
          responseCode: 200,
          responseHeaders: [{ name: "Content-Type", value: "application/json; charset=utf-8" }],
          body: syntheticBody
        }).catch((error) => browserProblems.push(`Fetch fulfill failed: ${error.message}`));
        return;
      }
      cdp.send("Fetch.continueRequest", { requestId: params.requestId })
        .catch((error) => browserProblems.push(`Fetch continue failed: ${error.message}`));
    });

    await cdp.send("Page.enable");
    await cdp.send("Runtime.enable");
    await cdp.send("Fetch.enable", { patterns: [{ urlPattern: "*data/verbs.json*", requestStage: "Request" }] });
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });

    const startedAt = Date.now();
    await cdp.send("Page.navigate", { url: appUrl });
    await waitFor(cdp, `(() => {
      const text = document.body.innerText;
      return text.includes('SmartTense') && /\\b500\\b/.test(text) && text.toLowerCase().includes('learning workspace');
    })()`);
    const homeMs = Date.now() - startedAt;

    await clickAndWait(cdp, "Theory", `document.body.innerText.toLowerCase().includes('objectives')`);
    await clickAndWait(cdp, "Practice", `document.body.innerText.toLowerCase().includes('check answer') && document.body.innerText.toLowerCase().includes('correct')`);
    await clickAndWait(cdp, "Individual", `document.body.innerText.toLowerCase().includes('individual') && document.body.innerText.toLowerCase().includes('tense')`);
    await clickAndWait(cdp, "Complete", `Boolean(document.querySelector('.mobile-card-list') && document.querySelector('.complete-table-card'))`);
    await clickAndWait(cdp, "Production", `document.body.innerText.toLowerCase().includes('production composer') && document.body.innerText.toLowerCase().includes('revision queue')`);

    const settingsStartedAt = Date.now();
    await clickAndWait(cdp, "Settings", `(() => {
      const text = document.body.innerText.toLowerCase();
      return text.includes('search and review database') && text.includes('showing 1-25 of 500');
    })()`);
    const settingsMs = Date.now() - settingsStartedAt;

    const nextClicked = await clickByText(cdp, "Next");
    if (!nextClicked) throw new Error("Next pagination control was not found");
    await waitFor(cdp, `document.body.innerText.toLowerCase().includes('showing 26-50 of 500')`);

    const metrics = await evaluate(cdp, `(() => ({
      bodyChars: document.body.innerText.length,
      activeButtons: document.querySelectorAll('button:not([disabled])').length,
      visibleRows: document.querySelectorAll('tbody tr').length,
      viewport: { width: window.innerWidth, height: window.innerHeight },
      language: document.documentElement.lang
    }))()`);

    if (browserProblems.length > 0) {
      throw new Error(`Browser problems detected:\\n${browserProblems.join("\\n")}`);
    }

    console.log(JSON.stringify({
      viewport: "390x844",
      syntheticVerbCount: syntheticData.verbs.length,
      screens: ["Home", "Theory", "Practice", "Individual", "Complete", "Production", "Settings"],
      paginationOk: true,
      durations: { homeMs, settingsMs },
      metrics
    }, null, 2));
  } finally {
    if (cdp) {
      try {
        await cdp.send("Browser.close");
      } catch (_) {
        // The browser may already be closing after a failed run.
      }
      cdp.close();
    }
    stopProcessTree(chrome);
    stopProcessTree(server);
    await sleep(1000);
    await removeTempDir(userDataDir);
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
