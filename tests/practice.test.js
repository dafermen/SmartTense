import test from "node:test";
import assert from "node:assert/strict";
import { getPracticeExercises, normalizePracticeAnswer, scorePracticeAnswer } from "../src/practice.js";

test("normalizes practice answers for fair comparison", () => {
  assert.equal(normalizePracticeAnswer("  Does he work in IT?  "), "does he work in it");
  assert.equal(normalizePracticeAnswer("DARIO   works."), "dario works");
});

test("scores exact answers after normalization", () => {
  assert.deepEqual(scorePracticeAnswer("works", " Works! "), {
    isCorrect: true,
    normalizedAnswer: "works",
    expectedAnswer: "works"
  });

  assert.equal(scorePracticeAnswer("Does he work in IT?", "Does he works in IT?").isCorrect, false);
});

test("extracts practice exercises from learning units", () => {
  const exercises = getPracticeExercises({
    sections: [
      { type: "theory", body: ["Read"] },
      { type: "exercises", title: "Starter", exercises: [{ id: "one", prompt: "A", answer: "B" }] }
    ]
  });

  assert.deepEqual(exercises, [{ id: "one", prompt: "A", answer: "B", sectionTitle: "Starter" }]);
});

test("filters practice exercises by context", () => {
  const exercises = getPracticeExercises({
    sections: [
      {
        type: "exercises",
        title: "Starter",
        exercises: [
          { id: "one", prompt: "A", answer: "B", context: "it-work" },
          { id: "two", prompt: "C", answer: "D", context: "daily-habits" }
        ]
      }
    ]
  }, "daily-habits");

  assert.deepEqual(exercises, [{ id: "two", prompt: "C", answer: "D", context: "daily-habits", sectionTitle: "Starter" }]);
});
