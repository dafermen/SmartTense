import test from "node:test";
import assert from "node:assert/strict";
import { getJourneyPercent, getJourneyStatus, getUnitJourney, resetUnitJourney, updateUnitJourney } from "../src/learningJourney.js";

test("stores an independent resumable journey for each unit", () => {
  const first = updateUnitJourney({}, "unit-a", { guidedStepIndex: 3, guidedAnswers: { q1: "am" } });
  const second = updateUnitJourney(first, "unit-b", { guidedStepIndex: 1 });
  assert.equal(getUnitJourney(second, "unit-a").guidedStepIndex, 3);
  assert.equal(getUnitJourney(second, "unit-a").guidedAnswers.q1, "am");
  assert.equal(getUnitJourney(second, "unit-b").guidedStepIndex, 1);
});

test("calculates progress from completed guided steps and practice answers", () => {
  const journey = { guidedCompletedStepIds: ["a", "b", "c"], practiceResults: { q1: {}, q2: {} } };
  assert.equal(getJourneyPercent(journey, { guidedSteps: 6, practiceExercises: 4 }), 45);
  assert.equal(getJourneyStatus(journey, { guidedSteps: 6, practiceExercises: 4 }), "inProgress");
  assert.equal(getJourneyPercent({ ...journey, productionCompleted: true }, { guidedSteps: 6, practiceExercises: 4 }), 100);
});

test("resets only one unit journey", () => {
  const progress = { a: { guidedStepIndex: 2 }, b: { guidedStepIndex: 4 } };
  assert.deepEqual(resetUnitJourney(progress, "a"), { b: { guidedStepIndex: 4 } });
});
