import { describe, test, expect } from 'bun:test';
import { existsSync } from 'node:fs';

const dist = new URL('../../dist/', import.meta.url).pathname;
if (!existsSync(dist)) throw new Error('dist/ missing — run `bun run build` before test:site');

describe('generated assets', () => {
  for (const locale of ['en', 'nl'] as const) {
    test(`og-${locale}.png exists and is non-trivial`, async () => {
      const file = Bun.file(`${dist}og-${locale}.png`);
      expect(await file.exists()).toBe(true);
      expect(file.size).toBeGreaterThan(5_000);
    });

    test(`og/${locale} source route is noindex`, async () => {
      const html = await Bun.file(`${dist}og/${locale}/index.html`).text();
      expect(html).toContain('noindex');
    });
  }

  for (const icon of ['apple-touch-icon.png', 'icon-192.png', 'icon-512.png'] as const) {
    test(`${icon} is rasterised from the brand mark and non-trivial`, async () => {
      const file = Bun.file(`${dist}${icon}`);
      expect(await file.exists()).toBe(true);
      expect(file.size).toBeGreaterThan(500);
      const magic = new Uint8Array((await file.arrayBuffer()).slice(1, 4));
      expect(new TextDecoder().decode(magic)).toBe('PNG');
    });
  }

  test('the web manifest points at the generated icons', async () => {
    const manifest = await Bun.file(`${dist}site.webmanifest`).json();
    expect(manifest.icons.map((i: { src: string }) => i.src)).toContain('/icon-512.png');
    expect(manifest.theme_color).toBe('#120e13');
  });

  test('the favicon carries the brand mark, not the old candy dot', async () => {
    const svg = await Bun.file(`${dist}favicon.svg`).text();
    expect(svg).toContain('#ff5160'); // raspberry
    expect(svg).toContain('#ffd16b'); // sherbet
    expect(svg).toContain('#007681'); // teal
    expect(svg).not.toContain('#ff4f96'); // the retired candy pink
  });

  test('social meta points at the large card', async () => {
    const en = await Bun.file(`${dist}index.html`).text();
    expect(en).toContain('og-en.png');
    expect(en).toContain('summary_large_image');
    expect(en).toContain('rel="apple-touch-icon"');
    expect(en).toContain('rel="manifest"');
  });

  test('sitemap excludes the og source routes', async () => {
    const sitemapIndex = await Bun.file(`${dist}sitemap-index.xml`).text();
    const match = sitemapIndex.match(/<loc>([^<]+)<\/loc>/);
    const sitemapFile = match![1]!.replace('https://sugarrush.dev/', '');
    const sitemap = await Bun.file(dist + sitemapFile).text();
    expect(sitemap).not.toContain('/og/');
  });
});
