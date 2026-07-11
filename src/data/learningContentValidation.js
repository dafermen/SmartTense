const MAX_SCHEMA_VERSION = 2;
const MAX_UNITS = 50;
const MAX_SECTIONS = 40;
const MAX_ITEMS = 60;
const MAX_OBJECTIVES = 20;
const MAX_STRING_LENGTH = 300;
const MAX_ID_LENGTH = 64;

const LEVELS = new Set(["basic", "intermediate", "advanced"]);
const SECTION_TYPES = new Set(["theory", "structures", "commonMistakes", "examples", "exercises", "vocabulary"]);
const STRUCTURE_FORMS = new Set(["affirmative", "negative", "questionPositive", "questionNegative"]);
const EXERCISE_KINDS = new Set(["fillBlank", "transform", "chooseTense", "correctMistake", "translation", "shortAnswer"]);

const ALLOWED_PAYLOAD_KEYS = new Set(["schemaVersion", "updatedAt", "contexts", "units"]);
const ALLOWED_CONTEXT_KEYS = new Set(["id", "title", "description"]);
const ALLOWED_UNIT_KEYS = new Set(["id", "title", "level", "focus", "tenseIds", "contextTags", "objectives", "sections"]);
const ALLOWED_SECTION_KEYS = new Set([
  "id",
  "type",
  "title",
  "body",
  "signalWords",
  "structures",
  "mistakes",
  "examples",
  "exercises",
  "vocabulary"
]);

export function validateLearningContent(payload) {
  // Learning content is future-facing data. Validate strictly before the UI uses
  // it so Theory, Practice, and Settings can share the same safe source.
  if (!payload || typeof payload !== "object" || !Array.isArray(payload.units) || payload.units.length === 0) {
    throw new Error("Invalid learning content");
  }

  rejectUnknownKeys(payload, ALLOWED_PAYLOAD_KEYS, "payload");

  if (payload.schemaVersion !== undefined && (!Number.isInteger(payload.schemaVersion) || payload.schemaVersion < 1 || payload.schemaVersion > MAX_SCHEMA_VERSION)) {
    throw new Error("Invalid schema version");
  }

  if (payload.updatedAt !== undefined && !isSafeString(payload.updatedAt, MAX_STRING_LENGTH)) {
    throw new Error("Invalid updatedAt");
  }

  if (payload.units.length > MAX_UNITS) {
    throw new Error(`Too many learning units: maximum ${MAX_UNITS}`);
  }

  const contextIds = validateContexts(payload.contexts);
  const seenUnitIds = new Set();
  for (const unit of payload.units) {
    validateUnit(unit, seenUnitIds, contextIds);
  }

  return payload;
}

function validateContexts(contexts) {
  if (contexts === undefined) return new Set();
  if (!Array.isArray(contexts) || contexts.length === 0 || contexts.length > MAX_ITEMS) {
    throw new Error("Invalid contexts");
  }

  const seenContextIds = new Set();
  for (const context of contexts) {
    validateObjectKeys(context, ALLOWED_CONTEXT_KEYS, "context");

    for (const key of ["id", "title", "description"]) {
      if (!isSafeString(context[key], key === "id" ? MAX_ID_LENGTH : MAX_STRING_LENGTH)) {
        throw new Error(`Invalid context ${key}`);
      }
    }

    validateId(context.id, "context id");
    if (seenContextIds.has(context.id)) {
      throw new Error(`Duplicate context id: ${context.id}`);
    }
    seenContextIds.add(context.id);
  }

  return seenContextIds;
}

function validateUnit(unit, seenUnitIds, contextIds) {
  if (!unit || typeof unit !== "object" || Array.isArray(unit)) {
    throw new Error("Invalid learning unit");
  }

  rejectUnknownKeys(unit, ALLOWED_UNIT_KEYS, "unit");

  for (const key of ["id", "title", "level", "focus"]) {
    if (!isSafeString(unit[key], key === "id" ? MAX_ID_LENGTH : MAX_STRING_LENGTH)) {
      throw new Error(`Invalid unit ${key}`);
    }
  }

  validateId(unit.id, "unit id");

  if (seenUnitIds.has(unit.id)) {
    throw new Error(`Duplicate unit id: ${unit.id}`);
  }
  seenUnitIds.add(unit.id);

  if (!LEVELS.has(unit.level)) {
    throw new Error(`Invalid unit level: ${unit.level}`);
  }

  validateTextArray(unit.tenseIds, "unit tenseIds", MAX_ITEMS, true);
  validateTextArray(unit.contextTags, "unit contextTags", MAX_ITEMS, true);
  validateKnownContextTags(unit.contextTags, contextIds);
  validateTextArray(unit.objectives, "unit objectives", MAX_OBJECTIVES);

  if (!Array.isArray(unit.sections) || unit.sections.length === 0 || unit.sections.length > MAX_SECTIONS) {
    throw new Error("Invalid unit sections");
  }

  const seenSectionIds = new Set();
  for (const section of unit.sections) {
    validateSection(section, unit.id, seenSectionIds, contextIds);
  }
}

function validateSection(section, unitId, seenSectionIds, contextIds) {
  if (!section || typeof section !== "object" || Array.isArray(section)) {
    throw new Error("Invalid learning section");
  }

  rejectUnknownKeys(section, ALLOWED_SECTION_KEYS, "section");

  for (const key of ["id", "type", "title"]) {
    if (!isSafeString(section[key], key === "id" ? MAX_ID_LENGTH : MAX_STRING_LENGTH)) {
      throw new Error(`Invalid section ${key}`);
    }
  }

  validateId(section.id, "section id");

  const sectionKey = `${unitId}:${section.id}`;
  if (seenSectionIds.has(sectionKey)) {
    throw new Error(`Duplicate section id: ${section.id}`);
  }
  seenSectionIds.add(sectionKey);

  if (!SECTION_TYPES.has(section.type)) {
    throw new Error(`Invalid section type: ${section.type}`);
  }

  if (section.signalWords !== undefined) {
    validateTextArray(section.signalWords, "section signalWords", MAX_ITEMS);
  }

  switch (section.type) {
    case "theory":
      validateTextArray(section.body, "section body", MAX_ITEMS);
      break;
    case "structures":
      validateStructuredArray(section.structures, "section structures", validateStructure);
      break;
    case "commonMistakes":
      validateStructuredArray(section.mistakes, "section mistakes", validateMistake);
      break;
    case "examples":
      validateStructuredArray(section.examples, "section examples", (item) => validateExample(item, contextIds));
      break;
    case "exercises":
      validateStructuredArray(section.exercises, "section exercises", (item) => validateExercise(item, contextIds));
      break;
    case "vocabulary":
      validateStructuredArray(section.vocabulary, "section vocabulary", (item) => validateVocabulary(item, contextIds));
      break;
    default:
      throw new Error(`Invalid section type: ${section.type}`);
  }
}

function validateStructure(item) {
  validateObjectKeys(item, new Set(["form", "pattern", "example"]), "structure");

  if (!isSafeString(item.form, MAX_STRING_LENGTH) || !STRUCTURE_FORMS.has(item.form)) {
    throw new Error(`Invalid structure form: ${item.form}`);
  }

  for (const key of ["pattern", "example"]) {
    if (!isSafeString(item[key], MAX_STRING_LENGTH)) {
      throw new Error(`Invalid structure ${key}`);
    }
  }
}

function validateMistake(item) {
  validateObjectKeys(item, new Set(["wrong", "right", "why"]), "mistake");

  for (const key of ["wrong", "right", "why"]) {
    if (!isSafeString(item[key], MAX_STRING_LENGTH)) {
      throw new Error(`Invalid mistake ${key}`);
    }
  }
}

function validateExample(item, contextIds) {
  validateObjectKeys(item, new Set(["context", "sentence", "note"]), "example");

  for (const key of ["context", "sentence", "note"]) {
    if (!isSafeString(item[key], MAX_STRING_LENGTH)) {
      throw new Error(`Invalid example ${key}`);
    }
  }
  validateKnownContextTag(item.context, contextIds);
}

function validateExercise(item, contextIds) {
  validateObjectKeys(item, new Set(["id", "kind", "prompt", "answer", "explanation", "context"]), "exercise");

  if (!isSafeString(item.id, MAX_ID_LENGTH)) {
    throw new Error("Invalid exercise id");
  }
  validateId(item.id, "exercise id");

  if (!isSafeString(item.kind, MAX_STRING_LENGTH) || !EXERCISE_KINDS.has(item.kind)) {
    throw new Error(`Invalid exercise kind: ${item.kind}`);
  }

  for (const key of ["prompt", "answer", "explanation"]) {
    if (!isSafeString(item[key], MAX_STRING_LENGTH)) {
      throw new Error(`Invalid exercise ${key}`);
    }
  }

  if (item.context !== undefined) {
    if (!isSafeString(item.context, MAX_ID_LENGTH)) {
      throw new Error("Invalid exercise context");
    }
    validateId(item.context, "exercise context");
    validateKnownContextTag(item.context, contextIds);
  }
}

function validateVocabulary(item, contextIds) {
  validateObjectKeys(item, new Set(["term", "meaning", "example", "context"]), "vocabulary");

  for (const key of ["term", "meaning"]) {
    if (!isSafeString(item[key], MAX_STRING_LENGTH)) {
      throw new Error(`Invalid vocabulary ${key}`);
    }
  }

  if (item.example !== undefined && !isSafeString(item.example, MAX_STRING_LENGTH)) {
    throw new Error("Invalid vocabulary example");
  }

  if (item.context !== undefined) {
    if (!isSafeString(item.context, MAX_ID_LENGTH)) {
      throw new Error("Invalid vocabulary context");
    }
    validateId(item.context, "vocabulary context");
    validateKnownContextTag(item.context, contextIds);
  }
}

function validateStructuredArray(value, label, validator) {
  if (!Array.isArray(value) || value.length === 0 || value.length > MAX_ITEMS) {
    throw new Error(`Invalid ${label}`);
  }

  for (const item of value) {
    validator(item);
  }
}

function validateObjectKeys(value, allowedKeys, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`Invalid ${label}`);
  }

  rejectUnknownKeys(value, allowedKeys, label);
}

function validateTextArray(value, label, maxItems, validateIds = false) {
  if (!Array.isArray(value) || value.length === 0 || value.length > maxItems) {
    throw new Error(`Invalid ${label}`);
  }

  for (const item of value) {
    if (!isSafeString(item, validateIds ? MAX_ID_LENGTH : MAX_STRING_LENGTH)) {
      throw new Error(`Invalid ${label}`);
    }
    if (validateIds) {
      validateId(item, label);
    }
  }
}

function validateId(value, label) {
  if (!/^[a-z0-9-]+$/i.test(value)) {
    throw new Error(`Invalid ${label}`);
  }
}

function validateKnownContextTags(tags, contextIds) {
  for (const tag of tags) {
    validateKnownContextTag(tag, contextIds);
  }
}

function validateKnownContextTag(tag, contextIds) {
  if (contextIds.size > 0 && !contextIds.has(tag)) {
    throw new Error(`Unknown context tag: ${tag}`);
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
