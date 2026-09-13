# API And Data Contracts

SmartTense has no HTTP application API. Its external contracts are static assets, JSON imports/exports, and browser-local persistence.

## Static Contracts

| Resource | Purpose | Validator |
| --- | --- | --- |
| `public/data/verbs.json` | Verb database | `src/data/validation.js` |
| `public/data/learningUnits.json` | Curriculum and exercises | `src/data/learningContentValidation.js` |
| `public/docs/dario-general-english-course.pdf` | A2 manual | Static asset |

## Internal Contracts

- `conjugation.js`: grammatical rows.
- `practice.js`: exercise extraction and scoring.
- `learningJourney.js`: resumable unit state.
- `skillMastery.js`: mastery, review timing, and mistake IDs.
- `adaptiveReview.js`: deterministic review queues.
- `learningPath.js`: curriculum order and recommendations.

The browser key `smarttense-progress-v1` stores local progress. Contract changes require validator updates, compatibility tests, documentation, and migration notes.
