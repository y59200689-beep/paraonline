import { describe, expect, it } from 'vitest';
import robots from '@/app/robots';

describe('robots.txt', () => {
  it('allows crawlers to fetch Next.js assets used to render public pages', () => {
    const rules = robots().rules;
    const publicRule = Array.isArray(rules)
      ? rules.find(rule => rule.userAgent === '*')
      : rules;

    expect(publicRule?.allow).toContain('/');
    expect(publicRule?.allow).toContain('/products');
    expect(publicRule?.disallow).not.toContain('/_next/');
  });
});
