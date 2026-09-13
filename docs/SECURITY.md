# Security Policy

SmartTense is designed to run as a static frontend application. It does not need a custom server, database, login system, or server-side file uploads for the web version.

## Security Model

- The production web app can be hosted as static files on platforms such as Cloudflare Pages, Netlify, Vercel, or GitHub Pages.
- Imported JSON files and Settings data edits are handled only in the user's browser session.
- Imported JSON and Settings edits never overwrite `public/data/verbs.json`, `src/data/defaultData.js`, or any server-side file.
- Local progress is stored in the user's browser storage and is not uploaded to a server.
- The app uses `JSON.parse` and React text rendering. It does not use `eval` or `dangerouslySetInnerHTML`.

## JSON Import And Settings Protections

The importer and Settings draft save reject risky or incompatible data before updating application state:

- File name must end in `.json`.
- MIME type must be empty, `application/json`, or `text/json`.
- File size must be at most 512 KB.
- Root object may only contain `schemaVersion`, `updatedAt`, and `verbs`.
- `schemaVersion` must be supported.
- `verbs` must be a non-empty array with at most 500 entries.
- Each verb must include `id`, `label`, and `base`.
- Verb IDs must be short alphanumeric/dash values.
- String fields have maximum length limits.
- Markup characters `<` and `>` are rejected in imported strings.
- Unknown verb fields are rejected.
- Duplicate verb IDs are rejected.

These checks protect the browser from oversized files, malformed data, and common XSS-style payloads in imported or edited text.

## Static Hosting Headers

`public/_headers` defines recommended security headers for static hosts that support that file format, including:

- `Content-Security-Policy`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: no-referrer`
- `Permissions-Policy`
- `X-Frame-Options: DENY`

If your hosting provider does not support `_headers`, configure equivalent headers in that provider's dashboard or config file.

GitHub Pages does not apply `public/_headers`. If SmartTense is hosted on GitHub Pages, rely on the in-app JSON validation and GitHub Pages' managed HTTPS. Use a host such as Cloudflare Pages or Netlify if custom security headers are required without adding a separate proxy/CDN.

## Before Publishing

Run:

```bash
npm test
npm run build
npm audit
```

Publish the generated static app rather than adding a custom backend unless the project truly needs server-side features.

For GitHub Pages deployment and custom subdomains, see `docs/GITHUB_PAGES.md`.

## Reporting Issues

If this project becomes public, add the preferred contact method here, such as a GitHub issue template or a security email address.
