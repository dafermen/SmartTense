const { spawn } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");
const outputDirectory = path.join(projectRoot, "docs", "images");
const appPort = Number(process.env.SMARTTENSE_SCREENSHOT_PORT || 5178);
const appUrl = `http://127.0.0.1:${appPort}/`;
const cdpPort = Number(process.env.SMARTTENSE_SCREENSHOT_CDP_PORT || 9700 + Math.floor(Math.random() * 200));
const viteBin = path.join(projectRoot, "node_modules", "vite", "bin", "vite.js");
const chromePath = findChromePath();
const userDataDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "smarttense-doc-screenshots-"));

function findChromePath() {
  const candidates = process.platform === "win32"
    ? [
        process.env.SMARTTENSE_CHROME_PATH,
        "C:/Program Files/Google/Chrome/Application/chrome.exe",
        "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe"
      ]
    : [
        process.env.SMARTTENSE_CHROME_PATH,
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        "/usr/bin/google-chrome",
        "/usr/bin/google-chrome-stable",
        "/usr/bin/chromium"
      ];
  return candidates.find((candidate) => candidate && fs.existsSync(candidate)) || "";
}

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function isAppAvailable() {
  try {
    const response = await fetch(appUrl);
    return response.ok;
  } catch {
    return false;
  }
}

async function waitForUrl(url, timeoutMilliseconds = 20000) {
  const deadline = Date.now() + timeoutMilliseconds;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) return response;
    } catch {
      // The local process is still starting.
    }
    await sleep(250);
  }
  throw new Error(`Timed out waiting for ${url}`);
}

class CDP {
  constructor(webSocketUrl) {
    this.socket = new WebSocket(webSocketUrl);
    this.nextId = 1;
    this.pending = new Map();
  }

  async open() {
    await new Promise((resolve, reject) => {
      this.socket.onopen = resolve;
      this.socket.onerror = reject;
    });
    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (!message.id || !this.pending.has(message.id)) return;
      const pending = this.pending.get(message.id);
      this.pending.delete(message.id);
      if (message.error) pending.reject(new Error(message.error.message));
      else pending.resolve(message.result || {});
    };
  }

  send(method, params = {}) {
    const id = this.nextId++;
    this.socket.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }));
  }

  close() {
    this.socket.close();
  }
}

async function evaluate(cdp, expression) {
  const response = await cdp.send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true
  });
  if (response.exceptionDetails) throw new Error(response.exceptionDetails.text || "Browser evaluation failed");
  return response.result?.value;
}

async function waitFor(cdp, expression, timeoutMilliseconds = 10000) {
  const deadline = Date.now() + timeoutMilliseconds;
  while (Date.now() < deadline) {
    if (await evaluate(cdp, expression)) return;
    await sleep(200);
  }
  throw new Error(`Timed out waiting for browser state: ${expression}`);
}

async function clickByText(cdp, label) {
  const expected = JSON.stringify(label.toLowerCase());
  const clicked = await evaluate(cdp, `(() => {
    const expected = ${expected};
    const candidates = [...document.querySelectorAll('button, a, [role="button"]')];
    const target = candidates.find((element) => (element.innerText || element.textContent || '').trim().toLowerCase() === expected);
    if (!target) return false;
    target.click();
    return true;
  })()`);
  if (!clicked) throw new Error(`Could not find ${label} navigation control`);
  await sleep(350);
}

async function setViewport(cdp, width, height, mobile) {
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: mobile ? 2 : 1,
    mobile
  });
  await sleep(250);
}

async function capture(cdp, filename) {
  await evaluate(cdp, `Promise.all([document.fonts?.ready || Promise.resolve(), new Promise((resolve) => {
    window.scrollTo(0, 0);
    requestAnimationFrame(() => requestAnimationFrame(resolve));
  })]).then(() => true)`);
  const screenshot = await cdp.send("Page.captureScreenshot", {
    format: "png",
    fromSurface: true,
    captureBeyondViewport: false
  });
  const destination = path.join(outputDirectory, filename);
  fs.writeFileSync(destination, Buffer.from(screenshot.data, "base64"));
  return { file: path.relative(projectRoot, destination).replace(/\\/g, "/"), bytes: fs.statSync(destination).size };
}

async function main() {
  if (!chromePath) throw new Error("Google Chrome was not found. Set SMARTTENSE_CHROME_PATH.");
  fs.mkdirSync(outputDirectory, { recursive: true });

  let server;
  let chrome;
  let cdp;
  try {
    if (!(await isAppAvailable())) {
      server = spawn(process.execPath, [viteBin, "--host", "127.0.0.1", "--port", String(appPort), "--strictPort"], {
        cwd: projectRoot,
        env: { ...process.env, BROWSER: "none" },
        stdio: "ignore",
        windowsHide: true
      });
      await waitForUrl(appUrl);
    }

    chrome = spawn(chromePath, [
      "--headless=new",
      "--disable-gpu",
      "--disable-extensions",
      "--no-first-run",
      `--remote-debugging-port=${cdpPort}`,
      `--user-data-dir=${userDataDirectory}`,
      "about:blank"
    ], { stdio: "ignore", windowsHide: true });

    await waitForUrl(`http://127.0.0.1:${cdpPort}/json/version`, 15000);
    const targetResponse = await fetch(`http://127.0.0.1:${cdpPort}/json/new?${encodeURIComponent("about:blank")}`, { method: "PUT" });
    const target = await targetResponse.json();
    cdp = new CDP(target.webSocketDebuggerUrl);
    await cdp.open();
    await cdp.send("Page.enable");
    await cdp.send("Runtime.enable");

    await setViewport(cdp, 1440, 900, false);
    await cdp.send("Page.navigate", { url: appUrl });
    await waitFor(cdp, `document.body?.innerText.includes('SmartTense') && document.body.innerText.toLowerCase().includes('your learning plan')`);

    const screenshots = [];
    screenshots.push(await capture(cdp, "home-desktop.png"));

    await setViewport(cdp, 390, 844, true);
    await clickByText(cdp, "Course");
    await waitFor(cdp, `document.body.innerText.toLowerCase().includes('english course a1-b2')`);
    screenshots.push(await capture(cdp, "course-mobile.png"));

    await clickByText(cdp, "Practice");
    await waitFor(cdp, `Boolean(document.querySelector('.focused-question-card'))`);
    screenshots.push(await capture(cdp, "practice-mobile.png"));

    await setViewport(cdp, 1440, 900, false);
    await clickByText(cdp, "Complete");
    await waitFor(cdp, `Boolean(document.querySelector('.complete-table-card'))`);
    screenshots.push(await capture(cdp, "complete-desktop.png"));

    console.log(JSON.stringify({ status: "PASS", url: appUrl, screenshots }, null, 2));
  } finally {
    if (cdp) {
      try { await cdp.send("Browser.close"); } catch { /* Chrome may already be closed. */ }
      cdp.close();
    }
    if (chrome && !chrome.killed) chrome.kill();
    if (server && !server.killed) server.kill();
    await sleep(500);
    const temporaryRoot = path.resolve(os.tmpdir()) + path.sep;
    const resolvedProfile = path.resolve(userDataDirectory);
    if (resolvedProfile.startsWith(temporaryRoot) && path.basename(resolvedProfile).startsWith("smarttense-doc-screenshots-")) {
      let removed = false;
      for (let attempt = 0; attempt < 10 && !removed; attempt += 1) {
        try {
          fs.rmSync(resolvedProfile, { recursive: true, force: true });
          removed = true;
        } catch {
          await sleep(300);
        }
      }
      if (!removed) console.warn(`Temporary Chrome profile could not be removed: ${resolvedProfile}`);
    }
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
