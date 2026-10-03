# Deployment

## Required Gate

1. Complete all 13 categories in `TESTING.md`.
2. Run `npm ci`.
3. Run `npm run release:check`.
4. Run `npm audit --omit=dev --audit-level=high`.
5. Complete `RELEASE_CHECKLIST.md`.
6. Update `CHANGELOG.md` and `CURRENT_STATUS.md`.

## Current Test Server — 2026-10-03

The owner authorized publishing the validated documentation/application build on the existing test server. The canonical demo is https://smarttense.innovalogic.tech/ and documentation is https://smarttense.innovalogic.tech/docs/. DNS already pointed to that server; no DNS changes were made.

Nginx serves static files from `/var/www/smarttense.innovalogic.tech/current`, a symlink to an immutable release. The initial release is `releases/20261003-c314914`, built from source `c314914debd7f872e47de6ae012348e9d7dcadd7` with base `/`. It has no backend and preserves browser-local progress. HTTPS uses a domain certificate managed by the existing Certbot renewal service. No credentials belong in Git.

Future releases must pass the required gate above, build with root base `/`, transfer only the verified `dist/` artifacts into a new release directory, preserve the current target for rollback, and atomically switch `current`. Keep the existing Nginx `/docs/` directory routing and ACME challenge route. Check valid HTTPS, root assets, documentation search/navigation, and desktop/mobile layouts after switching. Restore the previous symlink target if checks fail. Never upload `.env`, source dependencies or private user data.

## GitHub Pages Artifact

The existing Pages workflow still builds on pushes to `main`. It is a secondary artifact and **does not update the test server**. `PAGES_BASE_PATH=/` remains appropriate for a root-domain build. Do not claim the canonical domain was updated merely because the Pages workflow passed. A future switch back to Pages requires a deliberate DNS/hosting decision.

## Recorded Verification

The Linux release gate and production dependency audit passed before the initial server release. Public HTTPS and exact root/documentation assets passed; Chrome at 1440px and 390px passed reader, theme and overflow checks. The previous domain state was an unmatched certificate, not a working server release. Deployment evidence and server rollback records are retained centrally in `/var/backups/documentation-navigation-20261003-v1/smarttense`.

## Rollback

For the test server, restore the previous `current` symlink target and verify HTTPS, app assets and `/docs/`. Correct the source with a new commit and record the incident. A Pages-only rollback changes the secondary artifact, not the canonical server. Do not rewrite shared history.

Run `npm run cap:sync` only after the web gate passes; native signing and store delivery require a separate checklist.
