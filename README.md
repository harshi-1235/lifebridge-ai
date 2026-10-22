# LifeBridge AI — Free Starter Project

A responsive frontend prototype for **LifeBridge AI — One platform for life's essential needs**.

## Features included

- Responsive dashboard and mobile navigation
- Adaptive profile presets: school student, college student, employee/job seeker, parent/caregiver, older adult, and a general profile
- Life Radar using transparent local rules (interest match, task priority, due date)
- Add, complete, filter, and delete tasks
- Sample resources, including links to official Indian services
- Privacy preference UI, local data export, clear-local-data and restore-demo actions
- Browser-local persistence (localStorage)
- No paid dependencies, build step, framework, API key, or server required

## Important limitations

This is a **frontend starter / prototype**, not a production full-stack platform. It does not include secure user accounts, cloud database, real AI model integration, notifications, verified eligibility checks, or cross-device sync. Demo profile/task data is stored in this browser only. Do not enter sensitive personal information.

The Life Radar is a simple rule-based sorter; it is not a predictive AI system. Sample resources and links should be checked before relying on them.

## Run locally

1. Download and unzip the project.
2. Open `index.html` in a modern browser.

For a local web server (optional), run this from the project folder:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Publish free with GitHub Pages

1. Create or sign in to a GitHub account at https://github.com/.
2. Create a **public** repository named `lifebridge-ai` (GitHub Pages for this simple setup is available on public repositories with GitHub Free).
3. Upload the contents of this folder to the repository root. Make sure `index.html`, `styles.css`, `app.js`, and `assets/` are at the root.
4. In the repository, open **Settings → Pages**.
5. Under Build and deployment, choose **Deploy from a branch**.
6. Choose branch `main` and folder `/ (root)`, then save.
7. Wait for GitHub Pages to publish. The URL is usually:
   `https://YOUR-GITHUB-USERNAME.github.io/lifebridge-ai/`

GitHub UI labels may change. Do not upload secrets or sensitive user data to the repository.

## Publish free with Cloudflare Pages

1. Create a Cloudflare account at https://dash.cloudflare.com/.
2. Go to **Workers & Pages → Create → Pages** (the exact UI may vary).
3. Choose direct upload or connect the Git repository.
4. Upload the project folder (or connect the repository), and deploy.
5. Cloudflare will provide a `*.pages.dev` URL.

This is a static site, so use no build command and set the output directory to the folder containing `index.html` (for Git integration, the project root).

## Customize

- Update demo profile, tasks, and default privacy settings in `app.js`.
- Edit colors and responsive layouts in `styles.css`.
- Update page structure in `index.html`.
- Add resources in the `sampleResources` array in `app.js`.

## Before a real launch

A production version should add:
- Backend authentication and server-side authorization
- A database with user-level row access controls
- A real AI API integrated server-side (never expose API keys in frontend code)
- Consent, retention and deletion policies
- Accessibility and security testing
- Verified resource sources and date/eligibility validation
- Appropriate protections for minors and sensitive health/financial information
