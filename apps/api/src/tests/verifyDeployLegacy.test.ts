import { describe, expect, it } from 'vitest';
import { homepageIsLegacyStarter } from '../../../../scripts/deploy/lib/legacy-homepage.mjs';

describe('homepageIsLegacyStarter', () => {
  it('detects legacy starter HTML signatures', () => {
    const legacy = `<main><p>Starter web app for messaging and calling.</p><section aria-label="Local development"></section></main>`;
    expect(homepageIsLegacyStarter(legacy)).toBe(true);
  });

  it('accepts modern marketing HTML without legacy signatures', () => {
    const modern = `<html><body><div class="hero">Workspace</div><script src="/_next/static/chunks/main.js"></script></body></html>`;
    expect(homepageIsLegacyStarter(modern)).toBe(false);
  });
});
