const { readFileSync, writeFileSync } = require("node:fs");
const { resolve } = require("node:path");

const contentPath = resolve(__dirname, "../public/data/learningUnits.json");
const content = JSON.parse(readFileSync(contentPath, "utf8"));

function getUnit(unitId) {
  const unit = content.units.find((entry) => entry.id === unitId);
  if (!unit) throw new Error(`Missing unit: ${unitId}`);
  return unit;
}

function getExercises(unitId) {
  const section = getUnit(unitId).sections.find((entry) => entry.type === "exercises");
  if (!section) throw new Error(`Missing exercise section: ${unitId}`);
  return section.exercises;
}

function addContexts(unitId, contextIds) {
  const unit = getUnit(unitId);
  for (const contextId of contextIds) {
    if (!unit.contextTags.includes(contextId)) unit.contextTags.push(contextId);
  }
}

function setOptions(unitId, exerciseIds, options) {
  const exercises = getExercises(unitId);
  for (const exerciseId of exerciseIds) {
    const exercise = exercises.find((entry) => entry.id === exerciseId);
    if (!exercise) throw new Error(`Missing exercise: ${exerciseId}`);
    exercise.options = options;
  }
}

function addExercises(unitId, additions) {
  const exercises = getExercises(unitId);
  const existingIds = new Set(exercises.map((exercise) => exercise.id));
  for (const exercise of additions) {
    if (!existingIds.has(exercise.id)) exercises.push(exercise);
  }
}

setOptions("be-have-foundation", ["be-have-transform-1", "be-have-transform-1-family-routines-2"], [
  "Are you ready?",
  "Do you ready?",
  "Is you ready?",
  "You are ready?"
]);

setOptions("present-simple-foundation", ["present-simple-transform-1"], [
  "Does he work in IT?",
  "Do he work in IT?",
  "Does he works in IT?",
  "Is he work in IT?"
]);

setOptions("personal-information-questions", ["personal-info-transform-1"], [
  "Are you from Colombia?",
  "Do you from Colombia?",
  "Is you from Colombia?",
  "You are from Colombia?"
]);

setOptions("personal-information-questions", [
  "personal-info-translation-1",
  "personal-info-translation-1-daily-habits-2",
  "personal-info-translation-1-daily-habits-4",
  "personal-info-translation-1-daily-habits-2-family-routines-3",
  "personal-info-translation-1-daily-habits-4-family-routines-4",
  "personal-info-translation-1-daily-habits-2-meetings-1",
  "personal-info-translation-1-daily-habits-4-meetings-2"
], [
  "I am from Colombia.",
  "I is from Colombia.",
  "I am of Colombia.",
  "Am I from Colombia."
]);

setOptions("a2-present-continuous-actions", [
  "present-continuous-transform-1",
  "present-continuous-transform-1-daily-habits-2",
  "present-continuous-transform-1-meetings-3"
], [
  "They are not working today.",
  "They not are working today.",
  "They do not working today.",
  "They are not work today."
]);

setOptions("a2-present-perfect-experiences", [
  "present-perfect-transform-1",
  "present-perfect-transform-1-daily-habits-3"
], [
  "Have you visited that hotel?",
  "Did you have visited that hotel?",
  "Have you visit that hotel?",
  "You have visited that hotel?"
]);

setOptions("a2-present-perfect-continuous-duration", [
  "present-perfect-continuous-transform-1",
  "present-perfect-continuous-transform-1-daily-habits-1",
  "present-perfect-continuous-transform-1-meetings-3",
  "present-perfect-continuous-transform-1-daily-habits-1-meetings-5"
], [
  "Have you been working on the app?",
  "Do you have been working on the app?",
  "Have you working on the app?",
  "You have been working on the app?"
]);

setOptions("a2-present-perfect-continuous-duration", ["present-perfect-continuous-transform-2"], [
  "Has she been updating the dashboard all day?",
  "Have she been updating the dashboard all day?",
  "Has she updating the dashboard all day?",
  "Does she has been updating the dashboard all day?"
]);

setOptions("a2-prepositions-daily-habits", ["prepositions-translation-1"], [
  "I study English in the morning.",
  "I study English on the morning.",
  "I study English at the morning.",
  "I am study English in the morning."
]);

addContexts("present-simple-foundation", ["meetings", "family-routines"]);
addContexts("a2-present-perfect-experiences", ["family-routines"]);
addContexts("a2-present-perfect-continuous-duration", ["family-routines"]);
addContexts("a2-prepositions-daily-habits", ["family-routines", "it-work"]);

addExercises("present-simple-foundation", [
  {
    id: "present-simple-meetings-2",
    kind: "fillBlank",
    prompt: "The project manager _____ the meeting every Monday.",
    answer: "leads",
    options: ["leads", "lead", "is leading", "led"],
    explanation: "Use leads with the third-person singular subject the project manager.",
    context: "meetings"
  },
  {
    id: "present-simple-meetings-3",
    kind: "chooseTense",
    prompt: "Our team usually _____ at 9 a.m.",
    answer: "meets",
    options: ["meets", "is meeting", "meet", "met"],
    explanation: "Usually signals a repeated schedule, so use Present Simple.",
    context: "meetings"
  },
  {
    id: "present-simple-meetings-4",
    kind: "correctMistake",
    prompt: "Correct the sentence: She schedule the weekly meeting.",
    answer: "She schedules the weekly meeting.",
    options: [
      "She schedules the weekly meeting.",
      "She schedule the weekly meeting.",
      "She is schedules the weekly meeting.",
      "She scheduling the weekly meeting."
    ],
    explanation: "Add -s to schedule with she in Present Simple.",
    context: "meetings"
  },
  {
    id: "present-simple-meetings-5",
    kind: "translation",
    prompt: "Translate: Nosotros revisamos la agenda antes de la reunion.",
    answer: "We review the agenda before the meeting.",
    options: [
      "We review the agenda before the meeting.",
      "We reviews the agenda before the meeting.",
      "We are review the agenda before the meeting.",
      "We review the agenda after the meeting."
    ],
    explanation: "Use the base verb review with we and before for the sequence.",
    context: "meetings"
  },
  {
    id: "present-simple-family-3",
    kind: "fillBlank",
    prompt: "My father _____ up the children after school.",
    answer: "picks",
    options: ["picks", "pick", "is pick", "picking"],
    explanation: "Use picks with the third-person singular subject my father.",
    context: "family-routines"
  },
  {
    id: "present-simple-family-4",
    kind: "transform",
    prompt: "Change to a question: Your sister prepares dinner.",
    answer: "Does your sister prepare dinner?",
    options: [
      "Does your sister prepare dinner?",
      "Do your sister prepare dinner?",
      "Does your sister prepares dinner?",
      "Is your sister prepare dinner?"
    ],
    explanation: "Use does and return prepare to its base form.",
    context: "family-routines"
  },
  {
    id: "present-simple-family-5",
    kind: "translation",
    prompt: "Translate: Mis padres no trabajan los domingos.",
    answer: "My parents do not work on Sundays.",
    options: [
      "My parents do not work on Sundays.",
      "My parents does not work on Sundays.",
      "My parents are not work on Sundays.",
      "My parents do not works on Sundays."
    ],
    explanation: "Use do not with the plural subject parents and the base verb work.",
    context: "family-routines"
  }
]);

addExercises("a2-present-perfect-experiences", [
  {
    id: "present-perfect-family-2",
    kind: "fillBlank",
    prompt: "My parents have _____ dinner for the family.",
    answer: "prepared",
    options: ["prepared", "prepare", "preparing", "prepares"],
    explanation: "Use the past participle prepared after have.",
    context: "family-routines"
  },
  {
    id: "present-perfect-family-3",
    kind: "fillBlank",
    prompt: "She has _____ her grandmother this month.",
    answer: "visited",
    options: ["visited", "visit", "visiting", "visits"],
    explanation: "Use has plus the past participle visited.",
    context: "family-routines"
  },
  {
    id: "present-perfect-family-4",
    kind: "transform",
    prompt: "Change to a question: They have finished their chores.",
    answer: "Have they finished their chores?",
    options: [
      "Have they finished their chores?",
      "Did they have finished their chores?",
      "Have they finish their chores?",
      "They have finished their chores?"
    ],
    explanation: "Move have before they and keep the past participle finished.",
    context: "family-routines"
  },
  {
    id: "present-perfect-family-5",
    kind: "translation",
    prompt: "Translate: Ya hemos planeado la cena familiar.",
    answer: "We have already planned the family dinner.",
    options: [
      "We have already planned the family dinner.",
      "We already plan the family dinner.",
      "We have already plan the family dinner.",
      "We are already planned the family dinner."
    ],
    explanation: "Use have plus planned; already normally goes between have and the participle.",
    context: "family-routines"
  }
]);

addExercises("a2-present-perfect-continuous-duration", [
  {
    id: "present-perfect-continuous-family-2",
    kind: "fillBlank",
    prompt: "My mother has been _____ for an hour.",
    answer: "cooking",
    options: ["cooking", "cook", "cooked", "cooks"],
    explanation: "Use verb-ing after has been to emphasize duration.",
    context: "family-routines"
  },
  {
    id: "present-perfect-continuous-family-3",
    kind: "fillBlank",
    prompt: "They have been _____ the children since 3 p.m.",
    answer: "helping",
    options: ["helping", "help", "helped", "helps"],
    explanation: "Use helping after have been for an activity continuing from a starting time.",
    context: "family-routines"
  },
  {
    id: "present-perfect-continuous-family-4",
    kind: "transform",
    prompt: "Change to a question: Your brother has been studying all afternoon.",
    answer: "Has your brother been studying all afternoon?",
    options: [
      "Has your brother been studying all afternoon?",
      "Have your brother been studying all afternoon?",
      "Does your brother has been studying all afternoon?",
      "Has your brother studying all afternoon?"
    ],
    explanation: "Move has before the subject and keep been plus studying.",
    context: "family-routines"
  },
  {
    id: "present-perfect-continuous-family-5",
    kind: "translation",
    prompt: "Translate: Hemos estado limpiando la casa desde esta manana.",
    answer: "We have been cleaning the house since this morning.",
    options: [
      "We have been cleaning the house since this morning.",
      "We have cleaning the house since this morning.",
      "We are been cleaning the house since this morning.",
      "We have been cleaned the house since this morning."
    ],
    explanation: "Use have been plus cleaning and since for the starting point.",
    context: "family-routines"
  }
]);

addExercises("a2-prepositions-daily-habits", [
  {
    id: "prepositions-family-2",
    kind: "fillBlank",
    prompt: "Our family has dinner _____ 7 p.m.",
    answer: "at",
    options: ["at", "on", "in", "from"],
    explanation: "Use at with a specific clock time.",
    context: "family-routines"
  },
  {
    id: "prepositions-family-3",
    kind: "fillBlank",
    prompt: "The family photos are _____ the wall.",
    answer: "on",
    options: ["on", "at", "in", "under"],
    explanation: "Use on for something attached to a surface.",
    context: "family-routines"
  },
  {
    id: "prepositions-family-4",
    kind: "fillBlank",
    prompt: "The children's toys are _____ the bed.",
    answer: "under",
    options: ["under", "on", "at", "between"],
    explanation: "Use under for a lower position beneath something.",
    context: "family-routines"
  },
  {
    id: "prepositions-family-5",
    kind: "translation",
    prompt: "Translate: Mis abuelos llegan el domingo.",
    answer: "My grandparents arrive on Sunday.",
    options: [
      "My grandparents arrive on Sunday.",
      "My grandparents arrive at Sunday.",
      "My grandparents arrive in Sunday.",
      "My grandparents arrive Sunday on."
    ],
    explanation: "Use on with days of the week.",
    context: "family-routines"
  }
]);

writeFileSync(contentPath, `${JSON.stringify(content, null, 2)}\r\n`, "utf8");
console.log("A1/A2 curated options and context coverage were applied.");
