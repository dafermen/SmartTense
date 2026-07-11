import test from "node:test";
import assert from "node:assert/strict";
import { getNextLearningStep, getUnitProgress, markUnitProgress, resetUnitProgress } from "../src/learningPath.js";

const unit = { id: "present-simple-foundation", title: "Present Simple Foundation" };

test("derives unit status from theory and practice progress", () => {
  assert.equal(getUnitProgress(unit.id, {}).status, "notStarted");
  assert.equal(getUnitProgress(unit.id, { [unit.id]: { theoryViewed: true } }).status, "inProgress");
  assert.equal(getUnitProgress(unit.id, { [unit.id]: { theoryViewed: true, practiceCompleted: true } }).status, "completed");
});

test("recommends the next learning step", () => {
  assert.equal(getNextLearningStep(unit, {}).page, "theory");
  assert.equal(getNextLearningStep(unit, { [unit.id]: { theoryViewed: true } }).page, "practice");
  assert.equal(getNextLearningStep(unit, { [unit.id]: { theoryViewed: true, practiceCompleted: true } }).page, "individual");
});

test("marks and resets one unit without touching other units", () => {
  const initial = { other: { theoryViewed: true } };
  const marked = markUnitProgress(initial, unit.id, { theoryViewed: true });

  assert.deepEqual(marked.other, initial.other);
  assert.equal(marked[unit.id].theoryViewed, true);
  assert.deepEqual(resetUnitProgress(marked, unit.id), initial);
});
