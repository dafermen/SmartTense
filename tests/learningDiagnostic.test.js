import assert from "node:assert/strict";
import test from "node:test";

import { DIAGNOSTIC_CHECKS, getDiagnosticResult, toggleDiagnosticAnswer } from "../src/learningDiagnostic.js";

test("diagnostic has one check per MVP CEFR level", () => {
  assert.deepEqual(DIAGNOSTIC_CHECKS.map((check) => check.cefrLevel), ["A1", "A2", "B1", "B2"]);
});

test("diagnostic suggests the highest selected CEFR level", () => {
  const answers = {
    "a1-foundation": true,
    "a2-daily-communication": true,
    "b1-functional-communication": true
  };

  assert.equal(getDiagnosticResult(answers).cefrLevel, "B1");
  assert.equal(getDiagnosticResult(answers).completedCount, 3);
  assert.equal(getDiagnosticResult({}), null);
});

test("diagnostic answers toggle on and off", () => {
  const selected = toggleDiagnosticAnswer({}, "a1-foundation");
  assert.equal(selected["a1-foundation"], true);
  assert.deepEqual(toggleDiagnosticAnswer(selected, "a1-foundation"), {});
});
