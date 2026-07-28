import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { validateLearningContent } from "../src/data/learningContentValidation.js";

const learningContent = JSON.parse(readFileSync(new URL("../public/data/learningUnits.json", import.meta.url), "utf8"));

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

test("validates bundled learning content", () => {
  assert.equal(validateLearningContent(learningContent), learningContent);
});

test("bundled Present Simple unit has the sections needed by Theory", () => {
  const unit = learningContent.units.find((entry) => entry.id === "present-simple-foundation");
  assert.ok(unit);
  assert.deepEqual(
    new Set(unit.sections.map((section) => section.type)),
    new Set(["theory", "structures", "commonMistakes", "examples", "vocabulary", "exercises"])
  );
});

test("bundled A1 route has three ordered units", () => {
  const beHaveUnit = learningContent.units.find((entry) => entry.id === "be-have-foundation");
  const presentSimpleUnit = learningContent.units.find((entry) => entry.id === "present-simple-foundation");
  const personalInfoUnit = learningContent.units.find((entry) => entry.id === "personal-information-questions");

  assert.ok(beHaveUnit);
  assert.ok(personalInfoUnit);
  assert.equal(beHaveUnit.cefrLevel, "A1");
  assert.equal(beHaveUnit.unitOrder, 1);
  assert.deepEqual(beHaveUnit.prerequisiteUnitIds, []);
  assert.equal(presentSimpleUnit.unitOrder, 2);
  assert.deepEqual(presentSimpleUnit.prerequisiteUnitIds, ["be-have-foundation"]);
  assert.equal(personalInfoUnit.cefrLevel, "A1");
  assert.equal(personalInfoUnit.unitOrder, 3);
  assert.deepEqual(personalInfoUnit.prerequisiteUnitIds, ["present-simple-foundation"]);
});

test("bundled A2 route follows Dario unit sequence before B1", () => {
  const presentContinuous = learningContent.units.find((entry) => entry.id === "a2-present-continuous-actions");
  const presentPerfect = learningContent.units.find((entry) => entry.id === "a2-present-perfect-experiences");
  const presentPerfectContinuous = learningContent.units.find((entry) => entry.id === "a2-present-perfect-continuous-duration");
  const prepositions = learningContent.units.find((entry) => entry.id === "a2-prepositions-daily-habits");
  const b1Unit = learningContent.units.find((entry) => entry.id === "past-future-conditional-foundation");

  assert.equal(presentContinuous.cefrLevel, "A2");
  assert.equal(presentContinuous.unitOrder, 1);
  assert.deepEqual(presentContinuous.prerequisiteUnitIds, ["personal-information-questions"]);
  assert.equal(presentPerfect.unitOrder, 2);
  assert.deepEqual(presentPerfect.prerequisiteUnitIds, ["a2-present-continuous-actions"]);
  assert.equal(presentPerfectContinuous.unitOrder, 3);
  assert.deepEqual(presentPerfectContinuous.prerequisiteUnitIds, ["a2-present-perfect-experiences"]);
  assert.equal(prepositions.unitOrder, 4);
  assert.deepEqual(prepositions.prerequisiteUnitIds, ["a2-present-perfect-continuous-duration"]);
  assert.deepEqual(b1Unit.prerequisiteUnitIds, ["a2-prepositions-daily-habits"]);
});

test("bundled B1 and B2 route continues after A2", () => {
  const b1Foundation = learningContent.units.find((entry) => entry.id === "past-future-conditional-foundation");
  const b1Narratives = learningContent.units.find((entry) => entry.id === "b1-narratives-plans-problems");
  const b2Mixed = learningContent.units.find((entry) => entry.id === "b2-mixed-tenses-independent-production");

  assert.ok(b1Foundation);
  assert.ok(b1Narratives);
  assert.ok(b2Mixed);
  assert.equal(b1Foundation.cefrLevel, "B1");
  assert.equal(b1Foundation.unitOrder, 1);
  assert.deepEqual(b1Foundation.prerequisiteUnitIds, ["a2-prepositions-daily-habits"]);
  assert.equal(b1Narratives.cefrLevel, "B1");
  assert.equal(b1Narratives.unitOrder, 2);
  assert.deepEqual(b1Narratives.prerequisiteUnitIds, ["past-future-conditional-foundation"]);
  assert.equal(b2Mixed.cefrLevel, "B2");
  assert.equal(b2Mixed.unitOrder, 1);
  assert.deepEqual(b2Mixed.prerequisiteUnitIds, ["b1-narratives-plans-problems"]);
});

test("bundled Present Simple practice includes the starter exercise kinds", () => {
  const unit = learningContent.units.find((entry) => entry.id === "present-simple-foundation");
  const exerciseSection = unit.sections.find((section) => section.type === "exercises");

  assert.deepEqual(
    new Set(exerciseSection.exercises.map((exercise) => exercise.kind)),
    new Set(["fillBlank", "transform", "chooseTense", "correctMistake", "translation"])
  );
});

test("accepts optional Dario methodology blocks", () => {
  const payload = clone(learningContent);
  const unit = payload.units.find((entry) => entry.id === "present-simple-foundation");

  unit.learnerContext = "daily routines and work life";
  unit.grammarBlocks = [
    {
      "form": "affirmative",
      "pattern": "Subject + verb",
      "example": "I work on weekdays."
    }
  ];
  unit.controlledPractice = [
    {
      "id": "methodology-control-1",
      "kind": "fillBlank",
      "prompt": "She _____ an email every morning.",
      "answer": "sends",
      "explanation": "Use third person -s in affirmative present simple.",
      "context": unit.contextTags[0]
    }
  ];
  unit.contrastPractice = [
    {
      "id": "methodology-contrast-1",
      "kind": "chooseTense",
      "prompt": "Choose the form: She _____ a meeting now.",
      "answer": "presentContinuous",
      "explanation": "Right now indicates present continuous.",
      "context": unit.contextTags[0]
    }
  ];
  unit.mistakeCorrection = [
    {
      "id": "methodology-mistake-1",
      "kind": "correctMistake",
      "prompt": "Correct the sentence: She go to office every day.",
      "answer": "She goes to the office every day.",
      "explanation": "Third person singular uses -s.",
      "context": unit.contextTags[0]
    }
  ];
  unit.translationPractice = [
    {
      "id": "methodology-translation-1",
      "kind": "translation",
      "prompt": "Traduce: Ella envía un correo cada mañana.",
      "answer": "She sends an email every morning.",
      "explanation": "Use present simple + frequency adverb.",
      "context": unit.contextTags[0]
    }
  ];
  unit.pronunciationDrills = [
    {
      "id": "pr-1",
      "text": "She works on the project every day.",
      "focus": "word stress",
      "note": "Pause after subject."
    }
  ];
  unit.productionTask = {
    "prompt": "Describe your weekly routine with 4 sentences.",
    "requiredStructures": ["affirmative", "negative"],
    "checklist": ["Uses correct tense", "Uses routine markers"]
  };

  assert.equal(validateLearningContent(payload), payload);
});

test("rejects invalid production task", () => {
  const payload = clone(learningContent);
  const unit = payload.units.find((entry) => entry.id === "present-simple-foundation");

  unit.productionTask = { prompt: "" };

  assert.throws(() => validateLearningContent(payload), /Invalid productionTask prompt/);
});

test("bundled learning content defines contexts used by the unit", () => {
  const unit = learningContent.units.find((entry) => entry.id === "present-simple-foundation");
  const contextIds = new Set(learningContent.contexts.map((context) => context.id));

  assert.ok(learningContent.contexts.length >= 6);
  assert.ok(unit.contextTags.every((contextTag) => contextIds.has(contextTag)));
});

test("bundled learning content includes curriculum metadata", () => {
  assert.equal(learningContent.schemaVersion, 3);

  for (const unit of learningContent.units) {
    assert.match(unit.cefrLevel, /^(A1|A2|B1|B2)$/);
    assert.equal(Number.isInteger(unit.unitOrder), true);
    assert.equal(Array.isArray(unit.prerequisiteUnitIds), true);
  }
});

test("rejects empty learning unit collections", () => {
  assert.throws(() => validateLearningContent({ schemaVersion: 1, units: [] }), /Invalid learning content/);
});

test("rejects duplicate learning unit ids", () => {
  const payload = clone(learningContent);
  payload.units.push(clone(payload.units[0]));

  assert.throws(() => validateLearningContent(payload), /Duplicate unit id/);
});

test("rejects unsupported section types", () => {
  const payload = clone(learningContent);
  payload.units[0].sections[0].type = "video";

  assert.throws(() => validateLearningContent(payload), /Invalid section type/);
});

test("rejects markup-like content", () => {
  const payload = clone(learningContent);
  payload.units[0].sections[0].body[0] = "<script>alert(1)</script>";

  assert.throws(() => validateLearningContent(payload), /Invalid section body/);
});

test("rejects invalid exercise kinds", () => {
  const payload = clone(learningContent);
  payload.units[0].sections.find((section) => section.type === "exercises").exercises[0].kind = "essay";

  assert.throws(() => validateLearningContent(payload), /Invalid exercise kind/);
});

test("rejects unknown context tags", () => {
  const payload = clone(learningContent);
  payload.units[0].sections.find((section) => section.type === "examples").examples[0].context = "unknown-context";

  assert.throws(() => validateLearningContent(payload), /Unknown context tag/);
});

test("rejects missing structures for structure sections", () => {
  const payload = clone(learningContent);
  delete payload.units[0].sections.find((section) => section.type === "structures").structures;

  assert.throws(() => validateLearningContent(payload), /Invalid section structures/);
});

test("rejects schema v3 units without curriculum metadata", () => {
  const payload = clone(learningContent);
  delete payload.units[0].cefrLevel;

  assert.throws(() => validateLearningContent(payload), /Missing curriculum metadata/);
});

test("rejects invalid CEFR levels", () => {
  const payload = clone(learningContent);
  payload.units[0].cefrLevel = "C1";

  assert.throws(() => validateLearningContent(payload), /Invalid unit CEFR level/);
});

test("rejects unknown prerequisite unit ids", () => {
  const payload = clone(learningContent);
  payload.units[0].prerequisiteUnitIds = ["missing-unit"];

  assert.throws(() => validateLearningContent(payload), /Unknown prerequisite unit id/);
});

test("rejects duplicate unit order inside one CEFR level", () => {
  const payload = clone(learningContent);
  payload.units[1].cefrLevel = payload.units[0].cefrLevel;
  payload.units[1].unitOrder = payload.units[0].unitOrder;

  assert.throws(() => validateLearningContent(payload), /Duplicate unit order/);
});
