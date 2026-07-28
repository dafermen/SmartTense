# SmartTense Current Status

Last updated: 2026-07-26

## Active State

- Current implemented phase: **Phase 21 - A2 Course Manual**.
- Status: automated validation passed, including direct mobile coverage of Manual; physical-device review is optional.
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

## Next Recommended Work

1. Run the Phase 20 validation commands and correct only confirmed regressions.
2. Review the new retry and mistake-review flow on a phone-sized viewport.
3. Resume Phase 19 content-gap review for A1/A2 after Phase 20 is validated.
4. Continue the remaining product backlog only as separately planned phases: pronunciation/audio, offline installability, and deeper content QA.

## Key Files

- `src/FocusedPracticePage.jsx`: one-question Practice flow and retry.
- `src/skillMastery.js`: mastery plus persistent mistake IDs.
- `src/adaptiveReview.js`: deterministic review priority.
- `src/AdaptiveReviewPage.jsx`: review session UI.
- `src/LearningHubPages.jsx`: Home, Course, and Progress presentation.
- `src/App.jsx`: application state, persistence, routing, and orchestration.
- `docs/PHASE_EXECUTION_LOG.md`: chronological phase evidence.

## Phase 21 - A2 Course Manual

- Added a Manual destination to the main application menu.
- Bundled the original 57-page Dario A2 course PDF under `public/docs/`.
- Added an embedded desktop PDF reader and mobile open/download actions.
- Added English and Spanish interface labels.
- Automated build and mobile validation have not been run for this phase.

## Validation Update - 2026-07-27

- `npm test`: 95 tests passed.
- `npm run build`: production build passed after the Smart Resume correction.
- `npm run test:e2e:mobile`: quality gates passed at `390x844` with 500 synthetic verbs.
- Accessibility checks reported a main landmark, named navigation, document language, named buttons, and labeled fields.
- Horizontal overflow was zero on Home, primary mobile navigation, and Guided Lesson.
- Smart Resume initially skipped an unfinished Guided Lesson; `App.jsx` was corrected to derive the destination from `journeyProgress`, and the repeated mobile smoke passed.
- The official mobile smoke now opens Manual, validates its mobile card, confirms the local PDF link, verifies the embedded viewer is hidden at `390x844`, and checks zero horizontal overflow.
- Manual is listed explicitly among the 12 covered screens. Physical-device review remains optional.
