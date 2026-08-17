import { chromium } from 'playwright';
import { locales } from '../src/i18n';
import { serveDist } from './serve-dist';
import { generateIcons, ICON_SIZES } from './generate-icons';

const { server, origin, dist } = serveDist();
const browser = await chromium.launch();

try {
  for (const locale of locales) {
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1200, height: 630 });
    await page.goto(`${origin}/og/${locale}/`, { waitUntil: 'networkidle' });
    await page.screenshot({ path: `${dist}og-${locale}.png` });
    await page.close();
    console.log(`✓ og-${locale}.png`);
  }

  await generateIcons(browser, dist);
} finally {
  await browser.close();
  server.stop();
}

// Fail the build loudly if anything is missing or suspiciously small.
for (const locale of locales) {
  const og = Bun.file(`${dist}og-${locale}.png`);
  if (!(await og.exists()) || og.size < 5_000) {
    console.error(`og-${locale}.png missing or too small (${og.size} bytes)`);
    process.exit(1);
  }
}

for (const { file } of ICON_SIZES) {
  const icon = Bun.file(`${dist}${file}`);
  if (!(await icon.exists()) || icon.size < 500) {
    console.error(`${file} missing or too small (${icon.size} bytes)`);
    process.exit(1);
  }
}
