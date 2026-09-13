# Testing And Pre-Deployment Quality Gates

## Mandatory Rule

Before every deployment, each category below must be recorded as `PASS`, justified `NOT APPLICABLE`, or an approved time-bounded `EXCEPTION`. Missing evidence blocks deployment.

| # | Category | Current evidence | Maturity |
| --- | --- | --- | --- |
| 1 | Acceptance | Release checklist and mobile learner flow | Automated + manual |
| 2 | Unit | `npm test` | Automated |
| 3 | Properties and invariants | All verb/subject/tense combinations, level monotonicity, answer normalization, and progress backup round trips | Automated |
| 4 | Mutation | Stryker command runner for practice scoring; 43/43 mutants killed | Automated |
| 5 | Fuzzing | `npm run test:fuzz`: 1,130 deterministic unsafe payloads across all three JSON channels | Automated |
| 6 | Integration | Content, path, journey, administration, and browser-storage recovery interactions | Partial |
| 7 | Contract | JSON validators and compatibility tests | Automated |
| 8 | End-to-end | `npm run test:e2e:mobile` | Automated |
| 9 | Regression | Tests, audits, build, and mobile smoke | Automated |
| 10 | Security | Validation, dependency audit with 0 known vulnerabilities, and security checklist | Automated + manual |
| 11 | Concurrency and resilience | Pages concurrency and local failure paths | Partial |
| 12 | Performance and resources | Timing, 500-verb smoke, and enforced JavaScript/CSS bundle budgets | Automated + manual |
| 13 | Compatibility and deployment | Build, mobile viewport, Pages, Capacitor | Partial |

## Automated Gate

`npm run release:check` runs whitespace and script checks, content and translation audits, Node tests, mutation testing, deterministic JSON fuzzing, production build, bundle budgets, and mobile E2E. CI and Pages additionally run `npm audit --omit=dev --audit-level=high`.

## Evidence Template

Record release candidate, commit, date, owner, one result and evidence line for categories 1 through 13, then an `APPROVE` or `REJECT` decision.

## Backlog

- Extend mutation testing from practice scoring to selected conjugation rules.
- Extend fuzzing whenever a new external-data channel is introduced.
- Add PWA cache-upgrade and offline-recovery integration tests.
- Add published production health checks.
