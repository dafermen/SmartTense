# Operations

SmartTense is static: availability depends on GitHub Pages, DNS, TLS, static assets, and browser execution.

## Health Checks

- Production root and core assets return HTTP 200.
- Verb, curriculum, and A2 manual resources load.
- Home, Practice, and Manual render at phone size.
- The latest Pages workflow succeeded.

## Incident Flow

Confirm scope, inspect the latest workflow and commit, reproduce locally and in production, roll back learner-impacting failures, fix with tests, and record root cause and prevention.

Learner data remains browser-local. Clearing site data removes progress; cloud recovery and synchronization are not available.
