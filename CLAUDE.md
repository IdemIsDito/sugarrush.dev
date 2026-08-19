# CLAUDE.md — sugarrush.dev

## Prose standard

This page is the company's whole pitch, so copy that reads as machine-written
costs more here than it would on a longer page. Content changes go through the
`stop-slop` skill.

**Em dashes are banned in anything a reader sees.** `tests/site/prose.test.ts`
asserts zero em dashes in the rendered HTML of both locales and fails the build
otherwise. Use instead, depending on the job the dash was doing:

| Dash was doing | Use |
|---|---|
| Joining two complete thoughts | A full stop |
| Introducing a list or expansion | A colon |
| A parenthetical aside | Commas or parentheses |
| A date or number range | An en dash (`–`), the correct character |
| Separating title parts | A middot (`·`) |

Also avoided, and covered by the same test: negative-contrast constructions
(`not just X but Y`, `isn't X, it's Y`). State the positive directly.

Source-code comments are exempt. The test reads rendered HTML.

Both locales stay in parity. A change to `landing.en.json` needs the matching
change in `landing.nl.json`.

## Statutory details are shape-checked

`footer.kvk` and `footer.btw` are validated by regex in `src/content/schema.ts`
(KvK is 8 digits, BTW is `NL<9 digits>B<2 digits>`). A placeholder or a typo
fails the build rather than reaching a published page. Do not loosen these.

## The page is one statement

The scan section was removed deliberately. This is a statement page: kicker,
headline, one paragraph, a resume link, a locale link, the statutory footer.
Do not reintroduce service copy without being asked.
