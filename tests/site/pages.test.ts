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

  test('the scan heading and three steps render', () => {
    expect(en).toContain('The scan');
    expect(nl).toContain('De scan');
    for (const html of [en, nl]) {
      expect((html.match(/<h3/g) ?? []).length).toBe(3);
    }
  });

  test('email CTA points at jeroen@sugarrush.dev in both locales', () => {
    for (const html of [en, nl]) {
      expect(html).toContain('mailto:jeroen@sugarrush.dev');
    }
  });

  test('person CTA links to the locale-matched jeroenwever.com', () => {
    expect(en).toContain('href="https://jeroenwever.com/"');
    expect(nl).toContain('href="https://jeroenwever.com/nl/"');
  });

  test('footer names the operating company', () => {
    for (const html of [en, nl]) {
      expect(html).toContain('Sugar Rush Development B.V.');
    }
  });
});
