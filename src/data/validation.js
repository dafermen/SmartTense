const VALID_VERB_TYPES = new Set(["be", "modal"]);
const MAX_VERBS = 500;
const MAX_STRING_LENGTH = 160;
const MAX_ID_LENGTH = 48;
const MAX_SCHEMA_VERSION = 1;
const ALLOWED_PAYLOAD_KEYS = new Set(["schemaVersion", "updatedAt", "verbs"]);
const ALLOWED_VERB_KEYS = new Set([
  "id",
  "label",
  "meanings",
  "meaningEs",
  "type",
  "base",
  "third",
  "past",
  "pastPlural",
  "participle",
  "gerund",
  "object",
  "objects",
  "objectEs",
  "actionBase",
  "actionParticiple",
  "actionGerund"
]);

export function validateVerbData(payload) {
  // Validation runs before imported or fetched data reaches React state. The app
  // accepts optional fields, but rejects unknown shapes and oversized values.
  if (!payload || typeof payload !== "object" || !Array.isArray(payload.verbs) || payload.verbs.length === 0) {
    throw new Error("Invalid data");
  }

  rejectUnknownKeys(payload, ALLOWED_PAYLOAD_KEYS, "payload");

  if (payload.schemaVersion !== undefined && (!Number.isInteger(payload.schemaVersion) || payload.schemaVersion < 1 || payload.schemaVersion > MAX_SCHEMA_VERSION)) {
    throw new Error("Invalid schema version");
  }

  if (payload.updatedAt !== undefined && !isSafeString(payload.updatedAt, MAX_STRING_LENGTH)) {
    throw new Error("Invalid updatedAt");
  }

  if (payload.verbs.length > MAX_VERBS) {
    throw new Error(`Too many verbs: maximum ${MAX_VERBS}`);
  }

  const seenIds = new Set();

  for (const verb of payload.verbs) {
    validateVerb(verb, seenIds);
  }

  return payload;
}

function validateVerb(verb, seenIds) {
  if (!verb || typeof verb !== "object" || Array.isArray(verb)) {
    throw new Error("Invalid verb entry");
  }

  rejectUnknownKeys(verb, ALLOWED_VERB_KEYS, "verb");

  for (const key of ["id", "label", "base"]) {
    // id drives selection, label is shown to users, and base is the minimum form
    // needed to generate regular-verb examples.
    if (!isSafeString(verb[key], key === "id" ? MAX_ID_LENGTH : MAX_STRING_LENGTH)) {
      throw new Error(`Invalid verb ${key}`);
    }
  }

  if (!/^[a-z0-9-]+$/i.test(verb.id)) {
    throw new Error("Invalid verb id");
  }

  if (seenIds.has(verb.id)) {
    throw new Error(`Duplicate verb id: ${verb.id}`);
  }
  seenIds.add(verb.id);

  if (verb.type && !VALID_VERB_TYPES.has(verb.type)) {
    throw new Error(`Invalid verb type: ${verb.type}`);
  }

  for (const key of [
    "meaningEs",
    "third",
    "past",
    "pastPlural",
    "participle",
    "gerund",
    "object",
    "objectEs",
    "actionBase",
    "actionParticiple",
    "actionGerund"
  ]) {
    if (verb[key] !== undefined && !isSafeString(verb[key], MAX_STRING_LENGTH)) {
      throw new Error(`Invalid verb ${key}`);
    }
  }

  for (const key of ["meanings", "objects"]) {
    if (verb[key] !== undefined && !isSafeLocalizedMap(verb[key])) {
      throw new Error(`Invalid verb ${key}`);
    }
  }
}

function rejectUnknownKeys(value, allowedKeys, label) {
  for (const key of Object.keys(value)) {
    if (!allowedKeys.has(key)) {
      throw new Error(`Unknown ${label} field: ${key}`);
    }
  }
}

function isSafeString(value, maxLength) {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  return trimmed.length > 0 && trimmed.length <= maxLength && !/[<>]/.test(trimmed);
}

function isSafeLocalizedMap(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;

  const entries = Object.entries(value);
  if (entries.length === 0 || entries.length > 12) return false;

  return entries.every(([language, text]) => /^[a-z]{2,8}(-[A-Z]{2})?$/.test(language) && isSafeString(text, MAX_STRING_LENGTH));
}
