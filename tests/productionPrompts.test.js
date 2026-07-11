import assert from "node:assert/strict";
import test from "node:test";

import { PRODUCTION_PROMPTS, PRODUCTION_STATUSES } from "../src/data/productionPrompts.js";
import { TENSES } from "../src/data/defaultData.js";

test("production prompts cover speaking and writing with valid tense links", () => {
  const ids = new Set(PRODUCTION_PROMPTS.map((prompt) => prompt.id));
  const tenseIds = new Set(TENSES.map((tense) => tense.id));

  assert.equal(ids.size, PRODUCTION_PROMPTS.length);
  assert.ok(PRODUCTION_PROMPTS.some((prompt) => prompt.mode === "speaking"));
  assert.ok(PRODUCTION_PROMPTS.some((prompt) => prompt.mode === "writing"));

  for (const prompt of PRODUCTION_PROMPTS) {
    assert.ok(prompt.id);
    assert.ok(prompt.title);
    assert.ok(prompt.prompt);
    assert.ok(prompt.contextTag);
    assert.ok(tenseIds.has(prompt.tenseId));
    assert.match(prompt.mode, /^(speaking|writing)$/);
    assert.ok(Number.isInteger(prompt.suggestedTimeMinutes));
    assert.ok(prompt.suggestedTimeMinutes > 0);
    assert.ok(Array.isArray(prompt.rubric));
    assert.ok(prompt.rubric.length > 0);
  }
});

test("production statuses match the local review workflow", () => {
  assert.deepEqual(PRODUCTION_STATUSES, ["draft", "done", "needsReview", "approved"]);
});
