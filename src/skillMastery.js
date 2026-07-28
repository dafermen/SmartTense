export const SKILL_CATALOG = [
  { id: "be-forms", label: "Be forms", unitId: "be-have-foundation" },
  { id: "have-possession", label: "Have and has", unitId: "be-have-foundation" },
  { id: "there-is-are", label: "There is and there are", unitId: "be-have-foundation" },
  { id: "present-simple-routines", label: "Present Simple routines", unitId: "present-simple-foundation" },
  { id: "third-person-s", label: "He, she, it + -s", unitId: "present-simple-foundation" },
  { id: "present-simple-questions", label: "Do and does questions", unitId: "present-simple-foundation" },
  { id: "personal-questions", label: "Personal questions", unitId: "personal-information-questions" },
  { id: "present-continuous-form", label: "Be + verb-ing", unitId: "a2-present-continuous-actions" },
  { id: "present-tense-contrast", label: "Simple vs Continuous", unitId: "a2-present-continuous-actions" },
  { id: "present-perfect-form", label: "Have/has + participle", unitId: "a2-present-perfect-experiences" },
  { id: "present-perfect-markers", label: "Already, yet, ever, so far", unitId: "a2-present-perfect-experiences" },
  { id: "perfect-continuous-form", label: "Have/has been + -ing", unitId: "a2-present-perfect-continuous-duration" },
  { id: "for-since-duration", label: "For and since", unitId: "a2-present-perfect-continuous-duration" },
  { id: "prepositions-time-place", label: "Time and place prepositions", unitId: "a2-prepositions-daily-habits" },
  { id: "prepositions-movement", label: "Movement prepositions", unitId: "a2-prepositions-daily-habits" },
  { id: "past-sequencing", label: "Past sequence and completion", unitId: "past-future-conditional-foundation" },
  { id: "future-forms", label: "Future plans and completion", unitId: "past-future-conditional-foundation" },
  { id: "conditional-forms", label: "Conditional situations", unitId: "past-future-conditional-foundation" },
  { id: "narrative-sequencing", label: "Narrative sequencing", unitId: "b1-narratives-plans-problems" },
  { id: "plans-and-problems", label: "Plans and problem solving", unitId: "b1-narratives-plans-problems" },
  { id: "passive-voice", label: "Active and passive voice", unitId: "b2-mixed-tenses-independent-production" },
  { id: "reported-speech", label: "Reported speech", unitId: "b2-mixed-tenses-independent-production" },
  { id: "mixed-tense-precision", label: "Mixed tense precision", unitId: "b2-mixed-tenses-independent-production" }
];

const SKILLS_BY_ID = new Map(SKILL_CATALOG.map((skill) => [skill.id, skill]));

function includesAny(text, words) {
  return words.some((word) => text.includes(word));
}

export function getExerciseSkillId(unit, exercise) {
  const text = `${exercise?.prompt || ""} ${exercise?.explanation || ""}`.toLowerCase();

  switch (unit?.id) {
    case "be-have-foundation":
      if (text.includes("there is") || text.includes("there are")) return "there-is-are";
      if (includesAny(text, ["have", "has", "possession"])) return "have-possession";
      return "be-forms";
    case "present-simple-foundation":
      if (exercise?.kind === "transform" || includesAny(text, ["question", "does", " do "])) return "present-simple-questions";
      if (includesAny(text, ["third-person", "third person", "he ", "she ", "-s"])) return "third-person-s";
      return "present-simple-routines";
    case "personal-information-questions":
      return "personal-questions";
    case "a2-present-continuous-actions":
      if (exercise?.kind === "chooseTense" || text.includes("present simple")) return "present-tense-contrast";
      return "present-continuous-form";
    case "a2-present-perfect-experiences":
      if (includesAny(text, ["already", "yet", "ever", "never", "so far"])) return "present-perfect-markers";
      return "present-perfect-form";
    case "a2-present-perfect-continuous-duration":
      if (includesAny(text, [" for ", " since ", "duration", "how long"])) return "for-since-duration";
      return "perfect-continuous-form";
    case "a2-prepositions-daily-habits":
      if (includesAny(text, ["movement", " into ", " through ", " towards ", " across ", " under "])) return "prepositions-movement";
      return "prepositions-time-place";
    case "past-future-conditional-foundation":
      if (includesAny(text, ["if ", "conditional", "would", "hypothetical"])) return "conditional-forms";
      if (includesAny(text, ["future", "tomorrow", "next ", "will "])) return "future-forms";
      return "past-sequencing";
    case "b1-narratives-plans-problems":
      if (includesAny(text, ["plan", "problem", "solution", "going to", "will "])) return "plans-and-problems";
      return "narrative-sequencing";
    case "b2-mixed-tenses-independent-production":
      if (includesAny(text, ["reported", "she said", "he said", "explained that"])) return "reported-speech";
      if (includesAny(text, ["passive", "active voice", "by the "])) return "passive-voice";
      return "mixed-tense-precision";
    default:
      return `${unit?.id || "general"}-practice`;
  }
}

export function getMasteryStatus(mastery = 0) {
  if (mastery >= 85) return "Mastered";
  if (mastery >= 65) return "Strong";
  if (mastery >= 40) return "Learning";
  if (mastery > 0) return "Starting";
  return "New";
}

function getReviewDelayMs(isCorrect, mastery, streak) {
  if (!isCorrect) return 10 * 60 * 1000;
  if (mastery >= 85 && streak >= 3) return 7 * 24 * 60 * 60 * 1000;
  if (mastery >= 65) return 3 * 24 * 60 * 60 * 1000;
  return 24 * 60 * 60 * 1000;
}

export function recordSkillResult(progress, skillId, isCorrect, now = Date.now()) {
  const previous = progress[skillId] || {
    attempts: 0,
    correctAttempts: 0,
    mastery: 0,
    streak: 0
  };
  const mastery = isCorrect
    ? Math.min(100, previous.mastery + (previous.mastery < 50 ? 20 : 10))
    : Math.max(0, previous.mastery - 15);
  const streak = isCorrect ? previous.streak + 1 : 0;

  return {
    ...progress,
    [skillId]: {
      attempts: previous.attempts + 1,
      correctAttempts: previous.correctAttempts + (isCorrect ? 1 : 0),
      mastery,
      streak,
      lastPracticedAt: new Date(now).toISOString(),
      nextReviewAt: new Date(now + getReviewDelayMs(isCorrect, mastery, streak)).toISOString()
    }
  };
}

export function recordExerciseResult(progress, unit, exercise, isCorrect, now = Date.now()) {
  const skillId = getExerciseSkillId(unit, exercise);
  const updated = recordSkillResult(progress, skillId, isCorrect, now);
  const exerciseId = `${unit?.id || "general"}:${exercise?.id || "exercise"}`;
  const mistakes = new Set(progress[skillId]?.mistakeExerciseIds || []);
  if (isCorrect) mistakes.delete(exerciseId);
  else mistakes.add(exerciseId);

  return {
    ...updated,
    [skillId]: {
      ...updated[skillId],
      mistakeExerciseIds: [...mistakes].slice(-20)
    }
  };
}

export function getSkillMasterySummary(progress) {
  const entries = Object.entries(progress)
    .filter(([skillId, value]) => SKILLS_BY_ID.has(skillId) && value?.attempts > 0)
    .map(([skillId, value]) => ({ ...SKILLS_BY_ID.get(skillId), ...value }));
  const averageMastery = entries.length
    ? Math.round(entries.reduce((sum, entry) => sum + entry.mastery, 0) / entries.length)
    : 0;
  const priority = [...entries].sort((a, b) => a.mastery - b.mastery || new Date(a.nextReviewAt) - new Date(b.nextReviewAt))[0] || null;
  const strongest = [...entries].sort((a, b) => b.mastery - a.mastery)[0] || null;
  const mistakeCount = new Set(entries.flatMap((entry) => entry.mistakeExerciseIds || [])).size;

  return { practicedCount: entries.length, averageMastery, priority, strongest, mistakeCount, entries };
}

export function resetUnitSkillProgress(progress, unitId) {
  const unitSkillIds = new Set(SKILL_CATALOG.filter((skill) => skill.unitId === unitId).map((skill) => skill.id));
  return Object.fromEntries(Object.entries(progress).filter(([skillId]) => !unitSkillIds.has(skillId)));
}
