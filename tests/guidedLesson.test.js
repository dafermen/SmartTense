import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildGuidedLessonSteps, isGuidedAnswerCorrect } from "../src/guidedLesson.js";

const learningContent = JSON.parse(readFileSync(new URL("../public/data/learningUnits.json", import.meta.url), "utf8"));

test("every A2 unit builds a complete guided lesson sequence", () => {
  const units = learningContent.units.filter((entry) => entry.cefrLevel === "A2");

  assert.equal(units.length, 4);
  for (const unit of units) {
    const steps = buildGuidedLessonSteps(unit);

    assert.deepEqual(steps.slice(0, 3).map((step) => step.type), ["objective", "theory", "examples"]);
    assert.equal(steps.filter((step) => step.type === "practice").length, 3);
    assert.ok(steps.some((step) => step.type === "correction"), `${unit.id} needs correction practice`);
    assert.ok(steps.some((step) => step.type === "pronunciation"), `${unit.id} needs pronunciation`);
    assert.ok(steps.some((step) => step.type === "production"), `${unit.id} needs production`);
    assert.equal(steps.at(-1).type, "summary");
  }
});

test("guided answer comparison ignores case and repeated spaces", () => {
  assert.equal(isGuidedAnswerCorrect("  IS  ", "is"), true);
  assert.equal(isGuidedAnswerCorrect("are", "is"), false);
});
