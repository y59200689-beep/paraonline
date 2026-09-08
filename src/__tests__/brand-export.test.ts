import { describe, it, expect } from 'vitest';

describe('Brand Export Logic', () => {
  interface ExportableBrand {
    name: string;
    logo_url: string | null;
  }

  const generateBrandsCsv = (brands: ExportableBrand[], origin: string = 'https://paraonline-weld.vercel.app') => {
    const getImageUrl = (brand: ExportableBrand): string => {
      if (brand.logo_url && brand.logo_url.trim() !== '') {
        const trimmed = brand.logo_url.trim();
        if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
          return trimmed;
        }
        if (trimmed.startsWith('/') && origin) {
          return `${origin}${trimmed}`;
        }
        return trimmed;
      }
      return '';
    };

    const escapeCsv = (val: unknown) => {
      if (val === null || val === undefined) return '';
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const headers = ['Nom', "Lien de l'image"];
    const rows = brands.map(brand => [
      brand.name,
      getImageUrl(brand),
    ]);

    return '\uFEFF' + [headers, ...rows].map(row => row.map(escapeCsv).join(',')).join('\n');
  };

  it('exports brand names and their image links', () => {
    const brands: ExportableBrand[] = [
      { name: 'La Roche-Posay', logo_url: '/uploads/laroche.png' },
      { name: 'Vichy', logo_url: 'https://cdn.example.com/vichy.png' },
      { name: 'Marque Sans Logo', logo_url: null },
      { name: 'Autre Marque', logo_url: '' },
    ];

    const csv = generateBrandsCsv(brands, 'https://paraonline.ma');
    const lines = csv.replace(/^\uFEFF/, '').split('\n');

    expect(lines[0]).toBe('Nom,Lien de l\'image');
    expect(lines[1]).toBe('La Roche-Posay,https://paraonline.ma/uploads/laroche.png');
    expect(lines[2]).toBe('Vichy,https://cdn.example.com/vichy.png');
    expect(lines[3]).toBe('Marque Sans Logo,');
    expect(lines[4]).toBe('Autre Marque,');
  });

  it('properly escapes brand names with special characters like commas and quotes', () => {
    const brands: ExportableBrand[] = [
      { name: 'L\'Oréal, Paris', logo_url: '/uploads/loreal.png' },
      { name: 'Brand "Special"', logo_url: null },
    ];

    const csv = generateBrandsCsv(brands, 'https://paraonline.ma');
    const lines = csv.replace(/^\uFEFF/, '').split('\n');

    expect(lines[1]).toBe('"L\'Oréal, Paris",https://paraonline.ma/uploads/loreal.png');
    expect(lines[2]).toBe('"Brand ""Special""",');
  });
});
