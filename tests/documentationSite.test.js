import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const docsRoot = new URL("../public/docs/", import.meta.url);
const home = readFileSync(new URL("index.html", docsRoot), "utf8");
const architecture = readFileSync(new URL("architecture/overview/index.html", docsRoot), "utf8");
const searchIndex = JSON.parse(readFileSync(new URL("search-index.json", docsRoot), "utf8"));

test("generated documentation exposes navigation, search, theme and app return", () => {
  for (const page of [home, architecture]) {
    assert.match(page, /data-search/); assert.match(page, /data-theme-toggle/); assert.match(page, /href="\/" target="_self"/); assert.match(page, /data-sidebar/); assert.doesNotMatch(page, /\/docs\/docs\//);
  }
});
test("every search result points to a generated static page", () => {
  assert.ok(searchIndex.length >= 25);
  for (const entry of searchIndex) { const relative = entry.url.replace(/^\/docs\/?/, ""); const target = relative ? new URL(`${relative}index.html`, docsRoot) : new URL("index.html", docsRoot); assert.equal(existsSync(target), true, entry.url); }
});
test("documentation JavaScript and CSS are generated", () => {
  assert.equal(existsSync(new URL("docs.js", docsRoot)), true); assert.equal(existsSync(new URL("docs.css", docsRoot)), true);
});
