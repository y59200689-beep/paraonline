# Para Officinal S.A — E-Commerce & Skincare Clinic Platform

Para Officinal S.A is a premium, high-performance skincare clinical and K-Beauty e-commerce platform built using Next.js. It features a fully-integrated AI-assisted Skin Diagnostic tool, a loyalty points engine, automated logictics and carrier integrations (Yalidine/Cathedis), financial ledger reconciliation, and a comprehensive admin control center.

---

## 🚀 Technology Stack

- **Core**: Next.js (App Router), React, TypeScript
- **Styling**: Tailwind CSS & Vanilla CSS (calibrated for high-end cinematic/glassmorphic aesthetics)
- **Database**: Supabase (PostgreSQL with RLS)
- **State Management**: React Contexts
- **Testing**: Vitest & JSDOM

---

## 📦 Database & Hybrid Mock Architecture

The platform supports a hybrid database mode designed for seamless transition between local development and cloud production:

1. **Production Mode (Live Supabase)**:
   When `NEXT_PUBLIC_SUPABASE_URL` and keys are provided in `.env.local`, the app connects directly to a Supabase database.
2. **Development/Offline Mode (File-Persistent Mock DB)**:
   If Supabase keys are missing or set to placeholder credentials, the system automatically falls back to an in-memory database mock. This mock dynamically reads from and writes to the local JSON file:
   [supabase-mock-db.json](file:///Users/youssefmahir/Developer/ecom/supabase-mock-db.json)
   This allows you to test catalog management, order placements, stock deductions, and admin operations completely offline with full persistence.

---

## 🔒 Security Architecture

To protect user data and financial parameters, the codebase enforces the following backend guards:

### 1. Server-Side Order Submission
Orders are never created directly from the browser to the database. They must be submitted via the rate-limited `/api/orders` route. This endpoint uses `supabaseAdmin` (bypassing RLS) on the server to safely write orders and decrement inventory securely via database RPC triggers.

### 2. Secure Coupon Validation
Coupon status, expiration, and usage limits are verified on the server via `/api/coupons/validate`. This prevents public anonymous users from querying order history (protecting privacy) and stops price/discount tampering.

### 3. Protected Admin Operations
All administrative routes (`/api/admin/*`) require server-side session checks via `verifyAdminSession`.
- **Role-Based Access Control (RBAC)**: Support roles can view orders and update statuses but cannot delete records or export raw data. Only users with the `owner` role can execute operations like deletion.
- **MFA (Multi-Factor Authentication)**: Admin logins require MFA verification with recovery code capability.

---

## 💼 Core Business & Logistics Features

### 1. Moroccan COD Financial Ledger Reconciliation
Allows administrators to upload settlement CSV manifests from shipping partners (Yalidine/Cathedis). The system compares reported Cash on Delivery (COD) collection amounts, courier fees, and delivery statuses against internal records to detect financial discrepancies (mismatched statuses or unpaid amounts).

### 2. Carrier Integrations
Generate A6 shipping labels for Yalidine and Cathedis directly from order dashboards and synchronize courier tracking statuses back into order records.

### 3. Dynamic WhatsApp Templates & Recovery
Engage customers with automated notifications via WhatsApp for:
- Order confirmations (COD/online)
- Shipping and tracking links
- **Cart Recovery**: Recovers abandoned carts by compiling item lists and generating custom checkout links with incentive coupon codes.

### 4. Customer Loyalty Engine
Customers earn points for reviews and purchases. They are classified into tiers (Bronze, Silver, Gold, Platinum) with increasing multipliers. Points can be redeemed during checkout for discount rewards.

### 5. Smart Restock Forecasting
Analyzes sales velocity over the last 30 days to forecast coverage periods and automatically draft purchase orders for suppliers.

---

## 🛠️ Getting Started

### 1. Installation
Install project dependencies:
```bash
npm install
```

### 2. Environment Setup
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```
*Note: If these variables are omitted, the app will safely run in mock database mode using `supabase-mock-db.json`.*

### 3. Run Development Server
Start the local server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the storefront, or [http://localhost:3000/admin](http://localhost:3000/admin) for the control panel.

### 4. Running Tests
Run the Vitest test suite:
```bash
npm run test
```

### 5. Cron Service
To simulate cron-triggered background tasks (like automatic code snippets or database cleanups):
```bash
npm run cron-runner
```
