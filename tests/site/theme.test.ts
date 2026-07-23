import { test, expect, afterAll } from 'bun:test';
import { chromium } from 'playwright';
import { serveDist } from '../../scripts/serve-dist';

const { server, origin } = serveDist();
const browser = await chromium.launch();

afterAll(async () => {
  await browser.close();
  server.stop();
});

test('theme override persists across reloads and beats system scheme', async () => {
  const context = await browser.newContext({ colorScheme: 'light' });
  const page = await context.newPage();
  await page.goto(origin + '/');

  // Force dark via the toggle's select.
  await page.selectOption('#theme-select', 'dark');
  expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBe('dark');

  // Reload: the pre-paint inline script must reapply the stored override.
  await page.reload();
  expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBe('dark');

  await context.close();
});
