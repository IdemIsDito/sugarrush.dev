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

  test('schema rejects a malformed resume URL', () => {
    const valid = getLanding('en');
    expect(
      landingSchema.safeParse({
        ...valid,
        resume: { ...valid.resume, href: 'not-a-url' },
      }).success
    ).toBe(false);
  });

  test('the headline is the slogan in both locales', () => {
    expect(getLanding('en').slogan).toBe('coding with the speed of sweet');
    expect(getLanding('nl').slogan).toBe('coding with the speed of sweet');
  });

  test('resume link is locale-matched', () => {
    expect(getLanding('en').resume.href).toBe('https://jeroenwever.com/');
    expect(getLanding('nl').resume.href).toBe('https://jeroenwever.com/nl/');
  });
});
