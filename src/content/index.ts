import en from './landing.en.json';
import nl from './landing.nl.json';
import { landingSchema, type Landing } from './schema';

const raw = { en, nl } as const;

export type LandingLocale = keyof typeof raw;

/** Parse (and thereby validate) a locale's landing content. Throws on invalid content, failing the build. */
export function getLanding(locale: LandingLocale): Landing {
  return landingSchema.parse(raw[locale]);
}
