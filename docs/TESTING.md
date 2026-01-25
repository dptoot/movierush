# MovieRush Testing Guide

This document describes the testing infrastructure, how to run tests, and testing best practices for MovieRush.

## Overview

MovieRush uses a two-tier testing strategy:

| Layer | Framework | Purpose | Speed |
|-------|-----------|---------|-------|
| **Unit** | Vitest | Test pure functions (scoring, time bonus) | ~1 second |
| **E2E** | Playwright | Test full user flows in real browser | ~60 seconds |

## Quick Start

```bash
# Run all unit tests
npm run test

# Run unit tests in watch mode (during development)
npm run test:watch

# Run unit tests with coverage report
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI (interactive mode)
npm run test:e2e:ui

# Run all tests (unit + E2E)
npm run test:all
```

## Test Structure

```
tests/
├── unit/                    # Vitest unit tests
│   ├── scoring.test.ts      # Scoring algorithm tests
│   └── timeBonus.test.ts    # Time bonus calculation tests
└── e2e/                     # Playwright E2E tests
    ├── game-flow.spec.ts    # Core game flow tests
    ├── persistence.spec.ts  # localStorage persistence tests
    └── accessibility.spec.ts # Accessibility & WCAG tests
```

## Unit Tests (Vitest)

### What We Test

- **`lib/scoring.ts`** - Point calculation based on movie obscurity
- **`lib/timeBonus.ts`** - Time bonus calculation based on movie obscurity

### Running Unit Tests

```bash
# Run once
npm run test

# Watch mode (re-runs on file changes)
npm run test:watch

# With coverage report
npm run test:coverage
```

### Writing Unit Tests

Unit tests are located in `tests/unit/`. Example:

```typescript
import { describe, it, expect } from 'vitest';
import { calculatePoints } from '@/lib/scoring';

describe('calculatePoints', () => {
  it('awards 20 bonus points for obscure movies', () => {
    const result = calculatePoints(100, 6.0);
    expect(result.totalPoints).toBe(30); // 10 base + 20 bonus
  });
});
```

### Coverage Targets

- **Scoring logic**: 100% coverage
- **Time bonus logic**: 100% coverage

## E2E Tests (Playwright)

### What We Test

1. **Game Flow** (`game-flow.spec.ts`)
   - Homepage loads with start button
   - Start button reveals game interface
   - Timer counts down
   - Autocomplete shows results
   - Movie selection works
   - End game shows results
   - Keyboard navigation

2. **Persistence** (`persistence.spec.ts`)
   - Game state survives refresh
   - Completed game prevents replay
   - Score persists after completion

3. **Accessibility** (`accessibility.spec.ts`)
   - WCAG 2.1 AA compliance (via axe-core)
   - Keyboard navigation
   - Screen reader support
   - Color contrast
   - Reduced motion support

### Running E2E Tests

```bash
# Run headless (CI mode)
npm run test:e2e

# Run with UI (interactive debugging)
npm run test:e2e:ui

# Run specific test file
npx playwright test tests/e2e/game-flow.spec.ts

# Run tests in headed mode (see the browser)
npx playwright test --headed
```

### Writing E2E Tests

E2E tests are located in `tests/e2e/`. Example:

```typescript
import { test, expect } from '@playwright/test';

test('clicking start reveals game interface', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /start/i }).click();

  await expect(page.locator('time[role="timer"]')).toBeVisible();
  await expect(page.getByPlaceholder(/type a movie name/i)).toBeFocused();
});
```

### Debugging Failed Tests

1. **View HTML report**: After test failure, run `npx playwright show-report`
2. **Use UI mode**: `npm run test:e2e:ui` for step-by-step debugging
3. **Screenshots**: Failed tests automatically capture screenshots in `test-results/`

## CI/CD Integration

Tests run automatically on every push and pull request via GitHub Actions.

### Workflow Jobs

| Job | Description | Duration |
|-----|-------------|----------|
| `unit-tests` | Runs Vitest unit tests | ~30s |
| `e2e-tests` | Runs Playwright E2E tests | ~2-3 min |
| `lint` | Runs ESLint | ~20s |
| `type-check` | Runs TypeScript compiler | ~30s |

### Viewing CI Results

1. Go to the **Actions** tab in GitHub
2. Click on the workflow run
3. View job logs and test results
4. Download Playwright report artifact for detailed E2E results

## Manual Testing Checklist

Before major releases, manually verify:

### Core Game Flow
- [ ] Homepage loads without errors
- [ ] Start button begins game
- [ ] Timer counts down correctly
- [ ] Autocomplete shows movie results
- [ ] Correct guess adds movie to grid and time
- [ ] Incorrect guess applies time penalty
- [ ] End Game button works
- [ ] Results screen shows correct stats
- [ ] Share button copies results

### Persistence
- [ ] Refreshing during game preserves state
- [ ] Completed game cannot be replayed same day
- [ ] New day allows fresh game

### Accessibility
- [ ] Can complete game using only keyboard
- [ ] Screen reader announces important changes
- [ ] Works with reduced motion enabled
- [ ] Sufficient color contrast

### Responsive Design
- [ ] Works on mobile (375px width)
- [ ] Works on tablet (768px width)
- [ ] Works on desktop (1280px+ width)
- [ ] Works in landscape orientation

## Device Testing Matrix

| Device | OS | Browser | Status |
|--------|----|---------| -------|
| iPhone SE | iOS 17 | Safari | |
| iPhone 14 Pro | iOS 17 | Safari | |
| iPad | iPadOS 17 | Safari | |
| Pixel 7 | Android 14 | Chrome | |
| Samsung Galaxy Tab | Android | Chrome | |
| MacBook | macOS | Chrome | |
| MacBook | macOS | Safari | |
| Windows PC | Windows 11 | Chrome | |
| Windows PC | Windows 11 | Edge | |

## Troubleshooting

### Unit Tests Fail

```bash
# Clear Vitest cache
npx vitest --clearCache

# Run with verbose output
npx vitest --reporter=verbose
```

### E2E Tests Fail

```bash
# Update Playwright browsers
npx playwright install

# Run with debug logging
DEBUG=pw:api npm run test:e2e

# Run single test with trace
npx playwright test --trace on tests/e2e/game-flow.spec.ts
```

### CI Tests Fail but Local Tests Pass

1. Check environment variables are set in GitHub Secrets
2. Ensure `npm ci` (not `npm install`) is used
3. Check Node.js version matches (v20)

## Adding New Tests

### When to Add Unit Tests

- New utility functions in `lib/`
- Pure functions with clear inputs/outputs
- Business logic calculations

### When to Add E2E Tests

- New user-facing features
- Changes to existing user flows
- Bug fixes (add regression test)

## Configuration Files

- **`vitest.config.ts`** - Vitest configuration
- **`playwright.config.ts`** - Playwright configuration
- **`.github/workflows/test.yml`** - CI workflow
