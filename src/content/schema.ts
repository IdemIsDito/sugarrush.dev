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
    /* Statutory company details. PLACEHOLDERS — replace with the real
       registration numbers before this site goes live. */
    kvk: z.string().min(1),
    btw: z.string().min(1),
    country: z.string().min(1),
  }),
});

export type Landing = z.infer<typeof landingSchema>;
