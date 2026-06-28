# Secure Admin Panel with Server-Side Protections

The admin panel is currently accessible on the client side at `/admin` (and subpages like `/admin/orders`, `/admin/analytics`). Because it relies on client-side state checking (`isAuthenticated` in a `useEffect` inside `AdminLayout`), any user can request the admin page, causing their browser to download the JavaScript bundles containing sensitive admin UI, logic, and internal API routes before authentication occurs.

To resolve this and establish proper server-side protection, we propose two potential approaches.

---

## User Review Required

Please review the two proposed approaches below and let us know your preference.

### Option A: Next.js Middleware Guard + `/admin/login` Route (Recommended)
This approach uses Next.js Middleware to intercept requests to `/admin` (and all sub-routes), checking for the presence of the `admin_session` cookie server-side.
- If no valid session is found, the user is redirected to a separate page `/admin/login`.
- **Pros**: 
  - Standard Next.js architecture.
  - Fully protects the admin JS bundle (unauthenticated users are redirected before layout code/bundles are requested).
  - Clear URL separation representing the user's state.
- **Cons**: 
  - Requires moving the login form UI into a dedicated page (`/admin/login/page.tsx`).

### Option B: Server Component Auth Check in `AdminLayout`
This approach converts `src/app/admin/layout.tsx` into a Server Component (or wraps it in one).
- The Server Component calls `verifyAdminSession()` on the server.
- If there is no session, it renders a `<LoginForm />` component instead of the authenticated layouts and page children.
- On successful login, the client component triggers `router.refresh()` to reload the layout server-side.
- **Pros**: 
  - No new routes or URL changes required (keeps the single URL inline-auth behavior).
  - Unauthenticated users still do not download the main admin dashboard bundles (since the layout does not render them).
  - Less refactoring of routes.
- **Cons**: 
  - Doesn't redirect the user to a dedicated login URL.

---

## Proposed Changes

Depending on the approved option, the changes will be structured as follows:

### Component: Middleware (Option A)

#### [NEW] [middleware.ts](file:///Users/youssefmahir/Developer/ecom/src/middleware.ts)
- Create a middleware that intercepts all requests matching `/admin/:path*` (except `/admin/login` and any API endpoints).
- Parse and cryptographically verify the signature of the `admin_session` cookie.
- If verification fails or cookie is missing, redirect to `/admin/login`.

#### [NEW] [page.tsx](file:///Users/youssefmahir/Developer/ecom/src/app/admin/login/page.tsx)
- Move the secure console login UI (currently inside `src/app/admin/layout.tsx`) into this new route.

#### [MODIFY] [layout.tsx](file:///Users/youssefmahir/Developer/ecom/src/app/admin/layout.tsx)
- Remove the client-side login gate (`if (!isAuthenticated) ...`).
- Simplify layout to only render when the user is authenticated (guaranteed by Middleware).

---

### Component: Server Component Layout (Option B)

#### [MODIFY] [layout.tsx](file:///Users/youssefmahir/Developer/ecom/src/app/admin/layout.tsx)
- Convert the top-level `AdminLayout` export to a Server Component (remove `'use client'`).
- Verify session on the server using `verifyAdminSession()`.
- If unauthenticated, render the Client Component `<LoginForm />`.
- Otherwise, render `AdminProvider`, `AdminUIProvider`, and the layout shell.

---

## Verification Plan

### Automated Tests
- Run `npm run build` or `npx next build` to verify no compilation errors.

### Manual Verification
1. Access `/admin` or `/admin/orders` without being logged in. Verify that:
   - For Option A: The browser is redirected to `/admin/login` and the login console is visible.
   - For Option B: The login console is visible, and the URL remains `/admin` or `/admin/orders`.
2. Verify in the Network tab of DevTools that the large admin dashboard page/tabs bundles are not downloaded when unauthenticated.
3. Log in with correct credentials. Verify access is granted.
4. Log out and verify session is properly cleared and page/layout updates accordingly.
