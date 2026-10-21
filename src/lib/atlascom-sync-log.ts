type ProductRow = Record<string, unknown>;

const text = (value: unknown) => JSON.stringify(String(value ?? ''));

/** Only describe fields the sync writes; unchanged products have no log entry. */
export function atlascomProductLog(previous: ProductRow | null, next: ProductRow): string | null {
  const identity = `SKU ${text(next.sku)} | ${text(next.title)} | ID ${next.id}`;
  if (!previous) {
    return `AJOUTÉ | ${identity} | Stock : ${Number(next.stock)} | Prix : ${Number(next.price)} DH | Statut : brouillon`;
  }

  const changes: string[] = [];
  for (const [field, label] of [['title', 'Titre'], ['name', 'Nom'], ['name_fr', 'Nom français'], ['vendor', 'Marque']]) {
    if (String(previous[field] ?? '') !== String(next[field] ?? '')) {
      changes.push(`${label} : ${text(previous[field])} → ${text(next[field])}`);
    }
  }
  for (const [field, label] of [['stock', 'Stock'], ['price', 'Prix'], ['compare_price', 'Prix de référence']]) {
    if (Number(previous[field] ?? 0) !== Number(next[field] ?? 0)) {
      const unit = field === 'stock' ? '' : ' DH';
      changes.push(`${label} : ${Number(previous[field] ?? 0)} → ${Number(next[field] ?? 0)}${unit}`);
    }
  }
  return changes.length ? `MODIFIÉ | ${identity} | ${changes.join(' | ')}` : null;
}
