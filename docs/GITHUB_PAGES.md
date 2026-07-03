# Publishing SmartTense With GitHub

This guide explains how to keep the SmartTense repository updated and how to publish the web app with GitHub Pages.

## Repository Remote

The expected remote is:

```text
https://github.com/dafermen/SmartTense.git
```

Check it locally with:

```bash
git remote -v
```

## Recommended Local Release Flow

Before pushing a UI, documentation, or data change:

```bash
npm test
npm run build
```

Then commit and push:

```bash
git status
git add .
git commit -m "Update SmartTense documentation and UI"
git push origin main
```

Use a more specific commit message when possible.

## GitHub Pages Deployment Model

SmartTense is a static React/Vite app. For GitHub Pages, publish the generated `dist/` folder through GitHub Actions. Do not add a custom server unless the project later needs server-side features.

The repository includes this workflow:

```text
.github/workflows/deploy-pages.yml
```

The workflow:

1. Runs `npm ci`.
2. Runs `npm test`.
3. Builds the app with `npm run build -- --base "$BASE_PATH"`.
4. Uploads `dist/` as a Pages artifact.
5. Deploys to GitHub Pages.

## Publish Without A Custom Domain

Use this when the site URL will be:

```text
https://YOUR_GITHUB_USER.github.io/REPOSITORY_NAME/
```

Steps:

1. Push the project to GitHub.
2. Open the repository on GitHub.
3. Go to `Settings` -> `Pages`.
4. Under `Build and deployment`, choose `GitHub Actions`.
5. Push to the `main` branch, or run the workflow manually from the `Actions` tab.
6. Wait for the `Deploy SmartTense to GitHub Pages` workflow to finish.
7. Open the Pages URL shown by GitHub.

When `PAGES_BASE_PATH` is not set, the workflow uses:

```text
/SmartTense/
```

That value is required because Vite assets must be loaded from the repository path.

## Publish With A Custom Subdomain

A subdomain can point to GitHub Pages. Example:

```text
smarttense.example.com
```

High-level steps:

1. In GitHub, open the repository.
2. Go to `Settings` -> `Pages`.
3. Set `Custom domain` to your subdomain, for example `smarttense.example.com`.
4. Enable `Enforce HTTPS` after GitHub finishes provisioning the certificate.
5. In your DNS provider, create a `CNAME` record:

   ```text
   Type:  CNAME
   Name:  smarttense
   Value: YOUR_GITHUB_USER.github.io
   ```

6. In the GitHub repository, go to `Settings` -> `Secrets and variables` -> `Actions` -> `Variables`.
7. Add this repository variable:

   ```text
   Name:  PAGES_BASE_PATH
   Value: /
   ```

8. Re-run the deploy workflow.

The `PAGES_BASE_PATH=/` value matters because a custom subdomain serves the app from the domain root, not from `/SmartTense/`.

## DNS Notes

For a subdomain, use `CNAME`. For an apex/root domain such as `example.com`, use GitHub Pages' recommended `A` and `AAAA` records instead. A subdomain is simpler and is the recommended first setup.

DNS changes can take minutes or hours to propagate depending on the DNS provider.

## Security Notes For GitHub Pages

GitHub Pages is suitable for SmartTense because the app is static and JSON import runs only in the user's browser.

Important limitation:

- GitHub Pages does not use `public/_headers`. That file is useful on static hosts such as Cloudflare Pages or Netlify, but GitHub Pages does not apply it.

For GitHub Pages, keep these protections in the app itself:

- Strict JSON validation in `src/data/validation.js`.
- File type and file size checks before import.
- No `eval`.
- No `dangerouslySetInnerHTML`.
- Dependency checks with `npm audit`.

## Pre-Publish Checklist

Run locally before pushing:

```bash
npm test
npm run build
npm audit --audit-level=moderate
```

Then push to `main` and verify the GitHub Actions deployment.

## Troubleshooting

If the page loads blank or assets return 404:

- If using `github.io/SmartTense/`, leave `PAGES_BASE_PATH` unset or set it to `/SmartTense/`.
- If using a custom subdomain, set `PAGES_BASE_PATH` to `/`.

If the custom domain does not work:

- Check that the `CNAME` record points to `YOUR_GITHUB_USER.github.io`.
- Check that the custom domain is saved in GitHub Pages settings.
- Wait for DNS propagation.
- Enable `Enforce HTTPS` after GitHub provisions the certificate.
