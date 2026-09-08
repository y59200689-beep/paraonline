export function brandLogoSrc(name: string, domain?: string | null, logo?: string | null) {
  // Empty means explicitly removed; null/undefined retain automatic lookup.
  if (logo === '') return '';
  return logo || `https://logos.hunter.io/${domain || `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`}`;
}
