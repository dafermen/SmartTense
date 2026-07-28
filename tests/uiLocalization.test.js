import test from "node:test";
import assert from "node:assert/strict";
import { translate } from "../src/i18n.js";

const LEARNING_FLOW_KEYS = [
  "guidedUnavailable",
  "guidedYourGoal",
  "guidedPractice",
  "guidedFixMistake",
  "guidedSayAloud",
  "guidedComplete",
  "continueToPractice",
  "noReviewQuestions",
  "reviewComplete",
  "reviewReasonReinforce",
  "exerciseKindFillBlank",
  "exerciseKindCorrectMistake",
  "guidedStepTheory",
  "guidedStepProduction",
  "startAdaptiveReview",
  "celebrationTitle"
];

test("the primary learning flow has English and Spanish interface text", () => {
  for (const language of ["en", "es"]) {
    for (const key of LEARNING_FLOW_KEYS) {
      const value = translate(language, key);
      assert.equal(typeof value, "string", `${language}.${key} must be text`);
      assert.notEqual(value.trim(), "", `${language}.${key} must not be empty`);
      assert.notEqual(value, key, `${language}.${key} must be translated`);
    }
  }
});
