# kickandboom_tests

TypeScript Playwright smoke automation for the KickAndBoom landing page and WebGL game entry flow.

## Stack

- Playwright + TypeScript
- Page Object Model
- Custom fixtures
- Browser/runtime monitoring for console, page, and network failures
- WebGL canvas smoke helpers

## Setup

```bash
npm install
npx playwright install
```

## Run

```bash
npm test
npm run test:smoke
npm run test:debug
npm run test:headed
npm run report
```

## Configuration

The target URL is read from `.env`:

```text
https://kickandboom.com/dt/
```

Override it when needed:

```bash
BASE_URL=https://kickandboom.com/dt/ npm run test:smoke
npm run test:debug
```

## Project Structure

```text
src/
  config/        Environment config
  fixtures/      Custom Playwright fixtures
  pages/         Page objects
  utils/         Shared runtime and WebGL helpers
tests/
  smoke/         Critical smoke scenarios
```

## Current Coverage

The smoke test validates:

- landing page availability
- main Play CTA visibility and clickability
- transition into the game or target flow
- WebGL canvas visibility when present
- WebGL context creation when canvas is available
- blocking console/page/network failures
