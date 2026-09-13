import test from "node:test";
import assert from "node:assert/strict";
import { buildProgressBackup, validateProgressBackup } from "../src/progressBackup.js";

const progress = {
  activeLearningUnitId: "a2-present-perfect",
  visitedVerbIds: ["work", "work", "study"],
  unitProgress: { "a2-present-perfect": { practiceCompleted: true } },
  skillProgress: { "present-perfect": { mastery: 80 } },
  journeyProgress: { "a2-present-perfect": { guidedStepIndex: 4 } },
  diagnosticAnswers: { a1: true, a2: true },
  diagnosticCompleted: true,
  productionAttempts: { prompt1: [{ response: "I have finished my task." }] }
};

test("builds a versioned progress-only backup", () => {
  const backup = buildProgressBackup(progress, "2026-07-31T12:00:00.000Z");
  assert.equal(backup.kind, "smarttense-progress-backup");
  assert.equal(backup.schemaVersion, 1);
  assert.deepEqual(backup.progress.visitedVerbIds, ["work", "study"]);
  assert.equal(backup.progress.productionAttempts.prompt1[0].response, "I have finished my task.");
  assert.equal("interfaceLanguage" in backup.progress, false);
});

test("validates and clones a compatible progress backup", () => {
  const backup = buildProgressBackup(progress, "2026-07-31T12:00:00.000Z");
  const restored = validateProgressBackup(backup);
  restored.progress.unitProgress["a2-present-perfect"].practiceCompleted = false;
  assert.equal(backup.progress.unitProgress["a2-present-perfect"].practiceCompleted, true);
});

test("rejects files from another SmartTense data channel", () => {
  const backup = buildProgressBackup(progress, "2026-07-31T12:00:00.000Z");
  assert.throws(() => validateProgressBackup({ ...backup, kind: "smarttense-learning-content" }));
  assert.throws(() => validateProgressBackup({ ...backup, extra: true }));
});
