# SmartTense Developer Guide

This guide explains how the source code is organized and how to work on the app safely.

## Architecture

SmartTense is intentionally small. Most of the behavior is split into three areas:

- `src/App.jsx`: React state, controls, import/export, and rendering.
- `src/conjugation.js`: grammar engine that generates sentence rows.
- `src/learnerLanguages/`: learner-language translations, usage notes, and explanations.
- `src/data/`: default data, tense metadata, and JSON validation.

The app loads editable verb data from `public/data/verbs.json`. If that request fails, it uses the embedded `DEFAULT_DATA` from `src/data/defaultData.js` so the UI can still run.

## Main Data Flow

1. `App.jsx` loads verb data with `fetch('/data/verbs.json')`.
2. `validateVerbData` checks the JSON shape before state is updated.
3. The selected verb, search text, verb pattern, subject, level, and group are stored in React state.
4. Search and pattern filtering reduce the verb list shown in the top filter panel.
5. `getVerbSummary` and `classifyVerbPattern` power the verb pattern filter.
6. `getTensesByGroup` filters the visible tenses by group and learning level.
7. `buildRows` generates the affirmative, negative, interrogative, and negative interrogative sentences.
8. `src/learnerLanguages/` adds learner-language translations and usage notes to the generated rows.
9. The same rows are rendered as a desktop table and as mobile cards.

## Important Source Files

### `src/App.jsx`

Owns user interaction. This file should stay focused on state and rendering, not grammar rules.

Key responsibilities:

- Load default JSON data.
- Handle imports and exports, including client-side file checks before import.
- Track filters.
- Keep interface language and learner language as separate settings.
- Render desktop and mobile views.

### `src/conjugation.js`

Owns sentence generation. Add or adjust tense behavior here.

Important functions:

- `buildRows`: returns table-ready row objects.
- `getTensesByGroup`: applies learning level and tense group filters.
- `conjugateRegular`: handles normal verbs.
- `conjugateBe`: handles `to be`, because it does not follow normal auxiliary rules.
- `conjugateModal`, `conjugateCan`, `conjugateShould`: handle modal-style examples.
- `classifyVerbPattern`: classifies principal verb forms as `AAA`, `ABB`, `ABC`, `ABA`, or `REGULAR_ED` for future filtering and study groups.

### `src/learnerLanguages/`

Owns explanations for the student's first language. The English grammar engine should not contain Spanish, French, or other learner-language rules directly.

Current files:

- `index.js`: registry of supported learner languages.
- `es.js`: Spanish translations, Spanish subject labels, and Spanish usage notes.
- `fr.js`: French translations, French subject labels, and French usage notes.

To add another learner language later, create a language module with the same methods as `es.js`, register it in `index.js`, and add tests for its sentence translations and usage notes.

### `src/data/defaultData.js`

Contains:

- Built-in verbs.
- Subject metadata.
- Tense definitions.
- Learning levels.

### `src/data/validation.js`

Protects the app from invalid imported JSON. Validation intentionally rejects
oversized collections, unknown fields, unsupported schema versions, unsafe IDs,
markup-like strings, and fields that exceed length limits.

## Scripts

```bash
npm run dev
```

Starts the Vite dev server.

```bash
npm test
```

Runs unit tests with Node's native test runner.

```bash
npm run build
```

Creates the production web build in `dist/`.

```bash
npm run cap:sync
```

Builds the web app and syncs `dist/` into the iOS and Android Capacitor projects.

The GitHub Pages workflow uses the same build command with a Vite `--base`
argument. See `docs/GITHUB_PAGES.md` before changing deployment settings.

```bash
npm run cap:open:ios
npm run cap:open:android
```

Opens the native projects in Xcode or Android Studio.

## Testing Guidance

Add tests when changing:

- Conjugation output.
- Learning level filtering.
- JSON validation.
- Import/export behavior that can be isolated from the browser.

The current tests focus on the grammar engine and JSON validation because those areas are easiest to regress silently.

## Adding A Tense

1. Add the tense entry to `TENSES` in `src/data/defaultData.js`.
2. Add the generation template in `src/conjugation.js` for regular verbs.
3. Check whether `be`, `can`, or `should` need custom handling.
4. Add or update tests in `tests/conjugation.test.js`.

## Security Notes

SmartTense is safest when published as a static site. Imported JSON is read only
inside the user's browser and never writes to server files.

Before publishing, review:

- `SECURITY.md` for the security model and publishing checklist.
- `public/_headers` for static hosting security headers.
- `src/data/validation.js` when adding new JSON fields.
- `docs/GITHUB_PAGES.md` for GitHub Pages, custom subdomains, and the Vite
  `base` path used by deployment.

If a new JSON field is added, update `ALLOWED_VERB_KEYS`, documentation, and
validation tests in the same change.

## Adding A Verb

For built-in data, update `public/data/verbs.json` and `src/data/defaultData.js`. Keeping both in sync preserves the fallback behavior.

For temporary user testing, use the Import JSON button in the app.

See `docs/DATA_SCHEMA.md` for the accepted fields.

Verb pattern classification is calculated from `base`, `past`, and `participle`. Do not store `AAA`, `ABB`, or `ABC` manually unless the data model changes later.

## Capacitor Notes

The source of truth for the web UI remains `src/` and `public/`. The native projects wrap the built web app.

After changing web code, run:

```bash
npm run cap:sync
```

Android builds require JDK 21 with the generated Capacitor/Android Gradle configuration. If Gradle reports `invalid source release: 21`, set `JAVA_HOME` to a JDK 21 installation or configure Android Studio to use JDK 21.

## Before Publishing To GitHub

1. Confirm `.gitignore` excludes generated output such as `node_modules/`, `dist/`, and native build folders.
2. Choose a license and add a `LICENSE` file if the repository will be public.
3. Replace `com.smarttense.app` in `capacitor.config.json` with the final bundle id if needed.
4. Run `npm test` and `npm run build`.
5. Run `npm audit` and review dependency findings.
6. If publishing the web app, enable GitHub Pages with `GitHub Actions` as the
   source and review `docs/GITHUB_PAGES.md`.
7. Run `npm run cap:sync` if native projects should include the latest web build.
