# SmartTense Current Status

Last updated: 2026-09-13

## Active State

- Current implemented phase: **Phase 23 - Visual Documentation and GitHub Pages Release**.
- Status: local release gate and dependency audit passed; remote Pages publication is the active delivery step.
- Development URL normally used by the project: `http://127.0.0.1:5178/`.
- Source project path: `C:\Projects\SmartTense`.

## What Was Implemented

- Searchable unified verb selector in Complete filters.
- Action-oriented Home, Course, Progress, Guided Lesson, Focused Practice, and Adaptive Review already exist.
- Home smart resume now uses the pending unit step.
- Practice keeps final feedback visible and supports immediate retry.
- Incorrect exercises are stored in `skillProgress[skillId].mistakeExerciseIds`.
- Adaptive Review prioritizes recent mistakes and clears them after correction.
- Home and Progress expose pending mistake review.

## Validation Status

Initially pending in the Phase 20 implementation session; completed on 2026-07-27:

- `npm test`
- `npm run build`
- `npm run test:e2e:mobile`
- Manual mobile review at approximately `390x844`

Phase 20 automated validation is now closed; the successful evidence is recorded below.

## A1/A2 Pedagogical Review Closure - 2026-07-31

- Phase 19 is closed retrospectively with current evidence.
- All 7 A1/A2 units are guided-lesson ready.
- A1/A2 content has curated options, complete required practice coverage, 0 warnings and 0 context gaps.
## Phase 22 Local Validation - 2026-07-31

- `npm run release:check` passed.
- Content audit passed: 10 units, 213 exercises, 0 errors, 0 warnings, 10/10 methodology-ready units.
- Spanish learner-guide audit passed: 100 verbs and 1,200 translated forms.
- Automated tests passed: 95/95.
- Production build and the 12-screen mobile smoke journey passed.
- The external dependency audit is pending explicit authorization because it sends dependency metadata to the package registry.
- Remote CI and GitHub Pages validation remain pending until these local changes are published.

## Next Recommended Work

1. Publish Phase 23 and confirm the remote CI, custom domain, and GitHub Pages workflow.
2. Add PWA cache-upgrade and offline-recovery integration coverage.
3. Select the project license with the owner.
4. Plan the private-server migration separately if GitHub Pages no longer meets product needs.
## Pronunciation Practice - Implemented Locally 2026-07-31

- Guided Lesson can play each pronunciation drill or the complete drill set with the device English voice.
- Learners can choose slow or normal playback and mark individual drills as practiced.
- Pronunciation completion is stored inside the existing per-unit local journey.
- The feature does not request microphone access and remains usable as a read-and-repeat activity when device speech is unavailable.
- Unit tests cover speed selection, English voice selection, playback configuration and cancellation.
- Post-change validation passed: 98/98 tests, production build and the 12-screen mobile smoke journey.
## Progress Backup And Restore - Validated 2026-07-31

- Settings exports a versioned smarttense-progress-backup JSON file.
- The backup includes unit, skill, guided journey, diagnostic, visited verb and production-attempt history.
- Import validates the data channel, schema, date, fields, depth, collection sizes and unsafe keys before confirmation.
- Import does not replace interface language, visual preferences, the verb database or course content.
- Validation passed: 101/101 tests, production build and the 12-screen mobile smoke journey.
## Installable And Offline PWA - Validated 2026-07-31

- Production builds register a native service worker; development builds unregister service workers to prevent stale localhost behavior.
- The manifest supports standalone installation with standard and maskable SmartTense icons.
- The initial offline shell includes the application entry, curriculum, verb database and essential brand assets.
- Navigation uses network-first fallback; versioned resources and learning data use stale-while-revalidate.
- Validation passed: 104/104 tests, production build and the 12-screen mobile smoke journey.
- Published installability and offline behavior still require confirmation after the next remote deployment.
## Documentation Recovery And Navigation - 2026-09-09

- Restored `AGENTS.md`, `CURRENT_STATUS.md`, `CHANGELOG.md`, `CONTRIBUTING.md`, and `THIRD_PARTY_LICENSES.md` to the repository root.
- Kept `docs/SECURITY.md` as the canonical security document and recreated `docs/CURRENT_STATUS.md` as a compatibility link.
- Fixed the Markdown generator so unrecognized or incomplete list lines cannot create an infinite loop.
- `npm run build:docs` generated 31 pages with 0 broken local Markdown links.
- The regular one-command development startup generated documentation and started Vite successfully in 217 ms on a temporary port.
- Release validation passed content and translation audits, 107/107 automated tests, documentation generation, and the production build.
- The final mobile smoke remains pending: port 5174 belonged to another project, and Chrome later stopped producing progress on an alternate port.

## Key Files

- `src/FocusedPracticePage.jsx`: one-question Practice flow and retry.
- `src/skillMastery.js`: mastery plus persistent mistake IDs.
- `src/adaptiveReview.js`: deterministic review priority.
- `src/AdaptiveReviewPage.jsx`: review session UI.
- `src/LearningHubPages.jsx`: Home, Course, and Progress presentation.
- `src/App.jsx`: application state, persistence, routing, and orchestration.
- `docs/PHASE_EXECUTION_LOG.md`: chronological phase evidence.
- `src/browserStorage.js`: bounded and failure-tolerant browser persistence.

## Deterministic JSON Fuzzing - 2026-09-09

- `npm run test:fuzz` exercises the verb, learning-content, and progress-backup validation boundaries.
- The pseudo-random generator is reproducible with `SMARTTENSE_FUZZ_SEED`.
- Baseline result: 1,130/1,130 generated unsafe payloads rejected in 159 ms with seed `1397571922`.
- The release gate now includes deterministic fuzzing.

## Browser Persistence And Mobile Bundle Guard - 2026-09-09

- Browser storage now rejects malformed, unsafe, excessively deep, cyclic, or oversized settings while preserving graceful recovery.
- Automated persistence tests cover successful round trips, unavailable storage, quota failures, and clear failures.
- `npm test` passed 117/117 tests and the production build passed.
- `npm run check:bundle` enforces a 500 kB JavaScript-file limit and a 100 kB combined CSS limit after production builds.

## Visual Documentation And GitHub Pages Release - 2026-09-13

- Added reproducible real-application screenshots for Home, Course, Practice, and Complete.
- README and the learner guide now use the screenshots; the static documentation builder publishes them under `/docs/images/`.
- Added `public/CNAME` for `smarttense.innovalogic.tech`.
- Confirmed Docker is not required for the current static GitHub Pages architecture.
- Updated five vulnerable transitive packages and pinned `qs` 6.16.0 for the Stryker toolchain without forced upgrades.
- `npm audit` reports 0 vulnerabilities.
- `npm run release:check` passed: 10/10 methodology-ready units, 213 exercises, 1,200 translations, 117/117 tests, 43/43 mutants, 1,130 fuzz cases, production build, bundle budgets, and the 12-screen mobile journey.

## Phase 21 - A2 Course Manual

- Added a Manual destination to the main application menu.
- Bundled the original 57-page Dario A2 course PDF under `public/docs/`.
- Added an embedded desktop PDF reader and mobile open/download actions.
- Added English and Spanish interface labels.
- Automated build and mobile validation passed on 2026-07-31 as part of `npm run release:check`.

## Validation Update - 2026-07-27

- `npm test`: 95 tests passed.
- `npm run build`: production build passed after the Smart Resume correction.
- `npm run test:e2e:mobile`: quality gates passed at `390x844` with 500 synthetic verbs.
- Accessibility checks reported a main landmark, named navigation, document language, named buttons, and labeled fields.
- Horizontal overflow was zero on Home, primary mobile navigation, and Guided Lesson.
- Smart Resume initially skipped an unfinished Guided Lesson; `App.jsx` was corrected to derive the destination from `journeyProgress`, and the repeated mobile smoke passed.
- The official mobile smoke now opens Manual, validates its mobile card, confirms the local PDF link, verifies the embedded viewer is hidden at `390x844`, and checks zero horizontal overflow.
- Manual is listed explicitly among the 12 covered screens. Physical-device review remains optional.

## Phase 22 - Documentation And Pre-Deployment Quality Governance

- Canonical engineering documents, ADRs, GitHub templates, CI, changelog, contribution guide, third-party license inventory, and environment example added.
- All 13 test categories are mandatory pre-deployment review items.
- CI and Pages run the release gate and high-severity production dependency audit.
- Project license selection remains an owner decision.
