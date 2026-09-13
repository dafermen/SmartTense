# Development

## Setup

```bash
npm ci
npm run dev -- --port 5178 --host
```

Use Node.js 20 or newer and Chrome for mobile E2E checks.

## Commands

- `npm test`: Node tests.
- `npm run audit:content`: curriculum audit.
- `npm run audit:translations`: Spanish guide audit.
- `npm run test:e2e:mobile`: mobile acceptance smoke.
- `npm run build`: production build.
- `npm run release:check`: complete local release gate.

## Workflow

1. Read `AGENTS.md`, `CURRENT_STATUS.md`, and the relevant ADR.
2. Make the smallest coherent change.
3. Update tests and documentation together.
4. Complete the test matrix in `TESTING.md`.
5. Run the release gate before deployment.

Keep curriculum in data files, keep public/fallback verbs aligned, and update English and Spanish UI labels together.
