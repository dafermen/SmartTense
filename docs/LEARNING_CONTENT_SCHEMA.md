# SmartTense Learning Content Schema

This document defines the structured learning-content format for SmartTense. It is the foundation for Theory, Practice, learning path, vocabulary contexts, and future content administration features.

The source file is:

```text
public/data/learningUnits.json
```

The validator is:

```text
src/data/learningContentValidation.js
```

Settings can import and export this same JSON shape through the Learning content manager. Imported content is validated before it can be applied to the current browser session.

## Root Object

```json
{
  "schemaVersion": 3,
  "updatedAt": "2026-07-11",
  "contexts": [],
  "units": []
}
```

Allowed root fields:

- `schemaVersion`: optional integer. Current maximum is `3`.
- `updatedAt`: optional non-empty string.
- `contexts`: optional non-empty array when context filtering is used.
- `units`: required non-empty array of learning units.

## Context Catalog

```json
{
  "id": "it-work",
  "title": "IT work",
  "description": "Software, support, meetings, and technical work."
}
```

Rules:

- `id` must be unique and use letters, numbers, or hyphens.
- `title` and `description` are learner-facing text.
- When the root `contexts` array exists, unit tags, examples, vocabulary, and exercises that include a `context` must reference an existing context ID.

## Learning Unit

```json
{
  "id": "present-simple-foundation",
  "title": "Present Simple Foundation",
  "level": "basic",
  "cefrLevel": "A1",
  "unitOrder": 1,
  "prerequisiteUnitIds": [],
  "focus": "Use Present Simple for habits, routines, facts, and schedules.",
  "tenseIds": ["simplePresent"],
  "contextTags": ["daily-habits", "it-work"],
  "objectives": ["Recognize when Present Simple is the right tense."],
  "learnerContext": "daily life, family, IT work",
  "grammarBlocks": [],
  "controlledPractice": [],
  "contrastPractice": [],
  "mistakeCorrection": [],
  "translationPractice": [],
  "pronunciationDrills": [],
  "productionTask": {
    "prompt": "Describe a routine sentence in Present Simple and one in Present Continuous.",
    "requiredStructures": ["affirmative", "negative", "questionPositive"],
    "checklist": ["Uses the correct verb form", "Uses time context"]
  },
  "sections": []
}
```

Rules:

- `id` must be unique and use letters, numbers, or hyphens.
- `level` must be `basic`, `intermediate`, or `advanced`. This is the internal practice difficulty used by tense filters.
- `cefrLevel` must be `A1`, `A2`, `B1`, or `B2` for schema version `3`. This is the curricular level used for course planning.
- `unitOrder` must be a positive integer for schema version `3`. It controls recommended order inside a CEFR level.
- `prerequisiteUnitIds` is optional and may be an empty array. Every listed ID must point to another unit in the same payload.
- `tenseIds` links the unit to tense metadata from `src/data/defaultData.js`.
- `contextTags` controls which context buttons are shown for the unit.
- `objectives` are learner-facing goals.
- `learnerContext` is optional. It is a short learner-facing label (string or array of strings) that helps surface the unit's real-world scenario.
- `grammarBlocks` is optional and stores grammar structures for the unit.
- `controlledPractice` is optional. It stores practice exercises.
- `contrastPractice` is optional. It stores tense-comparison / selection practice.
- `mistakeCorrection` is optional. It stores correction-focused exercises.
- `translationPractice` is optional. It stores Spanish-to-English translation practice exercises.
- `pronunciationDrills` is optional. Each item has:
  - `id` (required): stable identifier
  - `text` (required): phrase/sentence for pronunciation focus
  - `focus` (optional): coaching tag
  - `note` (optional): optional guidance
- `productionTask` is optional and stores a guided speaking/writing prompt:
  - `prompt` (required)
  - `requiredStructures` (optional array): items expected in the student output
  - `checklist` (optional array): review points for teacher/student self-check
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

Rules:

- `context` must reference a root context when the catalog exists.
- Theory uses this field for the context filter.

### exercises

Use for Practice activities.

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
      "explanation": "Dario is he, so the verb work becomes works.",
      "context": "it-work"
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

Optional field:

- `context`: filters the exercise in Practice. It must reference a root context when the catalog exists.

### vocabulary

Use for vocabulary cards shown in Theory.

```json
{
  "id": "work-words",
  "type": "vocabulary",
  "title": "Work words",
  "vocabulary": [
    {
      "term": "meeting",
      "meaning": "A planned work conversation",
      "example": "She has a meeting every Monday.",
      "context": "meetings"
    }
  ]
}
```

Optional field:

- `context`: filters the vocabulary card in Theory. It must reference a root context when the catalog exists.

## Validation Rules

The validator rejects:

- Empty unit collections.
- Duplicate unit IDs.
- Duplicate context IDs.
- Unknown context references.
- Unknown fields.
- Unsupported schema versions.
- Unsupported internal levels, CEFR levels, section types, structure forms, or exercise kinds.
- Unknown prerequisite unit IDs.
- Duplicate `unitOrder` values inside the same `cefrLevel`.
- Strings that are empty, too long, or contain `<` or `>`.
- Oversized collections.

When adding a new field, update the schema, validator, tests, and documentation in the same change.
