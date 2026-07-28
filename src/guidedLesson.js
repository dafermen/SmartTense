function getSection(unit, type) {
  return unit?.sections?.find((section) => section.type === type);
}

export function buildGuidedLessonSteps(unit) {
  if (!unit) return [];

  const theory = getSection(unit, "theory");
  const examples = getSection(unit, "examples");
  const mistakes = getSection(unit, "commonMistakes");
  const exercises = getSection(unit, "exercises")?.exercises || [];
  const selectableExercises = exercises.filter((exercise) => Array.isArray(exercise.options) && exercise.options.length > 0);
  const steps = [
    { id: "objective", type: "objective", objectives: unit.objectives || [] },
    { id: "theory", type: "theory", section: theory },
    { id: "examples", type: "examples", items: examples?.examples?.slice(0, 2) || [] }
  ];

  for (const exercise of selectableExercises.slice(0, 3)) {
    steps.push({ id: `practice-${exercise.id}`, type: "practice", exercise });
  }

  if (mistakes?.mistakes?.length) {
    steps.push({ id: "correction", type: "correction", item: mistakes.mistakes[0] });
  }
  if (unit.pronunciationDrills?.length) {
    steps.push({ id: "pronunciation", type: "pronunciation", drills: unit.pronunciationDrills });
  }
  if (unit.productionTask) {
    steps.push({ id: "production", type: "production", task: unit.productionTask });
  }

  steps.push({ id: "summary", type: "summary" });
  return steps;
}

export function isGuidedAnswerCorrect(answer, expectedAnswer) {
  const normalize = (value) => String(value || "").trim().toLocaleLowerCase("en-US").replace(/\s+/g, " ");
  return normalize(answer) === normalize(expectedAnswer);
}
