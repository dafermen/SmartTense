# SmartTense Agent Guide

## Start Here

1. Read `docs/CURRENT_STATUS.md`.
2. Read `docs/INDEX.md` only for the documentation relevant to the task.
3. Treat `src/` and `public/` as the web source of truth; `android/` and `ios/` wrap the built app.

## Current Product Rules

- Primary learner flow: Home -> Guided Lesson -> Practice -> Production.
- Keep learner progress local; do not add accounts or a backend without a separate approved phase.
- Curriculum content belongs in `public/data/learningUnits.json`, not hard-coded React components.
- Verb data must stay aligned between `public/data/verbs.json` and `src/data/defaultData.js`.
- Reuse `journeyProgress` for resumable unit state and `skillProgress` for mastery and mistake review.
- Add learner-facing interface text to both languages in `src/i18n.js`.
- Preserve the mobile-first experience around 390px width.

## Working Agreement

- Do not duplicate Guided Lesson, Focused Practice, Adaptive Review, Course, or Progress. Extend their existing modules.
- Update `docs/CURRENT_STATUS.md` and `docs/PHASE_EXECUTION_LOG.md` after meaningful work.
- Record commands actually run; never mark validation complete without evidence.
- Development command: `npm run dev -- --port 5178 --host`.
- Full release gate: `npm run release:check`.
