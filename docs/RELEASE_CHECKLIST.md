# SmartTense Internal Release Checklist

Use this checklist before pushing a phase milestone or any change that touches navigation, mobile layout, Settings, learning content, or Production.

## Required Commands

Run the full release check:

```bash
npm run release:check
```

That command runs:

```bash
git diff --check
node --check scripts/mobile-smoke.cjs
npm test
npm run build
npm run test:e2e:mobile
```

If Chrome is not installed, record the blocker in `docs/PHASE_EXECUTION_LOG.md` and keep `npm test` plus `npm run build` green before pushing.

## Mobile Smoke Gates

`npm run test:e2e:mobile` must report:

- viewport `390x844`;
- 500 synthetic verbs;
- screens covered: Home, Theory, Practice, Individual, Complete, Production, Settings;
- Settings pagination from `1-25` to `26-50`;
- quality gates `passed: true`;
- accessibility: `hasMain`, `hasNamedNavigation`, `hasDocumentLanguage`;
- no unnamed visible buttons;
- no unlabeled visible fields.

## Screen Checklist

| Screen | Release check |
| --- | --- |
| Home | Shows active unit, recommended next step, current verb, example, progress, and quick actions. |
| Theory | Shows objectives, structures, examples, vocabulary/context filter, and opens without layout overflow on mobile. |
| Practice | Shows context filter, exercises, answer input, check action, reset action, and correct counter. |
| Individual | Shows affirmative-focused controls, tense/subject selectors, and readable output on mobile. |
| Complete | Shows filters, full table for desktop, mobile cards for small screens, and visible-form controls. |
| Production | Shows prompt composer, response/review fields, status selector, and revision queue. |
| Settings | Shows general settings, data manager, learning content manager, add verb, searchable/sortable/paginated data table, and edit/cancel/delete actions. |

## Documentation Checklist

- `docs/PHASE_EXECUTION_LOG.md`: active phase, tasks, evidence, risks, next block.
- `docs/CURRICULUM_PHASE_PLAN.md`: phase status, operational tasks, exit criteria, and internal Gantt updated when roadmap scope changes.
- `docs/INDEX.md`: documentation map updated when docs are added, removed, or consolidated.
- `README.md`: commands or release behavior updated when developer workflow changes.
- `docs/DEVELOPER_GUIDE.md`: implementation notes updated for developers.
- `docs/JUNIOR_DEVELOPER_GUIDE.md`: safe commands and touched files updated for junior developers.
- `docs/USER_GUIDE.md`: user-visible behavior updated when the learner flow changes.
- `docs/GITHUB_PAGES.md`: publishing checklist updated when release checks change.

## Release Notes

Use commit messages that describe the phase block, for example:

```text
Add mobile smoke accessibility gates
Update phase 9 release checklist
```
