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

export function getOrderedLearningUnits(units = []) {
  return [...units].sort((left, right) => {
    const leftLevel = getCefrRank(left.cefrLevel);
    const rightLevel = getCefrRank(right.cefrLevel);
    if (leftLevel !== rightLevel) return leftLevel - rightLevel;

    const leftOrder = Number.isInteger(left.unitOrder) ? left.unitOrder : Number.MAX_SAFE_INTEGER;
    const rightOrder = Number.isInteger(right.unitOrder) ? right.unitOrder : Number.MAX_SAFE_INTEGER;
    if (leftOrder !== rightOrder) return leftOrder - rightOrder;

    return String(left.title || left.id || "").localeCompare(String(right.title || right.id || ""));
  });
}

export function getLearningUnitsByCefrFilter(units = [], cefrFilter = "all") {
  const orderedUnits = getOrderedLearningUnits(units);
  if (!cefrFilter || cefrFilter === "all") return orderedUnits;
  return orderedUnits.filter((unit) => unit.cefrLevel === cefrFilter);
}

export function getRecommendedLearningUnit(units = [], progressByUnit = {}) {
  const orderedUnits = getOrderedLearningUnits(units);

  return orderedUnits.find((unit) => {
    if (getUnitProgress(unit.id, progressByUnit).practiceCompleted) return false;
    return (unit.prerequisiteUnitIds || []).every((unitId) => getUnitProgress(unitId, progressByUnit).practiceCompleted);
  }) || orderedUnits[0];
}

export function getRecommendedLearningUnitForLevel(units = [], progressByUnit = {}, cefrLevel) {
  if (!cefrLevel) return null;

  const unitsAtLevel = getOrderedLearningUnits(units).filter((unit) => unit.cefrLevel === cefrLevel);
  if (unitsAtLevel.length === 0) return null;

  return unitsAtLevel.find((unit) => !getUnitProgress(unit.id, progressByUnit).practiceCompleted) || unitsAtLevel[0];
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

function getCefrRank(cefrLevel) {
  return ["A1", "A2", "B1", "B2"].indexOf(cefrLevel) + 1 || Number.MAX_SAFE_INTEGER;
}
