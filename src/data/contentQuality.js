const REQUIRED_SECTION_TYPES = ["theory", "structures", "commonMistakes", "examples", "vocabulary", "exercises"];
const TARGET_EXERCISE_KINDS = ["fillBlank", "transform", "chooseTense", "correctMistake", "translation"];
const METHODOLOGY_FIELDS = ["learnerContext", "pronunciationDrills", "productionTask"];

function normalizeAnswer(value) {
  return String(value || "")
    .trim()
    .toLocaleLowerCase("en-US")
    .replace(/\s+/g, " ");
}

function addIssue(issues, severity, code, message, details = {}) {
  issues.push({ severity, code, message, ...details });
}

function getExercises(unit) {
  return unit.sections
    .filter((section) => section.type === "exercises" && Array.isArray(section.exercises))
    .flatMap((section) => section.exercises);
}

export function auditLearningContent(content, options = {}) {
  const levels = options.levels || ["A1", "A2"];
  const minimumOptions = options.minimumOptions || 3;
  const minimumContextExercises = options.minimumContextExercises || 5;
  const issues = [];
  const exerciseIds = new Set();
  const units = Array.isArray(content?.units)
    ? content.units.filter((unit) => levels.includes(unit.cefrLevel))
    : [];
  let exerciseCount = 0;

  for (const unit of units) {
    const sectionTypes = new Set(unit.sections.map((section) => section.type));
    const exercises = getExercises(unit);
    const declaredContexts = new Set(unit.contextTags || []);
    const contextCounts = new Map([...declaredContexts].map((context) => [context, 0]));
    exerciseCount += exercises.length;

    for (const sectionType of REQUIRED_SECTION_TYPES) {
      if (!sectionTypes.has(sectionType)) {
        addIssue(issues, "error", "missing-section", `${unit.id} is missing the ${sectionType} section.`, {
          unitId: unit.id,
          sectionType
        });
      }
    }

    const missingMethodologyFields = METHODOLOGY_FIELDS.filter((field) => unit[field] === undefined);
    if (missingMethodologyFields.length > 0) {
      addIssue(
        issues,
        "warning",
        "missing-methodology-blocks",
        `${unit.id} has not activated: ${missingMethodologyFields.join(", ")}.`,
        { unitId: unit.id, fields: missingMethodologyFields }
      );
    }

    const kinds = new Set();
    for (const exercise of exercises) {
      kinds.add(exercise.kind);

      if (exerciseIds.has(exercise.id)) {
        addIssue(issues, "error", "duplicate-exercise-id", `Duplicate exercise id: ${exercise.id}.`, {
          unitId: unit.id,
          exerciseId: exercise.id
        });
      }
      exerciseIds.add(exercise.id);

      if (!exercise.context) {
        addIssue(issues, "warning", "missing-exercise-context", `${exercise.id} has no learning context.`, {
          unitId: unit.id,
          exerciseId: exercise.id
        });
      } else {
        if (!contextCounts.has(exercise.context)) {
          contextCounts.set(exercise.context, 0);
        }
        contextCounts.set(exercise.context, contextCounts.get(exercise.context) + 1);
        if (!declaredContexts.has(exercise.context)) {
          addIssue(
            issues,
            "warning",
            "undeclared-unit-context",
            `${exercise.id} uses ${exercise.context}, but the unit does not declare that context.`,
            { unitId: unit.id, exerciseId: exercise.id, context: exercise.context }
          );
        }
      }

      if (!Array.isArray(exercise.options) || exercise.options.length === 0) {
        addIssue(issues, "warning", "missing-options", `${exercise.id} relies on generated answer options.`, {
          unitId: unit.id,
          exerciseId: exercise.id
        });
        continue;
      }

      const normalizedOptions = exercise.options.map(normalizeAnswer);
      const uniqueOptions = new Set(normalizedOptions);
      const answerMatches = normalizedOptions.filter((option) => option === normalizeAnswer(exercise.answer)).length;

      if (exercise.options.length < minimumOptions) {
        addIssue(issues, "error", "insufficient-options", `${exercise.id} has fewer than ${minimumOptions} options.`, {
          unitId: unit.id,
          exerciseId: exercise.id
        });
      }
      if (uniqueOptions.size !== normalizedOptions.length) {
        addIssue(issues, "error", "duplicate-options", `${exercise.id} contains duplicate options.`, {
          unitId: unit.id,
          exerciseId: exercise.id
        });
      }
      if (answerMatches !== 1) {
        addIssue(issues, "error", "invalid-correct-option", `${exercise.id} must contain its answer exactly once.`, {
          unitId: unit.id,
          exerciseId: exercise.id
        });
      }
    }

    const missingKinds = TARGET_EXERCISE_KINDS.filter((kind) => !kinds.has(kind));
    if (missingKinds.length > 0) {
      addIssue(issues, "warning", "missing-exercise-kinds", `${unit.id} is missing practice kinds: ${missingKinds.join(", ")}.`, {
        unitId: unit.id,
        kinds: missingKinds
      });
    }

    for (const [context, count] of contextCounts) {
      if (count < minimumContextExercises) {
        addIssue(
          issues,
          "warning",
          "context-coverage-gap",
          `${unit.id}/${context} has ${count} exercises; target is ${minimumContextExercises}.`,
          { unitId: unit.id, context, count, target: minimumContextExercises }
        );
      }
    }
  }

  const errors = issues.filter((issue) => issue.severity === "error");
  const warnings = issues.filter((issue) => issue.severity === "warning");
  return {
    summary: {
      levels,
      unitCount: units.length,
      exerciseCount,
      errorCount: errors.length,
      warningCount: warnings.length,
      contextGapCount: warnings.filter((issue) => issue.code === "context-coverage-gap").length,
      methodologyReadyUnitCount: units.filter((unit) => METHODOLOGY_FIELDS.every((field) => unit[field] !== undefined)).length
    },
    issues,
    errors,
    warnings
  };
}

export function formatContentAudit(report) {
  const { summary } = report;
  const lines = [
    `Content quality audit (${summary.levels.join("/")})`,
    `Units: ${summary.unitCount}`,
    `Exercises: ${summary.exerciseCount}`,
    `Errors: ${summary.errorCount}`,
    `Warnings: ${summary.warningCount}`,
    `Context coverage gaps: ${summary.contextGapCount}`,
    `Methodology-ready units: ${summary.methodologyReadyUnitCount}/${summary.unitCount}`
  ];

  for (const issue of report.issues) {
    lines.push(`[${issue.severity.toUpperCase()}] ${issue.code}: ${issue.message}`);
  }

  return lines.join("\n");
}
