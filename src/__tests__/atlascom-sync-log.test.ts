import { describe, expect, it } from 'vitest';
import { atlascomProductLog } from '@/lib/atlascom-sync-log';

const row = { id: 42, sku: 'SKU-42', title: 'Crème', name: 'Crème', name_fr: 'Crème', vendor: '', price: 99, compare_price: 99, stock: 3 };

describe('Atlascom product logs', () => {
  it('omits unchanged products, including equivalent database numeric strings', () => {
    expect(atlascomProductLog({ ...row, price: '99', stock: '3' }, row)).toBeNull();
  });
  it('identifies updated products and records old and new price and stock', () => {
    const log = atlascomProductLog(row, { ...row, price: 109, stock: 5 });
    expect(log).toContain('MODIFIÉ | SKU "SKU-42" | "Crème" | ID 42');
    expect(log).toContain('Stock : 3 → 5');
    expect(log).toContain('Prix : 99 → 109 DH');
    expect(log).not.toContain('Nom français');
  });
  it('records newly imported drafts without pretending they are published', () => {
    const log = atlascomProductLog(null, row);
    expect(log).toContain('AJOUTÉ');
    expect(log).toContain('SKU "SKU-42"');
    expect(log).toContain('Stock : 3 | Prix : 99 DH | Statut : brouillon');
  });
  it('includes changes to translated names and reference prices', () => {
    const log = atlascomProductLog(row, { ...row, name_fr: 'Nouvelle crème', compare_price: 120 });
    expect(log).toContain('Nom français : "Crème" → "Nouvelle crème"');
    expect(log).toContain('Prix de référence : 99 → 120 DH');
  });
  it('escapes embedded newlines so product names cannot forge log lines', () => {
    const log = atlascomProductLog(null, { ...row, title: 'Crème\nMODIFIÉ | faux' });
    expect(log).toContain('Crème\\nMODIFIÉ');
    expect(log).not.toContain('\n');
  });
});
