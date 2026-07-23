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
