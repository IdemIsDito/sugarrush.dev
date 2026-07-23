# sugarrush.dev

Bilingual (EN/NL) landing site for **Sugar Rush Development B.V.** — live at
[sugarrush.dev](https://sugarrush.dev). Static Astro site; the page content lives in
zod-validated per-locale JSON that drives both locales.

Built with Astro 5 + Bun and vanilla modern CSS (custom properties, native nesting,
`light-dark()` — no CSS framework). It shares its design system with
[jeroenwever.com](https://jeroenwever.com): same tokens, same theme + locale toggles.

- **WCAG 2.2 AA enforced in CI**: axe scans both locales in both color schemes on every push.
- **Theme system**: `prefers-color-scheme` by default, user override persisted, applied pre-paint.
- **CI as the gatekeeper**: typecheck → unit tests → build → site/a11y tests → deploy (Cloudflare Pages).

## Develop

```bash
bun install
bunx playwright install chromium   # once, for a11y/theme tests
bun run dev                        # http://localhost:4321
```

## Test

```bash
bun run check       # astro typecheck
bun run test:unit   # content schema + i18n
bun run build       # static site into dist/
bun run test:site   # pages, theme behavior, axe (WCAG 2.2 AA)
```

## Edit the content

Copy lives in `src/content/landing.en.json` and `src/content/landing.nl.json`, validated
by the zod schema in `src/content/schema.ts` at build time. UI chrome strings are in
`src/i18n/`. Colors and typography are tokens in `src/styles/tokens.css` (shared with the
resume site — keep them in sync).

## Deploy

Every push runs CI (`.github/workflows/ci.yml`). Green builds deploy to Cloudflare Pages:
`main` → production (sugarrush.dev), other branches → preview URLs.

One-time Cloudflare setup:

1. `bunx wrangler login`
2. `bunx wrangler pages project create sugarrush-dev --production-branch main`
3. In the GitHub repo settings, add secrets `CLOUDFLARE_API_TOKEN`
   (API token with the "Cloudflare Pages — Edit" permission) and `CLOUDFLARE_ACCOUNT_ID`.
4. In the Cloudflare dashboard → Pages → sugarrush-dev → Custom domains,
   add `sugarrush.dev` and `www.sugarrush.dev` (www set to redirect). See the
   www-redirect note below.

> **www redirect footgun:** a Cloudflare zone redirect rule does not fire for a hostname
> CNAME'd into Pages. If `www.sugarrush.dev` won't redirect, add a **proxied** A record
> for `www` pointing at `192.0.2.1` so the rule engine sees the request.
