import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:8100',
    fixturesFolder: 'tests/e2e/fixtures',
    specPattern: 'tests/e2e/specs/**/*.js',
    supportFile: 'tests/e2e/support/index.js',
    screenshotsFolder: 'tests/e2e/screenshots',
    videosFolder: 'tests/e2e/videos',
  },
})
