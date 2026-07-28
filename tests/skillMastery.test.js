import test from "node:test";
import assert from "node:assert/strict";
import {
  getExerciseSkillId,
  getMasteryStatus,
  getSkillMasterySummary,
  recordSkillResult,
  resetUnitSkillProgress
} from "../src/skillMastery.js";

test("maps exercises to stable grammar skills", () => {
  assert.equal(
    getExerciseSkillId({ id: "present-simple-foundation" }, { kind: "transform", prompt: "Change to a question" }),
    "present-simple-questions"
  );
  assert.equal(
    getExerciseSkillId({ id: "a2-present-perfect-continuous-duration" }, { prompt: "Choose for or since" }),
    "for-since-duration"
  );
});

test("records mastery, streak and review scheduling", () => {
  const now = Date.UTC(2026, 6, 21, 12);
  const first = recordSkillResult({}, "present-simple-routines", true, now);
  const second = recordSkillResult(first, "present-simple-routines", false, now + 1000);

  assert.equal(first["present-simple-routines"].mastery, 20);
  assert.equal(first["present-simple-routines"].streak, 1);
  assert.equal(second["present-simple-routines"].mastery, 5);
  assert.equal(second["present-simple-routines"].streak, 0);
  assert.equal(second["present-simple-routines"].attempts, 2);
  assert.ok(new Date(second["present-simple-routines"].nextReviewAt) > new Date(second["present-simple-routines"].lastPracticedAt));
});

test("summarizes practiced skills and chooses the lowest mastery priority", () => {
  const summary = getSkillMasterySummary({
    "be-forms": { attempts: 2, mastery: 60, nextReviewAt: "2026-07-22T00:00:00.000Z" },
    "have-possession": { attempts: 1, mastery: 20, nextReviewAt: "2026-07-21T00:00:00.000Z" }
  });

  assert.equal(summary.practicedCount, 2);
  assert.equal(summary.averageMastery, 40);
  assert.equal(summary.priority.id, "have-possession");
  assert.equal(summary.strongest.id, "be-forms");
  assert.equal(getMasteryStatus(summary.strongest.mastery), "Learning");
});

test("resets only skills owned by one unit", () => {
  const next = resetUnitSkillProgress({
    "be-forms": { attempts: 1 },
    "present-simple-routines": { attempts: 2 }
  }, "be-have-foundation");

  assert.deepEqual(next, { "present-simple-routines": { attempts: 2 } });
});
