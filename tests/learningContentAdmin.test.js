import test from "node:test";
import assert from "node:assert/strict";
import { buildLearningContentPayload, cloneLearningContent, getLearningContentSummary } from "../src/learningContentAdmin.js";

const sampleContent = {
  schemaVersion: 2,
  updatedAt: "2026-07-11",
  contexts: [{ id: "it-work", title: "IT work", description: "Work" }],
  units: [
    {
      id: "unit-one",
      title: "Unit One",
      sections: [
        { type: "theory", body: ["Read"] },
        { type: "vocabulary", vocabulary: [{ term: "deploy", meaning: "release", context: "it-work" }] },
        { type: "exercises", exercises: [{ id: "one", prompt: "A", answer: "B", context: "it-work" }] }
      ]
    }
  ]
};

test("summarizes learning content for Settings preview", () => {
  assert.deepEqual(getLearningContentSummary(sampleContent), {
    units: 1,
    contexts: 1,
    sections: 3,
    vocabulary: 1,
    exercises: 1,
    updatedAt: "2026-07-11",
    schemaVersion: 2
  });
});

test("builds an exportable learning content payload", () => {
  const payload = buildLearningContentPayload(sampleContent);

  assert.equal(payload.schemaVersion, 2);
  assert.match(payload.updatedAt, /^\d{4}-\d{2}-\d{2}$/);
  assert.deepEqual(payload.contexts, sampleContent.contexts);
  assert.deepEqual(payload.units, sampleContent.units);
});

test("clones learning content without sharing nested references", () => {
  const cloned = cloneLearningContent(sampleContent);
  cloned.units[0].title = "Changed";

  assert.equal(sampleContent.units[0].title, "Unit One");
});
