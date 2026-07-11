export const PRODUCTION_PROMPTS = [
  {
    id: "simple-present-routine",
    mode: "speaking",
    tenseId: "simplePresent",
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
    id: "simple-present-work",
    mode: "writing",
    tenseId: "simplePresent",
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
    id: "past-simple-story",
    mode: "speaking",
    tenseId: "simplePast",
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
    id: "conditional-speaking-note",
    mode: "writing",
    tenseId: "simpleConditional",
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
