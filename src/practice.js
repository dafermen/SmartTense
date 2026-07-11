import { ALL_CONTEXTS, filterByContext } from "./learningContexts.js";

export function getPracticeExercises(unit, selectedContext = ALL_CONTEXTS) {
  if (!unit?.sections) return [];

  const exercises = unit.sections
    .filter((section) => section.type === "exercises")
    .flatMap((section) => section.exercises.map((exercise) => ({ ...exercise, sectionTitle: section.title })));

  return filterByContext(exercises, selectedContext);
}

export function scorePracticeAnswer(expectedAnswer, userAnswer) {
  const expectedAnswers = Array.isArray(expectedAnswer) ? expectedAnswer : [expectedAnswer];
  const normalizedUserAnswer = normalizePracticeAnswer(userAnswer);
  const acceptedAnswer = expectedAnswers.find((answer) => normalizePracticeAnswer(answer) === normalizedUserAnswer);

  return {
    isCorrect: Boolean(normalizedUserAnswer && acceptedAnswer),
    normalizedAnswer: normalizedUserAnswer,
    expectedAnswer: expectedAnswers[0]
  };
}

export function normalizePracticeAnswer(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\u2019/g, "'")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[?!.]+$/g, "");
}
