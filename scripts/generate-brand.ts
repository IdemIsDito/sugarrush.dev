/**
 * Renders LinkedIn brand assets from the design system.
 *
 * Output goes to brand/, not dist/ — these are not site assets. Fonts resolve
 * because the temp page lives in the repo root and points at node_modules with
 * a relative path, which file:// URLs handle.
 */
import { chromium } from 'playwright';
import { unlink } from 'node:fs/promises';

const OUT = new URL('../brand/', import.meta.url).pathname;
const TMP = new URL('../.brand-render.html', import.meta.url).pathname;

const FONTS = `
<link rel="stylesheet" href="node_modules/@fontsource-variable/space-grotesk/index.css">
<link rel="stylesheet" href="node_modules/@fontsource/ibm-plex-mono/400.css">
<link rel="stylesheet" href="node_modules/@fontsource/ibm-plex-mono/600.css">`;

const BASE = `
  *{margin:0;box-sizing:border-box}
  body{background:#120e13;color:#fbf7f3;font-family:'Space Grotesk Variable',Helvetica,Arial,sans-serif;
       position:relative;overflow:hidden;display:flex;align-items:center}
  .band span{position:absolute;top:-160px;bottom:-160px;transform:skewX(-16deg)}
  .kicker{font-family:'IBM Plex Mono',monospace;font-weight:600;letter-spacing:0.14em;
          text-transform:uppercase;color:oklch(0.88 0.13 85)}
  .bars{display:flex}
  .bars i{border-radius:3px;transform:skewX(-16deg)}
  .bars i:nth-child(1){background:oklch(0.68 0.21 20)}
  .bars i:nth-child(2){background:oklch(0.88 0.13 85)}
  .bars i:nth-child(3){background:oklch(0.51 0.10 205)}
  .tld{color:oklch(0.68 0.21 20)}`;

const band = (w: number, m: number, g: number) => `
  <div class="band">
    <span style="right:${-m}px;width:${w}px;background:oklch(0.30 0.05 320)"></span>
    <span style="right:${w - m + g}px;width:${Math.round(w * 0.22)}px;background:oklch(0.36 0.06 320)"></span>
    <span style="right:${w - m + g + Math.round(w * 0.22) + g}px;width:${Math.round(w * 0.08)}px;background:oklch(0.26 0.04 320)"></span>
  </div>`;

const mark = (barW: number, barH: number, gap: number, type: number) => `
  <span style="display:inline-flex;align-items:center;gap:${Math.round(barW * 1.6)}px">
    <span class="bars" style="gap:${gap}px">
      <i style="width:${barW}px;height:${barH}px"></i>
      <i style="width:${barW}px;height:${barH}px"></i>
      <i style="width:${barW}px;height:${barH}px"></i>
    </span>
    <span style="font-size:${type}px;font-weight:700;letter-spacing:-0.03em">sugarrush<span class="tld">.dev</span></span>
  </span>`;

const assets = [
  {
    // The company logo overlaps the lower left of a page cover, so the mark
    // starts well clear of it.
    name: 'linkedin-company-cover',
    w: 1128,
    h: 191,
    html: `${band(200, 40, 18)}
      <div style="position:relative;padding-left:260px;display:flex;align-items:center;gap:28px">
        ${mark(11, 36, 5, 30)}
        <span class="kicker" style="font-size:14px">coding with the speed of sweet</span>
      </div>`,
  },
  {
    // Shown small in feeds, so the mark carries it alone. No type.
    name: 'linkedin-company-logo',
    w: 300,
    h: 300,
    html: `<div style="position:relative;width:100%;display:flex;justify-content:center">
        <span class="bars" style="gap:14px">
          <i style="width:38px;height:150px"></i>
          <i style="width:38px;height:150px"></i>
          <i style="width:38px;height:150px"></i>
        </span>
      </div>`,
  },
  {
    name: 'linkedin-post',
    w: 1200,
    h: 627,
    html: `${band(260, 50, 22)}
      <div style="position:relative;padding:0 96px;display:flex;flex-direction:column;gap:30px">
        <p class="kicker" style="font-size:20px">Sugar Rush Development</p>
        <h1 style="font-size:88px;line-height:0.94;font-weight:700;letter-spacing:-0.05em;max-width:15ch">coding with the speed of <span style="color:oklch(0.68 0.21 20)">sweet</span></h1>
        ${mark(11, 36, 5, 28)}
      </div>`,
  },
];

const browser = await chromium.launch();
try {
  for (const a of assets) {
    const page = await browser.newPage({ viewport: { width: a.w, height: a.h } });
    await Bun.write(
      TMP,
      `<!doctype html><html><head><meta charset="utf-8">${FONTS}<style>${BASE}
       body{width:${a.w}px;height:${a.h}px}</style></head><body>${a.html}</body></html>`
    );
    await page.goto(`file://${TMP}`, { waitUntil: 'networkidle' });
    await page.screenshot({ path: `${OUT}${a.name}.png` });
    await page.close();
    console.log(`✓ brand/${a.name}.png (${a.w}x${a.h})`);
  }
} finally {
  await browser.close();
  await unlink(TMP).catch(() => {});
}
