import test from "node:test";
import assert from "node:assert/strict";
import { getLearningUnitsByCefrFilter, getNextLearningStep, getOrderedLearningUnits, getRecommendedLearningUnit, getRecommendedLearningUnitForLevel, getUnitProgress, markUnitProgress, resetUnitProgress } from "../src/learningPath.js";

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

test("orders learning units by CEFR level and unit order", () => {
  const units = [
    { id: "b1-1", title: "B1 Unit", cefrLevel: "B1", unitOrder: 1 },
    { id: "a1-2", title: "A1 Second", cefrLevel: "A1", unitOrder: 2 },
    { id: "a1-1", title: "A1 First", cefrLevel: "A1", unitOrder: 1 }
  ];

  assert.deepEqual(getOrderedLearningUnits(units).map((entry) => entry.id), ["a1-1", "a1-2", "b1-1"]);
});

test("filters learning units by CEFR level while preserving order", () => {
  const units = [
    { id: "b1-1", title: "B1 Unit", cefrLevel: "B1", unitOrder: 1 },
    { id: "a2-2", title: "A2 Second", cefrLevel: "A2", unitOrder: 2 },
    { id: "a2-1", title: "A2 First", cefrLevel: "A2", unitOrder: 1 },
    { id: "a1-1", title: "A1 First", cefrLevel: "A1", unitOrder: 1 }
  ];

  assert.deepEqual(getLearningUnitsByCefrFilter(units, "A2").map((entry) => entry.id), ["a2-1", "a2-2"]);
  assert.deepEqual(getLearningUnitsByCefrFilter(units, "all").map((entry) => entry.id), ["a1-1", "a2-1", "a2-2", "b1-1"]);
});

test("recommends the first incomplete unit with completed prerequisites", () => {
  const units = [
    { id: "a1-1", title: "A1 First", cefrLevel: "A1", unitOrder: 1 },
    { id: "a1-2", title: "A1 Second", cefrLevel: "A1", unitOrder: 2, prerequisiteUnitIds: ["a1-1"] },
    { id: "b1-1", title: "B1 First", cefrLevel: "B1", unitOrder: 1, prerequisiteUnitIds: ["a1-2"] }
  ];

  assert.equal(getRecommendedLearningUnit(units, {}).id, "a1-1");
  assert.equal(getRecommendedLearningUnit(units, { "a1-1": { practiceCompleted: true } }).id, "a1-2");
});

test("recommends an incomplete unit inside a diagnostic CEFR level", () => {
  const units = [
    { id: "a1-1", title: "A1 First", cefrLevel: "A1", unitOrder: 1 },
    { id: "b1-1", title: "B1 First", cefrLevel: "B1", unitOrder: 1 },
    { id: "b1-2", title: "B1 Second", cefrLevel: "B1", unitOrder: 2 }
  ];

  assert.equal(getRecommendedLearningUnitForLevel(units, {}, "B1").id, "b1-1");
  assert.equal(getRecommendedLearningUnitForLevel(units, { "b1-1": { practiceCompleted: true } }, "B1").id, "b1-2");
  assert.equal(getRecommendedLearningUnitForLevel(units, {}, "B2"), null);
});
