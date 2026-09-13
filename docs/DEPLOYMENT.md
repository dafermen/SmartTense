# Deployment

## Required Gate

1. Complete all 13 categories in `TESTING.md`.
2. Run `npm ci`.
3. Run `npm run release:check`.
4. Run `npm audit --omit=dev --audit-level=high`.
5. Complete `RELEASE_CHECKLIST.md`.
6. Update `CHANGELOG.md` and `CURRENT_STATUS.md`.

## GitHub Pages

Pushes to `main` trigger `.github/workflows/deploy-pages.yml`. Pages uses GitHub Actions and the custom domain `https://smarttense.innovalogic.tech/`.

The deployment artifact includes `public/CNAME`, and the repository variable `PAGES_BASE_PATH` must be `/` for the custom subdomain.

## Current DNS Cutover

The GitHub Pages workflow and certificate are configured for `smarttense.innovalogic.tech`. The external DNS must expose `CNAME smarttense -> dafermen.github.io`. As of 2026-09-13, the subdomain still resolves through an A record to an Ubuntu/Nginx server, so HTTPS verification of the Pages content remains blocked until the DNS record is changed by the domain administrator.

## Docker And Private Server

Docker is not required for the current GitHub Pages deployment because SmartTense has no application backend and produces static files in `dist/`. A future private-server deployment can serve that directory with Nginx, Caddy, or a small container, but it should be treated as a separate migration with TLS, rollback, health checks, and server-access review. Do not copy or publish SSH keys.

## Rollback

Revert the faulty commit with a new commit, push `main`, monitor Pages, verify both URLs, and record the incident. Do not rewrite shared history.

Run `npm run cap:sync` only after the web gate passes; native signing and store delivery require a separate checklist.
