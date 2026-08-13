# CMS launch checklist (Phases 6–8)

Use a Vercel Preview deployment backed by the staging Supabase project. Do not test publishing against production until every item below is signed off.

## Assistant chat

- [ ] Chat loads the published CMS welcome message and suggested prompts.
- [ ] French, Arabic, English and Darija requests return the requested language.
- [ ] Delivery, payment, returns, tracking, WhatsApp and policy facts come from the published chat configuration.
- [ ] Order collection still validates name, Moroccan phone, address, stock and product IDs server-side.
- [ ] Gemini credentials, system instructions, rate limits and prompt-injection protection remain server-only.

## Roles and access

| Role | Expected access |
| --- | --- |
| Owner | Everything, integrations, roles, publishing |
| Manager | Content, catalogue, promotions, publishing |
| Content editor | Pages, brands, translations, FAQ; submits for approval |
| Catalogue editor | Products, stock, brands, diagnostic metadata |
| Fulfilment | Orders and shipping only |
| Support | Customer communication and reviews |
| Viewer | Read-only access |

- [ ] Test every admin route with one account per role.
- [ ] Test both page-level screens and direct API calls (buttons are not an authorization boundary).
- [ ] Confirm content editors cannot publish, schedule, restore, or alter protected diagnostic rules.
- [ ] Confirm viewers see no mutation controls and receive 403 from mutation APIs.

## CMS publishing and rollback

- [ ] Save a draft and confirm it is invisible to a normal visitor.
- [ ] Open a preview link with a valid token; confirm an expired or wrong-entity token is rejected.
- [ ] Submit a content-editor draft for approval; publish it as manager/owner.
- [ ] Schedule a future publish and run the Vercel cron with `CRON_SECRET`.
- [ ] Review revision author, timestamp and changed fields; compare two revisions.
- [ ] Restore an earlier revision and confirm restore creates a new draft/revision.
- [ ] Verify the one-click rollback path before each production publish.

## Visual and functional QA

- [ ] Run `npm run qa:cms` against Preview (`QA_BASE_URL=https://...`).
- [ ] Check desktop and mobile layouts for homepage, brands, checkout, policies and customer portal.
- [ ] Check French and Arabic copy, including RTL alignment and wrapping.
- [ ] Check homepage order, section visibility and duplicated sections from the CMS.
- [ ] Check gallery assets, CTA links, SEO title/description/canonical and social image.
- [ ] Check diagnostic preview, product eligibility, no duplicates, stock and sensitivity restrictions.
- [ ] Check assistant chat, checkout, brand routes and tracking page for console/network errors.

## Release gate

Run the following before merging:

```bash
npm run qa:cms
npx tsc --noEmit
npm run lint
npm run build -- --webpack
npm test
```

Record any known test failures in the release ticket. Publish only after visual, functional and permission approval on Preview, then keep the previous revision available for rollback.
