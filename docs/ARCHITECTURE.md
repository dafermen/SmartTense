# Architecture

SmartTense is a local-first, content-driven English learning application. React and Vite produce the static web application; Capacitor wraps the same build for Android and iOS.

## Layers

1. UI orchestration: `src/App.jsx`.
2. Learning experiences: Guided Lesson, Practice, Adaptive Review, Course, Progress, Production, Complete, and Manual.
3. Domain logic: conjugation, scoring, journey, mastery, diagnostic, and quality rules.
4. Data contracts: `public/data/`, fallback data, and allow-list validators.
5. Delivery: Vite, Capacitor, GitHub Actions, and GitHub Pages.

## Repository Map

```text
.github/       CI, Pages, issue and pull-request templates
docs/          canonical guides, specialist guides, and ADRs
public/        deployable curriculum, verbs, and learner documents
scripts/       audits, migrations, and mobile smoke
src/           application and domain code
tests/         automated coverage and fixtures
android/ ios/  Capacitor wrappers
```

## Constraints

- Curriculum belongs in validated data, not duplicated React code.
- Learner progress remains local unless a backend phase is approved.
- Imported JSON is untrusted input.
- Mobile behavior around `390x844` is release-critical.
- Consequential decisions require an ADR.

See [API](API.md), [Testing](TESTING.md), and [Developer Guide](DEVELOPER_GUIDE.md).
