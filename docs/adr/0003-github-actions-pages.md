# ADR 0003: GitHub Actions Pages Deployment

Status: Accepted

## Decision
Use GitHub Actions as the Pages build source. Deployment requires the release gate and production dependency audit.

## Consequences
Production is reproducible from `main`; quality failures block release; DNS and the custom domain remain operational dependencies.
