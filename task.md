# Tasks for Securing Admin Panel (Option A)

- [x] Create Next.js Proxy `src/proxy.ts` to intercept `/admin` routes.
  - [x] Implement signature verification using Web Crypto (HMAC-SHA256) to be edge-compatible.
  - [x] Redirect unauthenticated requests to `/admin/login`.
- [x] Create dedicated admin login page `src/app/admin/login/page.tsx`.
  - [x] Move login UI logic from `layout.tsx` to `login/page.tsx`.
  - [x] Support username/password input, MFA verification, and forced MFA setup steps.
  - [x] Redirect to `/admin` upon successful authentication.
- [x] Refactor `src/app/admin/layout.tsx`.
  - [x] Convert it to clean client/server structure or remove the client-side authentication gate redirect.
  - [x] Make sure sidebar/spotlight components render only when the user is logged in (i.e. not on the `/admin/login` page).
- [x] Verify implementation.
  - [x] Build the Next.js application using `npm run build` to confirm no type or compilation errors.
  - [x] Create a walkthrough markdown showing the changes.
