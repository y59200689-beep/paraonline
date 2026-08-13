# Para Officinal — Public Website Product Design Audit

Date: 10 August 2026
Scope: Public storefront only. Admin Dashboard and Customer Panel were excluded.
Reviewed route families: Home, catalogue, product detail, brand pages, About, advice index/article, tracking, policies, cart, checkout, checkout success/failure, desktop and mobile breakpoints.

## Executive assessment

**Overall score: 5.6/10**

The site has strong visual ambition and several polished individual compositions, especially the brand landing pages. It does not yet behave or read as one coherent production product. The biggest blockers are functional completion-state failures, severe mobile layout problems, inconsistent commerce messaging, and a fragmented visual system across major flows.

**Production-ready: No.** The site should not launch in its current state because the checkout success and failure routes render blank, mobile product discovery and purchase are materially compromised, and the cart/checkout currently communicates free shipping and a free gift at a 26.40 DH subtotal.

## Flow review

### 1. First visit and lead capture — Critical

The first visit is interrupted by a full-screen modal before the user has established trust or understood the catalogue. It asks for both email and WhatsApp number, but the supporting privacy reassurance is too small and there is no visible policy link. This is high friction for a cold visitor and obscures the strongest homepage content.

Recommendation: delay the modal until demonstrated intent (time, scroll depth, exit intent, or second visit), request only one field, show the offer value explicitly, and provide a direct privacy link.

### 2. Homepage discovery — Mixed

The opening campaign grid is visually strong, the category shortcuts are understandable, and the main imagery feels contemporary. However, the page becomes too long and promotion-heavy. It mixes turquoise, navy, mint, coral, gold, and purple accents without a clear semantic system. Lower sections include English campaign copy, empty white media panels, dense product grids, animated brand rows, and trust modules that feel like separate templates.

Recommendation: reduce the homepage to a deliberate narrative: hero, categories, one curated product block, concerns, brand proof, guidance, trust, footer. Remove duplicate product feeds and any section without complete content.

### 3. Catalogue and filtering — Warning

The catalogue has useful filters, search, sort, product count, and product cards. The dark filter column competes too strongly with the products, while the pale AI-match block has weak contrast and unclear value. Displaying 15,800 products creates an intimidating information scale. Missing product imagery is common and degrades trust. On mobile, two cards are squeezed into a narrow grid and copy becomes too small.

Recommendation: make search and category/brand filters primary; move advanced filters into a secondary panel; clarify pagination and result quality; provide a premium, branded missing-image fallback; use a single-column mobile card or a much more compact card built specifically for two columns.

### 4. Product detail and purchase decision — Critical

The product image is clear, but the product name is not visible in the first desktop viewport and is effectively absent from the first mobile experience. The visual priority is incorrectly given to the gallery, diagnostic badge, price panel, and trust cards. A tongue depressor receives a 75% “skin match” message, which is irrelevant and undermines the intelligence feature. The beige diagnostic panel has poor contrast, and the purchase CTA is pushed below the initial mobile view.

Recommendation: lead with product name, brand, availability, price, quantity, and CTA. Show the diagnostic block only for eligible face products. Keep one clear trust strip beneath the CTA. On mobile, cap the media area to about 45–50% of the initial viewport and make the CTA sticky after the user reaches the purchase area.

### 5. Cart and checkout — Critical

The drawer is information-rich and the checkout form has a clear two-column structure. However, the drawer contains too many simultaneous modules and its internal scrolling hides information. At a 26.40 DH subtotal the interface showed “Livraison Gratuite Débloquée”, “Cadeau Gratuit”, and a negative 35 DH economy, then the checkout repeated free delivery. This contradicts the earlier threshold messaging and may create financial or trust problems. Coupon entry appears in both cart and checkout. The direct checkout success and failure pages render as blank dark screens.

Recommendation: fix incentives before visual refinement; display one accurate progress message; show one coupon entry point; keep the cart summary compact; and provide robust success, failure, missing-order, retry, tracking, and return-to-shop states.

### 6. Brand pages — Good foundation

La Roche-Posay and Vichy are the strongest public pages. They have high-quality hero composition, distinct imagery, understandable primary/secondary CTAs, brand-specific proof points, and a coherent editorial structure. The shared template is consistent enough to scale. Risks include oversized hero copy, unsubstantiated claims, image authenticity, and CTA styling that diverges from the storefront’s main green/blue system.

Recommendation: use this quality bar as the basis of the public design system, standardize CTA hierarchy, source and cite claims, and ensure every brand page uses authentic approved assets.

### 7. Advice index and articles — Mixed

The editorial typography is confident and article imagery is attractive. The index wastes a large area on the right and only shows a narrow two-column content block. Articles have excessive empty space above the title, the share action floats without context, and there is no visible author or reviewer credential despite medical/dermatological positioning.

Recommendation: use a balanced editorial grid, show author/reviewer and updated date, add evidence/citation patterns, add related products carefully, and provide a clear category trail and next article path.

### 8. About and policy pages — Mixed

The About page is clean and easy to scan, but it is mostly generic marketing statistics. It lacks the human and legal proof that builds trust: company story, registered details, address, leadership/team, pharmacy expertise, sourcing standards, and real operational photography. The “NOTRE RENAISSANCE & ENGAGEMENT” label appears to be incorrect copy.

The policy page has good section navigation, but it is over-designed for a legal document and includes marketing language such as “Cadre Clinique”, “Protection CNDP & SSL”, and “Conciergerie WhatsApp”. Legal content should feel precise and sober, not promotional.

### 9. Tracking — Mixed

The tracking flow is focused and visually legible, with a strong single task. It uses a completely separate dark visual system and removes the standard storefront shell, making it feel like another product. The `PO-...` placeholder conflicts with the newer numeric order-ID direction. “Real-time” and 24/7 claims should match actual service capability.

Recommendation: retain the focused structure but inherit the public header, typography, button system, and support patterns. Provide examples for both required fields and a recovery path for users who lost the tracking code.

### 10. Mobile storefront — Critical

At 390 px the homepage and catalogue show material horizontal overflow/tiling, fixed elements compete for space, the chat button overlaps commerce UI, and the bottom navigation covers page content. Product detail prioritizes a very large image, while product name, core information, and CTA fall below the initial experience. Two-column catalogue cards are too dense and text becomes difficult to read.

Recommendation: treat mobile as a separate layout system, not a compressed desktop. Remove horizontal overflow, establish one fixed-navigation layer, reserve safe-area padding, reduce hero/media heights, and verify every key action at 360, 390, 430, 768, 1024, and 1440 px.

### 11. Completion and error states — Critical

Both checkout completion routes render blank. The browser console reports that `SuccessPage` and `FailurePage` are async Client Components, which the current Next.js runtime rejects. A blank page after payment is a direct loss-of-trust and support-cost issue.

Recommendation: repair these routes first, then test successful COD order, payment failure, duplicate callback, missing order context, refresh, back navigation, and deep-link access.

## Site-wide consistency problems

1. **Fragmented visual language:** storefront light/blue, product detail navy/gold/green, tracking dark/green, policy mint/legal, brand pages editorial blue.
2. **Too many CTA treatments:** turquoise pills, blue gradients, dark buttons, green gradients, white secondary buttons, outlined controls, and icon circles without a strict hierarchy.
3. **Typography scale drift:** oversized editorial headings coexist with very small uppercase labels and tiny secondary copy.
4. **Spacing drift:** some pages are dense (catalogue/cart), others have excessive empty space (advice, checkout, article headers).
5. **Trust language is inconsistent:** clinical, official, selected, certified, authentic, protected, 24/7, real-time, and dermatologist claims are used without a visible evidence system.
6. **Localization is incomplete:** French and Arabic affordances exist, but English campaign modules and an ambiguous mobile “AR” label remain.
7. **Global chrome is inconsistent:** tracking drops the storefront shell; mobile uses a separate bottom nav; chat and activity notifications compete with conversion actions.

## What the website does well

- Strong brand-page art direction and photography.
- Clear product photography where assets exist.
- Useful catalogue search/filter foundations.
- A credible commerce structure: categories, product details, cart, checkout, tracking, policies, advice.
- Good use of rounded cards and generous desktop whitespace in several key pages.
- Clear empty-cart state and readable checkout field grouping.
- Visible French/Arabic intent and Moroccan commerce context.

## Highest-priority improvements

1. Fix blank checkout success/failure routes and test every completion state.
2. Fix incentive logic and messaging for free shipping, gifts, and savings.
3. Rebuild mobile responsive behavior for home, catalogue, product detail, cart, and checkout.
4. Correct product-detail hierarchy and restrict Diagnostic IA to eligible products.
5. Resolve missing/empty image sources, broken placeholders, image sizing warnings, and LCP loading.
6. Define and apply one public design system: typography, color roles, spacing, radii, buttons, cards, status colors, and global navigation.
7. Remove or delay the first-visit lead modal.

## Medium-priority improvements

- Shorten and curate the homepage.
- Simplify catalogue filters and improve missing-image states.
- Add author/reviewer credibility to advice content.
- Add real company proof to About.
- Standardize tracking and policy page shells.
- Consolidate cart/checkout promo entry and trust content.
- Formalize bilingual/RTL content QA.

## Lower-priority improvements

- Refine icon style consistency.
- Standardize microcopy capitalization and punctuation.
- Add more deliberate hover/focus/pressed states after accessibility foundations are correct.
- Reduce decorative badges and uppercase micro-labels.
- Tune motion and brand marquees with pause/reduced-motion behavior.

## Accessibility and technical evidence

This was a visual/product audit, not a full WCAG conformance test. Observed risks include low-contrast gray and gold text, tiny labels, text over busy images, ambiguous icon-only controls, fixed overlays competing with mobile navigation, and animated/marquee content without an obvious pause affordance.

The current run also produced repeated console warnings/errors: multiple Supabase GoTrue clients in one browser context, missing/empty image sources, images with `fill` but no `sizes`, logo aspect-ratio warnings, an above-fold LCP image not loaded eagerly, and the checkout completion component errors. These issues align with the visible slow-loading, missing-image, and blank-state problems.

## Premium-product direction

Use the brand landing pages as the visual benchmark, but simplify them into a disciplined commerce system. Adopt one premium editorial sans family, one restrained palette (ink, white, clinical blue, mint success, coral danger), one button hierarchy, and one card system. Replace broad claims with evidence. Make photography and product information the hero, not decorative UI. Design mobile intentionally around search, product evaluation, cart, and checkout. The result should feel like a trusted Moroccan dermocosmetics retailer—not a collection of individually polished templates.
