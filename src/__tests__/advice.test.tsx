import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';

// Prevent actual file writes during tests
const writeSpy = vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {});

// Mock session holder
const mockSession = {
  role: 'owner',
  name: 'Youssef Mahir',
  id: 'admin-1'
};

vi.mock('@/lib/session', () => ({
  verifyAdminSession: vi.fn(() => Promise.resolve(mockSession)),
  hashPassword: vi.fn((p) => p)
}));

// Import the actual implementations
const { supabase } = await vi.importActual<typeof import('@/lib/supabase')>('../lib/supabase');
import { GET as adminGet, POST as adminPost } from '../app/api/admin/advice/route';
import { PUT as adminPut, DELETE as adminDelete } from '../app/api/admin/advice/[id]/route';
import { GET as publicGet } from '../app/api/advice/route';
import { GET as publicSlugGet } from '../app/api/advice/[slug]/route';

describe('Advice CMS Database & API Operations', () => {
  let originalDb: any;

  beforeEach(() => {
    // Backup and clone original mock database state
    const globalForMock = globalThis as any;
    originalDb = JSON.parse(JSON.stringify(globalForMock.mockDb));
    mockSession.role = 'owner'; // reset role to owner
    mockSession.name = 'Youssef Mahir';
    writeSpy.mockClear();
  });

  afterEach(() => {
    // Restore original mock database state
    const globalForMock = globalThis as any;
    globalForMock.mockDb = originalDb;
  });

  it('should allow owner to create a new advice article and save it to the DB', async () => {
    const payload = {
      slug: 'test-kbeauty-secrets',
      title_fr: 'Secrets de K-Beauty',
      title_ar: 'أسرار الجمال الكوري',
      content_fr: 'Contenu en français',
      content_ar: 'المحتوى باللغة العربية',
      summary_fr: 'Résumé',
      summary_ar: 'ملخص',
      image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03',
      category: 'kbeauty',
      read_time: 5,
      recommended_products: [1, 2],
      status: 'draft'
    };

    const req = new Request('http://localhost:3000/api/admin/advice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const response = await adminPost(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.article.slug).toBe('test-kbeauty-secrets');

    // Verify it exists in database
    const { data: dbArticles } = await supabase.from('advice_articles').select('*');
    const matches = dbArticles.filter((a: any) => a.slug === 'test-kbeauty-secrets');
    expect(matches).toHaveLength(1);
    expect(matches[0].category).toBe('kbeauty');
  });

  it('should block non-owner (support or logistician) from creating advice articles', async () => {
    mockSession.role = 'support'; // downgrade role to support

    const payload = {
      slug: 'forbidden-article',
      title_fr: 'Forbidden',
      title_ar: 'ممنوع',
      content_fr: 'No access',
      content_ar: 'لا وصول',
      summary_fr: 'Forbidden summary',
      summary_ar: 'ملخص ممنوع',
      image: 'img.jpg',
      category: 'skincare',
      status: 'published'
    };

    const req = new Request('http://localhost:3000/api/admin/advice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const response = await adminPost(req);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.success).toBe(false);
    expect(data.error).toContain('Accès refusé');
  });

  it('should retrieve all articles including drafts via admin GET API', async () => {
    // Add a draft article to mockDb
    const globalForMock = globalThis as any;
    globalForMock.mockDb.advice_articles.push({
      id: 'art_draft_test',
      slug: 'un-brouillon',
      title_fr: 'Un Brouillon',
      title_ar: 'مسودة',
      content_fr: 'Contenu draft',
      content_ar: 'المحتوى',
      summary_fr: 'Excerpt',
      summary_ar: 'ملخص',
      image: 'img.jpg',
      category: 'skincare',
      read_time: 3,
      recommended_products: [],
      status: 'draft',
      created_at: new Date().toISOString()
    });

    const req = new Request('http://localhost:3000/api/admin/advice');
    const response = await adminGet(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    // Should have seeded articles (2) + new draft (1) = 3 total
    expect(data.articles).toHaveLength(3);
    const drafts = data.articles.filter((a: any) => a.status === 'draft');
    expect(drafts).toHaveLength(1);
    expect(drafts[0].slug).toBe('un-brouillon');
  });

  it('should retrieve only published articles via public GET API', async () => {
    // Add a draft article to mockDb
    const globalForMock = globalThis as any;
    globalForMock.mockDb.advice_articles.push({
      id: 'art_draft_test',
      slug: 'un-brouillon',
      title_fr: 'Un Brouillon',
      title_ar: 'مسودة',
      content_fr: 'Contenu draft',
      content_ar: 'المحتوى',
      summary_fr: 'Excerpt',
      summary_ar: 'ملخص',
      image: 'img.jpg',
      category: 'skincare',
      read_time: 3,
      recommended_products: [],
      status: 'draft',
      created_at: new Date().toISOString()
    });

    const req = new Request('http://localhost:3000/api/advice');
    const response = await publicGet(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    // Drafts should be hidden; only get the 2 seeded published articles
    expect(data.articles).toHaveLength(2);
    const matchesDraft = data.articles.filter((a: any) => a.slug === 'un-brouillon');
    expect(matchesDraft).toHaveLength(0);
  });

  it('should allow modifying an article and writing audit log entry', async () => {
    const req = new Request('http://localhost:3000/api/admin/advice/art_1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title_fr: 'Nouveau titre mis à jour',
        status: 'published'
      })
    });

    const response = await adminPut(req, { params: Promise.resolve({ id: 'art_1' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.article.title_fr).toBe('Nouveau titre mis à jour');

    // Verify Audit Log entry was generated
    const { data: logs } = await supabase.from('audit_logs').select('*');
    const adviceLogs = logs.filter((l: any) => l.action === "Modification d'Article");
    expect(adviceLogs).toHaveLength(1);
    expect(adviceLogs[0].details).toContain('art_1');
  });

  it('should block deleting articles if role is not owner', async () => {
    mockSession.role = 'logistician'; // downgrade role

    const req = new Request('http://localhost:3000/api/admin/advice/art_2', {
      method: 'DELETE'
    });

    const response = await adminDelete(req, { params: Promise.resolve({ id: 'art_2' }) });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.success).toBe(false);

    // Verify it was NOT deleted
    const { data: item } = await supabase.from('advice_articles').select('*').eq('id', 'art_2').single();
    expect(item).not.toBeNull();
  });

  it('should support retrieving details for a published article by slug', async () => {
    const req = new Request('http://localhost:3000/api/advice/routine-kbeauty-glass-skin');
    const response = await publicSlugGet(req, { params: Promise.resolve({ slug: 'routine-kbeauty-glass-skin' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.article.id).toBe('art_1');
  });

  it('should return 404 for non-existent or draft article details request', async () => {
    // Add draft
    const globalForMock = globalThis as any;
    globalForMock.mockDb.advice_articles.push({
      id: 'art_draft_test',
      slug: 'le-brouillon-url',
      title_fr: 'Brouillon',
      title_ar: 'مسودة',
      content_fr: 'Draft',
      content_ar: 'مسودة',
      summary_fr: 'Excerpt',
      summary_ar: 'ملخص',
      image: 'img.jpg',
      category: 'skincare',
      status: 'draft',
      created_at: new Date().toISOString()
    });

    // Requesting draft slug
    const reqDraft = new Request('http://localhost:3000/api/advice/le-brouillon-url');
    const responseDraft = await publicSlugGet(reqDraft, { params: Promise.resolve({ slug: 'le-brouillon-url' }) });
    expect(responseDraft.status).toBe(404);

    // Requesting invalid slug
    const reqInvalid = new Request('http://localhost:3000/api/advice/does-not-exist');
    const responseInvalid = await publicSlugGet(reqInvalid, { params: Promise.resolve({ slug: 'does-not-exist' }) });
    expect(responseInvalid.status).toBe(404);
  });
});
