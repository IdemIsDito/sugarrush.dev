# sugarrush.dev — landing page design

**Date:** 2026-07-23
**Status:** approved (brainstorm), pending implementation plan
**Owner:** Jeroen Wever / Sugar Rush Development B.V.

## Summary

A one-page, bilingual (EN/NL) landing site for **Sugar Rush Development B.V.** at
`sugarrush.dev`. Its job is brand presence for the company plus a first, soft
statement of the new consultancy proposition — the **"scan"** — while linking back
to `jeroenwever.com` as the person behind the company.

This is the company face; `jeroenwever.com` is the personal/resume face. Two
companies-of-one, two repos, one shared visual language. The site is intentionally
small: it establishes presence now and gives the propositions a home to grow into
later, without committing to claims that can't yet be backed.

## Positioning (the pivot)

The shift is from selling **Jeroen for hire** (resume/CV framing on jeroenwever.com)
to selling **an outcome-led consultancy** under the Sugar Rush brand. The wedge is a
**scan**:

> I go into a company, name the risks in how their teams build today (codebase,
> practices, architecture — the things that bite later), and then either they fix
> them themselves or I fix them by leading by example, working across their teams
> rather than being embedded in one.

The offering is still forming. Copy stays deliberately soft and honest — one clear
proposition, no invented packages or pricing.

## Voice & honesty

- **First person "I."** It's a one-person company; the pitch must not imply a team
  that doesn't exist. The legal/brand name (Sugar Rush Development B.V.) appears in
  the wordmark and footer, not as a fake "we."
- Honesty-first standard carried over from the resume: no overclaiming, only
  defensible statements. The scan stays vague-but-real until sharpened.

## Scope

### In scope

A single page, both locales, top to bottom:

1. **Topbar** — `sugarrush.dev` wordmark (left); theme toggle + EN/NL locale toggle
   (right). Reuses the resume site's toggle patterns (persisted theme applied
   pre-paint; locale toggle swaps between `/` and `/nl/`).
2. **Hero** — "Sugar Rush Development" + slogan *"coding with the speed of sweet."*
3. **The scan** — one short first-person paragraph stating the proposition, followed
   by a soft three-step: **Scan → Report → Fix**
   - *Scan* — I look at how your teams build and name the risks.
   - *Report* — you get a clear, prioritized picture.
   - *Fix* — you fix it, or I fix it with your teams, leading by example.
   Concrete enough to mean something, light enough to avoid fake packages/pricing.
4. **Two CTAs** —
   - a `mailto:jeroen@sugarrush.dev` email link, and
   - "the person behind it →" linking to the **locale-matched** jeroenwever.com
     (EN → `https://jeroenwever.com/`, NL → `https://jeroenwever.com/nl/`).
5. **Footer** — Sugar Rush Development B.V., the SRD mark/slogan, a built-with note +
   source link, matching the resume footer's tone.

### Out of scope (YAGNI — future)

- Contact form / any backend (the `mailto:` link covers contact for now).
- Pricing, named packages, or scoped deliverables.
- Blog, case studies, or any additional pages.
- The A/B-testing SaaS product (tracked separately).

## Technical approach

New repo (`sugarrush-site`), **not** a fork of the whole resume repo, but reusing the
resume site's design system and pipeline wholesale:

- **Stack:** Astro 5 + Bun; vanilla modern CSS (custom properties, native nesting,
  `light-dark()`) — no CSS framework.
- **Design tokens:** copy `tokens.css` from the resume site verbatim (candy-shop
  palette: raspberry/grape/blueberry accents; Bricolage Grotesque display + Inter;
  `light-dark()` theming). One shared visual language across both sites.
- **Content model:** zod-validated JSON per locale (`content.en.json`,
  `content.nl.json`) as the single source of truth; UI labels in `src/i18n/`.
  Mirrors the resume site's approach.
- **i18n / routing:** EN at `/`, NL at `/nl/` (same shape as the resume site).
- **Theme + locale:** reuse the resume site's `ThemeToggle` and `LocaleToggle`
  component patterns (theme persisted and applied before paint; `prefers-color-scheme`
  as default with user override).
- **Accessibility:** WCAG 2.2 AA, enforced in CI via axe across both locales in both
  color schemes — same gate as the resume site.
- **CI/deploy:** typecheck → unit tests → build → site/a11y tests → deploy to
  Cloudflare Pages (`main` → production `sugarrush.dev`, branches → preview URLs).

## Reused vs. new

- **Reused (copied/adapted from resume-site):** `tokens.css`, global CSS base,
  `Base` layout, `ThemeToggle`, `LocaleToggle`, `Footer` pattern, zod content
  pipeline, i18n scaffolding, CI workflow, Cloudflare Pages config.
- **New:** the single landing page and its sections (hero, scan, CTAs), the
  `content.{en,nl}.json` copy, sugarrush-specific labels, wordmark/branding for
  `sugarrush.dev`, and the domain/Cloudflare project setup.

## Success criteria

- `sugarrush.dev` resolves to a live one-page site in EN and NL.
- Brand reads as Sugar Rush Development, visually consistent with jeroenwever.com.
- The scan proposition is stated clearly, first-person, and honestly.
- Both CTAs work: email opens `mailto:jeroen@sugarrush.dev`; the jeroenwever.com
  link lands on the matching locale.
- Passes the same quality gates as the resume site (typecheck, unit, build, axe
  WCAG 2.2 AA in both locales and schemes).

## Open questions

- None blocking. Email confirmed as `jeroen@sugarrush.dev`. Repo/dir named
  `sugarrush-site` (package `sugarrush.dev`) — adjustable.
