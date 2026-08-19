import { test, expect, afterAll } from 'bun:test';
import { chromium } from 'playwright';
import { serveDist } from '../../scripts/serve-dist';

const { server, origin } = serveDist();
const browser = await chromium.launch();

afterAll(async () => {
  // browser.newPage() opens a context that page.close() does not close; a leaked
  // one makes browser.close() hang rather than merely run slow. And any fetch()
  // against the server leaves a keep-alive socket, which an unforced stop()
  // waits on forever — both only ever showed up on CI.
  await Promise.all(browser.contexts().map((c) => c.close()));
  await browser.close();
  server.stop(true);
}, 30_000);

test('theme override persists across reloads and beats system scheme', async () => {
  const context = await browser.newContext({ colorScheme: 'light' });
  const page = await context.newPage();
  await page.goto(origin + '/');

  // Theme lives in the sheet, never in the header bar — open it first.
  await page.click('[data-menu-open]');
  await page.click('[data-theme-opt="dark"]');
  expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBe('dark');

  // Reload: the pre-paint inline script must reapply the stored override.
  await page.reload();
  expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBe('dark');

  // And the sheet must reopen showing dark as the checked pill.
  await page.click('[data-menu-open]');
  expect(await page.isChecked('#theme-dark')).toBe(true);

  await context.close();
});

test('returning to System clears the override', async () => {
  const context = await browser.newContext({ colorScheme: 'light' });
  const page = await context.newPage();
  await page.goto(origin + '/');

  await page.click('[data-menu-open]');
  await page.click('[data-theme-opt="dark"]');
  await page.click('[data-theme-opt="system"]');

  expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBeUndefined();
  expect(await page.evaluate(() => localStorage.getItem('theme'))).toBeNull();

  await context.close();
});
