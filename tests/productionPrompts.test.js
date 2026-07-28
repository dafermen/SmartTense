import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

import { PRODUCTION_PROMPTS, PRODUCTION_STATUSES } from "../src/data/productionPrompts.js";
import { TENSES } from "../src/data/defaultData.js";

const learningContent = JSON.parse(readFileSync(new URL("../public/data/learningUnits.json", import.meta.url), "utf8"));

test("production prompts cover speaking and writing with valid tense links", () => {
  const ids = new Set(PRODUCTION_PROMPTS.map((prompt) => prompt.id));
  const tenseIds = new Set(TENSES.map((tense) => tense.id));
  const unitIds = new Set(learningContent.units.map((unit) => unit.id));

  assert.equal(ids.size, PRODUCTION_PROMPTS.length);
  assert.ok(PRODUCTION_PROMPTS.some((prompt) => prompt.mode === "speaking"));
  assert.ok(PRODUCTION_PROMPTS.some((prompt) => prompt.mode === "writing"));
  assert.ok(PRODUCTION_PROMPTS.some((prompt) => prompt.id === "a1-personal-introduction"));
  assert.ok(PRODUCTION_PROMPTS.some((prompt) => prompt.id === "a1-basic-questions"));
  assert.ok(PRODUCTION_PROMPTS.some((prompt) => prompt.id === "a2-present-continuous-status"));
  assert.ok(PRODUCTION_PROMPTS.some((prompt) => prompt.id === "a2-present-perfect-experience"));
  assert.ok(PRODUCTION_PROMPTS.some((prompt) => prompt.id === "a2-present-perfect-continuous-duration"));
  assert.ok(PRODUCTION_PROMPTS.some((prompt) => prompt.id === "a2-prepositions-routine"));
  assert.ok(PRODUCTION_PROMPTS.some((prompt) => prompt.id === "b1-problem-story"));
  assert.ok(PRODUCTION_PROMPTS.some((prompt) => prompt.id === "b1-plan-solution"));
  assert.ok(PRODUCTION_PROMPTS.some((prompt) => prompt.id === "b2-independent-summary"));
  assert.ok(PRODUCTION_PROMPTS.some((prompt) => prompt.id === "b2-mixed-speaking"));

  for (const prompt of PRODUCTION_PROMPTS) {
    assert.ok(prompt.id);
    assert.ok(prompt.title);
    assert.ok(prompt.prompt);
    assert.ok(prompt.contextTag);
    assert.ok(tenseIds.has(prompt.tenseId));
    assert.match(prompt.cefrLevel, /^(A1|A2|B1|B2)$/);
    assert.ok(Array.isArray(prompt.unitIds));
    assert.ok(prompt.unitIds.length > 0);
    assert.ok(prompt.unitIds.every((unitId) => unitIds.has(unitId)));
    assert.match(prompt.mode, /^(speaking|writing)$/);
    assert.ok(Number.isInteger(prompt.suggestedTimeMinutes));
    assert.ok(prompt.suggestedTimeMinutes > 0);
    assert.ok(Array.isArray(prompt.rubric));
    assert.ok(prompt.rubric.length > 0);
  }
});

test("production prompts include route-aligned suggestions from A1 to B2", () => {
  const promptIdsByUnit = new Map();

  for (const prompt of PRODUCTION_PROMPTS) {
    for (const unitId of prompt.unitIds) {
      promptIdsByUnit.set(unitId, [...(promptIdsByUnit.get(unitId) || []), prompt.id]);
    }
  }

  assert.ok(promptIdsByUnit.get("be-have-foundation").includes("a1-personal-introduction"));
  assert.ok(promptIdsByUnit.get("present-simple-foundation").includes("simple-present-routine"));
  assert.ok(promptIdsByUnit.get("a2-present-continuous-actions").includes("a2-present-continuous-status"));
  assert.ok(promptIdsByUnit.get("b1-narratives-plans-problems").includes("b1-problem-story"));
  assert.ok(promptIdsByUnit.get("b2-mixed-tenses-independent-production").includes("b2-independent-summary"));
});

test("production statuses match the local review workflow", () => {
  assert.deepEqual(PRODUCTION_STATUSES, ["draft", "done", "needsReview", "approved"]);
});
