export function getUnitProgress(unitId, progressByUnit = {}) {
  const progress = progressByUnit?.[unitId] || {};
  const theoryViewed = Boolean(progress.theoryViewed);
  const practiceCompleted = Boolean(progress.practiceCompleted);

  return {
    unitId,
    theoryViewed,
    practiceCompleted,
    status: practiceCompleted ? "completed" : theoryViewed ? "inProgress" : "notStarted"
  };
}

export function getNextLearningStep(unit, progressByUnit = {}) {
  if (!unit?.id) {
    return {
      page: "theory",
      labelKey: "openTheory",
      title: "Theory",
      status: "notStarted"
    };
  }

  const progress = getUnitProgress(unit.id, progressByUnit);

  if (!progress.theoryViewed) {
    return {
      page: "theory",
      labelKey: "openTheory",
      title: unit.title,
      status: progress.status
    };
  }

  if (!progress.practiceCompleted) {
    return {
      page: "practice",
      labelKey: "openPractice",
      title: unit.title,
      status: progress.status
    };
  }

  return {
    page: "individual",
    labelKey: "practiceIndividual",
    title: unit.title,
    status: progress.status
  };
}

export function markUnitProgress(progressByUnit = {}, unitId, patch) {
  if (!unitId) return progressByUnit || {};

  return {
    ...progressByUnit,
    [unitId]: {
      ...(progressByUnit?.[unitId] || {}),
      ...patch
    }
  };
}

export function resetUnitProgress(progressByUnit = {}, unitId) {
  if (!unitId) return progressByUnit || {};
  const next = { ...progressByUnit };
  delete next[unitId];
  return next;
}
