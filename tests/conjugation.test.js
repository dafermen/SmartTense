import test from "node:test";
import assert from "node:assert/strict";
import { buildRows, classifyVerbPattern, getTensesByGroup, getVerbSummary } from "../src/conjugation.js";
import { DEFAULT_DATA, SUBJECTS, TENSES } from "../src/data/defaultData.js";

function rowFor(verbId, subjectId, tenseId) {
  const verb = DEFAULT_DATA.verbs.find((entry) => entry.id === verbId);
  const subject = SUBJECTS.find((entry) => entry.id === subjectId);
  const tense = TENSES.find((entry) => entry.id === tenseId);

  return buildRows(verb, [subject], [tense], "en", { learnerLanguage: "es" })[0];
}

test("regular verbs keep auxiliary do in simple present negatives and questions", () => {
  const row = rowFor("write", "he", "simplePresent");

  assert.equal(row.affirmative, "He writes a message.");
  assert.equal(row.negative, "He doesn't write a message.");
  assert.equal(row.questionPositive, "Does he write a message?");
  assert.equal(row.questionNegative, "Doesn't he write a message?");
});

test("can uses be able to forms without duplicated auxiliaries", () => {
  const presentContinuous = rowFor("can", "he", "presentContinuous");
  const pastPerfect = rowFor("can", "he", "pastPerfect");

  assert.equal(presentContinuous.affirmative, "He is able to speak English.");
  assert.equal(presentContinuous.negative, "He is not able to speak English.");
  assert.equal(pastPerfect.affirmative, "He had been able to speak English.");
  assert.equal(pastPerfect.questionNegative, "Hadn't he been able to speak English?");
});

test("should uses action participles and gerunds for perfect and continuous forms", () => {
  const presentPerfect = rowFor("should", "she", "presentPerfect");
  const presentContinuous = rowFor("should", "she", "presentContinuous");

  assert.equal(presentPerfect.affirmative, "She should have studied today.");
  assert.equal(presentPerfect.questionNegative, "Shouldn't she have studied today?");
  assert.equal(presentContinuous.affirmative, "She should be studying today.");
});

test("be examples use a complement that works in continuous forms", () => {
  const row = rowFor("be", "they", "presentContinuous");

  assert.equal(row.affirmative, "They are being careful.");
  assert.equal(row.questionPositive, "Are they being careful?");
});

test("be perfect continuous forms use being and warn that they are uncommon", () => {
  const row = rowFor("be", "i", "presentPerfectContinuous");

  assert.equal(row.affirmative, "I have been being careful.");
  assert.equal(row.negative, "I have not been being careful.");
  assert.equal(row.questionPositive, "Have I been being careful?");
  assert.equal(row.translations.affirmative, "Yo he estado siendo cuidadoso / cuidadosa.");
  assert.match(row.usageNote, /Poco común con to be/);
});

test("tense levels progressively reveal more rows", () => {
  assert.deepEqual(
    getTensesByGroup("all", "basic").map((tense) => tense.id),
    ["simplePresent", "presentContinuous", "simplePast", "simpleFuture"]
  );
  assert.equal(getTensesByGroup("all", "intermediate").length, 8);
  assert.equal(getTensesByGroup("all", "advanced").length, 16);
  assert.deepEqual(
    getTensesByGroup("conditional", "intermediate").map((tense) => tense.id),
    ["simpleConditional"]
  );
});

test("basic learning mode expands negative contractions to make NOT visible", () => {
  const verb = DEFAULT_DATA.verbs.find((entry) => entry.id === "write");
  const subject = SUBJECTS.find((entry) => entry.id === "he");
  const tense = TENSES.find((entry) => entry.id === "simplePresent");
  const row = buildRows(verb, [subject], [tense], "en", { useContractions: false })[0];

  assert.equal(row.negative, "He does not write a message.");
  assert.equal(row.questionNegative, "Does he not write a message?");
});

test("rows include sentence-level Spanish translations and sentence parts", () => {
  const beRow = rowFor("be", "i", "simplePresent");
  const writeRow = rowFor("write", "he", "simplePresent");

  assert.equal(beRow.translations.affirmative, "Yo soy/estoy cuidadoso / cuidadosa.");
  assert.equal(beRow.translations.negative, "Yo no soy/estoy cuidadoso / cuidadosa.");
  assert.equal(beRow.translations.questionPositive, "¿Soy/estoy yo cuidadoso / cuidadosa?");
  assert.equal(writeRow.translations.affirmative, "Él escribe un mensaje.");
  assert.equal(writeRow.translations.negative, "Él no escribe un mensaje.");
  assert.equal(writeRow.translations.questionPositive, "¿Él escribe un mensaje?");
  assert.deepEqual(
    writeRow.breakdown.negative.map((part) => part.role),
    ["subject", "auxiliary", "verb", "verb", "verb"]
  );
});

test("verb summary exposes key forms for learner profile", () => {
  const verb = DEFAULT_DATA.verbs.find((entry) => entry.id === "write");

  assert.deepEqual(getVerbSummary(verb), {
    type: "irregular",
    pattern: "ABC",
    base: "write",
    past: "wrote",
    participle: "written",
    gerund: "writing",
    meaning: "escribir",
    object: "a message",
    learnerObject: "un mensaje"
  });
});

test("learner-language fields can replace legacy Spanish fields", () => {
  const verb = {
    id: "custom",
    label: "to custom",
    base: "custom",
    meanings: { es: "personalizar" },
    objects: { es: "la práctica" },
    object: "practice"
  };
  const subject = SUBJECTS.find((entry) => entry.id === "i");
  const tense = TENSES.find((entry) => entry.id === "simplePresent");
  const row = buildRows(verb, [subject], [tense], "en", { learnerLanguage: "es" })[0];

  assert.equal(getVerbSummary(verb).meaning, "personalizar");
  assert.equal(row.translations.affirmative, "Yo personalizar la práctica.");
});

test("French learner language provides French meanings and translations", () => {
  const verb = DEFAULT_DATA.verbs.find((entry) => entry.id === "be");
  const subject = SUBJECTS.find((entry) => entry.id === "i");
  const tense = TENSES.find((entry) => entry.id === "simplePresent");
  const row = buildRows(verb, [subject], [tense], "en", { learnerLanguage: "fr" })[0];

  assert.equal(getVerbSummary(verb, "fr").meaning, "être");
  assert.equal(row.translations.affirmative, "Je suis prudent / prudente.");
  assert.equal(row.translations.questionPositive, "Est-ce que je suis prudent / prudente?");
});

test("French learner language has its own uncommon-use notes", () => {
  const verb = DEFAULT_DATA.verbs.find((entry) => entry.id === "be");
  const subject = SUBJECTS.find((entry) => entry.id === "i");
  const tense = TENSES.find((entry) => entry.id === "presentPerfectContinuous");
  const row = buildRows(verb, [subject], [tense], "en", { learnerLanguage: "fr" })[0];

  assert.match(row.usageNote, /Peu courant/);
});

test("classifies principal-part patterns for future verb filtering", () => {
  assert.equal(classifyVerbPattern({ base: "cut", past: "cut", participle: "cut" }), "AAA");
  assert.equal(classifyVerbPattern({ base: "buy", past: "bought", participle: "bought" }), "ABB");
  assert.equal(classifyVerbPattern({ base: "sing", past: "sang", participle: "sung" }), "ABC");
  assert.equal(classifyVerbPattern({ base: "come", past: "came", participle: "come" }), "ABA");
  assert.equal(classifyVerbPattern({ base: "want", past: "wanted", participle: "wanted" }), "REGULAR_ED");
  assert.equal(classifyVerbPattern({ base: "study", past: "studied", participle: "studied" }), "REGULAR_ED");
});

test("default verb data includes expanded beginner verbs with unique ids", () => {
  const ids = DEFAULT_DATA.verbs.map((verb) => verb.id);
  const uniqueIds = new Set(ids);

  assert.equal(ids.length, uniqueIds.size);
  assert.ok(ids.includes("eat"));
  assert.ok(ids.includes("understand"));
  assert.ok(ids.includes("study"));
});
