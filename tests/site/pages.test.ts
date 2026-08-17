import { describe, test, expect } from 'bun:test';
import { existsSync } from 'node:fs';

const dist = new URL('../../dist/', import.meta.url).pathname;
if (!existsSync(dist)) throw new Error('dist/ missing — run `bun run build` before test:site');

const en = await Bun.file(dist + 'index.html').text();
const nl = await Bun.file(dist + 'nl/index.html').text();

describe('landing pages', () => {
  test('NL page exists with lang="nl"', () => {
    expect(nl).toContain('<html lang="nl"');
  });

  test('both locales render the brand and wordmark', () => {
    for (const html of [en, nl]) {
      expect(html).toContain('Sugar Rush Development');
      expect(html).toContain('sugarrush');
    }
  });

  test('single h1 and a semantic main landmark per page', () => {
    for (const html of [en, nl]) {
      expect(html).toContain('<main id="main"');
      expect((html.match(/<h1/g) ?? []).length).toBe(1);
    }
  });

  test('the headline is the slogan, with its last word accented', () => {
    for (const html of [en, nl]) {
      expect(html).toMatch(/<h1[^>]*>coding with the speed of\s*<span class="accent"[^>]*>sweet<\/span><\/h1>/);
    }
  });

  test('the brand kicker carries the brand yellow', () => {
    for (const html of [en, nl]) {
      expect(html).toMatch(/class="kicker kicker-brand"[^>]*>Sugar Rush Development</);
    }
  });

  test('the statutory footer line renders', () => {
    for (const html of [en, nl]) {
      expect(html).toContain('KvK');
      expect(html).toContain('BTW');
    }
  });

  test('content is boxed by the shared shell', () => {
    for (const html of [en, nl]) {
      expect(html).toMatch(/<main id="main" class="shell"/);
    }
  });

  test('language toggle links to the other locale', () => {
    expect(en).toContain('href="/nl/"');
    expect(nl).toContain('href="/"');
  });

  test('theme and language live in the sheet, not the header bar', () => {
    for (const html of [en, nl]) {
      expect(html).toContain('id="menu-sheet"');
      expect(html).toContain('id="theme-dark"');
      // The band crosses every page: three stripes, always rendered.
      expect((html.match(/class="band"/g) ?? []).length).toBe(1);
    }
  });

  test('resume link points at the locale-matched jeroenwever.com', () => {
    expect(en).toContain('href="https://jeroenwever.com/"');
    expect(nl).toContain('href="https://jeroenwever.com/nl/"');
  });

  test('footer names the operating company', () => {
    for (const html of [en, nl]) {
      expect(html).toContain('Sugar Rush Development B.V.');
    }
  });
});
