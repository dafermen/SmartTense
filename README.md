# SmartTense

SmartTense is an English verb tense trainer built with React, Vite, and Capacitor. It helps learners study verb forms through a compact dashboard, focused affirmative practice, and a complete conjugation table.

The app is designed for two audiences:

- English learners who want clear examples with learner-language guidance.
- Developers who want a small React project that can run on the web, iPhone, and Android.

## Main Features

- Home dashboard with current verb summary, progress, quick actions, a live example, and a recommended next practice.
- Local learning path for the active unit, with next-step recommendation and unit progress reset.
- Theory view for the first Present Simple learning unit, rendered from structured JSON content.
- Context filter for Theory and Practice, with vocabulary packs and real-life examples.
- Practice view with starter exercises, local answer checking, immediate feedback, and context-aware filtering.
- Individual practice view focused on affirmative conjugation only.
- Complete view with affirmative, negative, interrogative, and negative interrogative forms.
- Expandable "Why this form?" explanations for generated sentence forms.
- Toggleable visible columns in Complete so users can reduce visual load.
- Multi-select tense and subject controls in Individual.
- Learning levels: Basic, Intermediate, and Advanced.
- Verb pattern filter: Regular -ED, AAA, ABB, ABC, ABA, BE, and Modal.
- Search by verb label, learner-language meaning, principal forms, complement, or pattern.
- Tense groups: Present, Past, Future, and Conditional.
- English and Spanish interface, with Spanish and French learner-language guides.
- Responsive layout optimized for desktop and mobile.
- Speaking and writing workspace for production practice with local revision tracking.
- Local JSON verb data with hardened import support for custom verb lists.
- Learning content import/export in Settings, with validation and preview before applying.
- CSV and JSON export from Complete.
- Capacitor projects for iOS and Android.

## Screens And Main Flow

1. Start on Home to see progress, the current verb, a short example, and the recommended next learning step.
2. Open Theory when you want a short lesson with objectives, structures, signal words, common mistakes, context examples, vocabulary, and starter practice preview.
3. Open Individual when you want focused affirmative practice with selected tenses and subjects.
4. Open Practice when you want starter exercises with immediate feedback, context filtering, and local unit completion.
5. Open a "Why this form?" panel when you want the pattern, reason, auxiliary, and verb-form explanation for a generated sentence.
6. Open Complete when you want the full table and comparison across sentence forms.
7. Use Display options to show translations, sentence parts, all subjects, or selected Complete columns.
8. Open Production to respond to speaking or writing prompts and track each attempt by status.
9. Export CSV or JSON from Complete if you need a generated table snapshot.

## Tech Stack

- React 19
- Vite 8
- Capacitor 8
- Node native test runner
- Plain CSS

## Project Structure

```text
SmartTense/
  android/                    Android Capacitor project
  ios/                        iOS Capacitor project
  public/
    assets/                   Static visual assets
    data/verbs.json           Default editable verb data
    data/learningUnits.json   Structured learning content, contexts, vocabulary, Theory, and Practice
  src/
    App.jsx                   Main React interface, app state, and local data/content manager
    conjugation.js            Verb tense generation engine
    i18n.js                   English/Spanish UI strings
    learningContentAdmin.js   Learning-content summary, clone, and export helpers
    learnerLanguages/         Learner-language guidance
    styles.css                Responsive visual design
    data/
      defaultData.js          Embedded fallback data and tense metadata
      validation.js           JSON import validation
      learningContentValidation.js  Learning content validation
  tests/                      Unit tests for grammar and validation
  docs/                       User, developer, data, and GitHub guides
  .github/workflows/          GitHub Actions workflows
  capacitor.config.json       Capacitor app settings
  package.json                Scripts and dependencies
  README.md                   Project overview
```

## Requirements

- Node.js 20 or newer recommended.
- npm.
- Xcode for iOS builds.
- Android Studio for Android builds.
- JDK 21 for the Android Gradle build used by the generated Capacitor project.

## Run Locally On Windows

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the URL shown by Vite, usually `http://127.0.0.1:5173/` or the next available port.

If PowerShell blocks `npm.ps1`, run npm through `npm.cmd`:

```powershell
npm.cmd install
npm.cmd run dev
```

## Test And Build

Run unit tests:

```bash
npm test
```

Create a production web build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Publish To GitHub Pages

SmartTense includes a GitHub Actions workflow for GitHub Pages:

```text
.github/workflows/deploy-pages.yml
```

For a normal GitHub Pages project URL such as `https://YOUR_GITHUB_USER.github.io/REPOSITORY_NAME/`, enable GitHub Pages with `GitHub Actions` as the source and push to `main`.

For a custom subdomain such as `smarttense.example.com`, point a DNS `CNAME` record to `YOUR_GITHUB_USER.github.io`, set the repository variable `PAGES_BASE_PATH` to `/`, and configure the custom domain in repository `Settings` -> `Pages`.

See `docs/GITHUB_PAGES.md` for the full guide.

## Mobile Builds With Capacitor

SmartTense includes native Capacitor projects for iOS and Android. The web app is built into `dist/`, then Capacitor copies that output into the native projects.

Build and sync both native projects:

```bash
npm run cap:sync
```

Open the iOS project in Xcode:

```bash
npm run cap:open:ios
```

Open the Android project in Android Studio:

```bash
npm run cap:open:android
```

Native app settings live in `capacitor.config.json`.

Current native app id:

```text
com.smarttense.app
```

Change this id before publishing if you have a final App Store or Play Store bundle identifier.

## Data

Default verb data lives in `public/data/verbs.json`.

Structured learning content lives in `public/data/learningUnits.json`. Theory renders this file in the app. It is validated by `src/data/learningContentValidation.js` and currently includes a Present Simple foundation unit with theory, structures, common mistakes, examples, and starter exercises.

Learning contexts also live in `public/data/learningUnits.json`. The current context catalog includes IT work, daily habits, family routines, meetings, travel/vacation, and prepositions. Theory and Practice can filter examples, vocabulary, and exercises by context.

Settings can import, preview, validate, apply, and export learning-content JSON for the current browser session. Use the exported JSON when `public/data/learningUnits.json` should be updated in source control.

The app also includes embedded fallback data in `src/data/defaultData.js`. The fallback keeps the app usable if the browser cannot load `public/data/verbs.json`.

Imported JSON and Settings edits only change the current browser session; they do not overwrite project files. Imported JSON is validated before it reaches app state. SmartTense rejects oversized files, unknown fields, unsupported schema versions, duplicate IDs, unsafe IDs, non-string fields, and strings that are too long or contain markup characters.

Learning path progress is also local to the current browser. It tracks whether the active unit's Theory has been viewed and whether its Practice exercises have been completed.

For the accepted JSON shape, see `docs/DATA_SCHEMA.md`.

For the accepted learning-content shape, see `docs/LEARNING_CONTENT_SCHEMA.md`.

## Documentation

- `docs/USER_GUIDE.md`: guide for learners and non-technical users.
- `docs/DEVELOPER_GUIDE.md`: architecture, scripts, testing, and mobile build notes.
- `docs/DATA_SCHEMA.md`: JSON format for adding or importing verbs.
- `docs/LEARNING_CONTENT_SCHEMA.md`: JSON format for learning units, contexts, vocabulary, examples, and exercises.
- `docs/JUNIOR_DEVELOPER_GUIDE.md`: safe first steps for new contributors.
- `docs/PROJECT_PHASE_ROADMAP.md`: phased product and software development roadmap.
- `docs/PROJECT_PHASE_EXECUTION_PLAN_FROM_DARIO.md`: roadmap ejecutivo + tareas operativas por fases con Gantt interno, basado en el documento de Dario.
- `docs/PHASE_EXECUTION_LOG.md`: registro de ejecución por fases y evidencia por entrega.
- `docs/DEVELOPMENT_PHASE_EXECUTION_PLAN.md`: roadmap ejecutivo y operativo con criterios de salida por fase.
- `docs/GITHUB_PAGES.md`: GitHub Pages and repository publishing guide.
- `docs/DEVELOPMENT_ROADMAP_INCREMENTAL.md`: phased execution roadmap with executive goals, operational tasks, and an internal Gantt plan.
- `SECURITY.md`: static hosting security model, JSON import limits, and publishing checklist.

## Current Validation

Before publishing a change, run:

```bash
npm test
npm run build
```

For native wrapper updates, also run:

```bash
npm run cap:sync
```

## License

No license has been selected yet. Add a `LICENSE` file before publishing if this repository will be public.
