import { test, expect, afterAll } from 'bun:test';
import { chromium } from 'playwright';
import { serveDist } from '../../scripts/serve-dist';

const { server, origin } = serveDist();
const browser = await chromium.launch();

afterAll(async () => {
  // Teardown only — every assertion has already run by this point.
  //
  // Three test files each hold a Chromium at module scope. That is fine on a
  // dev machine and contended on a 2-core CI runner, where browser.close()
  // wedges outright: it hangs rather than runs slow, so raising the timeout
  // just moved the failure from 5001ms to 30001ms. Bound it and move on; the
  // browser is reaped when the test process exits either way.
  await Promise.race([
    (async () => {
      await Promise.all(browser.contexts().map((c) => c.close()));
      await browser.close();
    })(),
    new Promise((resolve) => setTimeout(resolve, 8_000)),
  ]);
  // fetch() against the dist server leaves keep-alive sockets open, and an
  // unforced stop() waits on them forever.
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
