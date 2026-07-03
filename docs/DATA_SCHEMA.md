# SmartTense Data Schema

SmartTense reads verb data from JSON. The default file is:

```text
public/data/verbs.json
```

The same shape is accepted by Settings -> Import JSON and by the Settings data manager before saving a draft.

## Root Object

```json
{
  "schemaVersion": 1,
  "updatedAt": "2026-06-28",
  "verbs": []
}
```

Fields:

- `schemaVersion`: optional version number for humans and future migrations.
- `updatedAt`: optional date string.
- `verbs`: required non-empty array of verb objects.

Only these three root fields are accepted by the importer.

## Regular Verb Object

```json
{
  "id": "write",
  "label": "to write",
  "meaningEs": "escribir",
  "meanings": {
    "es": "escribir"
  },
  "base": "write",
  "third": "writes",
  "past": "wrote",
  "participle": "written",
  "gerund": "writing",
  "object": "a message",
  "objectEs": "un mensaje",
  "objects": {
    "es": "un mensaje"
  }
}
```

Required fields:

- `id`: unique id used internally.
- `label`: text shown in the verb selector.
- `base`: base English form.

Recommended fields:

- `meaningEs`: legacy Spanish meaning shown in the learner guide.
- `meanings`: optional localized learner meanings keyed by language code, such as `es` or future `fr`.
- `third`: third-person singular present form.
- `past`: simple past form.
- `participle`: past participle.
- `gerund`: `-ing` form.
- `object`: short complement used to build natural examples.
- `objectEs`: legacy Spanish meaning of the object or complement.
- `objects`: optional localized learner complements keyed by language code.

If `meanings.es` or `objects.es` exists, it is preferred over the legacy `meaningEs` and `objectEs` fields. The legacy fields remain supported so existing JSON files keep working while the app moves toward multiple learner languages.

If optional conjugation fields are missing, SmartTense uses simple fallbacks such as adding `s`, `ed`, or `ing`. For irregular verbs, always provide the explicit forms.

Only documented verb fields are accepted. Unknown fields are rejected so imported
files cannot smuggle unexpected data into the application state.

## Verb Pattern Classification

SmartTense calculates a study pattern from the three principal forms: `base`, `past`, and `participle`.

- `AAA`: all three forms are equal, such as `cut / cut / cut`.
- `ABB`: past and participle are equal, such as `buy / bought / bought`.
- `ABC`: all three forms are different, such as `sing / sang / sung`.
- `ABA`: base and participle are equal, such as `come / came / come`.
- `REGULAR_ED`: regular verbs ending in `-ed`, such as `want / wanted / wanted`.
- `BE`: special handling for `to be`.
- `MODAL`: special handling for modal entries such as `can` and `should`.

Do not add this pattern to JSON files. It is calculated automatically so future filters can use it consistently.

## Special Verb: `be`

```json
{
  "id": "be",
  "label": "to be",
  "meaningEs": "ser / estar",
  "type": "be",
  "base": "be",
  "third": "is",
  "past": "was",
  "participle": "been",
  "gerund": "being",
  "object": "careful",
  "objectEs": "cuidadoso / cuidadosa"
}
```

Use `type: "be"` for `to be`. The grammar engine handles it separately because it does not use `do` and `does` like regular verbs.

## Special Verb: Modal

```json
{
  "id": "can",
  "label": "can",
  "meaningEs": "poder",
  "type": "modal",
  "base": "can",
  "past": "could",
  "object": "speak English",
  "objectEs": "hablar ingles",
  "actionBase": "speak English",
  "actionParticiple": "spoken English",
  "actionGerund": "speaking English"
}
```

Use `type: "modal"` for modal-style entries. `actionBase`, `actionParticiple`, and `actionGerund` help the engine create natural examples for continuous and perfect tenses.

## Settings Data Manager

Settings provides a browser-side administrator for this schema. It can import/export the database, add a draft verb, bulk edit documented fields, delete draft rows, restore demo data, and save or discard the draft.

The bulk editor intentionally exposes only documented fields. Saving a draft runs the same validation used by file import, so duplicate IDs, missing required fields, unsupported types, unknown fields, and unsafe strings are rejected before `appData` changes.

Settings edits are not written directly to `public/data/verbs.json`. To make them permanent, export the database JSON and update the project data files intentionally.

## Validation Rules

Import and Settings draft save reject data when:

- The selected file does not end in `.json`.
- The selected file is larger than 512 KB.
- `verbs` is missing, empty, or not an array.
- `verbs` contains more than 500 entries.
- The root object contains unknown fields.
- `schemaVersion` is outside the supported range.
- A verb is missing `id`, `label`, or `base`.
- Two verbs use the same `id`.
- A verb contains unknown fields.
- A verb `id` contains characters other than letters, numbers, or dashes.
- `type` is present but is not `be` or `modal`.
- Optional string fields are present but are not strings.
- Any string field is empty, too long, or contains `<` or `>`.

## Keeping Built-In Data In Sync

When adding permanent verbs after using Settings export, update both files:

- `public/data/verbs.json`
- `src/data/defaultData.js`

This keeps the normal data file and embedded fallback data aligned.
