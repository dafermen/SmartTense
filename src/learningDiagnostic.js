export const DIAGNOSTIC_CHECKS = [
  {
    id: "a1-foundation",
    cefrLevel: "A1",
    labelKey: "diagnosticA1Label",
    descriptionKey: "diagnosticA1Description"
  },
  {
    id: "a2-daily-communication",
    cefrLevel: "A2",
    labelKey: "diagnosticA2Label",
    descriptionKey: "diagnosticA2Description"
  },
  {
    id: "b1-functional-communication",
    cefrLevel: "B1",
    labelKey: "diagnosticB1Label",
    descriptionKey: "diagnosticB1Description"
  },
  {
    id: "b2-independent-production",
    cefrLevel: "B2",
    labelKey: "diagnosticB2Label",
    descriptionKey: "diagnosticB2Description"
  }
];

const CEFR_RANKS = ["A1", "A2", "B1", "B2"];

export function getDiagnosticResult(answers = {}) {
  const selectedChecks = DIAGNOSTIC_CHECKS.filter((check) => Boolean(answers?.[check.id]));
  if (selectedChecks.length === 0) return null;

  const cefrLevel = selectedChecks.reduce((highest, check) => (
    getCefrRank(check.cefrLevel) > getCefrRank(highest) ? check.cefrLevel : highest
  ), "A1");

  return {
    cefrLevel,
    completedCount: selectedChecks.length,
    totalCount: DIAGNOSTIC_CHECKS.length
  };
}

export function toggleDiagnosticAnswer(answers = {}, checkId) {
  const next = { ...(answers || {}) };
  if (next[checkId]) {
    delete next[checkId];
  } else {
    next[checkId] = true;
  }
  return next;
}

function getCefrRank(cefrLevel) {
  const index = CEFR_RANKS.indexOf(cefrLevel);
  return index === -1 ? -1 : index;
}
