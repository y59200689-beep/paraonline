// Read-only analysis: reports artwork bounds without modifying logo images.
// Usage: node scripts/audit-brand-logo-bounds.mjs http://localhost:3000
import sharp from 'sharp';
import { readFile } from 'node:fs/promises';

const origin = process.argv[2] || 'http://localhost:3000';
const { brands } = await fetch(`${origin}/api/brands`).then(response => response.json());
const mapping = await readFile('src/lib/storefront-brand-logos.ts', 'utf8');
const local = Object.fromEntries([...mapping.matchAll(/\s+(\w+): '([^']+)'/g)].map(match => [match[1], match[2]]));
const key = name => name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
const sources = [...new Set(brands.map(brand => local[key(brand.name)] || (brand.logo_url === '' ? '' : brand.logo_url || `https://logos.hunter.io/${brand.domain || `${brand.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`}`)).filter(Boolean))];
const bounds = {};
const failures = [];
let next = 0;
await Promise.all(Array.from({ length: 6 }, async () => {
  while (next < sources.length) {
    const src = sources[next++];
    try {
      const response = await fetch(new URL(src, origin), { signal: AbortSignal.timeout(15000) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const input = Buffer.from(await response.arrayBuffer());
      const { data, info } = await sharp(input).resize({ width: 600, height: 600, fit: 'inside', withoutEnlargement: true }).flatten({ background: '#ffffff' }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
      let left = info.width, top = info.height, right = -1, bottom = -1;
      for (let y = 0; y < info.height; y++) {
        for (let x = 0; x < info.width; x++) {
          const offset = (y * info.width + x) * info.channels;
          if (Math.min(data[offset], data[offset + 1], data[offset + 2]) < 225) {
            left = Math.min(left, x); right = Math.max(right, x);
            top = Math.min(top, y); bottom = Math.max(bottom, y);
          }
        }
      }
      if (right < 0) throw new Error('No visible artwork');
      // Keep a small safety margin around antialiased edges.
      left = Math.max(0, left - 2); top = Math.max(0, top - 2);
      right = Math.min(info.width - 1, right + 2); bottom = Math.min(info.height - 1, bottom + 2);
      bounds[src] = [info.width, info.height, left, top, right - left + 1, bottom - top + 1];
    } catch (error) { failures.push({ src, reason: error.message }); }
  }
}));
console.log(JSON.stringify({ bounds, failures }));
