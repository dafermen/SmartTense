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
const REQUIRED_SCREENS = ["Home", "Course", "Theory", "Manual", "Guided Lesson", "Adaptive Review", "Practice", "Progress", "Individual", "Complete", "Production", "Settings"];
const GUIDED_A2_UNITS = [
  "Present Continuous Actions",
  "Present Perfect Experiences",
  "Present Perfect Continuous Duration",
  "Prepositions and Daily Habits"
];
const GUIDED_A1_UNITS = [
  "Be and Have Foundation",
  "Present Simple Foundation",
  "Personal Information and Basic Questions"
];
const GUIDED_B1_UNITS = [
  "Past, Future and Conditional Foundation",
  "Narratives, Plans and Problems"
];
const GUIDED_B2_UNITS = ["Mixed Tenses and Independent Production"];
const GUIDED_UNITS = [...GUIDED_A1_UNITS, ...GUIDED_A2_UNITS, ...GUIDED_B1_UNITS, ...GUIDED_B2_UNITS];
// Conservative local QA gates. They catch obvious regressions without turning
// normal machine variance into noise.
const QA_THRESHOLDS = {
  homeReadyMs: readPositiveNumber("SMARTTENSE_QA_HOME_READY_MS", 5000),
  settingsReadyMs: readPositiveNumber("SMARTTENSE_QA_SETTINGS_READY_MS", 2000),
  syntheticVerbCount: 500,
  visibleRows: 25,
  viewportWidth: readPositiveNumber("SMARTTENSE_QA_VIEWPORT_WIDTH", 390),
  viewportHeight: readPositiveNumber("SMARTTENSE_QA_VIEWPORT_HEIGHT", 844),
  maxActiveButtons: readPositiveNumber("SMARTTENSE_QA_MAX_ACTIVE_BUTTONS", 140),
  minBodyChars: readPositiveNumber("SMARTTENSE_QA_MIN_BODY_CHARS", 1200)
};

if (typeof fetch !== "function" || typeof WebSocket !== "function") {
  console.error("This smoke test requires a recent Node.js runtime with global fetch and WebSocket.");
  process.exit(1);
}

if (!chromePath) {
  console.error("Chrome was not found. Set SMARTTENSE_CHROME_PATH to the Chrome executable path.");
  process.exit(1);
}

function readPositiveNumber(name, fallback) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
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
  verbs: makeVerbs(QA_THRESHOLDS.syntheticVerbCount)
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

async function selectOptionByText(cdp, text) {
  const expected = JSON.stringify(text.toLowerCase());
  return evaluate(cdp, `(() => {
    const expected = ${expected};
    const options = [...document.querySelectorAll('select option')];
    const option = options.find((entry) => (entry.textContent || '').trim().toLowerCase().includes(expected));
    if (!option) return false;
    const select = option.parentElement;
    select.value = option.value;
    select.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  })()`);
}

async function clickAndWait(cdp, label, expression) {
  const clicked = await clickByText(cdp, label);
  if (!clicked) throw new Error(`Could not find navigation control: ${label}`);
  await waitFor(cdp, expression);
}

function assertQualityGates(result) {
  const failures = [];
  const { accessibility, durations, metrics, syntheticVerbCount, screens } = result;

  if (durations.homeMs > QA_THRESHOLDS.homeReadyMs) {
    failures.push(`Home ready time ${durations.homeMs}ms exceeded ${QA_THRESHOLDS.homeReadyMs}ms`);
  }
  if (durations.settingsMs > QA_THRESHOLDS.settingsReadyMs) {
    failures.push(`Settings ready time ${durations.settingsMs}ms exceeded ${QA_THRESHOLDS.settingsReadyMs}ms`);
  }
  if (syntheticVerbCount !== QA_THRESHOLDS.syntheticVerbCount) {
    failures.push(`Synthetic verb count ${syntheticVerbCount} did not match ${QA_THRESHOLDS.syntheticVerbCount}`);
  }
  if (screens.length !== REQUIRED_SCREENS.length || REQUIRED_SCREENS.some((screen) => !screens.includes(screen))) {
    failures.push(`Screen coverage did not include every required screen: ${REQUIRED_SCREENS.join(", ")}`);
  }
  if (metrics.visibleRows !== QA_THRESHOLDS.visibleRows) {
    failures.push(`Visible table rows ${metrics.visibleRows} did not match ${QA_THRESHOLDS.visibleRows}`);
  }
  if (metrics.viewport.width !== QA_THRESHOLDS.viewportWidth || metrics.viewport.height !== QA_THRESHOLDS.viewportHeight) {
    failures.push(`Viewport ${metrics.viewport.width}x${metrics.viewport.height} did not match ${QA_THRESHOLDS.viewportWidth}x${QA_THRESHOLDS.viewportHeight}`);
  }
  if (metrics.activeButtons > QA_THRESHOLDS.maxActiveButtons) {
    failures.push(`Active buttons ${metrics.activeButtons} exceeded ${QA_THRESHOLDS.maxActiveButtons}`);
  }
  if (metrics.bodyChars < QA_THRESHOLDS.minBodyChars) {
    failures.push(`Body text length ${metrics.bodyChars} was below ${QA_THRESHOLDS.minBodyChars}`);
  }
  if (metrics.homeHorizontalOverflow > 1) {
    failures.push(`Home had ${metrics.homeHorizontalOverflow}px of horizontal overflow`);
  }
  if (metrics.cefrFilterVisible) {
    failures.push("The legacy CEFR level filter was still visible on the mobile Home");
  }
  if (metrics.cefrFilterOverflow > 1) {
    failures.push(`CEFR filter overflowed its own container by ${metrics.cefrFilterOverflow}px`);
  }
  if (metrics.cefrButtonsOutOfCard > 0) {
    failures.push(`${metrics.cefrButtonsOutOfCard} CEFR filter buttons rendered outside the Home card`);
  }
  if (metrics.homeActionFieldOverlaps > 0) {
    failures.push(`${metrics.homeActionFieldOverlaps} Home action controls overlapped the learning-unit field`);
  }
  if (metrics.homeActionsOutOfCard > 0) {
    failures.push(`${metrics.homeActionsOutOfCard} Home action controls rendered outside the Home card`);
  }
  if (!metrics.mobileContinueVisible) {
    failures.push("The mobile Continue lesson action was not visible on Home");
  }
  if (!metrics.mobilePrimaryNavVisible || metrics.mobilePrimaryNavCount !== 4) {
    failures.push(`Mobile primary navigation exposed ${metrics.mobilePrimaryNavCount}/4 visible destinations`);
  }
  if (metrics.mobilePrimaryNavOverflow > 1) {
    failures.push(`Mobile primary navigation had ${metrics.mobilePrimaryNavOverflow}px of horizontal overflow`);
  }
  if (!metrics.desktopActionHomeVisible) {
    failures.push("The action-oriented Home was not visible at desktop width");
  }
  if (metrics.desktopLegacyHeroVisible) {
    failures.push("The legacy dashboard hero was still visible at desktop width");
  }
  if (metrics.desktopHomeHorizontalOverflow > 1) {
    failures.push(`Desktop Home had ${metrics.desktopHomeHorizontalOverflow}px of horizontal overflow`);
  }
  if (metrics.guidedLessonHorizontalOverflow > 1) {
    failures.push(`Guided Lesson had ${metrics.guidedLessonHorizontalOverflow}px of horizontal overflow`);
  }
  if (metrics.guidedLessonUnitCount !== GUIDED_UNITS.length) {
    failures.push(`Guided Lesson covered ${metrics.guidedLessonUnitCount}/${GUIDED_UNITS.length} A1-B2 units`);
  }
  if (!metrics.guidedResumeWorked) {
    failures.push("Guided Lesson did not resume at the saved step");
  }
  if (metrics.focusedPracticeQuestionCount !== 1) {
    failures.push(`Focused Practice showed ${metrics.focusedPracticeQuestionCount} visible question cards instead of 1`);
  }
  if (metrics.lockedCourseUnitCount < 1) {
    failures.push("Course did not expose prerequisite-locked units for a new learner");
  }
  if (!accessibility.hasMain) {
    failures.push("Document did not expose a main landmark");
  }
  if (!accessibility.hasNamedNavigation) {
    failures.push("Document did not expose a named navigation landmark");
  }
  if (!accessibility.hasDocumentLanguage) {
    failures.push("Document language was missing");
  }
  if (accessibility.unnamedButtons.length > 0) {
    failures.push(`Buttons without accessible names: ${accessibility.unnamedButtons.join(", ")}`);
  }
  if (accessibility.unlabeledFields.length > 0) {
    failures.push(`Visible fields without labels: ${accessibility.unlabeledFields.join(", ")}`);
  }

  if (failures.length > 0) {
    throw new Error(`Mobile smoke quality gates failed:\n${failures.join("\n")}`);
  }
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
      `--window-size=${QA_THRESHOLDS.viewportWidth},${QA_THRESHOLDS.viewportHeight}`,
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
      width: QA_THRESHOLDS.viewportWidth,
      height: QA_THRESHOLDS.viewportHeight,
      deviceScaleFactor: 2,
      mobile: true
    });

    const startedAt = Date.now();
    await cdp.send("Page.navigate", { url: appUrl });
    await waitFor(cdp, `(() => {
      const text = document.body.innerText;
      return text.includes('SmartTense') && text.toLowerCase().includes('your learning plan');
    })()`);
    const homeMs = Date.now() - startedAt;
    const homeLayoutMetrics = await evaluate(cdp, `(() => {
      const filter = document.querySelector('.cefr-filter');
      const card = document.querySelector('.home-primary-card');
      const actionWrap = document.querySelector('.compact-home-actions');
      const mobileNav = document.querySelector('.mobile-primary-nav');
      const mobileContinue = document.querySelector('.continue-learning-card > button');
      const unitField = document.querySelector('.home-primary-card .field');
      const cardRect = card?.getBoundingClientRect();
      const buttons = filter ? [...filter.querySelectorAll('button')] : [];
      const outsideButtons = cardRect ? buttons.filter((button) => {
        const rect = button.getBoundingClientRect();
        return rect.left < cardRect.left - 1 || rect.right > cardRect.right + 1;
      }).length : 0;
      const actionButtons = actionWrap
        ? [...actionWrap.querySelectorAll('button')].filter((button) => {
            const rect = button.getBoundingClientRect();
            return rect.width > 0 && rect.height > 0;
          })
        : [];
      const fieldRect = unitField?.getBoundingClientRect();
      const actionOverlaps = fieldRect ? actionButtons.filter((button) => {
        const rect = button.getBoundingClientRect();
        return !(rect.right <= fieldRect.left || rect.left >= fieldRect.right || rect.bottom <= fieldRect.top || rect.top >= fieldRect.bottom);
      }).length : 0;
      const actionsOutsideCard = cardRect ? actionButtons.filter((button) => {
        const rect = button.getBoundingClientRect();
        return rect.left < cardRect.left - 1 || rect.right > cardRect.right + 1 || rect.top < cardRect.top - 1 || rect.bottom > cardRect.bottom + 1;
      }).length : 0;

      return {
        homeHorizontalOverflow: Math.max(0, document.documentElement.scrollWidth - window.innerWidth),
        cefrFilterVisible: Boolean(filter && filter.getBoundingClientRect().width > 0 && filter.getBoundingClientRect().height > 0),
        cefrFilterOverflow: filter ? Math.max(0, filter.scrollWidth - Math.ceil(filter.clientWidth)) : 0,
        cefrButtonsOutOfCard: outsideButtons,
        homeActionFieldOverlaps: actionOverlaps,
        homeActionsOutOfCard: actionsOutsideCard
        ,mobileContinueVisible: Boolean(mobileContinue && mobileContinue.getBoundingClientRect().width > 0)
        ,mobilePrimaryNavVisible: Boolean(mobileNav && mobileNav.getBoundingClientRect().width > 0)
        ,mobilePrimaryNavCount: mobileNav ? [...mobileNav.querySelectorAll('button')].filter((button) => button.getBoundingClientRect().width > 0).length : 0
        ,mobilePrimaryNavOverflow: mobileNav ? Math.max(0, mobileNav.scrollWidth - Math.ceil(mobileNav.clientWidth)) : 0
      };
    })()`);

    await clickAndWait(cdp, "Manual", `document.body.innerText.toLowerCase().includes('a2 course manual')`);
    const manualMobileReady = await evaluate(cdp, `(() => {
      const card = document.querySelector('.manual-mobile-card');
      const viewer = document.querySelector('.manual-viewer-shell');
      const link = [...document.querySelectorAll('.manual-mobile-card a')].find((entry) => entry.href.includes('/docs/dario-general-english-course.pdf'));
      const cardRect = card?.getBoundingClientRect();
      const viewerRect = viewer?.getBoundingClientRect();
      return Boolean(
        cardRect && cardRect.width > 0 && cardRect.height > 0
        && (!viewerRect || viewerRect.width === 0 || viewerRect.height === 0)
        && link
        && document.documentElement.scrollWidth <= window.innerWidth
      );
    })()`);
    if (!manualMobileReady) throw new Error("Manual mobile view did not meet visibility, PDF link, or overflow requirements");
    await clickAndWait(cdp, "Home", `document.body.innerText.toLowerCase().includes('your learning plan')`);

    await clickAndWait(cdp, "Start from A1", `document.body.innerText.toLowerCase().includes('a1 guided lesson')`);
    await clickAndWait(cdp, "Continue", `document.body.innerText.includes('2/')`);
    await clickAndWait(cdp, "Back", `document.body.innerText.toLowerCase().includes('start guided lesson')`);
    await clickAndWait(cdp, "Home", `document.body.innerText.toLowerCase().includes('your learning plan')`);
    await clickAndWait(cdp, "Continue lesson", `document.body.innerText.toLowerCase().includes('a1 guided lesson')`);
    const guidedResumeWorked = await evaluate(cdp, `document.body.innerText.includes('2/')`);
    await clickAndWait(cdp, "Back", `document.body.innerText.toLowerCase().includes('start guided lesson')`);
    await clickAndWait(cdp, "Home", `document.body.innerText.toLowerCase().includes('your learning plan')`);

    await clickAndWait(cdp, "A2", `document.body.innerText.toLowerCase().includes('present continuous actions')`);
    let guidedLessonHorizontalOverflow = 0;
    let guidedLessonUnitCount = 0;
    for (let index = 0; index < GUIDED_A2_UNITS.length; index += 1) {
      const title = GUIDED_A2_UNITS[index];
      if (index > 0) {
        await clickAndWait(cdp, "Home", `document.body.innerText.toLowerCase().includes('your learning plan')`);
        const selected = await selectOptionByText(cdp, title);
        if (!selected) throw new Error(`Could not select A2 unit: ${title}`);
        await waitFor(cdp, `document.body.innerText.toLowerCase().includes(${JSON.stringify(title.toLowerCase())})`);
      }

      await clickAndWait(cdp, "Theory", `document.body.innerText.toLowerCase().includes('objectives') && document.body.innerText.toLowerCase().includes('start guided lesson')`);
      await clickAndWait(cdp, "Start guided lesson", `document.body.innerText.toLowerCase().includes('a2 guided lesson')`);
      const currentOverflow = await evaluate(cdp, `Math.max(0, document.documentElement.scrollWidth - window.innerWidth)`);
      guidedLessonHorizontalOverflow = Math.max(guidedLessonHorizontalOverflow, currentOverflow);
      guidedLessonUnitCount += 1;
      await clickAndWait(cdp, "Back", `document.body.innerText.toLowerCase().includes('objectives') && document.body.innerText.toLowerCase().includes('start guided lesson')`);
    }
    await clickAndWait(cdp, "Home", `document.body.innerText.toLowerCase().includes('your learning plan')`);
    await clickAndWait(cdp, "A1", `document.body.innerText.toLowerCase().includes('be and have foundation')`);
    for (let index = 0; index < GUIDED_A1_UNITS.length; index += 1) {
      const title = GUIDED_A1_UNITS[index];
      if (index > 0) {
        await clickAndWait(cdp, "Home", `document.body.innerText.toLowerCase().includes('your learning plan')`);
        const selected = await selectOptionByText(cdp, title);
        if (!selected) throw new Error(`Could not select A1 unit: ${title}`);
        await waitFor(cdp, `document.body.innerText.toLowerCase().includes(${JSON.stringify(title.toLowerCase())})`);
      }

      await clickAndWait(cdp, "Theory", `document.body.innerText.toLowerCase().includes('objectives') && document.body.innerText.toLowerCase().includes('start guided lesson')`);
      await clickAndWait(cdp, "Start guided lesson", `document.body.innerText.toLowerCase().includes('a1 guided lesson')`);
      const currentOverflow = await evaluate(cdp, `Math.max(0, document.documentElement.scrollWidth - window.innerWidth)`);
      guidedLessonHorizontalOverflow = Math.max(guidedLessonHorizontalOverflow, currentOverflow);
      guidedLessonUnitCount += 1;
      await clickAndWait(cdp, "Back", `document.body.innerText.toLowerCase().includes('objectives') && document.body.innerText.toLowerCase().includes('start guided lesson')`);
    }
    await clickAndWait(cdp, "Home", `document.body.innerText.toLowerCase().includes('your learning plan')`);
    await clickAndWait(cdp, "B1", `document.body.innerText.toLowerCase().includes('past, future and conditional foundation')`);
    for (let index = 0; index < GUIDED_B1_UNITS.length; index += 1) {
      const title = GUIDED_B1_UNITS[index];
      if (index > 0) {
        await clickAndWait(cdp, "Home", `document.body.innerText.toLowerCase().includes('your learning plan')`);
        const selected = await selectOptionByText(cdp, title);
        if (!selected) throw new Error(`Could not select B1 unit: ${title}`);
        await waitFor(cdp, `document.body.innerText.toLowerCase().includes(${JSON.stringify(title.toLowerCase())})`);
      }

      await clickAndWait(cdp, "Theory", `document.body.innerText.toLowerCase().includes('objectives') && document.body.innerText.toLowerCase().includes('start guided lesson')`);
      await clickAndWait(cdp, "Start guided lesson", `document.body.innerText.toLowerCase().includes('b1 guided lesson')`);
      const currentOverflow = await evaluate(cdp, `Math.max(0, document.documentElement.scrollWidth - window.innerWidth)`);
      guidedLessonHorizontalOverflow = Math.max(guidedLessonHorizontalOverflow, currentOverflow);
      guidedLessonUnitCount += 1;
      await clickAndWait(cdp, "Back", `document.body.innerText.toLowerCase().includes('objectives') && document.body.innerText.toLowerCase().includes('start guided lesson')`);
    }
    await clickAndWait(cdp, "Home", `document.body.innerText.toLowerCase().includes('your learning plan')`);
    await clickAndWait(cdp, "B2", `document.body.innerText.toLowerCase().includes('mixed tenses and independent production')`);
    for (const title of GUIDED_B2_UNITS) {
      await clickAndWait(cdp, "Theory", `document.body.innerText.toLowerCase().includes('objectives') && document.body.innerText.toLowerCase().includes('start guided lesson')`);
      await clickAndWait(cdp, "Start guided lesson", `document.body.innerText.toLowerCase().includes('b2 guided lesson')`);
      const currentOverflow = await evaluate(cdp, `Math.max(0, document.documentElement.scrollWidth - window.innerWidth)`);
      guidedLessonHorizontalOverflow = Math.max(guidedLessonHorizontalOverflow, currentOverflow);
      guidedLessonUnitCount += 1;
      await clickAndWait(cdp, "Back", `document.body.innerText.toLowerCase().includes('objectives') && document.body.innerText.toLowerCase().includes('start guided lesson')`);
    }
    const guidedLessonMetrics = { guidedLessonHorizontalOverflow, guidedLessonUnitCount, guidedResumeWorked };
    await clickAndWait(cdp, "Home", `document.body.innerText.toLowerCase().includes('your learning plan')`);
    await clickAndWait(cdp, "Start adaptive review", `document.body.innerText.toLowerCase().includes('adaptive review') && Boolean(document.querySelector('.adaptive-answer-field select'))`);
    await clickAndWait(cdp, "Progress", `document.body.innerText.toLowerCase().includes('see what you can do now')`);
    await clickAndWait(cdp, "Course", `document.body.innerText.toLowerCase().includes('english course a1-b2')`);
    const lockedCourseUnitCount = await evaluate(cdp, `[...document.querySelectorAll('.course-unit-row:disabled')].filter((element) => element.getBoundingClientRect().width > 0).length`);
    await clickAndWait(cdp, "Practice", `Boolean(document.querySelector('.focused-question-card')) && document.body.innerText.toLowerCase().includes('check answer')`);
    const focusedPracticeQuestionCount = await evaluate(cdp, `[...document.querySelectorAll('.focused-question-card')].filter((element) => element.getBoundingClientRect().width > 0).length`);
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
      language: document.documentElement.lang,
      ...${JSON.stringify(homeLayoutMetrics)},
      ...${JSON.stringify(guidedLessonMetrics)},
      lockedCourseUnitCount: ${JSON.stringify(lockedCourseUnitCount)},
      focusedPracticeQuestionCount: ${JSON.stringify(focusedPracticeQuestionCount)}
    }))()`);
    const accessibility = await evaluate(cdp, `(() => {
      const isVisible = (element) => {
        const style = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
      };
      const accessibleName = (element) => {
        const ariaLabel = element.getAttribute('aria-label') || '';
        const labelledBy = element.getAttribute('aria-labelledby') || '';
        const labelledByText = labelledBy
          .split(/\\s+/)
          .filter(Boolean)
          .map((id) => document.getElementById(id)?.innerText || '')
          .join(' ');
        const labelText = element.labels ? [...element.labels].map((label) => label.innerText).join(' ') : '';
        return [ariaLabel, labelledByText, labelText, element.innerText, element.value]
          .join(' ')
          .replace(/\\s+/g, ' ')
          .trim();
      };
      const describe = (element, index) => {
        const text = accessibleName(element);
        return text || element.id || element.name || element.className || element.tagName.toLowerCase() + '-' + index;
      };

      const interactive = [...document.querySelectorAll('button, input, select, textarea')].filter(isVisible);
      const unnamedButtons = interactive
        .filter((element) => element.tagName === 'BUTTON' && !accessibleName(element))
        .map(describe);
      const unlabeledFields = interactive
        .filter((element) => ['INPUT', 'SELECT', 'TEXTAREA'].includes(element.tagName))
        .filter((element) => {
          if (element.type === 'hidden') return false;
          if (element.type === 'file' && element.closest('label')) return false;
          return !accessibleName(element);
        })
        .map(describe);

      return {
        hasMain: Boolean(document.querySelector('main')),
        hasNamedNavigation: [...document.querySelectorAll('nav')].some((nav) => accessibleName(nav)),
        hasDocumentLanguage: Boolean(document.documentElement.lang),
        unnamedButtons,
        unlabeledFields
      };
    })()`);

    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width: 1280,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false
    });
    await clickAndWait(cdp, "Home", `document.body.innerText.toLowerCase().includes('your learning plan')`);
    const desktopHomeMetrics = await evaluate(cdp, `(() => {
      const actionHome = document.querySelector('.home-mobile-focus');
      const legacyHero = document.querySelector('.home-hero-grid');
      const isVisible = (element) => {
        if (!element) return false;
        const rect = element.getBoundingClientRect();
        const style = window.getComputedStyle(element);
        return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
      };
      return {
        desktopActionHomeVisible: isVisible(actionHome),
        desktopLegacyHeroVisible: isVisible(legacyHero),
        desktopHomeHorizontalOverflow: Math.max(0, document.documentElement.scrollWidth - window.innerWidth)
      };
    })()`);
    Object.assign(metrics, desktopHomeMetrics);

    if (browserProblems.length > 0) {
      throw new Error(`Browser problems detected:\\n${browserProblems.join("\\n")}`);
    }

    const result = {
      viewport: `${QA_THRESHOLDS.viewportWidth}x${QA_THRESHOLDS.viewportHeight}`,
      syntheticVerbCount: syntheticData.verbs.length,
      screens: REQUIRED_SCREENS,
      paginationOk: true,
      durations: { homeMs, settingsMs },
      accessibility,
      metrics,
      qualityGates: {
        passed: true,
        thresholds: QA_THRESHOLDS
      }
    };

    assertQualityGates(result);
    console.log(JSON.stringify(result, null, 2));
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
