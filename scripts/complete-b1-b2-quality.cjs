const { readFileSync, writeFileSync } = require("node:fs");
const { resolve } = require("node:path");

const contentPath = resolve(__dirname, "../public/data/learningUnits.json");
const content = JSON.parse(readFileSync(contentPath, "utf8"));

function replaceWord(sentence, from, to) {
  return sentence.replace(new RegExp(`\\b${from}\\b`, "i"), (word) => {
    if (word === word.toUpperCase()) return to.toUpperCase();
    if (word[0] === word[0].toUpperCase()) return `${to[0].toUpperCase()}${to.slice(1)}`;
    return to;
  });
}

function buildPersistentOptions(answer) {
  const correct = String(answer || "").trim();
  const options = new Set([correct]);
  const replacements = [
    ["am", "is"], ["is", "are"], ["are", "is"], ["was", "were"], ["were", "was"],
    ["have", "has"], ["has", "have"], ["had", "have"], ["do", "does"], ["does", "do"],
    ["did", "does"], ["will", "would"], ["would", "will"], ["been", "being"]
  ];

  for (const [from, to] of replacements) {
    if (new RegExp(`\\b${from}\\b`, "i").test(correct)) options.add(replaceWord(correct, from, to));
  }

  if (/\bnot\b/i.test(correct)) options.add(correct.replace(/\s+not\b/i, ""));
  else {
    const auxiliary = correct.match(/\b(am|is|are|was|were|have|has|had|do|does|did|will|would|can|could|should|must)\b/i);
    if (auxiliary) options.add(correct.replace(auxiliary[0], `${auxiliary[0]} not`));
  }

  const words = correct.split(/\s+/);
  if (words.length >= 4) {
    options.add([words[1], words[0], ...words.slice(2)].join(" "));
    options.add(words.filter((_, index) => index !== 1).join(" "));
  }

  if (words.length >= 2) options.add(`${words[0]} ${words[0]} ${words.slice(1).join(" ")}`);
  return [...options].filter(Boolean).slice(0, 5);
}

function getUnit(id) {
  const unit = content.units.find((entry) => entry.id === id);
  if (!unit) throw new Error(`Missing unit: ${id}`);
  return unit;
}

function getExercises(unit) {
  const section = unit.sections.find((entry) => entry.type === "exercises");
  if (!section) throw new Error(`Missing exercise section: ${unit.id}`);
  return section.exercises;
}

function addExercises(unit, additions) {
  const exercises = getExercises(unit);
  const ids = new Set(exercises.map((exercise) => exercise.id));
  additions.forEach((exercise) => {
    if (!ids.has(exercise.id)) exercises.push(exercise);
  });
}

const foundation = getUnit("past-future-conditional-foundation");
if (!foundation.contextTags.includes("meetings")) foundation.contextTags.push("meetings");
addExercises(foundation, [
  {
    id: "b1-foundation-meetings-fill-2",
    kind: "fillBlank",
    prompt: "Before the meeting started, the team _____ shared the agenda.",
    answer: "had",
    options: ["had", "has", "have", "was"],
    explanation: "Use past perfect for an action completed before the meeting started.",
    context: "meetings"
  },
  {
    id: "b1-foundation-meetings-choose-3",
    kind: "chooseTense",
    prompt: "Choose the tense: By the next meeting, we will have completed the review.",
    answer: "future perfect",
    options: ["future perfect", "simple future", "past perfect", "conditional"],
    explanation: "Future perfect marks completion before a future meeting.",
    context: "meetings"
  },
  {
    id: "b1-foundation-meetings-correct-4",
    kind: "correctMistake",
    prompt: "Correct the sentence: If the manager will arrive early, we will start at nine.",
    answer: "If the manager arrives early, we will start at nine.",
    options: ["If the manager arrives early, we will start at nine.", "If the manager will arrive early, we will start at nine.", "If the manager arrived early, we will start at nine.", "If the manager arriving early, we will start at nine."],
    explanation: "Use Present Simple in the if-clause of a real future condition.",
    context: "meetings"
  },
  {
    id: "b1-foundation-meetings-translation-5",
    kind: "translation",
    prompt: "Translate: Si tuviera mas tiempo, prepararia una agenda mejor.",
    answer: "If I had more time, I would prepare a better agenda.",
    options: ["If I had more time, I would prepare a better agenda.", "If I have more time, I would prepare a better agenda.", "If I had more time, I will prepare a better agenda.", "If I would have more time, I prepared a better agenda."],
    explanation: "Use past form in the hypothetical condition and would in the result.",
    context: "meetings"
  }
]);

const narratives = getUnit("b1-narratives-plans-problems");
if (!narratives.contextTags.includes("family-routines")) narratives.contextTags.push("family-routines");
addExercises(narratives, [
  {
    id: "b1-narrative-family-translation-3",
    kind: "translation",
    prompt: "Translate: Cuando llegue, mi familia estaba cenando.",
    answer: "When I arrived, my family was having dinner.",
    options: ["When I arrived, my family was having dinner.", "When I was arriving, my family had dinner.", "When I arrive, my family was having dinner.", "When I arrived, my family is having dinner."],
    explanation: "Use Past Simple for the arrival and Past Continuous for the action in progress.",
    context: "family-routines"
  },
  {
    id: "b1-narrative-family-choose-4",
    kind: "chooseTense",
    prompt: "Choose the contrast: My sister was cooking when the phone rang.",
    answer: "past continuous + past simple",
    options: ["past continuous + past simple", "past simple + past continuous", "present perfect + past simple", "past perfect + present simple"],
    explanation: "Past Continuous gives the background; Past Simple marks the interrupting event.",
    context: "family-routines"
  },
  {
    id: "b1-narrative-family-correct-5",
    kind: "correctMistake",
    prompt: "Correct the sentence: We were watch television when the lights went out.",
    answer: "We were watching television when the lights went out.",
    options: ["We were watching television when the lights went out.", "We were watch television when the lights went out.", "We watched television when the lights were go out.", "We are watching television when the lights went out."],
    explanation: "Past Continuous requires was or were plus the -ing form.",
    context: "family-routines"
  }
]);

const b2 = getUnit("b2-mixed-tenses-independent-production");
addExercises(b2, [
  {
    id: "b2-mixed-fill-it-work-1",
    kind: "fillBlank",
    prompt: "The final report _____ by the team before the director arrived.",
    answer: "had been reviewed",
    options: ["had been reviewed", "has reviewed", "was reviewing", "would review"],
    explanation: "Use past perfect passive for a completed action before another past event.",
    context: "it-work"
  }
]);

for (const unit of [foundation, narratives, b2]) {
  for (const exercise of getExercises(unit)) {
    if (!Array.isArray(exercise.options) || exercise.options.length === 0) {
      exercise.options = buildPersistentOptions(exercise.answer);
    }
    if (exercise.options.length < 3) {
      throw new Error(`Could not create enough options for ${exercise.id}`);
    }
  }
}

writeFileSync(contentPath, `${JSON.stringify(content, null, 2)}\r\n`, "utf8");
console.log("B1 and B2 answer options, contexts, and practice kinds were completed.");
