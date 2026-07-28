import test from "node:test";
import assert from "node:assert/strict";
import { buildAdaptiveReviewQueue, getAdaptiveReviewReason } from "../src/adaptiveReview.js";

const units = [
  {
    id: "present-simple-foundation",
    cefrLevel: "A1",
    title: "Present Simple",
    sections: [{
      type: "exercises",
      exercises: [
        { id: "routine", kind: "fillBlank", prompt: "I ___ at eight.", answer: "work", options: ["work", "works"] },
        { id: "question", kind: "transform", prompt: "Change to a question", answer: "Do you work?", options: ["Do you work?", "Does you work?"] }
      ]
    }]
  }
];

test("builds a review queue from exercises with valid options", () => {
  const queue = buildAdaptiveReviewQueue(units, {}, { limit: 8, now: 0 });
  assert.equal(queue.length, 2);
  assert.ok(queue.every((item) => item.exercise.options.includes(item.exercise.answer)));
});

test("prioritizes a weaker practiced skill", () => {
  const queue = buildAdaptiveReviewQueue(units, {
    "present-simple-routines": { attempts: 2, correctAttempts: 2, mastery: 80, nextReviewAt: "2099-01-01T00:00:00.000Z" },
    "present-simple-questions": { attempts: 2, correctAttempts: 0, mastery: 10, nextReviewAt: "1970-01-01T00:00:00.000Z" }
  }, { limit: 2, now: Date.UTC(2026, 6, 21) });
  assert.equal(queue[0].skillId, "present-simple-questions");
});

test("explains why an item was selected", () => {
  assert.equal(getAdaptiveReviewReason({ mastery: 0 }), "New skill");
  assert.equal(getAdaptiveReviewReason({ mastery: 25 }), "Needs reinforcement");
  assert.equal(getAdaptiveReviewReason({ mastery: 50 }), "Keep practicing");
});
