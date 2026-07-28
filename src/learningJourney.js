export function getUnitJourney(progress = {}, unitId) {
  return progress[unitId] || {
    guidedStepIndex: 0,
    guidedAnswers: {},
    guidedCheckedAnswers: {},
    guidedCompletedStepIds: [],
    guidedProductionDraft: "",
    guidedCompleted: false,
    practiceAnswers: {},
    practiceResults: {},
    practiceCurrentIndex: 0,
    practiceCompleted: false,
    productionCompleted: false
  };
}

export function updateUnitJourney(progress = {}, unitId, patch) {
  const current = getUnitJourney(progress, unitId);
  return { ...progress, [unitId]: { ...current, ...patch, updatedAt: new Date().toISOString() } };
}

export function resetUnitJourney(progress = {}, unitId) {
  const next = { ...progress };
  delete next[unitId];
  return next;
}

export function isJourneyStarted(journey = {}) {
  return Boolean(
    journey.guidedStepIndex
    || journey.guidedCompletedStepIds?.length
    || Object.keys(journey.practiceResults || {}).length
    || journey.productionCompleted
  );
}

export function isJourneyCompleted(journey = {}, legacyCompleted = false) {
  return Boolean(journey.productionCompleted || legacyCompleted);
}

export function getJourneyPercent(journey = {}, totals = {}) {
  if (journey.productionCompleted) return 100;
  const guidedTotal = Math.max(1, totals.guidedSteps || 1);
  const practiceTotal = Math.max(1, totals.practiceExercises || 1);
  const guidedRatio = journey.guidedCompleted ? 1 : Math.min(1, (journey.guidedCompletedStepIds?.length || 0) / guidedTotal);
  const practiceRatio = Math.min(1, Object.keys(journey.practiceResults || {}).length / practiceTotal);
  return Math.min(99, Math.round((guidedRatio * 60) + (practiceRatio * 30)));
}

export function getJourneyStatus(journey = {}, totals = {}, legacyCompleted = false) {
  if (isJourneyCompleted(journey, legacyCompleted)) return "completed";
  return getJourneyPercent(journey, totals) > 0 ? "inProgress" : "notStarted";
}
