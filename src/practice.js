export function getPracticeExercises(unit) {
  if (!unit?.sections) return [];

  return unit.sections
    .filter((section) => section.type === "exercises")
    .flatMap((section) => section.exercises.map((exercise) => ({ ...exercise, sectionTitle: section.title })));
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
