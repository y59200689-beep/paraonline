# Para Officinal — Developer Maintenance Playbook

> **Audience**: Any developer picking up this project.  
> **Last updated**: 2026-06-14

---

## 1. Repository Layout

```
src/
├── app/                    # Next.js App Router pages & API routes
│   ├── admin/              # Admin back-office page
│   ├── api/                # REST API routes (Supabase-backed)
│   ├── customer/           # Customer portal page
│   ├── politiques/         # Policy CMS pages
│   └── products/           # PDP & product listing pages
├── components/             # Presentational React components
│   └── admin/              # Admin-specific tab components
├── context/                # Global React contexts (providers)
│   └── admin/              # Admin-domain contexts
├── lib/                    # Pure utility/data modules
│   ├── data.ts             # Product catalogue + type definitions
│   ├── pricing.ts          # Shipping, discount, total calculations
│   ├── loyalty.ts          # Points / tier helpers
│   ├── permissions.ts      # Role-based access control helpers
│   ├── session.ts          # JWT session utilities
│   ├── supabase.ts         # Supabase client singleton
│   └── image-optimizer.ts  # Image optimisation helpers
├── __tests__/              # Vitest unit + integration tests
└── data/                   # Static JSON data (ingredients, FAQ, etc.)
```

---

## 2. Path Aliases

All cross-directory imports **must** use the `@/` alias (maps to `src/`).

| ❌ Do NOT use         | ✅ Use instead               |
|----------------------|------------------------------|
| `../context/CartContext` | `@/context/CartContext`  |
| `../../lib/data`     | `@/lib/data`                |
| `./../../components` | `@/components/...`          |

The alias is declared in [`tsconfig.json`](../tsconfig.json) under `compilerOptions.paths`.

### Audit command
```bash
grep -r "from '\.\." src/ --include="*.tsx" --include="*.ts" | grep -v "__tests__"
# Expected output: empty (zero violations)
```

---

## 3. Context Provider Order

The provider tree **must** be nested in this exact order (outermost → innermost):

```
Settings → Ui → Language → Loyalty → Theme → Cart → Currency → AmPm → Compare → Wishlist
```

This is declared in `src/app/layout.tsx`. Never reorder without verifying that downstream hooks don't break due to missing upstream context.

---

## 4. TypeScript Hygiene

### Check
```bash
npx tsc --noEmit
# Expected: no output (0 errors)
```

### Rules enforced by `tsconfig.json`
- `strict: true` — all implicit `any` types are errors.
- `noImplicitAny: true` — arrow function parameters on typed arrays still need explicit types when TS can't infer them from context.

### Common pitfall: `never`-typed `let` inside `act()`
When assigning inside async `act()` callbacks in tests, always declare the variable with an explicit type:

```tsx
// ❌ TS infers this as `never`
let result;
await act(async () => { result = await somePromise(); });

// ✅ Correct
let result: ReturnType<typeof someFunction> | undefined;
await act(async () => { result = await someFunction(); });
```

---

## 5. Test Suite

### Run all tests
```bash
npx vitest run
-- Expected: 74 tests passing across 8 files
```

### Test files & coverage
| File | Tests | Domain |
|------|-------|--------|
| `csv.test.ts` | 20 | CSV import/export engine |
| `loyalty.test.ts` | 12 | Points calculation & tiers |
| `pricing.test.ts` | 19 | Shipping fees, discounts, totals |
| `permissions.test.ts` | 7 | Role-based access control |
| `integration.test.tsx` | 1 | Full checkout → loyalty flow |
| `performance.test.tsx` | 4 | Render & data-load benchmarks |
| `contexts.test.tsx` | 9 | Cart, coupon, settings hooks |
| `diagnostic.test.tsx` | 2 | WebRTC camera mock & dermo diagnostic flow |

### Add a new test
Place it in `src/__tests__/` with the `// @vitest-environment jsdom` directive for DOM tests.

---

## 6. Orphan Components (Candidates for Removal)

The following components have **no imports** in the codebase as of the last audit. They were likely used in previous design iterations. Review before removing.

| Component | Notes |
|-----------|-------|
| `AmPmSwitch.tsx` | Replaced by inline toggle in Header |
| `BeforeAfterSlider.tsx` | Was used in a removed landing section |
| `ClinicalUrgencyFeed.tsx` | Prototype; never shipped |
| `HadaLaboSlider.tsx` | Brand spotlight replaced by `AdminSpotlight` |
| `TrustSeals.tsx` | Folded into Footer directly |

**To remove safely:**
1. Search the entire repo one more time: `grep -r "ComponentName" src/ public/`
2. Delete the file.
3. Run `npx tsc --noEmit && npx vitest run` to confirm clean.

---

## 7. Adding a New Product

Products live in `src/lib/data.ts` in the `PRODUCTS_DB` array. The `Product` interface requires:

```ts
{
  id: number;          // Unique integer
  title: string;       // Full display title
  vendor: string;      // Brand name
  image: string;       // Primary image URL
  images: string[];    // Gallery images array
  price: number;       // Selling price (DH)
  comparePrice: number; // Strike-through price (DH)
  category: string;    // e.g. "garnier", "kbeauty", "offers"
  tags: string[];      // Filter tags
  rating: number;      // 0–5
  reviews: number;     // Review count
  description: string; // Product description
  ingredients: string; // Ingredient list
  usage: string;       // Application instructions
  sku?: string;        // SKU for admin tracking
  buyingCost?: number; // Cost price for margin analytics
}
```

---

## 8. Supabase & Environment Variables

Required `.env.local` keys:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...   # Server-side API routes only
```

Never commit `.env.local`. The Supabase client is a singleton in `src/lib/supabase.ts`.

---

## 9. Build & Deployment

```bash
# Development server
npm run dev

# Type check
npx tsc --noEmit

# Test suite
npx vitest run

# Production build
npm run build
```

The project targets **Next.js App Router** (read `node_modules/next/dist/docs/` for API specifics before editing routing or layouts).

---

## 10. Admin Access

- Admin panel: `/admin`
- Role hierarchy: `superadmin > manager > logistician`
- Auth: JWT session via `src/lib/session.ts` + Supabase `admin_users` table
- Route protection: enforced in each API route via `src/lib/permissions.ts`
