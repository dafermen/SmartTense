import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { auditLearningContent } from "../src/data/contentQuality.js";

const learningContent = JSON.parse(readFileSync(new URL("../public/data/learningUnits.json", import.meta.url), "utf8"));

test("A1 and A2 use curated answer options without context gaps", () => {
  const report = auditLearningContent(learningContent);

  assert.equal(report.summary.errorCount, 0);
  assert.equal(report.summary.contextGapCount, 0);
  assert.equal(report.issues.some((issue) => issue.code === "missing-options"), false);
  assert.equal(report.issues.some((issue) => issue.code === "undeclared-unit-context"), false);
});

test("every context shown by an A1 or A2 unit has at least five exercises", () => {
  const units = learningContent.units.filter((unit) => ["A1", "A2"].includes(unit.cefrLevel));

  for (const unit of units) {
    const exercises = unit.sections.find((section) => section.type === "exercises").exercises;
    for (const context of unit.contextTags) {
      assert.ok(
        exercises.filter((exercise) => exercise.context === context).length >= 5,
        `${unit.id}/${context} should have at least five exercises`
      );
    }
  }
});
