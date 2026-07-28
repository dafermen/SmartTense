const { readFileSync, writeFileSync } = require("node:fs");
const { resolve } = require("node:path");

const contentPath = resolve(__dirname, "../public/data/learningUnits.json");
const content = JSON.parse(readFileSync(contentPath, "utf8"));

function addExercises(unitId, additions) {
  const unit = content.units.find((entry) => entry.id === unitId);
  if (!unit) throw new Error(`Missing unit: ${unitId}`);
  const section = unit.sections.find((entry) => entry.type === "exercises");
  if (!section) throw new Error(`Missing exercise section: ${unitId}`);
  const existingIds = new Set(section.exercises.map((exercise) => exercise.id));

  for (const exercise of additions) {
    if (!existingIds.has(exercise.id)) section.exercises.push(exercise);
  }
}

addExercises("a2-present-continuous-actions", [
  {
    id: "present-continuous-correct-mistake-1",
    kind: "correctMistake",
    prompt: "Correct the sentence: She is work on the release now.",
    answer: "She is working on the release now.",
    options: [
      "She is working on the release now.",
      "She working on the release now.",
      "She is work on the release now.",
      "She does working on the release now."
    ],
    explanation: "Present Continuous needs is plus the -ing form working.",
    context: "it-work"
  },
  {
    id: "present-continuous-translation-1",
    kind: "translation",
    prompt: "Translate: Ellos estan preparando la cena ahora mismo.",
    answer: "They are preparing dinner right now.",
    options: [
      "They are preparing dinner right now.",
      "They preparing dinner right now.",
      "They prepare dinner right now.",
      "They are prepare dinner right now."
    ],
    explanation: "Use are plus preparing for an action happening right now.",
    context: "daily-habits"
  }
]);

addExercises("a2-present-perfect-experiences", [
  {
    id: "present-perfect-choose-tense-1",
    kind: "chooseTense",
    prompt: "The team _____ three bugs so far today.",
    answer: "has fixed",
    options: ["has fixed", "fixed", "is fixing", "fixes"],
    explanation: "So far today connects a completed result to the present, so use Present Perfect.",
    context: "it-work"
  }
]);

addExercises("a2-present-perfect-continuous-duration", [
  {
    id: "present-perfect-continuous-correct-mistake-1",
    kind: "correctMistake",
    prompt: "Correct the sentence: They have been help the children since 3 p.m.",
    answer: "They have been helping the children since 3 p.m.",
    options: [
      "They have been helping the children since 3 p.m.",
      "They have helping the children since 3 p.m.",
      "They have been help the children since 3 p.m.",
      "They are been helping the children since 3 p.m."
    ],
    explanation: "Present Perfect Continuous needs have been plus the -ing form helping.",
    context: "family-routines"
  }
]);

addExercises("a2-prepositions-daily-habits", [
  {
    id: "prepositions-transform-1",
    kind: "transform",
    prompt: "Rewrite with under: The cat is below the table.",
    answer: "The cat is under the table.",
    options: [
      "The cat is under the table.",
      "The cat is on the table.",
      "The cat is into the table.",
      "The cat is at the table under."
    ],
    explanation: "Use under before the noun phrase to describe a lower position.",
    context: "family-routines"
  },
  {
    id: "prepositions-choose-tense-1",
    kind: "chooseTense",
    prompt: "Every Monday, she _____ to work at 8 a.m.",
    answer: "goes",
    options: ["goes", "is going", "has gone", "went"],
    explanation: "Every Monday signals Present Simple; at introduces the specific time.",
    context: "daily-habits"
  }
]);

writeFileSync(contentPath, `${JSON.stringify(content, null, 2)}\r\n`, "utf8");
console.log("A2 practice kinds were completed.");
