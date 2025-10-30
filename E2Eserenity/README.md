# E2Eselenium2 — tests (API-backed)

This folder contains the adapted tests that call the Stickify backend API directly (faster and reliable). The suite uses Cucumber (`@cucumber/cucumber`) with TypeScript and `superagent` for HTTP.

Quick start (PowerShell):

1. From the project root or inside `E2Eselenium2` install dependencies:

```powershell
cd .\E2Eselenium2
npm install
```

2. Make sure the backend is running (default: http://localhost:3000). If your backend is on a different URL set the env var `STICKIFY_API_URL` before running tests.

```powershell
$env:STICKIFY_API_URL = 'http://localhost:3000'
npm test
```

Notes:
- Tests are API-driven. If you prefer full Selenium UI flows, tasks are stubs where you can plug Protractor / WebDriver calls.
- The `tsconfig.json` is configured to compile the test files in this folder.

Files of interest:
- `tasks/*.ts` — API helper tasks (signup, login, create playlist, rate song, follow, search)
- `steps/*.ts` — Cucumber step definitions that call the tasks and assert responses
- `features/` — feature files (Gherkin)

If you want I can also wire a full SerenityJS + WebDriver flow to drive the UI, but that requires a different setup (Protractor/Playwright/Chromedriver) and additional dependencies.
