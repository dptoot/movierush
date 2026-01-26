import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  reporter: 'html',
  // Global timeout for each test (including retries)
  timeout: 30 * 1000,
  expect: {
    timeout: 5 * 1000,
  },
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    // Faster action timeouts in CI
    actionTimeout: isCI ? 10 * 1000 : 30 * 1000,
    navigationTimeout: isCI ? 15 * 1000 : 30 * 1000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    // Use production server in CI (already built), dev server locally
    command: isCI ? 'npm run start' : 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !isCI,
    timeout: 120 * 1000,
    // Show server output in CI for debugging
    stdout: isCI ? 'pipe' : 'ignore',
    stderr: 'pipe',
  },
});
