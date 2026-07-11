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
npm.cmd run release:check
```

The release check already includes the mobile smoke test for navigation, responsive layout, Settings, and high-volume data.

Use `npm.cmd` on Windows PowerShell if script execution blocks `npm`.

## Where Things Live

- `src/App.jsx`: main UI, navigation, Settings, filters, and data manager.
- `src/conjugation.js`: grammar engine.
- `src/data/defaultData.js`: built-in tense, subject, and fallback verb data.
- `src/data/validation.js`: validation for verb JSON.
- `src/data/learningContentValidation.js`: validation for learning units.
- `src/learningContentAdmin.js`: learning-content draft summary and export helpers.
- `src/practice.js`: practice exercise extraction, answer normalization, and scoring.
- `src/learningContexts.js`: context filtering and vocabulary extraction helpers.
- `src/learningPath.js`: local unit progress and next-step recommendation helpers.
- `public/data/verbs.json`: default verb database loaded by the app.
- `public/data/learningUnits.json`: first structured learning-content database.
- `src/styles.css`: visual layout and responsive behavior.
- `tests/`: automated tests.
- `scripts/mobile-smoke.cjs`: local Chrome/Vite mobile smoke test for critical screens.
- `docs/`: user, developer, data, publishing, and roadmap docs.

The mobile smoke has internal quality gates for Home ready time, Settings ready time, viewport size, 500-verb volume, and 25 visible Settings rows. If it fails, read the failure message before changing thresholds.
For a phase milestone, also follow `docs/RELEASE_CHECKLIST.md`.

## Current Product Direction

SmartTense is moving from a conjugation table into a guided learning tool.

The current stable surfaces are:

- `Home`: dashboard and recommendations.
- `Theory`: read-only learning lesson rendered from `public/data/learningUnits.json`.
- `Contexts`: compact filters for examples, vocabulary, and practice.
- `Why this form?`: compact explanations attached to generated sentence rows.
- `Practice`: starter exercises with local answer checking.
- `Learning path`: local Theory/Practice progress for the active unit.
- `Individual`: focused affirmative practice.
- `Production`: speaking and writing practice with status-based queue.
- `Complete`: full conjugation comparison.
- `Settings`: configuration, verb data administration, and learning-content import/export.

Production is now active. It supports drafting attempts, local statuses, filtering, edit, and delete in the queue.

## Development Flow By Phase

SmartTense uses a phase-driven execution model. Before and after bigger changes, keep this sequence:

1. Identify the active phase in `docs/PHASE_EXECUTION_LOG.md`.
2. Read the corresponding goals in:
   - `docs/PHASE_PLAN_DARIO_UNIT1_BY_OPERATIONS.md` (operational roadmap).
   - `docs/DEVELOPER_GUIDE.md` for architecture and file ownership.
3. Implement the phase tasks with minimal scope.
4. Update evidence in `docs/PHASE_EXECUTION_LOG.md` and adjust the phase plan/Gantt if needed.
5. Run checks (`npm.cmd run release:check`) before commit.

Keep phase docs current when a deliverable is completed so the next teammate can continue safely.

Keep any larger authoring UI separate from the small learning-content admin helpers.

## Updating Production

1. Open `Production` and pick a Speaking or Writing prompt.
2. Write a response and choose a status (`Draft`, `Done`, `Needs review`, `Approved`).
3. Save the attempt.
4. Filter queue by mode/status for review.
5. Use Edit to update a single attempt and Confirm to apply the change.

## Adding A Learning Unit

1. Open `public/data/learningUnits.json`.
2. Add one unit with a unique hyphenated `id`.
3. Link it to one or more `tenseIds`.
4. Link it to context IDs from the root `contexts` catalog.
5. Add objectives and sections.
6. Run:

```powershell
npm.cmd test
```

If tests fail, read the validation error and compare the unit with `docs/LEARNING_CONTENT_SCHEMA.md`.

## Updating Theory

Theory is rendered in `src/App.jsx` by `TheoryPage` and `LearningSection`.

Keep Theory read-only until the Practice phase starts:

- show explanations and examples;
- allow expanding starter answers;
- do not add scoring or answer input here;
- keep mobile layout compact.

## Updating Explanations

Explanations are created in `src/conjugation.js` and attached to each row as `row.explanations`.

Rules for safe edits:

- Keep the explanation tied to the generated sentence.
- Do not create a second conjugation engine.
- Update `tests/conjugation.test.js` when the explanation shape or wording changes.
- Keep the UI collapsed by default so Complete and Individual stay compact.

## Updating Practice

Practice is rendered in `src/App.jsx` by `PracticePage`.

The pure practice logic lives in `src/practice.js`:

- `getPracticeExercises`
- `normalizePracticeAnswer`
- `scorePracticeAnswer`

When editing Practice, add tests in `tests/practice.test.js` and keep scoring local. Do not add accounts or server storage.

## Updating Contexts

Context logic lives in `src/learningContexts.js`.

Current behavior:

- map unit `contextTags` to root context metadata;
- filter examples, vocabulary, and exercises;
- keep untagged items visible as shared content.

When editing contexts, update `public/data/learningUnits.json`, `docs/LEARNING_CONTENT_SCHEMA.md`, and `tests/learningContexts.test.js` if helper behavior changes.

## Updating Learning Content Admin

The Settings content manager uses `src/learningContentAdmin.js`.

Current behavior:

- preview counts for units, contexts, vocabulary, and exercises;
- export a valid learning-content payload;
- keep imports local to the browser until a developer updates `public/data/learningUnits.json`.

When editing this flow, update `tests/learningContentAdmin.test.js` and keep validation in `src/data/learningContentValidation.js` as the final gate.

## Updating Production Prompts and Attempts

1. Edit prompts in `src/data/productionPrompts.js`.
2. Keep prompt text short and practical (daily habits, work context, speaking tasks, writing tasks).
3. Keep `mode`, `tenseId`, and `rubric` aligned with available labels in the UI.
4. Update status labels in `src/i18n.js` and `PRODUCTION_STATUSES` together.
5. Update `tests/productionPrompts.test.js` when prompt structure, statuses, or tense links change.
6. Run `npm.cmd test` and `npm.cmd run build` after any structural prompt changes.

## Updating Learning Path

Learning path logic lives in `src/learningPath.js`.

Current statuses:

- `notStarted`
- `inProgress`
- `completed`

Home uses `getNextLearningStep` to decide whether the learner should open Theory, Practice, or Individual next. Settings can reset the current unit progress. Update `tests/learningPath.test.js` with any rule change.

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
