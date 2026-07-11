# SmartTense Learning Content Schema

This document defines the first structured learning-content format for SmartTense. It is the foundation for future Theory, Practice, learning path, and content administration features.

The source file is:

```text
public/data/learningUnits.json
```

The validator is:

```text
src/data/learningContentValidation.js
```

## Root Object

```json
{
  "schemaVersion": 1,
  "updatedAt": "2026-07-11",
  "units": []
}
```

Allowed root fields:

- `schemaVersion`: optional integer. Current maximum is `1`.
- `updatedAt`: optional non-empty string.
- `units`: required non-empty array of learning units.

## Learning Unit

```json
{
  "id": "present-simple-foundation",
  "title": "Present Simple Foundation",
  "level": "basic",
  "focus": "Use Present Simple for habits, routines, facts, and schedules.",
  "tenseIds": ["simplePresent"],
  "contextTags": ["daily-habits", "it-work"],
  "objectives": ["Recognize when Present Simple is the right tense."],
  "sections": []
}
```

Rules:

- `id` must be unique and use letters, numbers, or hyphens.
- `level` must be `basic`, `intermediate`, or `advanced`.
- `tenseIds` links the unit to tense metadata from `src/data/defaultData.js`.
- `contextTags` prepares the content for future vocabulary/context filters.
- `objectives` are learner-facing goals.
- `sections` holds the real teaching and practice content.

## Section Types

Every section needs `id`, `type`, and `title`.

### theory

Use for short explanations.

```json
{
  "id": "meaning",
  "type": "theory",
  "title": "Meaning",
  "body": ["Present Simple describes habits and routines."],
  "signalWords": ["always", "usually", "every day"]
}
```

### structures

Use for grammar patterns.

```json
{
  "id": "structures",
  "type": "structures",
  "title": "Structures",
  "structures": [
    {
      "form": "affirmative",
      "pattern": "Subject + base verb (+ s/es for he/she/it)",
      "example": "He works as an IT engineer."
    }
  ]
}
```

Allowed `form` values:

- `affirmative`
- `negative`
- `questionPositive`
- `questionNegative`

### commonMistakes

Use for error correction.

```json
{
  "id": "common-mistakes",
  "type": "commonMistakes",
  "title": "Common mistakes",
  "mistakes": [
    {
      "wrong": "He work in IT.",
      "right": "He works in IT.",
      "why": "He/she/it needs -s in affirmative Present Simple."
    }
  ]
}
```

### examples

Use for contextual examples.

```json
{
  "id": "examples",
  "type": "examples",
  "title": "Examples",
  "examples": [
    {
      "context": "it-work",
      "sentence": "Dario checks his email before he starts coding.",
      "note": "This describes a regular work routine."
    }
  ]
}
```

### exercises

Use for future Practice activities.

```json
{
  "id": "starter-practice",
  "type": "exercises",
  "title": "Starter practice",
  "exercises": [
    {
      "id": "present-simple-fill-1",
      "kind": "fillBlank",
      "prompt": "Dario _____ as an IT engineer.",
      "answer": "works",
      "explanation": "Dario is he, so the verb work becomes works."
    }
  ]
}
```

Allowed `kind` values:

- `fillBlank`
- `transform`
- `chooseTense`
- `correctMistake`
- `translation`
- `shortAnswer`

### vocabulary

Use for future vocabulary packs.

```json
{
  "id": "work-words",
  "type": "vocabulary",
  "title": "Work words",
  "vocabulary": [
    {
      "term": "meeting",
      "meaning": "A planned work conversation",
      "example": "She has a meeting every Monday."
    }
  ]
}
```

## Validation Rules

The validator rejects:

- Empty unit collections.
- Duplicate unit IDs.
- Unknown fields.
- Unsupported schema versions.
- Unsupported levels, section types, structure forms, or exercise kinds.
- Strings that are empty, too long, or contain `<` or `>`.
- Oversized collections.

When adding a new field, update the schema, validator, tests, and documentation in the same change.
