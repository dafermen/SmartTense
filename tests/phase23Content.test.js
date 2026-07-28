import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { auditLearningContent } from "../src/data/contentQuality.js";

const learningContent = JSON.parse(readFileSync(new URL("../public/data/learningUnits.json", import.meta.url), "utf8"));
const requiredKinds = ["fillBlank", "transform", "chooseTense", "correctMistake", "translation"];

test("every A2 unit covers all required controlled practice kinds", () => {
  const units = learningContent.units.filter((unit) => unit.cefrLevel === "A2");

  for (const unit of units) {
    const exercises = unit.sections.find((section) => section.type === "exercises").exercises;
    const kinds = new Set(exercises.map((exercise) => exercise.kind));
    assert.deepEqual(kinds, new Set(requiredKinds), `${unit.id} should cover every required kind`);
  }
});

test("completed A2 practice preserves content quality", () => {
  const report = auditLearningContent(learningContent);

  assert.equal(report.summary.errorCount, 0);
  assert.equal(report.summary.contextGapCount, 0);
  assert.equal(
    report.warnings.some((issue) => issue.code === "missing-exercise-kinds" && issue.unitId.startsWith("a2-")),
    false
  );
});
