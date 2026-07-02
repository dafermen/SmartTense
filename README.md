# SmartTense

SmartTense is an English verb tense trainer built with React, Vite, and Capacitor. It helps learners explore affirmative, negative, interrogative, and negative interrogative forms without seeing every tense at once.

The app is designed for two audiences:

- English learners who want a simple practice table with learner-language guidance.
- Developers who want a small, readable React project that can run on web, iPhone, and Android.

## Features

- Learning levels: Basic, Intermediate, and Advanced.
- Verb pattern filter: Regular -ED, AAA, ABB, ABC, ABA, BE, and Modal.
- Search by verb label, learner-language meaning, principal forms, complement, or pattern.
- Tense groups: Present, Past, Future, and Conditional.
- Affirmative, negative, interrogative, and negative interrogative forms.
- English and Spanish interface, with Spanish and French learner-language guides.
- Responsive layout with mobile practice cards.
- Local JSON verb data with hardened import support for custom verb lists.
- CSV and JSON export.
- Capacitor projects for iOS and Android.

## Screens And Main Flow

1. Search or choose a verb from the filter panel above the table.
2. Filter by verb pattern, learning level, subject, or tense group.
3. Review the table on desktop or practice cards on mobile.
4. Use the collapsible left menu to switch between Home, Documentation, and About.
5. Export the result as CSV or JSON if needed.

## Tech Stack

- React 19
- Vite 8
- Capacitor 8
- Node native test runner
- Plain CSS

## Project Structure

```text
SmartTense/
├── android/                    Android Capacitor project
├── ios/                        iOS Capacitor project
├── public/
│   ├── assets/                 Static visual assets
│   └── data/verbs.json         Default editable verb data
├── src/
│   ├── App.jsx                 Main React interface and app state
│   ├── conjugation.js          Verb tense generation engine
│   ├── i18n.js                 English/Spanish UI strings
│   ├── learnerLanguages/       Learner-language explanations and translations
│   ├── styles.css              Responsive visual design
│   └── data/
│       ├── defaultData.js      Embedded fallback data and tense metadata
│       └── validation.js       JSON import validation
├── tests/                      Unit tests for grammar and validation
├── .github/workflows/          GitHub Pages deployment workflow
├── capacitor.config.json       Capacitor app settings
├── package.json                Scripts and dependencies
└── README.md                   Project overview
```

## Requirements

- Node.js 20 or newer recommended.
- npm.
- Xcode for iOS builds.
- Android Studio for Android builds.
- JDK 21 for the Android Gradle build used by the generated Capacitor project.

## Run Locally

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the URL shown by Vite, usually `http://127.0.0.1:5173/` or the next available port.

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

For a normal GitHub Pages project URL such as
`https://YOUR_GITHUB_USER.github.io/REPOSITORY_NAME/`, enable GitHub Pages with
`GitHub Actions` as the source and push to `main`.

For a custom subdomain such as `smarttense.example.com`, point a DNS `CNAME`
record to `YOUR_GITHUB_USER.github.io`, set the repository variable
`PAGES_BASE_PATH` to `/`, and configure the custom domain in repository
`Settings` -> `Pages`.

See `docs/GITHUB_PAGES.md` for the full step-by-step guide.

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

Native app settings live in:

```text
capacitor.config.json
```

Current native app id:

```text
com.smarttense.app
```

Change this id before publishing if you have a final App Store or Play Store bundle identifier.

## Data

Default verb data lives in:

```text
public/data/verbs.json
```

The app also includes embedded fallback data in:

```text
src/data/defaultData.js
```

The fallback data keeps the app usable if the browser cannot load `public/data/verbs.json`. Imported JSON only changes the current browser session; it does not overwrite project files.

Imported JSON is validated before it reaches app state. SmartTense rejects oversized files, unknown fields, unsupported schema versions, duplicate IDs, unsafe IDs, non-string fields, and strings that are too long or contain markup characters.

## JSON Shape

```json
{
  "schemaVersion": 1,
  "updatedAt": "2026-06-28",
  "verbs": [
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
  ]
}
```

`meaningEs` and `objectEs` are still supported for current Spanish learner data. New data can also use `meanings` and `objects` maps so future learner languages, such as French, can be added without changing the schema again.

For more detail about custom data files, see `docs/DATA_SCHEMA.md`.

## Documentation

- `docs/USER_GUIDE.md`: plain-language guide for learners and non-technical users.
- `docs/DEVELOPER_GUIDE.md`: architecture, scripts, testing, and mobile build notes.
- `docs/DATA_SCHEMA.md`: JSON format for adding or importing verbs.
- `docs/GITHUB_PAGES.md`: web publishing guide for GitHub Pages and custom subdomains.
- `SECURITY.md`: static hosting security model, JSON import limits, and publishing checklist.

## Current Build Notes

- Web tests pass with `npm test`.
- Web build and Capacitor sync pass with `npm run cap:sync`.
- iOS build was verified with Xcode command-line tools.
- Android native build requires JDK 21. If Android compilation fails with `invalid source release: 21`, switch your Java environment to JDK 21 and run the Gradle build again.

## License

No license has been selected yet. Add a `LICENSE` file before publishing if this repository will be public.
