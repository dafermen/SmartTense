export function cloneLearningContent(content) {
  return JSON.parse(JSON.stringify(content || { schemaVersion: 2, contexts: [], units: [] }));
}

export function buildLearningContentPayload(content) {
  const draft = cloneLearningContent(content);

  return {
    schemaVersion: draft.schemaVersion || 2,
    updatedAt: new Date().toISOString().slice(0, 10),
    contexts: draft.contexts || [],
    units: draft.units || []
  };
}

export function getLearningContentSummary(content) {
  const units = Array.isArray(content?.units) ? content.units : [];
  const contexts = Array.isArray(content?.contexts) ? content.contexts : [];
  const sections = units.flatMap((unit) => Array.isArray(unit.sections) ? unit.sections : []);
  const vocabulary = sections
    .filter((section) => section.type === "vocabulary")
    .flatMap((section) => section.vocabulary || []);
  const exercises = sections
    .filter((section) => section.type === "exercises")
    .flatMap((section) => section.exercises || []);

  return {
    units: units.length,
    contexts: contexts.length,
    sections: sections.length,
    vocabulary: vocabulary.length,
    exercises: exercises.length,
    updatedAt: content?.updatedAt || "local draft",
    schemaVersion: content?.schemaVersion || 2
  };
}
