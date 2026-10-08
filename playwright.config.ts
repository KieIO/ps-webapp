import { defineConfig, devices } from '@playwright/test';

/**
 * E2E against real API + seed-dev (preferred over mocks).
 *
 * Env (optional overrides):
 *   PLAYWRIGHT_BASE_URL  — app under test (default http://localhost:5173)
 *   VITE_API_URL         — passed to Vite webServer (default http://localhost:8080/api/v1)
 *   E2E_* credentials    — see e2e/fixtures/auth.ts
 */
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:5173';
const apiURL = process.env.VITE_API_URL ?? 'http://localhost:8080/api/v1';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  timeout: 60_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 5173',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      ...process.env,
      VITE_API_URL: apiURL,
      VITE_USE_AUTH_MOCK: 'false',
      VITE_USE_USERS_MOCK: 'false',
      VITE_USE_PROJECTS_MOCK: 'false',
      VITE_USE_TITLES_MOCK: 'false',
      VITE_USE_TASK_SCORES_MOCK: 'false',
      VITE_USE_TASKS_MOCK: 'false',
    },
  },
});
