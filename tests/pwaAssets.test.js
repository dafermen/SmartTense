import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const manifest = JSON.parse(readFileSync(new URL("../public/manifest.webmanifest", import.meta.url), "utf8"));
const serviceWorker = readFileSync(new URL("../public/service-worker.js", import.meta.url), "utf8");
const mainEntry = readFileSync(new URL("../src/main.jsx", import.meta.url), "utf8");

test("PWA manifest describes an installable standalone learning app", () => {
  assert.equal(manifest.name, "SmartTense English Course");
  assert.equal(manifest.display, "standalone");
  assert.equal(manifest.start_url, "./");
  assert.ok(manifest.icons.some((icon) => icon.purpose === "any"));
  assert.ok(manifest.icons.some((icon) => icon.purpose === "maskable"));
});

test("offline shell includes the curriculum and verb database", () => {
  assert.match(serviceWorker, /data\/learningUnits\.json/);
  assert.match(serviceWorker, /data\/verbs\.json/);
  assert.match(serviceWorker, /request\.mode === "navigate"/);
  assert.match(serviceWorker, /caches\.delete/);
});

test("service worker is registered only for production builds", () => {
  assert.match(mainEntry, /import\.meta\.env\.PROD/);
  assert.match(mainEntry, /serviceWorker\.register/);
  assert.match(mainEntry, /registration\.unregister/);
});
