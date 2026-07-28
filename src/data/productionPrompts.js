export const PRODUCTION_PROMPTS = [
  {
    id: "a1-personal-introduction",
    mode: "speaking",
    tenseId: "simplePresent",
    cefrLevel: "A1",
    unitIds: ["be-have-foundation"],
    title: "A1 personal introduction",
    prompt: "Introduce yourself in 3 short sentences using be and have.",
    contextTag: "daily-habits",
    rubric: [
      "Uses be for identity or state",
      "Uses have or has correctly",
      "Sentences are short and clear"
    ],
    suggestedTimeMinutes: 2
  },
  {
    id: "simple-present-routine",
    mode: "speaking",
    tenseId: "simplePresent",
    cefrLevel: "A1",
    unitIds: ["present-simple-foundation"],
    title: "Daily routine intro",
    prompt: "Describe your daily routine in 3 short sentences using simple present.",
    contextTag: "daily-habits",
    rubric: [
      "Uses simple present structure correctly",
      "Clear and natural everyday routine",
      "No major grammar errors"
    ],
    suggestedTimeMinutes: 2
  },
  {
    id: "a1-basic-questions",
    mode: "writing",
    tenseId: "simplePresent",
    cefrLevel: "A1",
    unitIds: ["personal-information-questions"],
    title: "A1 basic questions",
    prompt: "Write 4 short questions and answers for a first meeting. Use be, have, and do.",
    contextTag: "meetings",
    rubric: [
      "Uses correct word order in questions",
      "Includes short clear answers",
      "Uses be, have, or do naturally"
    ],
    suggestedTimeMinutes: 4
  },
  {
    id: "simple-present-work",
    mode: "writing",
    tenseId: "simplePresent",
    cefrLevel: "A1",
    unitIds: ["present-simple-foundation"],
    title: "Work context",
    prompt: "Write 3 short sentences about your work habits this week.",
    contextTag: "it-work",
    rubric: [
      "Uses simple present in each sentence",
      "Vocabulary fits a work context",
      "Sentences are easy to understand"
    ],
    suggestedTimeMinutes: 3
  },
  {
    id: "a2-present-continuous-status",
    mode: "speaking",
    tenseId: "presentContinuous",
    cefrLevel: "A2",
    unitIds: ["a2-present-continuous-actions"],
    title: "A2 current status",
    prompt: "Describe what you are doing at work or at home this week in 4 short sentences.",
    contextTag: "it-work",
    rubric: [
      "Uses am, is, or are before -ing verbs",
      "Describes current or temporary actions",
      "Sentences are clear and short"
    ],
    suggestedTimeMinutes: 3
  },
  {
    id: "a2-present-perfect-experience",
    mode: "writing",
    tenseId: "presentPerfect",
    cefrLevel: "A2",
    unitIds: ["a2-present-perfect-experiences"],
    title: "A2 recent experience",
    prompt: "Write 4 short sentences about things you have already done this week.",
    contextTag: "daily-habits",
    rubric: [
      "Uses have or has with past participles",
      "Avoids finished past-time markers",
      "Uses already, yet, or recently naturally"
    ],
    suggestedTimeMinutes: 4
  },
  {
    id: "a2-present-perfect-continuous-duration",
    mode: "speaking",
    tenseId: "presentPerfectContinuous",
    cefrLevel: "A2",
    unitIds: ["a2-present-perfect-continuous-duration"],
    title: "A2 duration practice",
    prompt: "Talk for 60 seconds about something you have been doing lately.",
    contextTag: "daily-habits",
    rubric: [
      "Uses have or has been + verb-ing",
      "Includes for, since, or lately",
      "Keeps the meaning connected to now"
    ],
    suggestedTimeMinutes: 3
  },
  {
    id: "a2-prepositions-routine",
    mode: "writing",
    tenseId: "simplePresent",
    cefrLevel: "A2",
    unitIds: ["a2-prepositions-daily-habits"],
    title: "A2 preposition routine",
    prompt: "Write 5 short sentences about your routine using in, on, at, to, and from.",
    contextTag: "prepositions",
    rubric: [
      "Uses time prepositions correctly",
      "Uses place or movement prepositions correctly",
      "Sentences describe real daily habits"
    ],
    suggestedTimeMinutes: 4
  },
  {
    id: "past-simple-story",
    mode: "speaking",
    tenseId: "simplePast",
    cefrLevel: "B1",
    unitIds: ["past-future-conditional-foundation"],
    title: "Past habits and memories",
    prompt: "Tell what you usually did last weekend and what you learned.",
    contextTag: "travel-vacation",
    rubric: [
      "Uses past tense consistently",
      "Sequence of events is clear",
      "Grammar is understandable"
    ],
    suggestedTimeMinutes: 3
  },
  {
    id: "future-goal-note",
    mode: "writing",
    tenseId: "simpleFuture",
    cefrLevel: "B1",
    unitIds: ["past-future-conditional-foundation"],
    title: "Next plans",
    prompt: "Write what you will do this week in 4 short sentences.",
    contextTag: "meetings",
    rubric: [
      "Uses future simple consistently",
      "Plans are realistic and clear",
      "Spelling and punctuation are understandable"
    ],
    suggestedTimeMinutes: 3
  },
  {
    id: "past-future-comparison-speaking",
    mode: "speaking",
    tenseId: "futurePerfect",
    cefrLevel: "B1",
    unitIds: ["past-future-conditional-foundation"],
    title: "Past-Future-Conditional comparison",
    prompt: "Talk for 60 seconds: when would you use past perfect vs future perfect in daily work communication?",
    contextTag: "it-work",
    rubric: [
      "Names at least one clear difference of meaning",
      "Uses examples tied to different time points",
      "Keeps tense forms understandable"
    ],
    suggestedTimeMinutes: 3
  },
  {
    id: "b1-problem-story",
    mode: "speaking",
    tenseId: "simplePast",
    cefrLevel: "B1",
    unitIds: ["b1-narratives-plans-problems"],
    title: "B1 problem story",
    prompt: "Tell a short story about a problem you solved. Use past forms and sequence words.",
    contextTag: "it-work",
    rubric: [
      "Uses past forms to describe finished events",
      "Uses sequence words such as first, then, or after that",
      "Explains the problem and result clearly"
    ],
    suggestedTimeMinutes: 4
  },
  {
    id: "b1-plan-solution",
    mode: "writing",
    tenseId: "simpleConditional",
    cefrLevel: "B1",
    unitIds: ["b1-narratives-plans-problems"],
    title: "B1 plan and solution",
    prompt: "Write 4 sentences about what you would do if a work or travel plan changed.",
    contextTag: "travel-vacation",
    rubric: [
      "Uses would + base verb correctly",
      "Includes a clear condition or changed situation",
      "Gives a practical solution"
    ],
    suggestedTimeMinutes: 4
  },
  {
    id: "b2-independent-summary",
    mode: "writing",
    tenseId: "pastPerfect",
    cefrLevel: "B2",
    unitIds: ["b2-mixed-tenses-independent-production"],
    title: "B2 independent summary",
    prompt: "Write a short update that explains a problem, a result, and a recommendation using connectors.",
    contextTag: "meetings",
    rubric: [
      "Uses connectors such as although, however, or therefore",
      "Combines past context with present or future result",
      "Includes a clear recommendation"
    ],
    suggestedTimeMinutes: 5
  },
  {
    id: "b2-mixed-speaking",
    mode: "speaking",
    tenseId: "perfectConditional",
    cefrLevel: "B2",
    unitIds: ["b2-mixed-tenses-independent-production"],
    title: "B2 mixed tenses reflection",
    prompt: "Talk for 90 seconds about what happened, what has changed, and what you would have done differently.",
    contextTag: "it-work",
    rubric: [
      "Combines past and present result naturally",
      "Uses would have + past participle for unreal past reflection",
      "Keeps the explanation organized and coherent"
    ],
    suggestedTimeMinutes: 5
  },
  {
    id: "conditional-speaking-note",
    mode: "writing",
    tenseId: "simpleConditional",
    cefrLevel: "B1",
    unitIds: ["past-future-conditional-foundation", "b1-narratives-plans-problems"],
    title: "Conditional situations",
    prompt: "Write 4 short if-clauses about your work and habits.",
    contextTag: "it-work",
    rubric: [
      "Uses if + past form in conditional clause",
      "Uses would + verb in result clause",
      "Sentences are clear and idiomatic"
    ],
    suggestedTimeMinutes: 4
  }
];

export const PRODUCTION_STATUSES = ["draft", "done", "needsReview", "approved"];
