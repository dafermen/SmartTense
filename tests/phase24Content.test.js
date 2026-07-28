import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { auditLearningContent } from "../src/data/contentQuality.js";
import { buildGuidedLessonSteps } from "../src/guidedLesson.js";

const learningContent = JSON.parse(readFileSync(new URL("../public/data/learningUnits.json", import.meta.url), "utf8"));

test("every A1 unit is ready for a simplified guided lesson", () => {
  const units = learningContent.units.filter((unit) => unit.cefrLevel === "A1");

  assert.equal(units.length, 3);
  for (const unit of units) {
    const steps = buildGuidedLessonSteps(unit);
    assert.ok(steps.some((step) => step.type === "pronunciation"));
    assert.ok(steps.some((step) => step.type === "production"));
    assert.equal(steps.at(-1).type, "summary");
  }
});

test("A1 methodology and practice cleanup leaves no audit warnings", () => {
  const report = auditLearningContent(learningContent);
  const a1Warnings = report.warnings.filter((issue) => {
    const unit = learningContent.units.find((entry) => entry.id === issue.unitId);
    return unit?.cefrLevel === "A1";
  });

  assert.deepEqual(a1Warnings, []);
});
