import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { buildGuidedLessonSteps } from "../src/guidedLesson.js";
import { getExerciseSkillId } from "../src/skillMastery.js";

const content = JSON.parse(await readFile(new URL("../public/data/learningUnits.json", import.meta.url), "utf8"));
const targetIds = [
  "past-future-conditional-foundation",
  "b1-narratives-plans-problems",
  "b2-mixed-tenses-independent-production"
];

test("every B1 and B2 unit is ready for a complete guided lesson", () => {
  for (const unitId of targetIds) {
    const unit = content.units.find((entry) => entry.id === unitId);
    assert.ok(unit, `Missing ${unitId}`);
    assert.ok(unit.learnerContext.length >= 3);
    assert.ok(unit.pronunciationDrills.length >= 2);
    assert.ok(unit.productionTask.requiredStructures.length >= 3);
    const stepTypes = buildGuidedLessonSteps(unit).map((step) => step.type);
    for (const type of ["objective", "theory", "examples", "practice", "correction", "pronunciation", "production", "summary"]) {
      assert.ok(stepTypes.includes(type), `${unitId} is missing ${type}`);
    }
  }
});

test("B1 and B2 exercises map to level-specific mastery skills", () => {
  assert.equal(
    getExerciseSkillId({ id: "past-future-conditional-foundation" }, { prompt: "If I had time, I would help." }),
    "conditional-forms"
  );
  assert.equal(
    getExerciseSkillId({ id: "b2-mixed-tenses-independent-production" }, { prompt: "Change to active voice" }),
    "passive-voice"
  );
});
