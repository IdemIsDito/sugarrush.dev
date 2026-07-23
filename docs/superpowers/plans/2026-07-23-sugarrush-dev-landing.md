# sugarrush.dev Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a one-page, bilingual (EN/NL) landing site for Sugar Rush Development B.V. at `sugarrush.dev` — brand presence plus the soft "scan" consultancy proposition, linking back to the locale-matched jeroenwever.com.

**Architecture:** Static Astro 5 site. Per-locale content lives in zod-validated JSON (single source of truth) that drives the page; UI chrome strings live in a small i18n dictionary. The candy-shop design system (tokens, global CSS, theme + locale toggles) is copied verbatim from the resume site so both sites share one visual language. EN renders at `/`, NL at `/nl/`. WCAG 2.2 AA is enforced in CI by axe across both locales in both color schemes.

**Tech Stack:** Astro 5, Bun (runtime + package manager + test runner), vanilla modern CSS (`light-dark()`, custom properties, native nesting — no framework), zod, Playwright + @axe-core/playwright, Cloudflare Pages.

## Global Constraints

Every task's requirements implicitly include this section.

- **Bun**, never Node/npm. Commands are `bun ...` / `bunx ...`.
- **Vanilla modern CSS only** — no Tailwind or any CSS framework.
- **Voice is first person "I"**; the brand name (Sugar Rush Development B.V.) appears only in wordmark/footer. Never imply a team.
- **Honesty-first:** no invented pricing, packages, scoped deliverables, or credentials. The scan copy stays soft.
- **Design tokens copied verbatim** from resume-site `src/styles/tokens.css` — do not restyle the palette.
- **Routing:** EN at `/`, NL at `/nl/`. `prefixDefaultLocale: false`.
- **Contact email:** `jeroen@sugarrush.dev` (identical in both locales).
- **jeroenwever.com links are locale-matched:** EN → `https://jeroenwever.com/`, NL → `https://jeroenwever.com/nl/`.
- **WCAG 2.2 AA**, zero axe violations at tags `wcag2a wcag2aa wcag21aa wcag22aa`, tested in both locales × {light, dark}.
- **Reference (read-only):** the resume site at `/Users/wever/Projects/resume-site` is the source of the reused files. Copy from it; do not modify it.

---

## File Structure

- `package.json`, `astro.config.mjs`, `tsconfig.json`, `bunfig.toml`, `.gitignore` — project config.
- `src/content/schema.ts` — zod schema for the landing content.
- `src/content/landing.en.json`, `src/content/landing.nl.json` — per-locale content (single source of truth).
- `src/content/index.ts` — validated content loader.
- `src/i18n/{index,en,nl}.ts` — locale helpers + UI chrome strings.
- `src/styles/tokens.css`, `src/styles/global.css` — copied design system.
- `src/layouts/Base.astro` — html/head/body shell, theme pre-paint script, skip link.
- `src/components/ThemeToggle.astro`, `src/components/LocaleToggle.astro` — copied toggles.
- `src/components/Topbar.astro` — wordmark + toggles.
- `src/components/Footer.astro` — SRD colophon.
- `src/components/LandingPage.astro` — composes Base + Topbar + hero + scan + CTAs + Footer.
- `src/pages/index.astro`, `src/pages/nl/index.astro` — thin locale entry points.
- `public/favicon.svg`, `public/robots.txt` — static assets.
- `scripts/serve-dist.ts` — static file server for site tests.
- `tests/unit/{content,i18n}.test.ts`, `tests/site/{pages,a11y,theme}.test.ts` — tests.
- `.github/workflows/ci.yml` — CI + Cloudflare Pages deploy.
- `README.md` — dev/test/deploy docs.

---

### Task 1: Content model — schema, per-locale JSON, i18n (unit-tested)

Pure TypeScript; no Astro rendering. Establishes the single source of truth and the locale helpers, verified by unit tests only.

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `bunfig.toml`
- Create: `.gitignore`
- Create: `src/content/schema.ts`
- Create: `src/content/landing.en.json`
- Create: `src/content/landing.nl.json`
- Create: `src/content/index.ts`
- Create: `src/i18n/en.ts`
- Create: `src/i18n/nl.ts`
- Create: `src/i18n/index.ts`
- Test: `tests/unit/content.test.ts`
- Test: `tests/unit/i18n.test.ts`

**Interfaces:**
- Produces: `getLanding(locale: 'en'|'nl'): Landing` from `src/content/index.ts`; `type Landing` from `src/content/schema.ts`.
- Produces: from `src/i18n`: `type Locale = 'en'|'nl'`, `locales`, `useTranslations(locale): (key: TranslationKey) => string`, `altLocale(locale): Locale`, `localePath(locale): string`.
- The `Landing` type shape: `{ brand: string; wordmark: string; slogan: string; scan: { heading: string; intro: string; steps: { title: string; body: string }[] }; cta: { email: string; emailLabel: string; personLabel: string; personHref: string }; footer: { builtWith: string; sourceLabel: string; sourceHref: string; operatesAs: string } }`.

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "sugarrush.dev",
  "type": "module",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check",
    "test:unit": "bun test tests/unit",
    "test:site": "bun test tests/site"
  },
  "dependencies": {
    "@astrojs/sitemap": "^3.2.0",
    "@fontsource-variable/bricolage-grotesque": "^5.2.10",
    "@fontsource-variable/inter": "^5.2.8",
    "astro": "^5.0.0",
    "zod": "^4.0.0"
  },
  "devDependencies": {
    "@astrojs/check": "^0.9.0",
    "@axe-core/playwright": "^4.10.0",
    "@types/bun": "^1.3.14",
    "playwright": "^1.49.0",
    "typescript": "^5.7.0"
  }
}
```

- [ ] **Step 2: Create `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "src/**/*", "tests/**/*", "scripts/**/*"],
  "exclude": ["dist"]
}
```

- [ ] **Step 3: Create `bunfig.toml`**

```toml
# Playwright-driven site tests launch real Chromium; CI runners need more
# headroom than bun's 5s default test timeout.
[test]
timeout = 30000
```

- [ ] **Step 4: Create `.gitignore`**

```gitignore
# build & deps
node_modules/
dist/
.astro/

# brainstorm artifacts
.superpowers/

# misc
.DS_Store
```

- [ ] **Step 5: Install dependencies**

Run: `bun install`
Expected: resolves and writes `bun.lock`; exit 0.

- [ ] **Step 6: Create `src/content/schema.ts`**

```typescript
import { z } from 'zod';

export const landingSchema = z.object({
  brand: z.string().min(1), // "Sugar Rush Development"
  wordmark: z.string().min(1), // "sugarrush.dev"
  slogan: z.string().min(1), // "coding with the speed of sweet"
  scan: z.object({
    heading: z.string().min(1),
    intro: z.string().min(1),
    steps: z
      .array(
        z.object({
          title: z.string().min(1),
          body: z.string().min(1),
        })
      )
      .length(3),
  }),
  cta: z.object({
    email: z.email(),
    emailLabel: z.string().min(1),
    personLabel: z.string().min(1),
    personHref: z.url(),
  }),
  footer: z.object({
    builtWith: z.string().min(1),
    sourceLabel: z.string().min(1),
    sourceHref: z.url(),
    operatesAs: z.string().min(1),
  }),
});

export type Landing = z.infer<typeof landingSchema>;
```

- [ ] **Step 7: Create `src/content/landing.en.json`**

```json
{
  "brand": "Sugar Rush Development",
  "wordmark": "sugarrush.dev",
  "slogan": "coding with the speed of sweet",
  "scan": {
    "heading": "The scan",
    "intro": "I look at how your teams build today — the codebase, the practices, the architecture — and name the risks that tend to bite later. Then you decide: fix them yourself, or I fix them with you, working across your teams and leading by example.",
    "steps": [
      {
        "title": "Scan",
        "body": "I go through how your teams build and name the risks, plainly."
      },
      {
        "title": "Report",
        "body": "You get a clear, prioritized picture — what matters, and why."
      },
      {
        "title": "Fix",
        "body": "You fix it, or I fix it with your teams, leading by example."
      }
    ]
  },
  "cta": {
    "email": "jeroen@sugarrush.dev",
    "emailLabel": "Email me about a scan",
    "personLabel": "Jeroen, the person behind it",
    "personHref": "https://jeroenwever.com/"
  },
  "footer": {
    "builtWith": "This site was built with agents",
    "sourceLabel": "source on GitHub",
    "sourceHref": "https://github.com/IdemIsDito/sugarrush.dev",
    "operatesAs": "Sugar Rush Development B.V."
  }
}
```

- [ ] **Step 8: Create `src/content/landing.nl.json`**

```json
{
  "brand": "Sugar Rush Development",
  "wordmark": "sugarrush.dev",
  "slogan": "coding with the speed of sweet",
  "scan": {
    "heading": "De scan",
    "intro": "Ik kijk naar hoe jullie teams nu bouwen — de codebase, de werkwijze, de architectuur — en benoem de risico's die later gaan bijten. Daarna kies je zelf: los je het zelf op, of los ik het samen met jullie op, dwars door de teams heen en door het voor te doen.",
    "steps": [
      {
        "title": "Scan",
        "body": "Ik loop na hoe jullie teams bouwen en benoem de risico's, helder."
      },
      {
        "title": "Rapport",
        "body": "Je krijgt een duidelijk, geprioriteerd beeld — wat telt, en waarom."
      },
      {
        "title": "Oplossen",
        "body": "Je lost het zelf op, of ik doe het samen met jullie teams en doe het voor."
      }
    ]
  },
  "cta": {
    "email": "jeroen@sugarrush.dev",
    "emailLabel": "Mail me over een scan",
    "personLabel": "Jeroen, de persoon erachter",
    "personHref": "https://jeroenwever.com/nl/"
  },
  "footer": {
    "builtWith": "Deze site is gebouwd met agents",
    "sourceLabel": "broncode op GitHub",
    "sourceHref": "https://github.com/IdemIsDito/sugarrush.dev",
    "operatesAs": "Sugar Rush Development B.V."
  }
}
```

- [ ] **Step 9: Create `src/content/index.ts`**

```typescript
import en from './landing.en.json';
import nl from './landing.nl.json';
import { landingSchema, type Landing } from './schema';

const raw = { en, nl } as const;

export type LandingLocale = keyof typeof raw;

/** Parse (and thereby validate) a locale's landing content. Throws on invalid content, failing the build. */
export function getLanding(locale: LandingLocale): Landing {
  return landingSchema.parse(raw[locale]);
}
```

- [ ] **Step 10: Create `src/i18n/en.ts`**

```typescript
export default {
  'nav.skip': 'Skip to content',
  'locale.switch': 'Nederlands',
  'theme.legend': 'Theme',
  'theme.system': 'System',
  'theme.light': 'Light',
  'theme.dark': 'Dark',
  'meta.title': 'Sugar Rush Development — engineering risk scans',
  'meta.description':
    'Sugar Rush Development B.V. — I scan how your teams build, name the risks, and help you fix them, or fix them with you. Run by Jeroen Wever.',
} as const;
```

- [ ] **Step 11: Create `src/i18n/nl.ts`**

```typescript
export default {
  'nav.skip': 'Naar inhoud',
  'locale.switch': 'English',
  'theme.legend': 'Thema',
  'theme.system': 'Systeem',
  'theme.light': 'Licht',
  'theme.dark': 'Donker',
  'meta.title': 'Sugar Rush Development — scans van engineeringrisico’s',
  'meta.description':
    'Sugar Rush Development B.V. — ik scan hoe jullie teams bouwen, benoem de risico’s en help ze op te lossen, of los ze samen met jullie op. Van Jeroen Wever.',
} as const;
```

- [ ] **Step 12: Create `src/i18n/index.ts`**

```typescript
import en from './en';
import nl from './nl';

export const locales = ['en', 'nl'] as const;
export type Locale = (typeof locales)[number];
export type TranslationKey = keyof typeof en;

const dictionaries: Record<Locale, Record<TranslationKey, string>> = { en, nl };

export function useTranslations(locale: Locale) {
  return (key: TranslationKey): string => dictionaries[locale][key];
}

export function altLocale(locale: Locale): Locale {
  return locale === 'en' ? 'nl' : 'en';
}

export function localePath(locale: Locale): string {
  return locale === 'en' ? '/' : '/nl/';
}
```

- [ ] **Step 13: Write failing unit test `tests/unit/content.test.ts`**

```typescript
import { describe, test, expect } from 'bun:test';
import { landingSchema } from '../../src/content/schema';
import { getLanding } from '../../src/content';

describe('landing content', () => {
  test('both locale files satisfy the schema', () => {
    expect(() => getLanding('en')).not.toThrow();
    expect(() => getLanding('nl')).not.toThrow();
  });

  test('schema rejects invalid content', () => {
    const result = landingSchema.safeParse({ brand: '' });
    expect(result.success).toBe(false);
  });

  test('schema rejects a malformed contact email', () => {
    const valid = getLanding('en');
    expect(
      landingSchema.safeParse({
        ...valid,
        cta: { ...valid.cta, email: 'not-an-email' },
      }).success
    ).toBe(false);
  });

  test('both locales expose exactly three scan steps', () => {
    expect(getLanding('en').scan.steps.length).toBe(3);
    expect(getLanding('nl').scan.steps.length).toBe(3);
  });

  test('contact email is jeroen@sugarrush.dev in both locales', () => {
    expect(getLanding('en').cta.email).toBe('jeroen@sugarrush.dev');
    expect(getLanding('nl').cta.email).toBe('jeroen@sugarrush.dev');
  });

  test('jeroenwever.com link is locale-matched', () => {
    expect(getLanding('en').cta.personHref).toBe('https://jeroenwever.com/');
    expect(getLanding('nl').cta.personHref).toBe('https://jeroenwever.com/nl/');
  });
});
```

- [ ] **Step 14: Write failing unit test `tests/unit/i18n.test.ts`**

```typescript
import { describe, test, expect } from 'bun:test';
import en from '../../src/i18n/en';
import nl from '../../src/i18n/nl';
import { useTranslations, altLocale, localePath } from '../../src/i18n';

describe('i18n', () => {
  test('en and nl dictionaries have identical keys', () => {
    expect(Object.keys(nl).sort()).toEqual(Object.keys(en).sort());
  });

  test('no empty translations', () => {
    for (const dict of [en, nl]) {
      for (const [key, value] of Object.entries(dict)) {
        expect(value.trim().length, `empty translation for ${key}`).toBeGreaterThan(0);
      }
    }
  });

  test('useTranslations returns locale-specific strings', () => {
    expect(useTranslations('en')('locale.switch')).toBe('Nederlands');
    expect(useTranslations('nl')('locale.switch')).toBe('English');
  });

  test('altLocale and localePath', () => {
    expect(altLocale('en')).toBe('nl');
    expect(altLocale('nl')).toBe('en');
    expect(localePath('en')).toBe('/');
    expect(localePath('nl')).toBe('/nl/');
  });
});
```

- [ ] **Step 15: Run unit tests to verify they pass**

Run: `bun run test:unit`
Expected: PASS — all tests in both files green. (Zod v4 exposes `z.email()`/`z.url()` as top-level helpers, matching the schema.)

- [ ] **Step 16: Commit**

```bash
git add package.json tsconfig.json bunfig.toml .gitignore bun.lock src/content src/i18n tests/unit
git commit -m "feat: landing content model, i18n, and unit tests

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 2: Design system + layout shell — page renders in both locales

Copies the candy-shop design system and renders a minimal page (topbar + hero) at `/` and `/nl/`, verified by a build + pages test.

**Files:**
- Create: `astro.config.mjs`
- Create: `src/styles/tokens.css` (verbatim copy from resume-site)
- Create: `src/styles/global.css` (verbatim copy from resume-site)
- Create: `src/components/ThemeToggle.astro` (verbatim copy from resume-site)
- Create: `src/components/LocaleToggle.astro` (verbatim copy from resume-site)
- Create: `src/layouts/Base.astro`
- Create: `src/components/Topbar.astro`
- Create: `src/components/LandingPage.astro`
- Create: `src/pages/index.astro`
- Create: `src/pages/nl/index.astro`
- Create: `public/favicon.svg`
- Create: `public/robots.txt`
- Test: `tests/site/pages.test.ts`

**Interfaces:**
- Consumes: `getLanding`, `useTranslations`, `altLocale`, `localePath`, `type Locale` from Task 1.
- Produces: `Base.astro` props `{ locale: Locale; title: string; description: string }` with a default `<slot />`. `LandingPage.astro` props `{ locale: Locale }`. `Topbar.astro` props `{ locale: Locale; wordmark: string }`.

- [ ] **Step 1: Copy the design tokens verbatim**

Run: `cp /Users/wever/Projects/resume-site/src/styles/tokens.css src/styles/tokens.css`
Expected: file exists; do not edit it (Global Constraints: tokens copied verbatim).

- [ ] **Step 2: Copy the global stylesheet verbatim**

Run: `cp /Users/wever/Projects/resume-site/src/styles/global.css src/styles/global.css`
Expected: file exists.

- [ ] **Step 3: Copy the two toggle components verbatim**

Run: `cp /Users/wever/Projects/resume-site/src/components/ThemeToggle.astro src/components/ThemeToggle.astro && cp /Users/wever/Projects/resume-site/src/components/LocaleToggle.astro src/components/LocaleToggle.astro`
Expected: both files exist. They already depend only on `../i18n` (Task 1 provides the same helpers and the `theme.*`/`locale.switch` keys).

- [ ] **Step 4: Create `astro.config.mjs`**

```javascript
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://sugarrush.dev',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'nl'],
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/404'),
    }),
  ],
});
```

- [ ] **Step 5: Create `public/favicon.svg`** (candy dot in brand raspberry)

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="7" fill="#1c1517" />
  <circle cx="16" cy="16" r="7" fill="#ff4f96" />
</svg>
```

- [ ] **Step 6: Create `public/robots.txt`**

```text
User-agent: *
Allow: /

Sitemap: https://sugarrush.dev/sitemap-index.xml
```

- [ ] **Step 7: Create `src/layouts/Base.astro`**

```astro
---
import '@fontsource-variable/bricolage-grotesque';
import '@fontsource-variable/inter';
import '../styles/tokens.css';
import '../styles/global.css';
import { useTranslations, altLocale, localePath, type Locale } from '../i18n';

interface Props {
  locale: Locale;
  title: string;
  description: string;
}

const { locale, title, description } = Astro.props;
const t = useTranslations(locale);
const site = Astro.site!;
const canonical = new URL(localePath(locale), site);
const alternate = new URL(localePath(altLocale(locale)), site);
---

<!doctype html>
<html lang={locale}>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonical} />
    <link rel="alternate" hreflang={locale} href={canonical} />
    <link rel="alternate" hreflang={altLocale(locale)} href={alternate} />
    <link rel="alternate" hreflang="x-default" href={new URL('/', site)} />
    <meta property="og:type" content="website" />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={canonical} />
    <meta name="twitter:card" content="summary" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="sitemap" href="/sitemap-index.xml" />
    <script is:inline>
      const stored = localStorage.getItem('theme');
      if (stored === 'light' || stored === 'dark') {
        document.documentElement.dataset.theme = stored;
      }
    </script>
  </head>
  <body>
    <a class="skip-link" href="#main">{t('nav.skip')}</a>
    <slot />
  </body>
</html>
```

- [ ] **Step 8: Create `src/components/Topbar.astro`**

```astro
---
import LocaleToggle from './LocaleToggle.astro';
import ThemeToggle from './ThemeToggle.astro';
import type { Locale } from '../i18n';

interface Props {
  locale: Locale;
  wordmark: string;
}

const { locale, wordmark } = Astro.props;
const [name, tld] = wordmark.split(/(?=\.)/); // "sugarrush" + ".dev"
---

<div class="topbar">
  <a class="mark" href="#main">{name}<span class="mark-dot" aria-hidden="true">{tld}</span></a>
  <div class="toggles">
    <LocaleToggle locale={locale} />
    <ThemeToggle locale={locale} />
  </div>
</div>

<style>
  .topbar {
    position: sticky;
    top: 0;
    z-index: 5;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-2);
    min-height: var(--topbar-height);
    padding: var(--space-1) var(--page-pad);
    background: var(--color-bg);
    border-bottom: 1px solid var(--color-border);
  }

  .mark {
    font-family: var(--font-display);
    font-weight: 800;
    font-size: var(--text-lg);
    color: var(--color-text);
    text-decoration: none;
    white-space: nowrap;

    & .mark-dot {
      color: var(--color-dot-raspberry);
    }

    @media (max-width: 40rem) {
      font-size: var(--text-base);
    }
  }

  .toggles {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }
</style>
```

- [ ] **Step 9: Create `src/components/LandingPage.astro`** (hero only for now; scan + CTAs + footer arrive in Task 3)

```astro
---
import Base from '../layouts/Base.astro';
import Topbar from './Topbar.astro';
import { getLanding } from '../content';
import { useTranslations, type Locale } from '../i18n';

interface Props {
  locale: Locale;
}

const { locale } = Astro.props;
const t = useTranslations(locale);
const c = getLanding(locale);
---

<Base locale={locale} title={t('meta.title')} description={t('meta.description')}>
  <Topbar locale={locale} wordmark={c.wordmark} />
  <main id="main">
    <header class="hero">
      <h1>{c.brand}</h1>
      <p class="slogan">{c.slogan}</p>
    </header>
  </main>
</Base>

<style>
  .hero {
    max-width: 44rem;
    margin-inline: auto;
    padding: var(--space-6) var(--page-pad) var(--space-5);
  }

  h1 {
    font-size: var(--text-2xl);
    letter-spacing: -0.02em;
  }

  .slogan {
    font-style: italic;
    color: var(--color-muted);
    margin: var(--space-2) 0 0;
  }
</style>
```

- [ ] **Step 10: Create `src/pages/index.astro`**

```astro
---
import LandingPage from '../components/LandingPage.astro';
---

<LandingPage locale="en" />
```

- [ ] **Step 11: Create `src/pages/nl/index.astro`**

```astro
---
import LandingPage from '../../components/LandingPage.astro';
---

<LandingPage locale="nl" />
```

- [ ] **Step 12: Typecheck and build**

Run: `bun run check && bun run build`
Expected: check reports 0 errors; build writes `dist/index.html`, `dist/nl/index.html`, and `dist/sitemap-index.xml`.

- [ ] **Step 13: Write failing test `tests/site/pages.test.ts`**

```typescript
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
```

- [ ] **Step 14: Run the site test**

Run: `bun run test:site`
Expected: PASS — all `landing pages` tests green.

- [ ] **Step 15: Commit**

```bash
git add astro.config.mjs src/styles src/layouts src/components src/pages public tests/site/pages.test.ts
git commit -m "feat: design system, layout shell, and bilingual page render

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 3: The scan section, CTAs, and footer

Fleshes out the page body with the proposition, both CTAs, and the SRD colophon — the content that makes the page actually say something. Verified by extending the pages test.

**Files:**
- Modify: `src/components/LandingPage.astro`
- Create: `src/components/Footer.astro`
- Modify: `tests/site/pages.test.ts`

**Interfaces:**
- Consumes: `getLanding(locale)` shape from Task 1 (`scan`, `cta`, `footer`), `Topbar`/`Base` from Task 2.
- Produces: `Footer.astro` props `{ locale: Locale }`.

- [ ] **Step 1: Create `src/components/Footer.astro`**

```astro
---
import { getLanding } from '../content';
import type { Locale } from '../i18n';

interface Props {
  locale: Locale;
}

const { locale } = Astro.props;
const f = getLanding(locale).footer;
const slogan = getLanding(locale).slogan;
---

<footer>
  <p class="srd">
    {f.builtWith} — <a href={f.sourceHref}>{f.sourceLabel}</a>.
    <strong>{f.operatesAs}</strong> — <em>{slogan}</em>
    <span class="sprinkles" aria-hidden="true">
      <span class="dot" style="--dot: var(--color-dot-raspberry)"></span>
      <span class="dot" style="--dot: var(--color-dot-grape)"></span>
      <span class="dot" style="--dot: var(--color-dot-blueberry)"></span>
    </span>
  </p>
</footer>

<style>
  footer {
    max-width: 44rem;
    margin-inline: auto;
    padding: var(--space-4) var(--page-pad) var(--space-5);
    border-top: 1px solid var(--color-border);
  }

  .srd {
    margin: 0;
    font-size: var(--text-sm);
    color: var(--color-muted);
  }

  .sprinkles {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    margin-left: var(--space-1);

    & .dot:nth-child(2) {
      width: 0.4em;
      height: 0.4em;
    }

    & .dot:nth-child(3) {
      width: 0.3em;
      height: 0.3em;
    }
  }
</style>
```

- [ ] **Step 2: Replace `src/components/LandingPage.astro` with the full page**

```astro
---
import Base from '../layouts/Base.astro';
import Topbar from './Topbar.astro';
import Footer from './Footer.astro';
import { getLanding } from '../content';
import { useTranslations, type Locale } from '../i18n';

interface Props {
  locale: Locale;
}

const { locale } = Astro.props;
const t = useTranslations(locale);
const c = getLanding(locale);
---

<Base locale={locale} title={t('meta.title')} description={t('meta.description')}>
  <Topbar locale={locale} wordmark={c.wordmark} />
  <main id="main">
    <header class="hero">
      <h1>{c.brand}</h1>
      <p class="slogan">{c.slogan}</p>
    </header>

    <section class="scan" aria-labelledby="scan-heading">
      <h2 id="scan-heading">{c.scan.heading}</h2>
      <p class="intro">{c.scan.intro}</p>
      <ol class="steps">
        {
          c.scan.steps.map((step) => (
            <li>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </li>
          ))
        }
      </ol>
      <div class="cta">
        <a class="cta-primary" href={`mailto:${c.cta.email}`}>{c.cta.emailLabel}</a>
        <a class="cta-secondary" href={c.cta.personHref}>{c.cta.personLabel} <span aria-hidden="true">→</span></a>
      </div>
    </section>
  </main>
  <Footer locale={locale} />
</Base>

<style>
  .hero {
    max-width: 44rem;
    margin-inline: auto;
    padding: var(--space-6) var(--page-pad) var(--space-4);
  }

  h1 {
    font-size: var(--text-2xl);
    letter-spacing: -0.02em;
  }

  .slogan {
    font-style: italic;
    color: var(--color-muted);
    margin: var(--space-2) 0 0;
  }

  .scan {
    max-width: 44rem;
    margin-inline: auto;
    padding: var(--space-2) var(--page-pad) var(--space-5);
  }

  .scan h2 {
    font-size: var(--text-xl);
  }

  .intro {
    margin: var(--space-3) 0 0;
    max-width: 40rem;
  }

  .steps {
    display: grid;
    gap: var(--space-3);
    grid-template-columns: repeat(3, 1fr);
    margin: var(--space-5) 0 0;
    padding: 0;
    list-style: none;
    counter-reset: step;

    @media (max-width: 40rem) {
      grid-template-columns: 1fr;
    }
  }

  .steps li {
    counter-increment: step;
    padding: var(--space-3);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 12px;
  }

  .steps h3 {
    font-size: var(--text-lg);

    &::before {
      content: counter(step);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 1.5em;
      height: 1.5em;
      margin-right: var(--space-2);
      font-size: var(--text-sm);
      color: var(--color-bg);
      background: var(--color-accent);
      border-radius: 50%;
    }
  }

  .steps p {
    margin: var(--space-2) 0 0;
    font-size: var(--text-sm);
    color: var(--color-muted);
  }

  .cta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-3) var(--space-4);
    margin-top: var(--space-5);
  }

  .cta-primary {
    display: inline-flex;
    align-items: center;
    min-height: 44px;
    padding: var(--space-2) var(--space-4);
    font-weight: 600;
    color: var(--color-bg);
    background: var(--color-accent);
    border-radius: 999px;
    text-decoration: none;

    &:hover {
      opacity: 0.9;
    }
  }

  .cta-secondary {
    min-height: 44px;
    display: inline-flex;
    align-items: center;
    color: var(--color-text);
    text-decoration-color: var(--color-border);

    &:hover {
      color: var(--color-accent);
    }
  }
</style>
```

- [ ] **Step 3: Extend `tests/site/pages.test.ts`** — add these tests inside the `describe('landing pages', ...)` block (after the existing `language toggle` test, before its closing `});`):

```typescript
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
```

- [ ] **Step 4: Rebuild and test**

Run: `bun run build && bun run test:site`
Expected: PASS — all `landing pages` tests green, including the four new ones.

- [ ] **Step 5: Commit**

```bash
git add src/components/LandingPage.astro src/components/Footer.astro tests/site/pages.test.ts
git commit -m "feat: scan section, CTAs, and SRD footer

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 4: Accessibility gate + theme behavior (axe, both locales × schemes)

Adds the static server helper and the axe + theme site tests — the WCAG 2.2 AA gate that mirrors the resume site.

**Files:**
- Create: `scripts/serve-dist.ts`
- Create: `tests/site/a11y.test.ts`
- Create: `tests/site/theme.test.ts`

**Interfaces:**
- Consumes: built `dist/` from Task 2/3.
- Produces: `serveDist(): { server, origin: string, dist: string }` from `scripts/serve-dist.ts`.

- [ ] **Step 1: Install the Playwright browser (once)**

Run: `bunx playwright install chromium`
Expected: Chromium downloaded; exit 0.

- [ ] **Step 2: Create `scripts/serve-dist.ts`**

```typescript
import { existsSync } from 'node:fs';

/** Serve the built dist/ directory on a random port. Caller must stop() the server. */
export function serveDist() {
  const dist = new URL('../dist/', import.meta.url).pathname;
  if (!existsSync(dist)) throw new Error('dist/ missing — run `bun run build` first');

  const server = Bun.serve({
    port: 0,
    async fetch(req) {
      let path = decodeURIComponent(new URL(req.url).pathname);
      if (path.endsWith('/')) path += 'index.html';
      let file = Bun.file(dist + path);
      if (!(await file.exists())) file = Bun.file(dist + path + '/index.html');
      if (!(await file.exists())) return new Response('not found', { status: 404 });
      return new Response(file);
    },
  });

  return { server, origin: `http://localhost:${server.port}`, dist };
}
```

- [ ] **Step 3: Create `tests/site/a11y.test.ts`**

```typescript
import { test, expect, afterAll } from 'bun:test';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { serveDist } from '../../scripts/serve-dist';

const { server, origin } = serveDist();
const browser = await chromium.launch();

afterAll(async () => {
  await browser.close();
  server.stop();
});

for (const path of ['/', '/nl/'] as const) {
  for (const colorScheme of ['light', 'dark'] as const) {
    test(`${path} (${colorScheme}) has zero WCAG 2.2 AA violations`, async () => {
      const context = await browser.newContext({ colorScheme });
      const page = await context.newPage();
      await page.goto(origin + path);

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze();

      const summary = results.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        nodes: v.nodes.map((n) => n.html),
      }));
      expect(summary).toEqual([]);

      await context.close();
    });
  }
}

for (const path of ['/', '/nl/'] as const) {
  test(`CTA links resolve to real targets (${path})`, async () => {
    const page = await browser.newPage();
    await page.goto(origin + path);

    const hrefs = await page.$$eval('a[href]', (els) => els.map((a) => a.getAttribute('href')!));
    expect(hrefs.some((h) => h.startsWith('mailto:jeroen@sugarrush.dev'))).toBe(true);
    expect(hrefs.some((h) => h.startsWith('https://jeroenwever.com/'))).toBe(true);

    // internal targets must exist on the server
    for (const href of hrefs.filter((h) => h.startsWith('/'))) {
      const res = await fetch(origin + href);
      expect(res.status, `broken link: ${href}`).toBe(200);
    }
    await page.close();
  });
}
```

- [ ] **Step 4: Create `tests/site/theme.test.ts`**

```typescript
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
```

- [ ] **Step 5: Rebuild and run the full site suite**

Run: `bun run build && bun run test:site`
Expected: PASS — zero axe violations across `/` and `/nl/` in light and dark; CTA-resolution and theme-persistence tests green. If axe flags a contrast issue, it means a token was altered — restore the verbatim `tokens.css`; do not hand-tune colors.

- [ ] **Step 6: Commit**

```bash
git add scripts/serve-dist.ts tests/site/a11y.test.ts tests/site/theme.test.ts
git commit -m "test: WCAG 2.2 AA axe gate and theme persistence

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 5: CI pipeline, deploy config, and README

Wires the quality gates into GitHub Actions with a Cloudflare Pages deploy, and documents the project. Deliverable is a valid workflow + docs; the pipeline runs on push.

**Files:**
- Create: `.github/workflows/ci.yml`
- Create: `README.md`

**Interfaces:**
- Consumes: the `check`, `test:unit`, `build`, `test:site` scripts from Task 1.

- [ ] **Step 1: Create `.github/workflows/ci.yml`**

```yaml
name: CI

on:
  push:

concurrency:
  group: ${{ github.ref }}
  cancel-in-progress: true

jobs:
  build-test-deploy:
    runs-on: ubuntu-latest
    env:
      HAS_CF_SECRETS: ${{ secrets.CLOUDFLARE_API_TOKEN != '' }}
    steps:
      - uses: actions/checkout@v7

      - uses: oven-sh/setup-bun@0c5077e51419868618aeaa5fe8019c62421857d6 # v2.2.0
        with:
          bun-version: latest

      - name: Install dependencies
        run: bun install --frozen-lockfile

      - name: Install Playwright Chromium
        run: bunx playwright install --with-deps chromium

      - name: Typecheck
        run: bun run check

      - name: Unit tests
        run: bun run test:unit

      - name: Build
        run: bun run build

      - name: Site tests (smoke, theme, axe)
        run: bun run test:site

      - name: Deploy to Cloudflare Pages
        if: env.HAS_CF_SECRETS == 'true'
        uses: cloudflare/wrangler-action@ebbaa1584979971c8614a24965b4405ff95890e0 # v4.0.0
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: pages deploy dist --project-name=sugarrush-dev --branch=${{ github.ref_name }}
```

- [ ] **Step 2: Create `README.md`**

```markdown
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

\`\`\`bash
bun install
bunx playwright install chromium   # once, for a11y/theme tests
bun run dev                        # http://localhost:4321
\`\`\`

## Test

\`\`\`bash
bun run check       # astro typecheck
bun run test:unit   # content schema + i18n
bun run build       # static site into dist/
bun run test:site   # pages, theme behavior, axe (WCAG 2.2 AA)
\`\`\`

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
\`\`\`
```

Note: the fenced ` ``` ` blocks inside the README use escaped backticks above only to keep this plan valid Markdown; write real triple-backtick fences into the actual `README.md`.

- [ ] **Step 3: Verify the full pipeline locally**

Run: `bun run check && bun run test:unit && bun run build && bun run test:site`
Expected: every stage exits 0 — the same gates CI runs.

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/ci.yml README.md
git commit -m "ci: quality gates + Cloudflare Pages deploy, and README

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Self-Review

**1. Spec coverage:**
- One-page bilingual EN/NL landing → Tasks 2–3 (pages at `/` and `/nl/`). ✓
- Brand presence (wordmark, brand, slogan) → Topbar + hero (Task 2), Footer (Task 3). ✓
- The scan (intro + Scan/Report/Fix) → Task 3 content + section. ✓
- First-person voice, honesty-first, no pricing/team → content JSON copy (Task 1/3). ✓
- Two CTAs: `mailto:jeroen@sugarrush.dev` + locale-matched jeroenwever.com → Task 3, asserted in Tasks 3–4. ✓
- Reused design system (tokens, global CSS, toggles) → Task 2 verbatim copies. ✓
- zod-validated per-locale content as single source of truth → Task 1. ✓
- WCAG 2.2 AA in CI, both locales × schemes → Task 4 axe test + Task 5 CI. ✓
- Theme: system default + persisted override, pre-paint → Base script + ThemeToggle (Task 2), tested Task 4. ✓
- Cloudflare Pages deploy → Task 5. ✓
- Out of scope (form, pricing, blog, SaaS, PDF/OG) → correctly absent; OG-image generation dropped, Base uses `twitter:card summary` with no image. ✓

**2. Placeholder scan:** No TBD/TODO. Every code step carries complete, runnable content. The README's escaped fences are called out explicitly so the implementer writes real fences.

**3. Type consistency:** `getLanding(locale)`/`type Landing` used consistently (Tasks 1–3). `Landing` fields (`brand`, `wordmark`, `slogan`, `scan.{heading,intro,steps[].title/body}`, `cta.{email,emailLabel,personLabel,personHref}`, `footer.{builtWith,sourceLabel,sourceHref,operatesAs}`) match every consumer. i18n `useTranslations/altLocale/localePath/Locale` signatures match the copied `ThemeToggle`/`LocaleToggle`/`Base`. `serveDist()` return shape matches its test consumers. `#theme-select` id in ThemeToggle matches the theme test selector.
