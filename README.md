# kickandboom_tests

Playwright + TypeScript automation project for the KickAndBoom landing page and Unity/WebGL game entry flow.

Target flow:

1. Open the landing page.
2. Handle cookie consent and age confirmation if shown.
3. Verify the main `Play now` CTA.
4. Click the CTA.
5. Verify that the WebGL/game flow starts.
6. Check runtime errors, failed critical requests, and WebGL context when a canvas is available.

## Tech Stack

- Playwright Test
- Cucumber/Gherkin BDD
- TypeScript
- Page Object Model
- Custom Playwright fixtures
- Runtime monitoring for console, page, and network failures
- WebGL/canvas smoke helpers
- GitHub Actions CI

## Setup

```bash
npm install
npx playwright install
```

## Environment

The base URL is read from `.env`.

```env
BASE_URL=https://kickandboom.com/dt/
```

Use `.env.example` as a template when setting up the project locally or in CI.

## Commands

Run all configured Playwright projects:

```bash
npm test
```

Run smoke tests:

```bash
npm run test:smoke
```

Run CI smoke command:

```bash
npm run test:ci
```

Run Firefox smoke separately:

```bash
npm run test:firefox
```

Run BDD smoke scenario:

```bash
npm run bdd:smoke
```

Run BDD in headed debug mode:

```bash
npm run bdd:debug
```

Run in debug mode with Playwright Inspector:

```bash
npm run test:debug
```

Run headed:

```bash
npm run test:headed
```

Open the last HTML report:

```bash
npm run report
```

Run TypeScript checks:

```bash
npm run typecheck
```

## Test Coverage

Current Playwright smoke scenario:

```text
@smoke KickAndBoom landing and game entry
```

Current BDD scenario:

```gherkin
@smoke @landing @game-entry
Scenario: Visitor starts the Play flow from the landing page
```

Covered checks:

- landing page loads successfully
- cookie banner is accepted when visible
- age confirmation is accepted when visible
- `Play now` CTA is visible and enabled
- CTA starts the next game/target flow
- Unity/WebGL canvas or iframe is attached
- WebGL context is available when canvas is present
- blocking console, page, request, and server errors are not present

## Project Structure

```text
.
├── .github/workflows/          GitHub Actions workflow
├── features/                   Gherkin BDD scenarios
├── src/
│   ├── bdd/                    Cucumber world, hooks, and steps
│   ├── config/                 Environment configuration
│   ├── fixtures/               Custom Playwright fixtures
│   ├── pages/                  Page objects
│   └── utils/                  Runtime monitor and WebGL helpers
├── tests/
│   └── smoke/                  Critical smoke scenarios
├── cucumber.mjs
├── playwright.config.ts
├── package.json
└── tsconfig.json
```

## BDD Layer

BDD is implemented with Cucumber/Gherkin on top of Playwright. Feature files describe business-readable behavior, while step definitions reuse the same Page Objects and WebGL/runtime helpers as the Playwright smoke test. Keep BDD scenarios focused on user-critical flows; low-level browser checks should stay in Playwright specs.

BDD browser can be changed with:

```bash
BDD_BROWSER=webkit npm run bdd:smoke
```

Parallelism can be changed with:

```bash
CUCUMBER_PARALLEL=4 npm run bdd:smoke
```

## CI/CD

Workflow file:

```text
.github/workflows/playwright.yml
```

The pipeline runs on:

- pull requests
- pushes to `main` or `master`
- manual `workflow_dispatch`
- daily scheduled smoke run

Pipeline steps:

1. Install dependencies with `npm ci`.
2. Install Playwright browsers.
3. Run TypeScript typecheck.
4. Run Playwright smoke tests with `npm run test:ci`.
5. Run BDD smoke scenario with `npm run bdd:smoke`.
6. Upload `playwright-report` and `test-results` as artifacts.

CI release-gate smoke runs Chromium desktop, WebKit desktop, and mobile Chrome. Firefox is kept as a separate command because Unity/WebGL game launch is unstable on GitHub-hosted Firefox runners and should not block the main release gate unless the product officially requires that combination.

To change the target environment in GitHub Actions, set repository variable:

```text
BASE_URL=https://kickandboom.com/dt/
```

## Notes

Unity/WebGL content is rendered inside a canvas, so browser automation cannot inspect internal Unity objects directly. This project keeps the automated test stable by validating browser-level behavior, canvas/WebGL availability, runtime errors, and the game entry flow. Deeper gameplay validation should be done through browser-accessible test hooks or a deterministic debug API when available.
