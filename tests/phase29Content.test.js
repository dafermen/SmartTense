import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { auditLearningContent } from "../src/data/contentQuality.js";

const content = JSON.parse(await readFile(new URL("../public/data/learningUnits.json", import.meta.url), "utf8"));

test("the complete A1-B2 curriculum passes all content quality gates", () => {
  const report = auditLearningContent(content, { levels: ["A1", "A2", "B1", "B2"] });
  assert.deepEqual(report.errors, []);
  assert.deepEqual(report.warnings, []);
  assert.equal(report.summary.unitCount, 10);
  assert.equal(report.summary.methodologyReadyUnitCount, 10);
});
