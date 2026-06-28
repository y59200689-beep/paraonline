# Supabase Integration & Bootstrap Guide

This document contains a comprehensive reference of all Supabase configuration, schema definitions, Row Level Security (RLS) policies, and TypeScript integration scripts needed to set up and run the e-commerce storefront database from scratch.

---

## 1. Environment Variables Configuration (`.env.local`)

Add the following environment variables to your `.env.local` file at the root of the project. Replace placeholders with your actual project credentials from your Supabase Dashboard project settings (**Project Settings → API**).

```env
# Public Supabase credentials for client-side queries
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-public-anon-key-placeholder

# Service Role Key — Server-Side API routes ONLY (bypasses RLS for admin tasks/secure orders)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-placeholder

# Site URL for redirects (auth)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## 2. Consolidated Database Schema & Policies (`schema.sql`)

Below is the consolidated SQL migration containing the initial schemas, table modifications (MFA, payments), and RLS configurations. Run this script in the **Supabase SQL Editor** or save it inside `supabase/migrations/20260614000000_bootstrap.sql` to initialize the database:

```sql
-- ============================================================
-- 1. EXTENSIONS & SCHEMA INITIALIZATION
-- ============================================================

-- Enable pgcrypto for UUID generation if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 2. CREATE TABLES
-- ============================================================

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  name TEXT,
  name_fr TEXT,
  vendor TEXT NOT NULL,
  image TEXT,
  images TEXT[] DEFAULT '{}'::TEXT[],
  price NUMERIC NOT NULL,
  compare_price NUMERIC,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}'::TEXT[],
  rating NUMERIC DEFAULT 5,
  reviews NUMERIC DEFAULT 0,
  description TEXT,
  ingredients TEXT,
  usage TEXT,
  stock INTEGER DEFAULT 100,
  sku TEXT,
  buying_cost NUMERIC,
  points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
  order_id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::JSONB,
  subtotal NUMERIC NOT NULL,
  discount_amount NUMERIC DEFAULT 0,
  applied_coupon TEXT,
  gift_item JSONB,
  total NUMERIC NOT NULL,
  status TEXT DEFAULT 'Pending' NOT NULL,
  skin_diagnostic JSONB,
  loyalty_points NUMERIC DEFAULT 0,
  loyalty_tier TEXT,
  payment_method VARCHAR DEFAULT 'cod',
  payment_status VARCHAR DEFAULT 'unpaid',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  author TEXT NOT NULL,
  rating INTEGER NOT NULL,
  comment TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  status TEXT DEFAULT 'Pending' NOT NULL,
  reply TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Leads Table (Newsletter signup or contact leads)
CREATE TABLE IF NOT EXISTS leads (
  id BIGSERIAL PRIMARY KEY,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Diagnostics Table (Anonymous skin diagnostics data)
CREATE TABLE IF NOT EXISTS diagnostics (
  id BIGSERIAL PRIMARY KEY,
  skin_type TEXT NOT NULL,
  concern TEXT NOT NULL,
  sun_exposure TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Operators Table (Admin users)
CREATE TABLE IF NOT EXISTS operators (
  id BIGSERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  mfa_secret TEXT,
  mfa_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Settings Table (Global store configuration details)
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Audit Logs Table (Admin changes log tracker)
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL,
  details TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Abandoned Carts Table
CREATE TABLE IF NOT EXISTS abandoned_carts (
  phone TEXT PRIMARY KEY,
  name TEXT,
  items JSONB NOT NULL DEFAULT '[]'::JSONB,
  total NUMERIC NOT NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  recovery_status TEXT,
  recovery_updated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Loyalty Overrides Table (Manual loyalty points corrections)
CREATE TABLE IF NOT EXISTS loyalty_overrides (
  phone TEXT PRIMARY KEY,
  points NUMERIC NOT NULL,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Customer Profiles Table (Linked to Supabase Auth users)
CREATE TABLE IF NOT EXISTS customer_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  phone TEXT,
  points NUMERIC DEFAULT 0,
  total_earned NUMERIC DEFAULT 0,
  points_history JSONB DEFAULT '[]'::JSONB,
  diary_logs JSONB DEFAULT '[]'::JSONB,
  planner_am_dates JSONB DEFAULT '[]'::JSONB,
  planner_pm_dates JSONB DEFAULT '[]'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Force Row Level Security on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnostics ENABLE ROW LEVEL SECURITY;
ALTER TABLE operators ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE abandoned_carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_profiles ENABLE ROW LEVEL SECURITY;

-- --- PRODUCTS POLICIES ---
-- Allow public select (everyone can see products)
DROP POLICY IF EXISTS "products_read_anon" ON products;
CREATE POLICY "products_read_anon" ON products FOR SELECT TO anon USING (true);
-- Write privileges restricted to service role only (admin route actions)
DROP POLICY IF EXISTS "products_all_service" ON products;
CREATE POLICY "products_all_service" ON products FOR ALL TO service_role USING (true) WITH CHECK (true);

-- --- REVIEWS POLICIES ---
-- Allow reading only approved reviews publicly
DROP POLICY IF EXISTS "reviews_read_approved" ON reviews;
CREATE POLICY "reviews_read_approved" ON reviews FOR SELECT TO anon USING (status = 'Approved');
-- Direct anonymous client insertions are disabled to prevent spam.
-- All database updates are handled via rate-limited API routes using the service role key.
DROP POLICY IF EXISTS "reviews_all_service" ON reviews;
CREATE POLICY "reviews_all_service" ON reviews FOR ALL TO service_role USING (true) WITH CHECK (true);

-- --- ORDERS POLICIES ---
-- Restrict all client-side access. Writes/updates are run in Next.js backend via service role key
DROP POLICY IF EXISTS "orders_all_service" ON orders;
CREATE POLICY "orders_all_service" ON orders FOR ALL TO service_role USING (true) WITH CHECK (true);

-- --- LEADS POLICIES ---
-- Restrict all anonymous inserts. Writes must pass through Next.js API routes with service role key
DROP POLICY IF EXISTS "leads_all_service" ON leads;
CREATE POLICY "leads_all_service" ON leads FOR ALL TO service_role USING (true) WITH CHECK (true);

-- --- DIAGNOSTICS POLICIES ---
-- Restrict all anonymous inserts. Submissions must go through rate-limited server endpoints
DROP POLICY IF EXISTS "diagnostics_all_service" ON diagnostics;
CREATE POLICY "diagnostics_all_service" ON diagnostics FOR ALL TO service_role USING (true) WITH CHECK (true);

-- --- OPERATORS POLICIES ---
-- No public client access allowed (admin credentials & sessions managed securely in backend routes)
DROP POLICY IF EXISTS "operators_all_service" ON operators;
CREATE POLICY "operators_all_service" ON operators FOR ALL TO service_role USING (true) WITH CHECK (true);

-- --- SETTINGS POLICIES ---
-- Locked to service role only
DROP POLICY IF EXISTS "settings_all_service" ON settings;
CREATE POLICY "settings_all_service" ON settings FOR ALL TO service_role USING (true) WITH CHECK (true);

-- --- AUDIT LOGS POLICIES ---
-- Locked to service role only
DROP POLICY IF EXISTS "audit_logs_all_service" ON audit_logs;
CREATE POLICY "audit_logs_all_service" ON audit_logs FOR ALL TO service_role USING (true) WITH CHECK (true);

-- --- ABANDONED CARTS POLICIES ---
-- Locked to service role only
DROP POLICY IF EXISTS "abandoned_carts_all_service" ON abandoned_carts;
CREATE POLICY "abandoned_carts_all_service" ON abandoned_carts FOR ALL TO service_role USING (true) WITH CHECK (true);

-- --- LOYALTY OVERRIDES POLICIES ---
-- Locked to service role only
DROP POLICY IF EXISTS "loyalty_overrides_all_service" ON loyalty_overrides;
CREATE POLICY "loyalty_overrides_all_service" ON loyalty_overrides FOR ALL TO service_role USING (true) WITH CHECK (true);

-- --- CUSTOMER PROFILES POLICIES ---
-- 1. Authenticated users can view their own profile only
DROP POLICY IF EXISTS "customer_profiles_select_self" ON customer_profiles;
CREATE POLICY "customer_profiles_select_self" ON customer_profiles FOR SELECT TO authenticated USING (auth.uid() = id);

-- 2. Authenticated users can insert their own profile
DROP POLICY IF EXISTS "customer_profiles_insert_self" ON customer_profiles;
CREATE POLICY "customer_profiles_insert_self" ON customer_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- 3. Authenticated users can update their own profile
DROP POLICY IF EXISTS "customer_profiles_update_self" ON customer_profiles;
CREATE POLICY "customer_profiles_update_self" ON customer_profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- 4. Admin API actions can CRUD all profiles using the service role bypass
DROP POLICY IF EXISTS "customer_profiles_service_role" ON customer_profiles;
CREATE POLICY "customer_profiles_service_role" ON customer_profiles FOR ALL TO service_role USING (true) WITH CHECK (true);
```

---

## 3. Client Initialization & Local File-Backed Development Mock (`src/lib/supabase.ts`)

This SDK client detects if you are in a production environment with valid Supabase environment variables. If environment variables are missing or use placeholder strings (e.g. `placeholder`), it boots an in-memory database mock that reads and writes from `supabase-mock-db.json` inside the workspace root. This enables seamless offline frontend development.

```typescript
import { createClient } from '@supabase/supabase-js';
import { PRODUCTS_DB } from './data';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// Detect whether to use real Supabase or run in mock mode
const isPlaceholder = 
  !process.env.NEXT_PUBLIC_SUPABASE_URL || 
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project-id') || 
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

// --- In-Memory Database Mock with File Persistence ---
const globalForMock = globalThis as unknown as {
  mockDb: {
    operators: any[];
    settings: any[];
    products: any[];
    orders: any[];
    reviews: any[];
    leads: any[];
    diagnostics: any[];
    audit_logs: any[];
    abandoned_carts: any[];
    loyalty_overrides: any[];
    customer_profiles: any[];
  }
};

const getDbFilePath = () => {
  if (typeof window === 'undefined') {
    const path = require('path');
    return path.join(process.cwd(), 'supabase-mock-db.json');
  }
  return '';
};

const saveToDisk = () => {
  if (typeof window === 'undefined' && isPlaceholder && globalForMock.mockDb) {
    try {
      const fs = require('fs');
      const filePath = getDbFilePath();
      fs.writeFileSync(filePath, JSON.stringify(globalForMock.mockDb, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write mock db to disk:', err);
    }
  }
};

const loadFromDisk = () => {
  if (typeof window === 'undefined' && isPlaceholder) {
    try {
      const fs = require('fs');
      const filePath = getDbFilePath();
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        globalForMock.mockDb = JSON.parse(fileContent);
        return true;
      }
    } catch (err) {
      console.error('Failed to read mock db from disk:', err);
    }
  }
  return false;
};

const getInitialProducts = () => {
  return PRODUCTS_DB.map(p => ({
    id: p.id,
    title: p.title,
    name: p.name || null,
    name_fr: p.nameFr || null,
    vendor: p.vendor,
    image: p.image,
    images: p.images || [],
    price: p.price,
    compare_price: p.comparePrice || null,
    category: p.category,
    tags: p.tags || [],
    rating: p.rating || 5,
    reviews: p.reviews || 0,
    description: p.description || null,
    ingredients: p.ingredients || null,
    usage: p.usage || null,
    stock: p.stock || 100,
    sku: p.sku || null,
    buying_cost: p.buyingCost || null,
    points: p.points || 0,
    created_at: new Date().toISOString()
  }));
};

if (isPlaceholder) {
  const loaded = loadFromDisk();
  if (!loaded && !globalForMock.mockDb) {
    globalForMock.mockDb = {
      operators: [
        {
          id: "1",
          username: "admin",
          // Set MOCK_ADMIN_PASSWORD_HASH in .env.local to override this default.
          password: process.env.MOCK_ADMIN_PASSWORD_HASH ?? "6051fc84a7a0d74c225fb18a496b09952da5642e60723ecae543298edd7d82d6",
          role: "owner",
          name: "Youssef Mahir",
          is_active: true,
          mfa_enabled: false,
          created_at: new Date().toISOString()
        }
      ],
      settings: [
        {
          id: 1,
          value: {
            storeName: "Para Officinal S.A",
            freeShippingThreshold: 600,
            shippingFee: 35,
            quizDiscountPercent: 15,
            coupons: [
              { code: "BEAUTY10", discountPercent: 10, freeShipping: false, isActive: true },
              { code: "CLINICAL15", discountPercent: 15, freeShipping: false, isActive: true },
              { code: "FREESHIP", discountPercent: 0, freeShipping: true, isActive: true }
            ]
          },
          created_at: new Date().toISOString()
        }
      ],
      products: getInitialProducts(),
      orders: [],
      reviews: [],
      leads: [],
      diagnostics: [],
      audit_logs: [],
      abandoned_carts: [],
      loyalty_overrides: [],
      customer_profiles: []
    };
    saveToDisk();
  } else if (!loaded && globalForMock.mockDb) {
    saveToDisk();
  }
}

class MockSupabaseQueryBuilder {
  private table: string;
  private filters: Array<(item: any) => boolean> = [];
  private orderCol: string | null = null;
  private orderAsc: boolean = true;
  private limitCount: number | null = null;
  private rangeStart: number | null = null;
  private rangeEnd: number | null = null;

  constructor(table: string) {
    this.table = table;
  }

  select(columns: string = '*', options?: any) {
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push((item) => {
      const itemVal = item[column];
      if (typeof value === 'string' && typeof itemVal === 'string') {
        return itemVal.toLowerCase() === value.toLowerCase();
      }
      return itemVal == value;
    });
    return this;
  }

  gt(column: string, value: any) {
    this.filters.push((item) => Number(item[column]) > Number(value));
    return this;
  }

  or(filterStr: string) {
    this.filters.push((item) => {
      const conditions = filterStr.split(',');
      return conditions.some(cond => {
        if (cond.includes('.ilike.')) {
          const [col, valWithPercents] = cond.split('.ilike.');
          const searchTerm = valWithPercents.replace(/%/g, '').toLowerCase();
          return String(item[col] || '').toLowerCase().includes(searchTerm);
        }
        if (cond.includes('.eq.')) {
          const [col, val] = cond.split('.eq.');
          return String(item[col] || '').toLowerCase() === val.toLowerCase();
        }
        if (cond.includes('.cs.')) {
          const [col, val] = cond.split('.cs.');
          const cleanVal = val.replace(/[{""}]/g, '').toLowerCase();
          const arr = item[col] || [];
          return Array.isArray(arr) && arr.some(x => String(x).toLowerCase().includes(cleanVal));
        }
        return false;
      });
    });
    return this;
  }

  order(column: string, { ascending = true } = {}) {
    this.orderCol = column;
    this.orderAsc = ascending;
    return this;
  }

  range(from: number, to: number) {
    this.rangeStart = from;
    this.rangeEnd = to;
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  async insert(data: any) {
    const list = globalForMock.mockDb[this.table as keyof typeof globalForMock.mockDb] || [];
    const records = Array.isArray(data) ? data : [data];
    const inserted = records.map(r => ({
      id: r.id || String(Math.random().toString(36).substring(2, 11)),
      created_at: new Date().toISOString(),
      ...r
    }));
    list.push(...inserted);
    globalForMock.mockDb[this.table as keyof typeof globalForMock.mockDb] = list;
    saveToDisk();
    return { data: inserted, error: null };
  }

  async upsert(data: any, options?: any) {
    const list = globalForMock.mockDb[this.table as keyof typeof globalForMock.mockDb] || [];
    const records = Array.isArray(data) ? data : [data];
    const upserted = records.map(r => {
      const existingIdx = list.findIndex((x: any) => x.id === r.id);
      const newRec = {
        created_at: new Date().toISOString(),
        ...r
      };
      if (existingIdx !== -1) {
        list[existingIdx] = { ...list[existingIdx], ...r };
      } else {
        list.push(newRec);
      }
      return newRec;
    });
    globalForMock.mockDb[this.table as keyof typeof globalForMock.mockDb] = list;
    saveToDisk();
    return { data: upserted, error: null };
  }

  update(data: any) {
    const list = globalForMock.mockDb[this.table as keyof typeof globalForMock.mockDb] || [];
    const updatedList = list.map((item: any) => {
      if (this.filters.every(f => f(item))) {
        return { ...item, ...data };
      }
      return item;
    });
    globalForMock.mockDb[this.table as keyof typeof globalForMock.mockDb] = updatedList;
    saveToDisk();
    return {
      select: () => ({
        single: () => {
          const match = updatedList.find(item => this.filters.every(f => f(item)));
          return Promise.resolve({ data: match || null, error: match ? null : { message: 'Not found', code: 'PGRST116' } });
        }
      }),
      then: (resolve: any) => resolve({ data: updatedList.filter(item => this.filters.every(f => f(item))), error: null })
    };
  }

  async delete() {
    const list = globalForMock.mockDb[this.table as keyof typeof globalForMock.mockDb] || [];
    const filtered = list.filter(item => !this.filters.every(f => f(item)));
    globalForMock.mockDb[this.table as keyof typeof globalForMock.mockDb] = filtered;
    saveToDisk();
    return { data: null, error: null };
  }

  private getFilteredData() {
    let list = globalForMock.mockDb[this.table as keyof typeof globalForMock.mockDb] || [];
    list = list.filter(item => this.filters.every(f => f(item)));
    
    if (this.orderCol) {
      list = [...list].sort((a, b) => {
        const valA = a[this.orderCol!];
        const valB = b[this.orderCol!];
        if (valA < valB) return this.orderAsc ? -1 : 1;
        if (valA > valB) return this.orderAsc ? 1 : -1;
        return 0;
      });
    }

    if (this.rangeStart !== null && this.rangeEnd !== null) {
      list = list.slice(this.rangeStart, this.rangeEnd + 1);
    } else if (this.limitCount !== null) {
      list = list.slice(0, this.limitCount);
    }

    return list;
  }

  async single() {
    const data = this.getFilteredData();
    if (data.length === 0) {
      return { data: null, error: { message: 'Not found', code: 'PGRST116' } };
    }
    return { data: data[0], error: null };
  }

  async maybeSingle() {
    const data = this.getFilteredData();
    return { data: data[0] || null, error: null };
  }

  then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) {
    const data = this.getFilteredData();
    return Promise.resolve({ data, count: data.length, error: null }).then(onfulfilled, onrejected);
  }
}

const mockAuth = {
  onAuthStateChange: () => ({
    data: { subscription: { unsubscribe: () => {} } }
  }),
  getSession: async () => ({ data: { session: null } }),
  signInWithPassword: async () => ({ data: { user: null }, error: null }),
  signUp: async () => ({ data: { user: null }, error: null }),
  signOut: async () => ({ error: null }),
};

const mockSupabaseClient = {
  auth: mockAuth,
  from: (table: string) => new MockSupabaseQueryBuilder(table)
} as any;

// Public client used on client-side React components
export const supabase = isPlaceholder 
  ? mockSupabaseClient 
  : createClient(supabaseUrl, supabaseAnonKey);

// Admin client used on server-side API endpoints (bypasses RLS)
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;
export const supabaseAdmin = isPlaceholder 
  ? mockSupabaseClient 
  : createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
```

---

## 4. Querying & Storing Data in Next.js Server API Routes

Because public/anonymous direct insertions are disabled by our database security schema (`20260615000001_disable_anon_direct_writes.sql`), you should always route write requests through a Next.js server endpoint. Below is an example implementation showing how to safely record new customer leads:

```typescript
// File: src/app/api/leads/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { verifyAdminSession } from '@/lib/session';

// GET: Retrieve customer leads (Admin authenticated access)
export async function GET() {
  try {
    const session = await verifyAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Accès non autorisé' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      leads: data.map((item: any) => ({
        email: item.email,
        phone: item.phone,
        date: item.created_at
      }))
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erreur serveur' }, { status: 500 });
  }
}

// POST: Place a lead (Rate-limited, client-facing submission)
export async function POST(request: Request) {
  try {
    const { email, phone } = await request.json();
    if (!email && !phone) {
      return NextResponse.json({ success: false, error: 'Email or phone number is required' }, { status: 400 });
    }

    const newLead = {
      email: email || '',
      phone: phone || '',
      created_at: new Date().toISOString()
    };

    // Note: We use supabaseAdmin to insert because anon client-side writes are forbidden
    const { error } = await supabase
      .from('leads')
      .insert(newLead);

    if (error) throw error;

    return NextResponse.json({ success: true, lead: newLead });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erreur serveur' }, { status: 500 });
  }
}
```

---

## 5. Seeding Data Configuration (`supabase/seed.sql`)

Below is a seed template script to populate your database with global settings and a couple of test products during initial setup. Keep this inside your `supabase/seed.sql` directory:

```sql
-- Seed global store settings
INSERT INTO settings (id, value)
VALUES (
  1,
  '{
    "storeName": "Para Officinal S.A",
    "shippingFee": 35,
    "freeShippingThreshold": 600,
    "quizDiscountPercent": 15,
    "coupons": [
      { "code": "BEAUTY10", "isActive": true, "freeShipping": false, "discountPercent": 10 },
      { "code": "CLINICAL15", "isActive": true, "freeShipping": false, "discountPercent": 15 },
      { "code": "FREESHIP", "isActive": true, "freeShipping": true, "discountPercent": 0 }
    ]
  }'::jsonb
)
ON CONFLICT (id) DO UPDATE 
SET value = EXCLUDED.value;

-- Seed sample products
INSERT INTO products (id, title, name, name_fr, vendor, price, compare_price, category, tags, stock, rating, reviews, created_at)
VALUES 
  (
    1, 
    'Beauty Relief Serum', 
    'Beauty Relief Serum 30ml', 
    'Sérum Apaisant Beauté 30ml', 
    'K-Beauty Lab', 
    299.00, 
    350.00, 
    'Serums', 
    '{"calming", "hydration"}', 
    80, 
    4.8, 
    124, 
    now()
  ),
  (
    2, 
    'Sun Shield SPF 50+', 
    'UV Sun Shield Cream', 
    'Crème Solaire Protectrice SPF 50+', 
    'Clinical Derma', 
    189.00, 
    220.00, 
    'Sunscreen', 
    '{"spf", "protection"}', 
    150, 
    4.9, 
    89, 
    now()
  )
ON CONFLICT (id) DO NOTHING;
```
