# Public storefront release checklist

This checklist applies only to the public storefront. Admin and customer-panel routes are outside this release gate.

## Release controls

- `NEXT_PUBLIC_FEATURE_PRODUCT_REDESIGN`, `NEXT_PUBLIC_FEATURE_CART_REDESIGN`, and `NEXT_PUBLIC_FEATURE_CHECKOUT_REDESIGN` are the rollback switches for the commerce redesign.
- Enable flags in Preview first. Promote the same build to Production only after the checks below pass.
- Keep the previous successful Vercel deployment available for immediate rollback.
- Review `/api/telemetry` reports after release for client errors and LCP, CLS, and INP regressions.

## Routes and states

Check `/`, `/products`, a published product route, `/checkout`, `/checkout/success`, `/checkout/failure`, `/suivi-commande`, every published `/brand/*` page, `/conseils`, `/a-propos`, and every `/politiques/*` route.

For commerce routes verify loading, empty, unavailable-product, validation error, API error, and success states. Confirm that cart, checkout, and the created order agree on product totals, delivery fee, discount, gift eligibility, and final total.

## Viewports

Run the public quality suite at 360, 390, 430, 768, 1024, and 1440 pixels. There must be no horizontal overflow, clipped controls, fixed-element overlap, or inaccessible primary CTA.

## Accessibility

1. Run `npm run test:e2e:a11y` after starting the application.
2. Navigate every route with Tab, Shift+Tab, Enter, Space, Escape, and arrow keys where appropriate.
3. Confirm visible focus, logical focus order, modal focus trapping, and focus restoration.
4. With macOS VoiceOver, verify headings, landmarks, forms, error announcements, product images, cart controls, dialogs, and language controls.
5. Verify touch targets at 44 by 44 pixels and test `prefers-reduced-motion: reduce`.
6. Record manual VoiceOver and keyboard results in the release ticket; automation is not a substitute for this step.

## Localisation

- Test French and Arabic on every route.
- Confirm `dir="rtl"` after switching to Arabic and check long Arabic labels in cards, buttons, drawers, filters, and checkout fields.
- Verify Moroccan phone validation and locale-aware currency, dates, numbers, and order identifiers.
- No visible English fallback copy is accepted in French or Arabic modes.

## Assets and performance

- No public image may have an empty source. Missing product media must use `/images/product-image-fallback.png`.
- Responsive images require correct dimensions or `sizes`; genuine above-the-fold images may use priority, while below-fold sections remain deferred.
- Check browser console errors and failed image requests.
- In Preview or Production, confirm LCP below 2.5 seconds, CLS below 0.1, and INP below 200 milliseconds from collected web-vital telemetry. Do not use local development numbers as the launch measurement.

## Trust and conversion

- Delivery times, stock, reviews, savings, authenticity, returns, support availability, and regulatory claims must be backed by current operational data or editable approved content.
- Product ratings show only stored review data. Empty review states must not invent stars or counts.
- Returns, privacy, terms, delivery, tracking, and support links must be reachable near checkout.
- CTA labels remain consistent: `Ajouter au panier`, `Passer la commande`, `Suivre ma commande`, and their approved Arabic translations.

## Release sequence

1. Capture baseline and candidate screenshots at every viewport.
2. Run unit tests, TypeScript, production build, accessibility tests, and commerce smoke tests.
3. Compare candidate screenshots, including loading and error states.
4. Validate analytics events for product view, add to cart, checkout start, order success, and failure.
5. Enable feature flags in Preview and complete stakeholder review.
6. Promote to Production, monitor telemetry and conversion, then keep the prior deployment available until the observation window closes.
