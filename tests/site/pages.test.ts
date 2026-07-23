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

  test('language toggle links to the other locale', () => {
    expect(en).toContain('href="/nl/"');
    expect(nl).toContain('href="/"');
  });
});
