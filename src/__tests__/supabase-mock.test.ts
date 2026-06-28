import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';

// Prevent actual file writes during tests
const writeSpy = vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {});

// Import the actual implementation bypass the global mock in setupTests
const { supabase } = await vi.importActual<typeof import('@/lib/supabase')>('../lib/supabase');

describe('Supabase Mock Client', () => {
  let originalDb: any;

  beforeEach(() => {
    // Backup and clone original mock database state
    const globalForMock = globalThis as any;
    originalDb = JSON.parse(JSON.stringify(globalForMock.mockDb));
  });

  afterEach(() => {
    // Restore original mock database state
    const globalForMock = globalThis as any;
    globalForMock.mockDb = originalDb;
    writeSpy.mockClear();
  });

  it('should auto-increment IDs for products table if omitted in insert', async () => {
    // Fetch current products to see the max ID
    const { data: initialProducts } = await supabase.from('products').select('id');
    const ids = (initialProducts || []).map((p: any) => Number(p.id)).filter((id: number) => !isNaN(id));
    const maxId = Math.max(0, ...ids);

    // Insert new product without ID
    const newProduct = {
      title: 'Test New Product AutoIncrement',
      price: 150,
      stock: 10,
      category: 'visage'
    };

    const { data: insertedData } = await supabase.from('products').insert(newProduct);
    expect(insertedData).toHaveLength(1);
    expect(insertedData[0].id).toBe(maxId + 1);
  });

  it('should auto-increment IDs for products table if omitted in upsert and avoid collision', async () => {
    // Fetch current products
    const { data: initialProducts } = await supabase.from('products').select('id');
    const ids = (initialProducts || []).map((p: any) => Number(p.id)).filter((id: number) => !isNaN(id));
    const maxId = Math.max(0, ...ids);

    // Upsert a batch of products without IDs
    const newProducts = [
      { title: 'Upsert Product A', price: 100 },
      { title: 'Upsert Product B', price: 200 }
    ];

    const { data: upsertedData } = await supabase.from('products').upsert(newProducts);
    expect(upsertedData).toHaveLength(2);
    expect(upsertedData[0].id).toBe(maxId + 1);
    expect(upsertedData[1].id).toBe(maxId + 2);
  });

  it('should update existing product in upsert if ID is provided', async () => {
    const { data: original } = await supabase.from('products').select('*').eq('id', 1).single();
    expect(original).not.toBeNull();
    const originalPrice = original.price;

    const updatedProduct = {
      id: 1,
      title: original.title,
      price: 999 // modify price
    };

    await supabase.from('products').upsert(updatedProduct);

    const { data: updated } = await supabase.from('products').select('*').eq('id', 1).single();
    expect(updated.price).toBe(999);
  });

  it('should support deferred update chaining with filters', async () => {
    // Select product with ID 2
    const { data: original } = await supabase.from('products').select('*').eq('id', 2).single();
    expect(original).not.toBeNull();

    // Update product 2 price
    await supabase.from('products').update({ price: 777 }).eq('id', 2);

    // Verify it updated the target product and didn't touch other products
    const { data: updated } = await supabase.from('products').select('*').eq('id', 2).single();
    expect(updated.price).toBe(777);

    // Product 1 price should not have changed to 777
    const { data: p1 } = await supabase.from('products').select('*').eq('id', 1).single();
    expect(p1.price).not.toBe(777);
  });

  it('should support deferred delete chaining with filters', async () => {
    // Insert a product first
    const testProduct = { id: 9999, title: 'Temp Product to Delete', price: 10, category: 'visage' };
    await supabase.from('products').insert(testProduct);

    // Verify it exists
    const { data: exists } = await supabase.from('products').select('*').eq('id', 9999).maybeSingle();
    expect(exists).not.toBeNull();

    // Delete it using .delete().eq(...)
    await supabase.from('products').delete().eq('id', 9999);

    // Verify it no longer exists
    const { data: deleted } = await supabase.from('products').select('*').eq('id', 9999).maybeSingle();
    expect(deleted).toBeNull();
  });
});
