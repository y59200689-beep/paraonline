import { describe, it, expect } from 'vitest';

// Helper: Delimiter sniffing logic (copied from public/workers/csv-worker.js)
function sniffDelimiter(text: string, delimiter: string = 'auto'): string {
  let separator = ",";
  if (delimiter === "auto") {
    const firstLine = text.split(/\r?\n/)[0] || "";
    const commas = (firstLine.match(/,/g) || []).length;
    const semicolons = (firstLine.match(/;/g) || []).length;
    const tabs = (firstLine.match(/\t/g) || []).length;
    const pipes = (firstLine.match(/\|/g) || []).length;

    if (semicolons > commas && semicolons > tabs && semicolons > pipes) {
      separator = ";";
    } else if (tabs > commas && tabs > semicolons && tabs > pipes) {
      separator = "\t";
    } else if (pipes > commas && pipes > semicolons && pipes > tabs) {
      separator = "|";
    }
  } else {
    separator = delimiter;
  }
  return separator;
}

// Helper: High-performance CSV parser (copied from public/workers/csv-worker.js)
function parseCSV(text: string, separator: string): string[][] {
  const lines: string[][] = [];
  let row: string[] = [];
  let inQuotes = false;
  let currentValue = "";
  let i = 0;
  const len = text.length;

  while (i < len) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          currentValue += '"';
          i += 2; // skip double double-quotes
          continue;
        } else {
          inQuotes = false;
        }
      } else {
        currentValue += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === separator) {
        row.push(currentValue.trim());
        currentValue = "";
      } else if (char === "\r" || char === "\n") {
        if (char === "\r" && nextChar === "\n") {
          i++;
        }
        row.push(currentValue.trim());
        if (row.length > 0 && row.some(cell => cell !== "")) {
          lines.push(row);
        }
        row = [];
        currentValue = "";
      } else {
        currentValue += char;
      }
    }
    i++;
  }

  if (row.length > 0 || currentValue !== "") {
    row.push(currentValue.trim());
    if (row.some(cell => cell !== "")) {
      lines.push(row);
    }
  }

  return lines;
}

// Helper: Column mapping guesser (copied from CatalogTab.tsx)
const guessMapping = (header: string): string => {
  const h = header.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '');
  if (h === 'id' || h === 'productid' || h === 'identifiant') return 'id';
  if (h === 'title' || h === 'titre' || h === 'name' || h === 'nom' || h === 'namefr' || h === 'nomfr' || h === 'titrefrançais') return 'title';
  if (h === 'vendor' || h === 'brand' || h === 'marque' || h === 'fournisseur') return 'vendor';
  if (h === 'price' || h === 'prix' || h === 'pricefr' || h === 'prixdh') return 'price';
  if (h === 'compareprice' || h === 'prixcompare' || h === 'comparepricefr' || h === 'prixbarre' || h === 'compare') return 'comparePrice';
  if (h === 'stock' || h === 'quantity' || h === 'quantite' || h === 'qty') return 'stock';
  if (h === 'sku' || h === 'codesku' || h === 'referencesku' || h === 'ref') return 'sku';
  if (h === 'buyingcost' || h === 'coutdachat' || h === 'buying' || h === 'cout') return 'buyingCost';
  if (h === 'category' || h === 'categorie' || h === 'cat') return 'category';
  if (h === 'description' || h === 'desc') return 'description';
  if (h === 'ingredients' || h === 'composition') return 'ingredients';
  if (h === 'usage' || h === 'utilisation' || h === 'conseilsdutilisation') return 'usage';
  if (h === 'image' || h === 'urlimage' || h === 'photo' || h === 'img') return 'image';
  if (h === 'tags' || h === 'motscles') return 'tags';
  return '';
};

// Helper: Row validation logic (recreated from CatalogTab.tsx for isolated unit testing)
function validateCSVRows(rows: any[], existingProducts: any[] = [], importUpdateExisting: boolean = false) {
  const validations: any[] = [];
  const seenSkus = new Set<string>();
  const seenIds = new Set<number>();

  rows.forEach((mappedProduct, rowIdx) => {
    const errors: Record<string, string> = {};
    const warnings: Record<string, string> = {};

    // 1. Validate ID
    if (mappedProduct.id !== undefined && String(mappedProduct.id).trim() !== '') {
      const idNum = Number(String(mappedProduct.id).replace(/[^0-9.-]/g, ''));
      if (isNaN(idNum)) {
        errors.id = "L'ID doit être un nombre.";
      } else {
        if (seenIds.has(idNum)) {
          errors.id = "ID doublon dans le fichier CSV.";
        }
        seenIds.add(idNum);
      }
    }

    // 2. Validate SKU
    if (mappedProduct.sku && String(mappedProduct.sku).trim() !== '') {
      const skuStr = String(mappedProduct.sku).trim();
      if (seenSkus.has(skuStr)) {
        errors.sku = "SKU doublon dans le fichier CSV.";
      }
      seenSkus.add(skuStr);
      
      if (!importUpdateExisting) {
        const skuConflict = existingProducts.some(p => p.sku === skuStr);
        if (skuConflict) {
          warnings.sku = "Ce SKU existe déjà en base et sera ignoré.";
        }
      }
    }

    // 3. Validate Title
    if (!mappedProduct.title && !mappedProduct.id && !mappedProduct.sku) {
      errors.title = "Le produit doit avoir un Titre, un SKU ou un ID.";
    }

    // 4. Validate Price
    if (mappedProduct.price !== undefined && String(mappedProduct.price).trim() !== '') {
      const priceNum = Number(String(mappedProduct.price).replace(/[^0-9.-]/g, ''));
      if (isNaN(priceNum)) {
        errors.price = "Le prix doit être un nombre.";
      } else if (priceNum < 0) {
        errors.price = "Le prix ne peut pas être négatif.";
      }
    }

    // 5. Validate BuyingCost
    if (mappedProduct.buyingCost !== undefined && String(mappedProduct.buyingCost).trim() !== '') {
      const buyingCostNum = Number(String(mappedProduct.buyingCost).replace(/[^0-9.-]/g, ''));
      if (isNaN(buyingCostNum)) {
        errors.buyingCost = "Le coût d'achat doit être un nombre.";
      } else if (buyingCostNum < 0) {
        errors.buyingCost = "Le coût d'achat ne peut pas être négatif.";
      }
    }

    // 6. Validate Stock
    if (mappedProduct.stock !== undefined && String(mappedProduct.stock).trim() !== '') {
      const stockNum = Number(String(mappedProduct.stock).replace(/[^0-9.-]/g, ''));
      if (isNaN(stockNum) || !Number.isInteger(stockNum)) {
        errors.stock = "Le stock doit être un entier.";
      } else if (stockNum < 0) {
        errors.stock = "Le stock ne peut pas être négatif.";
      }
    }

    // 7. Validate Category
    if (mappedProduct.category && String(mappedProduct.category).trim() !== '') {
      const catStr = String(mappedProduct.category).trim().toLowerCase();
      const validCategories = ['bebe', 'solaire', 'visage', 'cheveux', 'kbeauty', 'offers', 'all'];
      if (!validCategories.includes(catStr)) {
        warnings.category = `Catégorie non reconnue ('${catStr}').`;
      }
    }

    validations.push({
      rowIdx,
      errors,
      warnings
    });
  });

  return validations;
}

// Tests
describe('CSV Importer & Exporter Logistics Engines', () => {
  describe('Delimiter Sniffing', () => {
    it('should sniff comma by default or if commas dominate', () => {
      const text = 'id,title,price\n1,Product A,120';
      expect(sniffDelimiter(text, 'auto')).toBe(',');
    });

    it('should sniff semicolon correctly', () => {
      const text = 'id;title;price\n1;Product A;120';
      expect(sniffDelimiter(text, 'auto')).toBe(';');
    });

    it('should sniff tab correctly', () => {
      const text = 'id\ttitle\tprice\n1\tProduct A\t120';
      expect(sniffDelimiter(text, 'auto')).toBe('\t');
    });

    it('should sniff pipe correctly', () => {
      const text = 'id|title|price\n1|Product A|120';
      expect(sniffDelimiter(text, 'auto')).toBe('|');
    });

    it('should respect manual override delimiter', () => {
      const text = 'id;title;price\n1;Product A;120';
      expect(sniffDelimiter(text, ';')).toBe(';');
    });
  });

  describe('CSV Parsing', () => {
    it('should parse simple fields correctly', () => {
      const text = 'id,title,price\n1,Product A,120';
      const lines = parseCSV(text, ',');
      expect(lines).toHaveLength(2);
      expect(lines[0]).toEqual(['id', 'title', 'price']);
      expect(lines[1]).toEqual(['1', 'Product A', '120']);
    });

    it('should parse quoted fields containing commas correctly', () => {
      const text = 'id,title,price\n1,"Product A, Special, Edition",120';
      const lines = parseCSV(text, ',');
      expect(lines[1][1]).toBe('Product A, Special, Edition');
    });

    it('should parse escaped quotes inside quoted fields', () => {
      const text = 'id,title,price\n1,"Product ""A"" Special",120';
      const lines = parseCSV(text, ',');
      expect(lines[1][1]).toBe('Product "A" Special');
    });
  });

  describe('Column Mapping Synonym Guessing', () => {
    it('should map id and synonyms correctly', () => {
      expect(guessMapping('ID')).toBe('id');
      expect(guessMapping('identifiant')).toBe('id');
      expect(guessMapping('product_id')).toBe('id');
    });

    it('should map title and French synonyms correctly', () => {
      expect(guessMapping('title')).toBe('title');
      expect(guessMapping('Nom FR')).toBe('title');
      expect(guessMapping('Titre')).toBe('title');
    });

    it('should map price and synonyms correctly', () => {
      expect(guessMapping('price')).toBe('price');
      expect(guessMapping('Prix (DH)')).toBe('price');
      expect(guessMapping('prix_dh')).toBe('price');
    });

    it('should map buyingCost and synonyms correctly', () => {
      expect(guessMapping('buyingCost')).toBe('buyingCost');
      expect(guessMapping("Coût d'achat")).toBe('buyingCost');
    });
  });

  describe('CSV Data Validation rules', () => {
    it('should pass on valid row', () => {
      const rows = [{ id: 1, title: 'Serum A', price: 250, stock: 10, sku: 'SRM-A', category: 'visage' }];
      const validations = validateCSVRows(rows);
      expect(validations[0].errors).toEqual({});
      expect(validations[0].warnings).toEqual({});
    });

    it('should report error for duplicate SKUs or IDs', () => {
      const rows = [
        { id: 1, title: 'Serum A', sku: 'SRM-A' },
        { id: 1, title: 'Serum B', sku: 'SRM-A' }
      ];
      const validations = validateCSVRows(rows);
      expect(validations[1].errors.id).toBe('ID doublon dans le fichier CSV.');
      expect(validations[1].errors.sku).toBe('SKU doublon dans le fichier CSV.');
    });

    it('should report warning for SKU conflict in DB when not updating existing', () => {
      const db = [{ id: 99, sku: 'SRM-EXISTING' }];
      const rows = [{ title: 'New Serum', sku: 'SRM-EXISTING' }];
      const validations = validateCSVRows(rows, db, false);
      expect(validations[0].warnings.sku).toBe('Ce SKU existe déjà en base et sera ignoré.');
    });

    it('should report error for negative prices and buying costs', () => {
      const rows = [{ title: 'Serum C', price: -50, buyingCost: -30 }];
      const validations = validateCSVRows(rows);
      expect(validations[0].errors.price).toBe('Le prix ne peut pas être négatif.');
      expect(validations[0].errors.buyingCost).toBe("Le coût d'achat ne peut pas être négatif.");
    });

    it('should report error for non-integer or negative stock', () => {
      const rows = [
        { title: 'Serum D', stock: 5.5 },
        { title: 'Serum E', stock: -10 }
      ];
      const validations = validateCSVRows(rows);
      expect(validations[0].errors.stock).toBe('Le stock doit être un entier.');
      expect(validations[1].errors.stock).toBe('Le stock ne peut pas être négatif.');
    });

    it('should report warning for non-supported category', () => {
      const rows = [{ title: 'Serum F', category: 'unknown-category' }];
      const validations = validateCSVRows(rows);
      expect(validations[0].warnings.category).toBe("Catégorie non reconnue ('unknown-category').");
    });
  });

  describe('Yalidine Carrier Manifest exporter formatting', () => {
    it('should correctly format order details into Yalidine columns', () => {
      const order = {
        order_id: 'ORD123',
        customer_name: 'Youssef Mahir',
        phone_number: '+212600000000',
        address: 'Bld Anfa N 15',
        city: 'Casablanca',
        total: 350,
        items: [
          { title: 'Serum A', quantity: 2, price: 150 },
          { title: 'Cream B', quantity: 1, price: 50 }
        ]
      };

      const parts = order.customer_name.split(' ');
      const firstname = parts[0];
      const familyname = parts.slice(1).join(' ');
      const itemsStr = order.items.map(i => `${i.title} (x${i.quantity})`).join(', ');

      const formattedRow = [
        order.order_id,
        familyname,
        firstname,
        order.phone_number,
        order.address,
        order.city,
        order.city,
        0, // stop_desk
        order.total,
        1, // hand_delivery
        0, // free_sharing
        itemsStr
      ];

      expect(formattedRow[0]).toBe('ORD123');
      expect(formattedRow[1]).toBe('Mahir');
      expect(formattedRow[2]).toBe('Youssef');
      expect(formattedRow[7]).toBe(0); // StopDesk default
      expect(formattedRow[8]).toBe(350); // Total price
      expect(formattedRow[11]).toBe('Serum A (x2), Cream B (x1)'); // Mapped products description
    });
  });

  describe('Cathedis Carrier Manifest exporter formatting', () => {
    it('should correctly format order details into Cathedis columns', () => {
      const order = {
        order_id: 'ORD456',
        customer_name: 'Amine Alaoui',
        phone_number: '+212611111111',
        address: 'Rue Ibn Tachfine N 8',
        city: 'Tanger',
        total: 500
      };

      const formattedRow = [
        order.order_id,
        order.customer_name,
        order.phone_number,
        order.address,
        order.city,
        order.total,
        0.5, // default weight
        "Standard", // dimensions
        "normal", // shipping type
        order.city
      ];

      expect(formattedRow[0]).toBe('ORD456');
      expect(formattedRow[1]).toBe('Amine Alaoui');
      expect(formattedRow[4]).toBe('Tanger');
      expect(formattedRow[5]).toBe(500); // COD amount
      expect(formattedRow[6]).toBe(0.5); // Weight default
      expect(formattedRow[8]).toBe('normal'); // Shipping type normal
    });
  });
});
