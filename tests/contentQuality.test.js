import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { auditLearningContent } from "../src/data/contentQuality.js";

const learningContent = JSON.parse(readFileSync(new URL("../public/data/learningUnits.json", import.meta.url), "utf8"));

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

test("A1 and A2 bundled content passes blocking quality checks", () => {
  const report = auditLearningContent(learningContent);

  assert.equal(report.summary.unitCount, 7);
  assert.equal(report.summary.exerciseCount, 138);
  assert.deepEqual(report.errors, []);
});

test("content audit is clean after methodology and context completion", () => {
  const report = auditLearningContent(learningContent);

  assert.deepEqual(report.warnings, []);
});

test("content audit rejects ambiguous multiple-choice answers", () => {
  const payload = clone(learningContent);
  const exercise = payload.units[0].sections.find((section) => section.type === "exercises").exercises[0];
  exercise.options = [exercise.answer, exercise.answer, "another answer"];

  const report = auditLearningContent(payload);

  assert.ok(report.errors.some((issue) => issue.code === "duplicate-options"));
  assert.ok(report.errors.some((issue) => issue.code === "invalid-correct-option"));
});

test("content audit rejects an answer missing from curated options", () => {
  const payload = clone(learningContent);
  const exercise = payload.units[0].sections.find((section) => section.type === "exercises").exercises[0];
  exercise.options = ["wrong one", "wrong two", "wrong three"];

  const report = auditLearningContent(payload);

  assert.ok(report.errors.some((issue) => issue.code === "invalid-correct-option"));
});
