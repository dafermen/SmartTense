# SmartTense Junior Developer Guide

This guide is for making small, safe changes without having to understand the whole project at once.

## First Commands

Install dependencies:

```powershell
npm.cmd install
```

Run the app:

```powershell
npm.cmd run dev
```

Run checks before committing:

```powershell
npm.cmd test
npm.cmd run build
```

Use `npm.cmd` on Windows PowerShell if script execution blocks `npm`.

## Where Things Live

- `src/App.jsx`: main UI, navigation, Settings, filters, and data manager.
- `src/conjugation.js`: grammar engine.
- `src/data/defaultData.js`: built-in tense, subject, and fallback verb data.
- `src/data/validation.js`: validation for verb JSON.
- `src/data/learningContentValidation.js`: validation for learning units.
- `public/data/verbs.json`: default verb database loaded by the app.
- `public/data/learningUnits.json`: first structured learning-content database.
- `src/styles.css`: visual layout and responsive behavior.
- `tests/`: automated tests.
- `docs/`: user, developer, data, publishing, and roadmap docs.

## Current Product Direction

SmartTense is moving from a conjugation table into a guided learning tool.

The current stable surfaces are:

- `Home`: dashboard and recommendations.
- `Individual`: focused affirmative practice.
- `Complete`: full conjugation comparison.
- `Settings`: configuration and data administration.

The next planned surfaces are Theory and Practice, powered by `public/data/learningUnits.json`.

## Adding A Learning Unit

1. Open `public/data/learningUnits.json`.
2. Add one unit with a unique hyphenated `id`.
3. Link it to one or more `tenseIds`.
4. Add objectives and sections.
5. Run:

```powershell
npm.cmd test
```

If tests fail, read the validation error and compare the unit with `docs/LEARNING_CONTENT_SCHEMA.md`.

## Adding Or Editing Verbs

For user testing, use Settings in the app:

- Add one row with `Add verb`.
- Edit one row with `Edit`.
- Use `Bulk edit` only when many rows need updates.
- Export the database when you want to keep the result.

For source changes, keep these files aligned:

- `public/data/verbs.json`
- `src/data/defaultData.js`

Then update tests if the grammar behavior changes.

## Safe Change Checklist

Before finishing any change:

1. Keep the change focused on the requested feature.
2. Update docs when behavior or data shape changes.
3. Run `npm.cmd test`.
4. Run `npm.cmd run build`.
5. Check `git status --short` and only commit files that belong to your change.

Do not revert files you did not intentionally change.
