const BACKUP_KIND = "smarttense-progress-backup";
const BACKUP_SCHEMA_VERSION = 1;
const MAX_COLLECTION_ITEMS = 1000;
const MAX_TEXT_LENGTH = 20000;
const MAX_TREE_DEPTH = 12;
const PROGRESS_KEYS = ["activeLearningUnitId", "visitedVerbIds", "unitProgress", "skillProgress", "journeyProgress", "diagnosticAnswers", "diagnosticCompleted", "productionAttempts"];

function isPlainObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function validateJsonTree(value, depth = 0) {
  if (depth > MAX_TREE_DEPTH) throw new Error("Progress backup is too deeply nested");
  if (value === null || typeof value === "boolean" || typeof value === "number") return;
  if (typeof value === "string") {
    if (value.length > MAX_TEXT_LENGTH) throw new Error("Progress backup text is too long");
    return;
  }
  if (Array.isArray(value)) {
    if (value.length > MAX_COLLECTION_ITEMS) throw new Error("Progress backup collection is too large");
    value.forEach((item) => validateJsonTree(item, depth + 1));
    return;
  }
  if (!isPlainObject(value)) throw new Error("Progress backup contains an unsupported value");
  const entries = Object.entries(value);
  if (entries.length > MAX_COLLECTION_ITEMS) throw new Error("Progress backup object is too large");
  for (const [key, item] of entries) {
    if (["__proto__", "prototype", "constructor"].includes(key)) throw new Error("Progress backup contains an unsafe key");
    validateJsonTree(item, depth + 1);
  }
}

function normalizeProgress(progress = {}) {
  return {
    activeLearningUnitId: String(progress.activeLearningUnitId || "").slice(0, 120),
    visitedVerbIds: Array.isArray(progress.visitedVerbIds) ? [...new Set(progress.visitedVerbIds.map(String))].slice(0, MAX_COLLECTION_ITEMS) : [],
    unitProgress: progress.unitProgress || {},
    skillProgress: progress.skillProgress || {},
    journeyProgress: progress.journeyProgress || {},
    diagnosticAnswers: progress.diagnosticAnswers || {},
    diagnosticCompleted: Boolean(progress.diagnosticCompleted),
    productionAttempts: progress.productionAttempts || {}
  };
}

export function buildProgressBackup(progress, exportedAt = new Date().toISOString()) {
  return validateProgressBackup({ kind: BACKUP_KIND, schemaVersion: BACKUP_SCHEMA_VERSION, exportedAt, progress: normalizeProgress(progress) });
}

export function validateProgressBackup(payload) {
  if (!isPlainObject(payload)) throw new Error("Invalid progress backup");
  if (Object.keys(payload).some((key) => !["kind", "schemaVersion", "exportedAt", "progress"].includes(key))) throw new Error("Unknown progress backup field");
  if (payload.kind !== BACKUP_KIND || payload.schemaVersion !== BACKUP_SCHEMA_VERSION) throw new Error("Unsupported progress backup");
  if (typeof payload.exportedAt !== "string" || Number.isNaN(Date.parse(payload.exportedAt))) throw new Error("Invalid progress backup date");
  if (!isPlainObject(payload.progress)) throw new Error("Invalid progress payload");
  const progressKeys = Object.keys(payload.progress);
  if (progressKeys.some((key) => !PROGRESS_KEYS.includes(key)) || PROGRESS_KEYS.some((key) => !progressKeys.includes(key))) throw new Error("Invalid progress fields");
  if (!Array.isArray(payload.progress.visitedVerbIds) || typeof payload.progress.diagnosticCompleted !== "boolean") throw new Error("Invalid progress field types");
  for (const key of ["unitProgress", "skillProgress", "journeyProgress", "diagnosticAnswers", "productionAttempts"]) {
    if (!isPlainObject(payload.progress[key])) throw new Error(`Invalid ${key}`);
  }
  validateJsonTree(payload.progress);
  return JSON.parse(JSON.stringify(payload));
}
