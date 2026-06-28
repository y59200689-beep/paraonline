-- ============================================================
-- Migrations: 20260614000000_init_schema.sql
-- Description: Create initial schema for all tables
-- ============================================================

-- 1. Products Table
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

-- 2. Orders Table
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Reviews Table
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

-- 4. Leads Table
CREATE TABLE IF NOT EXISTS leads (
  id BIGSERIAL PRIMARY KEY,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Diagnostics Table
CREATE TABLE IF NOT EXISTS diagnostics (
  id BIGSERIAL PRIMARY KEY,
  skin_type TEXT NOT NULL,
  concern TEXT NOT NULL,
  sun_exposure TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Operators (Admin users) Table
CREATE TABLE IF NOT EXISTS operators (
  id BIGSERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Settings Table
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL,
  details TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Abandoned Carts Table
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

-- 10. Loyalty Overrides Table
CREATE TABLE IF NOT EXISTS loyalty_overrides (
  phone TEXT PRIMARY KEY,
  points NUMERIC NOT NULL,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. Customer Profiles Table (Mirroring client users)
CREATE TABLE IF NOT EXISTS customer_profiles (
  id UUID PRIMARY KEY,
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
