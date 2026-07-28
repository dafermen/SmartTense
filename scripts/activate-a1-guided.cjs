const { readFileSync, writeFileSync } = require("node:fs");
const { resolve } = require("node:path");

const contentPath = resolve(__dirname, "../public/data/learningUnits.json");
const content = JSON.parse(readFileSync(contentPath, "utf8"));

const methodology = {
  "be-have-foundation": {
    learnerContext: ["personal introductions", "family and possessions", "basic work situations"],
    pronunciationDrills: [
      {
        id: "a1-be-have-pronunciation-be",
        text: "I am ready and she is at home.",
        focus: "Say am and is clearly",
        note: "Repeat in two short parts, then as one sentence."
      },
      {
        id: "a1-be-have-pronunciation-have",
        text: "I have a laptop and he has a phone.",
        focus: "Contrast have and has",
        note: "Stress laptop and phone."
      }
    ],
    productionTask: {
      prompt: "Write three short sentences about who you are, something you have, and something in your home or workplace.",
      requiredStructures: ["one sentence with be", "one sentence with have or has", "one sentence with there is or there are"],
      checklist: ["Keep each sentence short.", "Check am, is, are, have, or has.", "Read the three sentences aloud."]
    }
  },
  "present-simple-foundation": {
    learnerContext: ["daily routines", "family habits", "simple work schedules"],
    pronunciationDrills: [
      {
        id: "a1-present-simple-pronunciation-s",
        text: "He works in IT and she starts at eight.",
        focus: "Keep the final -s audible",
        note: "Repeat works and starts before the full sentence."
      },
      {
        id: "a1-present-simple-pronunciation-question",
        text: "Does she work on Mondays?",
        focus: "Say does lightly and stress work",
        note: "Do not add -s to work after does."
      }
    ],
    productionTask: {
      prompt: "Describe three parts of your normal day and ask one question about another person's routine.",
      requiredStructures: ["two affirmative routine sentences", "one negative sentence", "one question with do or does"],
      checklist: ["Use Present Simple in every sentence.", "Check the final -s with he or she.", "Say the question aloud."]
    }
  },
  "personal-information-questions": {
    learnerContext: ["introductions", "family conversations", "first meetings"],
    pronunciationDrills: [
      {
        id: "a1-personal-info-pronunciation-origin",
        text: "Where are you from?",
        focus: "Link where are naturally",
        note: "Repeat the question and answer with your country."
      },
      {
        id: "a1-personal-info-pronunciation-work",
        text: "What do you do?",
        focus: "Keep both uses of do short",
        note: "Answer with I work or I study."
      }
    ],
    productionTask: {
      prompt: "Introduce yourself in three sentences and write two polite questions for a new classmate or coworker.",
      requiredStructures: ["one sentence with be", "one sentence about work or study", "two personal questions"],
      checklist: ["Put am, is, or are before the subject in be questions.", "Use do or does for action questions.", "Read your introduction aloud."]
    }
  }
};

for (const [unitId, fields] of Object.entries(methodology)) {
  const unit = content.units.find((entry) => entry.id === unitId);
  if (!unit) throw new Error(`Missing unit: ${unitId}`);
  Object.assign(unit, fields);
}

const presentSimple = content.units.find((entry) => entry.id === "present-simple-foundation");
const sharedExercise = presentSimple.sections
  .find((section) => section.type === "exercises")
  .exercises.find((exercise) => exercise.id === "present-simple-fill-all-1");
if (!sharedExercise) throw new Error("Missing shared Present Simple exercise");
sharedExercise.context = "it-work";

const beHave = content.units.find((entry) => entry.id === "be-have-foundation");
const beHaveExercises = beHave.sections.find((section) => section.type === "exercises").exercises;
if (!beHaveExercises.some((exercise) => exercise.id === "be-have-translation-1")) {
  beHaveExercises.push({
    id: "be-have-translation-1",
    kind: "translation",
    prompt: "Translate: Tengo una computadora en casa.",
    answer: "I have a computer at home.",
    options: ["I have a computer at home.", "I am have a computer at home.", "I has a computer at home.", "I have computer in home."],
    explanation: "Use have with I and at home for the location.",
    context: "daily-habits"
  });
}

writeFileSync(contentPath, `${JSON.stringify(content, null, 2)}\r\n`, "utf8");
console.log("A1 Guided Lesson methodology and practice were activated.");
