import { getPracticeExercises } from "./practice.js";
import { getExerciseSkillId, SKILL_CATALOG } from "./skillMastery.js";

const SKILL_LABELS = new Map(SKILL_CATALOG.map((skill) => [skill.id, skill.label]));

function isUsableExercise(exercise) {
  return Array.isArray(exercise?.options)
    && exercise.options.length >= 2
    && exercise.options.includes(exercise.answer);
}

function getPriority(progress = {}, now = Date.now(), isMistake = false) {
  const attempts = progress.attempts || 0;
  const mastery = progress.mastery || 0;
  const accuracy = attempts ? (progress.correctAttempts || 0) / attempts : 0;
  const isDue = !progress.nextReviewAt || new Date(progress.nextReviewAt).getTime() <= now;
  return (isMistake ? 5000 : 0) + (isDue ? 1000 : 0) + ((100 - mastery) * 10) + ((1 - accuracy) * 100);
}

export function buildAdaptiveReviewQueue(units, skillProgress = {}, options = {}) {
  const now = options.now ?? Date.now();
  const limit = options.limit ?? 8;
  const candidates = (units || []).flatMap((unit) => (
    getPracticeExercises(unit)
      .filter(isUsableExercise)
      .map((exercise) => {
        const skillId = getExerciseSkillId(unit, exercise);
        const progress = skillProgress[skillId] || {};
        const id = `${unit.id}:${exercise.id}`;
        const isMistake = (progress.mistakeExerciseIds || []).includes(id);
        return {
          id,
          unit,
          exercise,
          skillId,
          skillLabel: SKILL_LABELS.get(skillId) || `${unit.cefrLevel} grammar practice`,
          mastery: progress.mastery || 0,
          isMistake,
          priority: getPriority(progress, now, isMistake)
        };
      })
  ));

  candidates.sort((a, b) => b.priority - a.priority || a.id.localeCompare(b.id));

  const firstBySkill = [];
  const additional = [];
  const seenSkills = new Set();
  candidates.forEach((candidate) => {
    if (seenSkills.has(candidate.skillId)) additional.push(candidate);
    else {
      seenSkills.add(candidate.skillId);
      firstBySkill.push(candidate);
    }
  });

  return [...firstBySkill, ...additional].slice(0, Math.max(0, limit));
}

export function getAdaptiveReviewReason(item) {
  if (item?.isMistake) return "Recent mistake";
  if (!item || item.mastery === 0) return "New skill";
  if (item.mastery < 40) return "Needs reinforcement";
  if (item.mastery < 65) return "Keep practicing";
  return "Scheduled review";
}
