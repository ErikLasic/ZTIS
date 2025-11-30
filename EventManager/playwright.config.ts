import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright konfiguracija za EventManager testiranje
 * Avtor: Erik Lasic
 * Predmet: ZTIS - Naloga 7: Avtomatizacija testiranja
 */
export default defineConfig({
  testDir: './tests',
  /* Timeout za posamezen test */
  timeout: 30 * 1000,
  expect: {
    timeout: 5000
  },
  /* Ne izvajaj testov vzporedno za konsistentnost */
  fullyParallel: false,
  /* Fail na CI če je test.only ostal v kodi */
  forbidOnly: !!process.env.CI,
  /* Ponovi test samo na CI */
  retries: process.env.CI ? 2 : 0,
  /* En worker za sekvenčno izvajanje */
  workers: 1,
  /* Reporter - HTML poročilo in seznam v konzoli */
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list']
  ],
  /* Skupne nastavitve za vse teste */
  use: {
    /* Bazni URL aplikacije */
    baseURL: 'http://localhost:3000',
    /* Trace za debug */
    trace: 'on-first-retry',
    /* Screenshot ob napaki */
    screenshot: 'only-on-failure',
    /* Video ob napaki */
    video: 'retain-on-failure',
  },

  /* Samo Chromium brskalnik */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* Avtomatsko zaženi lokalni strežnik pred testi */
  webServer: {
    command: 'npm run server',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
