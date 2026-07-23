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
