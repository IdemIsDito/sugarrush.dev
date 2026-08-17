import { z } from 'zod';

export const landingSchema = z.object({
  brand: z.string().min(1), // "Sugar Rush Development" — the hero kicker
  wordmark: z.string().min(1), // "sugarrush.dev"
  slogan: z.string().min(1), // "coding with the speed of sweet" — the hero headline
  intro: z.string().min(1), // the line under the headline: what the name is
  resume: z.object({
    label: z.string().min(1),
    href: z.url(),
  }),
  footer: z.object({
    builtWith: z.string().min(1),
    sourceLabel: z.string().min(1),
    sourceHref: z.url(),
    operatesAs: z.string().min(1),
    /* Statutory company details. Shape-checked so a typo or a placeholder
       cannot reach a published page: KvK is 8 digits, BTW is the Dutch
       NL<9 digits>B<2 digits> format. */
    kvk: z.string().regex(/^KvK \d{8}$/),
    btw: z.string().regex(/^BTW NL\d{9}B\d{2}$/),
    country: z.string().min(1),
  }),
});

export type Landing = z.infer<typeof landingSchema>;
