import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const css = readFileSync('src/app/styles/storefront-brand-colors.css', 'utf8');
const hex = (name: string) => css.match(new RegExp(`--${name}: (#[a-f0-9]{6});`))![1];
const luminance = (value: string) => {
  const c = value.slice(1).match(/../g)!.map(part => parseInt(part, 16) / 255)
    .map(n => n <= .04045 ? n / 12.92 : ((n + .055) / 1.055) ** 2.4);
  return c[0] * .2126 + c[1] * .7152 + c[2] * .0722;
};
const contrast = (a: string, b: string) => {
  const values = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (values[0] + .05) / (values[1] + .05);
};

describe('Para Divine color-only theme', () => {
  it('uses the requested brand colors and white/soft surfaces', () => {
    expect(hex('brand-primary')).toBe('#e68d8f');
    expect(hex('brand-button-fill')).toBe('#b95058');
    expect(hex('brand-secondary')).toBe('#41abad');
    expect(hex('brand-background')).toBe('#ffffff');
    expect(hex('brand-soft')).toBe('#faf7f6');
    expect(hex('brand-soft-cool')).toBe('#f7fbfb');
  });
  it('uses the requested white CTA text while retaining readable accent text', () => {
    expect(hex('brand-button-text')).toBe('#ffffff');
    expect(css).toContain('color: var(--brand-button-text) !important;');
    for (const background of ['brand-button-fill', 'brand-button-gradient-light']) {
      expect(contrast(hex('brand-button-text'), hex(background))).toBeGreaterThanOrEqual(4.5);
    }
    expect(contrast('#ffffff', '#bd555b')).toBeGreaterThanOrEqual(4.5);
    expect(contrast('#ffffff', '#af4b51')).toBeGreaterThanOrEqual(4.5);
    expect(contrast(hex('brand-text'), hex('brand-secondary'))).toBeGreaterThanOrEqual(4.5);
    expect(contrast(hex('brand-text'), hex('brand-primary'))).toBeGreaterThanOrEqual(4.5);
    expect(contrast(hex('brand-secondary-ink'), hex('brand-background'))).toBeGreaterThanOrEqual(4.5);
  });
  it('does not override layout, typography, motion, or semantic status tokens', () => {
    const declarations = [...css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/(?:^|[;{])\s*([a-z-]+)\s*:/gm)].map(m => m[1]);
    const paint = ['color', 'background-color', 'background-image', 'border-color', 'outline-color', 'accent-color'];
    expect(declarations.filter(name => !name.startsWith('--') && !paint.includes(name))).toEqual([]);
    expect(css).not.toMatch(/--(?:color-(?:destructive|emerald|whatsapp)|public-(?:danger|mint))[^:]*:/);
    expect(css).not.toMatch(/(?:^|\n)\s*:root\s*\{/);
  });
});
