/** Converts a camelCase theme key into the corresponding CSS custom property. */
export function toThemeColorVariable(key: string) {
  return `--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
}
