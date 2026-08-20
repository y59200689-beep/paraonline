import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockSession = { id: '1', name: 'Owner Session', username: 'owner', role: 'owner' };

vi.mock('@/lib/session', () => ({
  verifyAdminSession: vi.fn(() => Promise.resolve(mockSession)),
  hashPasswordAsync: vi.fn(async (value: string) => `hash:${value}`),
}));

const { supabase } = await vi.importActual<typeof import('@/lib/supabase')>('../lib/supabase');
const { POST: manageUsers } = await import('../app/api/admin/users/route');
const { GET: listOperators, POST: createOperator, PATCH: updateOperator } = await import('../app/api/admin/operators/route');
const { POST: disableMfa } = await import('../app/api/admin/auth/mfa/disable/route');
const { POST: registerOperator } = await import('../app/api/admin/auth/register/route');
const { GET: listMarketingFlows, POST: createMarketingFlow } = await import('../app/api/admin/marketing/flows/route');
const { GET: listCoupons, POST: createCoupon, PATCH: updateCoupon, DELETE: deleteCoupon } = await import('../app/api/admin/coupons/route');
const { GET: getAdminSettings, POST: updateAdminSettings } = await import('../app/api/admin/settings/route');

describe('DB-authoritative privileged admin mutations', () => {
  let originalDb: any;

  beforeEach(() => {
    const globalForMock = globalThis as any;
    originalDb = JSON.parse(JSON.stringify(globalForMock.mockDb));
    const owner = globalForMock.mockDb.operators.find((operator: any) => operator.id === mockSession.id);
    owner.role = 'viewer';
    owner.is_active = true;
    globalForMock.mockDb.operators.push({
      id: 'target-operator', name: 'Target', username: 'target', role: 'support', is_active: true,
      mfa_enabled: true, mfa_secret: 'secret',
    });
  });

  afterEach(() => {
    (globalThis as any).mockDb = originalDb;
  });

  it('rejects a stale owner session before creating an operator', async () => {
    const before = (await supabase.from('operators').select('*')).data.length;
    const response = await manageUsers(new Request('http://localhost/api/admin/users', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'new-user', password: 'password', name: 'New User', role: 'support' }),
    }));

    expect(response.status).toBe(403);
    expect((await supabase.from('operators').select('*')).data).toHaveLength(before);
  });

  it('rejects a viewer before creating an operator through the registration route', async () => {
    const before = (await supabase.from('operators').select('*')).data.length;
    const response = await registerOperator(new Request('http://localhost/api/admin/auth/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'viewer-created', password: 'password', name: 'Viewer Created' }),
    }));

    expect(response.status).toBe(403);
    expect((await supabase.from('operators').select('*')).data).toHaveLength(before);
  });

  it('rejects a stale owner session before disabling another operator’s MFA', async () => {
    const response = await disableMfa(new Request('http://localhost/api/admin/auth/mfa/disable', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'target-operator' }),
    }));

    expect(response.status).toBe(403);
    const { data: target } = await supabase.from('operators').select('*').eq('id', 'target-operator').single();
    expect(target.mfa_enabled).toBe(true);
    expect(target.mfa_secret).toBe('secret');
  });

  it('allows a viewer to read marketing flows but rejects direct creation', async () => {
    const listResponse = await listMarketingFlows();
    expect(listResponse.status).toBe(200);

    const before = (await supabase.from('marketing_flows').select('*')).data.length;
    const createResponse = await createMarketingFlow(new Request('http://localhost/api/admin/marketing/flows', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Viewer must not create this flow' }),
    }));

    expect(createResponse.status).toBe(403);
    expect((await supabase.from('marketing_flows').select('*')).data).toHaveLength(before);
  });

  it('allows an active owner to create a marketing flow', async () => {
    const owner = (globalThis as any).mockDb.operators.find((operator: any) => operator.id === mockSession.id);
    owner.role = 'owner';

    const response = await createMarketingFlow(new Request('http://localhost/api/admin/marketing/flows', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Owner flow', actions: [] }),
    }));

    expect(response.status).toBe(200);
    expect((await supabase.from('marketing_flows').select('*')).data).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: 'Owner flow' })]),
    );
  });

  it('uses the deployed operators schema for team management', async () => {
    const owner = (globalThis as any).mockDb.operators.find((operator: any) => operator.id === mockSession.id);
    owner.role = 'owner';

    const createResponse = await createOperator(new Request('http://localhost/api/admin/operators', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'QA Viewer', username: 'qa-viewer', password: 'qa-password', role: 'viewer' }),
    }) as any);

    expect(createResponse.status).toBe(201);
    const created = (await createResponse.json()).operator;
    expect(created).toMatchObject({ username: 'qa-viewer', role: 'viewer', is_active: true });
    expect(created).not.toHaveProperty('password');
    expect(created).not.toHaveProperty('email');
    expect(created).not.toHaveProperty('active');

    const listResponse = await listOperators(new Request('http://localhost/api/admin/operators') as any);
    expect(listResponse.status).toBe(200);
    expect((await listResponse.json()).operators).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: created.id, username: 'qa-viewer', is_active: true }),
    ]));

    const disableResponse = await updateOperator(new Request('http://localhost/api/admin/operators', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: created.id, is_active: false }),
    }) as any);
    expect(disableResponse.status).toBe(200);
    expect((await supabase.from('operators').select('*').eq('id', created.id).single()).data.is_active).toBe(false);
  });

  it('allows viewers to list coupons but rejects all direct coupon writes', async () => {
    const listResponse = await listCoupons();
    expect(listResponse.status).toBe(200);
    expect((await listResponse.json()).coupons).toEqual(expect.any(Array));

    const createResponse = await createCoupon(new Request('http://localhost/api/admin/coupons', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'VIEWER10', discountType: 'percent', discountValue: 10, minPurchase: 0, expiryDate: '2099-12-31', usageLimit: 0, isActive: true }),
    }));
    const updateResponse = await updateCoupon(new Request('http://localhost/api/admin/coupons', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'BEAUTY10', isActive: false }),
    }));
    const deleteResponse = await deleteCoupon(new Request('http://localhost/api/admin/coupons?code=BEAUTY10', { method: 'DELETE' }));

    expect(createResponse.status).toBe(403);
    expect(updateResponse.status).toBe(403);
    expect(deleteResponse.status).toBe(403);
    expect((await supabase.from('settings').select('*').eq('id', 1).single()).data.value.coupons)
      .toEqual(expect.arrayContaining([expect.objectContaining({ code: 'BEAUTY10', isActive: true })]));
  });

  it('allows an active owner to list, create, disable, and delete a coupon without shipping privileges', async () => {
    const owner = (globalThis as any).mockDb.operators.find((operator: any) => operator.id === mockSession.id);
    owner.role = 'owner';

    const listResponse = await listCoupons();
    expect(listResponse.status).toBe(200);

    const createResponse = await createCoupon(new Request('http://localhost/api/admin/coupons', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'QA10SAFE', discountType: 'percent', discountValue: 10, minPurchase: 0, startDate: '', expiryDate: '2099-12-31', usageLimit: 0, isActive: true }),
    }));
    expect(createResponse.status).toBe(201);
    const created = (await createResponse.json()).coupon;
    expect(created).toMatchObject({ code: 'QA10SAFE', discountType: 'percent', discountValue: 10, freeShipping: false, isActive: true });
    expect(created).not.toHaveProperty('password');
    expect(created).not.toHaveProperty('password_hash');

    const disableResponse = await updateCoupon(new Request('http://localhost/api/admin/coupons', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'QA10SAFE', isActive: false }),
    }));
    expect(disableResponse.status).toBe(200);
    expect((await disableResponse.json()).coupon).toMatchObject({ code: 'QA10SAFE', isActive: false, freeShipping: false });

    const deleteResponse = await deleteCoupon(new Request('http://localhost/api/admin/coupons?code=QA10SAFE', { method: 'DELETE' }));
    expect(deleteResponse.status).toBe(200);
    expect((await supabase.from('settings').select('*').eq('id', 1).single()).data.value.coupons)
      .not.toEqual(expect.arrayContaining([expect.objectContaining({ code: 'QA10SAFE' })]));
  });

  it.each([
    { code: '', discountType: 'percent', discountValue: 10, minPurchase: 0, expiryDate: '2099-12-31' },
    { code: 'BADPERCENT', discountType: 'percent', discountValue: 101, minPurchase: 0, expiryDate: '2099-12-31' },
    { code: 'BADFIXED', discountType: 'fixed', discountValue: -1, minPurchase: 0, expiryDate: '2099-12-31' },
    { code: 'BADDATE', discountType: 'percent', discountValue: 10, minPurchase: 0, startDate: '2099-12-31', expiryDate: '2099-01-01' },
  ])('rejects malformed owner coupon payload %#', async (payload) => {
    const owner = (globalThis as any).mockDb.operators.find((operator: any) => operator.id === mockSession.id);
    owner.role = 'owner';

    const response = await createCoupon(new Request('http://localhost/api/admin/coupons', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
    }));
    expect(response.status).toBe(400);
  });

  it('rejects legacy delivery-only and free-shipping coupon payloads', async () => {
    const owner = (globalThis as any).mockDb.operators.find((operator: any) => operator.id === mockSession.id);
    owner.role = 'owner';

    const response = await createCoupon(new Request('http://localhost/api/admin/coupons', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'FREESHIP', discountType: 'percent', discountValue: 10, minPurchase: 0, expiryDate: '2099-12-31', freeShipping: true }),
    }));
    expect(response.status).toBe(400);
    expect((await response.json()).error).toMatch(/livraison/i);
  });

  it('lets viewers read sanitized settings but rejects section writes', async () => {
    const readResponse = await getAdminSettings();
    expect(readResponse.status).toBe(200);
    const readBody = await readResponse.json();
    expect(readBody.settings).not.toHaveProperty('adminPasscode');
    expect(readBody.settings).not.toHaveProperty('yalidineApiKey');

    const writeResponse = await updateAdminSettings(new Request('http://localhost/api/admin/settings', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'general', settings: { storeName: 'Viewer cannot save' } }),
    }));
    expect(writeResponse.status).toBe(403);
  });

  it('merges owner section updates and normalizes shipping without erasing gifts or coupons', async () => {
    const owner = (globalThis as any).mockDb.operators.find((operator: any) => operator.id === mockSession.id);
    owner.role = 'owner';
    const readResponse = await getAdminSettings();
    expect(readResponse.status).toBe(200);
    const settingsRow = (globalThis as any).mockDb.settings.find((setting: any) => setting.id === 1);
    settingsRow.value = {
      ...settingsRow.value,
      freeShippingThreshold: 999,
      shippingFee: 35,
      shippingRules: [
        { city: 'Casablanca', fee: 20, freeThreshold: 111 },
        { city: 'Rabat', fee: 20, freeThreshold: 222 },
        { city: 'Salé', fee: 20, freeThreshold: 333 },
        { city: 'Mohammedia', fee: 20, freeThreshold: 444 },
        { city: 'Tanger', fee: 25, freeThreshold: 555 },
        { city: 'Marrakech', fee: 30, freeThreshold: 666 },
      ],
      giftRanges: [{ minAmount: 400, maxAmount: 599, productId: 1, isActive: true }, { minAmount: 600, maxAmount: 799, productId: 2, isActive: true }],
      coupons: [{ code: 'KEEP10', discountPercent: 10, freeShipping: false, isActive: true }],
      yalidineApiKey: 'private-value',
      unrelatedSetting: 'keep-me',
    };

    const response = await updateAdminSettings(new Request('http://localhost/api/admin/settings', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'general', settings: { storeName: 'Para Officinal S.A', shippingFee: 35, yalidineApiKey: '' } }),
    }));
    expect(response.status).toBe(200);
    const responseBody = await response.json();
    expect(responseBody.settings).not.toHaveProperty('yalidineApiKey');

    const persisted = (await supabase.from('settings').select('*').eq('id', 1).single()).data.value;
    expect(persisted.freeShippingThreshold).toBe(400);
    expect(persisted.shippingRules).toEqual([
      { city: 'Casablanca', fee: 20 }, { city: 'Rabat', fee: 20 }, { city: 'Salé', fee: 20 },
      { city: 'Mohammedia', fee: 20 }, { city: 'Tanger', fee: 25 }, { city: 'Marrakech', fee: 30 },
    ]);
    expect(persisted.giftRanges).toHaveLength(2);
    expect(persisted.coupons).toEqual([expect.objectContaining({ code: 'KEEP10' })]);
    expect(persisted.yalidineApiKey).toBe('private-value');
    expect(persisted.unrelatedSetting).toBe('keep-me');
  });

  it('rejects unauthenticated and malformed admin settings writes', async () => {
    const { verifyAdminSession } = await import('@/lib/session');
    vi.mocked(verifyAdminSession).mockResolvedValueOnce(null as any);
    const unauthenticated = await updateAdminSettings(new Request('http://localhost/api/admin/settings', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'general', settings: { storeName: 'No session' } }),
    }));
    expect(unauthenticated.status).toBe(401);

    const owner = (globalThis as any).mockDb.operators.find((operator: any) => operator.id === mockSession.id);
    owner.role = 'owner';
    const malformed = await updateAdminSettings(new Request('http://localhost/api/admin/settings', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'unknown', settings: [] }),
    }));
    expect(malformed.status).toBe(400);
  });
});
