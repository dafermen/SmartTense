import test from "node:test";
import assert from "node:assert/strict";
import { buildRows, getTensesByGroup } from "../src/conjugation.js";
import { DEFAULT_DATA, SUBJECTS, TENSES } from "../src/data/defaultData.js";
import { normalizePracticeAnswer, scorePracticeAnswer } from "../src/practice.js";
import { buildProgressBackup, validateProgressBackup } from "../src/progressBackup.js";

const SENTENCE_FIELDS = ["affirmative", "negative", "questionPositive", "questionNegative"];

test("every bundled verb-subject-tense combination produces complete sentences", () => {
  for (const verb of DEFAULT_DATA.verbs) {
    const rows = buildRows(verb, SUBJECTS, TENSES, "en", { learnerLanguage: "es" });
    assert.equal(rows.length, SUBJECTS.length * TENSES.length, verb.id);

    for (const row of rows) {
      for (const field of SENTENCE_FIELDS) {
        const sentence = row[field];
        assert.equal(typeof sentence, "string", `${verb.id}/${row.tenseId}/${field}`);
        assert.ok(sentence.length > 3, `${verb.id}/${row.tenseId}/${field}`);
        assert.doesNotMatch(sentence, /\b(?:undefined|null)\b/i, `${verb.id}/${row.tenseId}/${field}`);
        assert.doesNotMatch(sentence, /\s{2,}/, `${verb.id}/${row.tenseId}/${field}`);
      }
      assert.match(row.affirmative, /\.$/);
      assert.match(row.negative, /\.$/);
      assert.match(row.questionPositive, /\?$/);
      assert.match(row.questionNegative, /\?$/);
      assert.ok(row.translations.affirmative);
      assert.ok(row.translations.negative);
      assert.ok(row.translations.questionPositive);
      assert.ok(row.translations.questionNegative);
    }
  }
});

test("tense visibility is monotonic at every grammar group", () => {
  for (const group of ["all", "present", "past", "future", "conditional"]) {
    const basic = new Set(getTensesByGroup(group, "basic").map((tense) => tense.id));
    const intermediate = new Set(getTensesByGroup(group, "intermediate").map((tense) => tense.id));
    const advanced = new Set(getTensesByGroup(group, "advanced").map((tense) => tense.id));

    for (const tenseId of basic) assert.ok(intermediate.has(tenseId), `${group}/${tenseId}`);
    for (const tenseId of intermediate) assert.ok(advanced.has(tenseId), `${group}/${tenseId}`);
  }
});

test("practice normalization is idempotent and scoring ignores presentation noise", () => {
  const answers = [
    "Does she work from home?",
    "I have finished the report.",
    "They are studying English!",
    "Dario's family starts at eight.",
    "Él works on Monday."
  ];

  for (const answer of answers) {
    const normalized = normalizePracticeAnswer(answer);
    assert.equal(normalizePracticeAnswer(normalized), normalized);
    for (const variant of [`  ${answer}  `, answer.toUpperCase(), answer.replace(/ /g, "   ")]) {
      assert.equal(scorePracticeAnswer(answer, variant).isCorrect, true, variant);
    }
  }
});

test("every accepted answer variant scores while neighboring text does not", () => {
  const accepted = ["has worked", "has been working", "worked"];
  for (const answer of accepted) {
    assert.equal(scorePracticeAnswer(accepted, answer).isCorrect, true);
    assert.equal(scorePracticeAnswer(accepted, ` ${answer.toUpperCase()}! `).isCorrect, true);
  }
  assert.equal(scorePracticeAnswer(accepted, "is working").isCorrect, false);
  assert.equal(scorePracticeAnswer(accepted, "").isCorrect, false);
});

test("progress backups round-trip deterministically and remain detached", () => {
  for (let index = 0; index < 40; index += 1) {
    const unitId = `unit-${index % 10}`;
    const progress = {
      activeLearningUnitId: unitId,
      visitedVerbIds: [`verb-${index}`, `verb-${index}`, `verb-${index + 1}`],
      unitProgress: { [unitId]: { theoryViewed: index % 2 === 0, practiceCompleted: index % 3 === 0 } },
      skillProgress: { [`skill-${index}`]: { mastery: (index * 7) % 101, streak: index % 5 } },
      journeyProgress: { [unitId]: { guidedStepIndex: index % 8, guidedCompletedStepIds: [`step-${index % 4}`] } },
      diagnosticAnswers: { A1: true, A2: index % 2 === 0 },
      diagnosticCompleted: index % 3 === 0,
      productionAttempts: { [`prompt-${index}`]: [{ response: `Attempt ${index}`, status: "draft" }] }
    };
    const backup = buildProgressBackup(progress, "2026-09-09T12:00:00.000Z");
    const restored = validateProgressBackup(backup);

    assert.equal(JSON.stringify(restored), JSON.stringify(backup));
    assert.deepEqual(restored.progress.visitedVerbIds, [`verb-${index}`, `verb-${index + 1}`]);
    restored.progress.unitProgress[unitId].theoryViewed = !restored.progress.unitProgress[unitId].theoryViewed;
    assert.notEqual(restored.progress.unitProgress[unitId].theoryViewed, backup.progress.unitProgress[unitId].theoryViewed);
  }
});
