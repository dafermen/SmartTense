# Troubleshooting

## Local page does not open
Run `npm ci`, start port 5178, check for a port conflict, and open `http://127.0.0.1:5178/`.

## Learning content cannot load
Run `npm run audit:content`; inspect JSON syntax, schema version, IDs, contexts, options, and prerequisites.

## Manual on mobile
The embedded viewer is intentionally hidden. Use Open Manual or Download PDF.

## Pages deployment fails
Confirm build type is GitHub Actions, inspect build and deploy jobs separately, run the local release gate, check base path, DNS, and TLS.

## Progress looks wrong
Progress is origin- and browser-local. Confirm the browser profile before resetting a unit.

## Mobile smoke fails
Confirm Chrome or `SMARTTENSE_CHROME_PATH`; use the timeout body text to identify the actual page.
