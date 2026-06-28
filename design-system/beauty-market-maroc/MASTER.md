# 📘 Design System Master File: Beauty Market Maroc

> **LOGIC ARCHITECTURE:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that page-specific file exists, its rules **override** this Master file.
> If not, strictly follow the rules below to maintain visual cohesion.

---

**Project:** Beauty Market Maroc
**Industry:** Premium Skincare & Clinical Dermo-Cosmetics
**Theme Mood:** Elegant, Clinical-Luxury, Sophisticated, Timeless, Premium Editorial
**Visual Signature:** Liquid Glass Aesthetic & Slate Blue & Navy Color System

---

## 🎨 1. Core Visual Palette (Slate Blue & Navy)

To maintain our premium clinical identity, subsequent development **MUST** strictly adhere to the Slate Blue and Navy color system. Do not introduce vibrant primary colors, playful pastels, or plain red/blue/green defaults.

| Brand Role | Hex Value | CSS Variable | Visual Purpose & Implementation Guide |
| :--- | :--- | :--- | :--- |
| **Slate Blue** | `#2573a3` | `--color-primary` | **Brand Signature:** Used for high-contrast active icons, category highlights, focus states, selected indicators, and trust tags (K-Beauty badges). |
| **Dark Navy** | `#1a255d` | `--color-primary-dark` | **Luxury Anchor:** Represents clinical authority and premium quality. Used for major headers, primary CTA buttons, solid background wrappers, and primary logo markings. |
| **Secondary Canvas** | `#ffffff` | `--color-secondary` | **Purity Canvas:** Sterile clinical white. Used for page sections, layout backdrops, active toggle text, and structural card interiors. |
| **Foreground Text** | `#111827` | `--color-foreground` | **Clinical Readability:** Deep charcoal/black. Used for titles, body copy, and secondary descriptions to maintain a 4.5:1 contrast ratio. |
| **Accent Glow** | `#831843` | *Component Local* | **Luxury Contrast:** Soft deep rose gold. Used primarily for focus shadow glows and organic luxury accents. |
| **Border Slate** | `#e2e8f0` | `--color-border` | **Glass Enclosure:** Thin border strokes that enclose bento cards and product details without heavy visual division. |
| **Border Light** | `#f1f5f9` | `--color-border-light` | **Subtle Separation:** Used for internal dividers, line rules, and secondary container wrappers. |

### 🔍 Brand Signature Gradients
*   **The Primary Clinical Blend:** `linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))`
    *   *Visual effect:* Seamless transition from Dark Navy (`#1a255d`) to Slate Blue (`#2573a3`).
    *   *Usage:* Primary marketing CTA buttons, premium promo card buttons, and brand badges.

---

## ✍️ 2. Typography & Editorial Systems

Our typography system bridges luxury fashion editorial styling with high-performance clinical readability.

*   **Heading Font:** Playfair Display (Serif)
    *   *Purpose:* Expresses luxury, heritage, and clinical craftsmanship. Use for `h1`, `h2`, and major section headings.
*   **Body Font:** Inter (Sans-serif)
    *   *Purpose:* Modern, crisp, and neutral. Optimizes readability for active skincare ingredients, scientific descriptions, and price values.
*   **Google Fonts Shared Link:**
    ```html
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet">
    ```

---

## 📏 3. Spacing & Shadow Depths

All layouts must strictly align to these spacing variables to maintain perfect symmetry across grids and viewports.

### Spacing Variables
*   `--space-xs` (`4px` / `0.25rem`): Tight micro-gaps (e.g., star icons in a review row).
*   `--space-sm` (`8px` / `0.5rem`): Standard gap between badge, category title, and heading.
*   `--space-md` (`16px` / `1rem`): Standard internal padding for cards and mobile sections.
*   `--space-lg` (`24px` / `1.5rem`): Standard desktop padding, horizontal container margins.
*   `--space-xl` (`32px` / `2rem`): Grid gap spacing between columns.
*   `--space-2xl` (`48px` / `3rem`): Section gaps and large block separations.

### Premium Shadow Scale
*   `--shadow-sm` (`0 1px 2px rgba(26, 37, 93, 0.03)`): Micro elements.
*   `--shadow-md` (`0 4px 12px rgba(26, 37, 93, 0.05)`): Standard product cards.
*   `--shadow-lg` (`0 12px 32px rgba(26, 37, 93, 0.08)`): Flying carts, dropdown drawers, and diagnostics panels.
*   `--shadow-premium` (`0 20px 40px -15px rgba(26, 37, 93, 0.05), 0 1px 3px rgba(0, 0, 0, 0.01)`): Full product cards on hover.

---

## 💎 4. Component Visual Specifications

### A. Primary Buttons
```css
.btn-primary {
  background-color: var(--color-primary-dark); /* Navy Base */
  color: var(--color-secondary);
  font-size: 11px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  border-radius: 6px;
  box-shadow: 0 4px 14px rgba(26, 37, 93, 0.15);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.btn-primary:hover {
  background-color: var(--color-primary); /* Slate Blue Hover */
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(26, 37, 93, 0.25);
}

.btn-primary:active {
  transform: scale(0.97);
}
```

### B. Secondary Buttons (Outlined)
```css
.btn-secondary {
  background-color: transparent;
  color: var(--color-primary-dark);
  border: 1.5px solid var(--color-primary-dark);
  border-radius: 6px;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.btn-secondary:hover {
  background-color: var(--color-primary-dark);
  color: var(--color-secondary);
}
```

### C. Glassmorphism Product Cards
```css
.product-card-shell {
  background-color: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(226, 232, 240, 0.6);
  border-radius: 10px;
  box-shadow: var(--glass-shadow);
  transition: all 0.5s ease-[cubic-bezier(0.16, 1, 0.3, 1)];
}

.product-card-shell:hover {
  transform: perspective(900px) rotateX(2deg) rotateY(2deg) translateY(-4px);
  border-color: rgba(37, 115, 163, 0.3); /* Slate Blue Glow Accent */
  box-shadow: var(--shadow-premium);
}
```

---

## 🚫 5. Anti-Patterns (Visual Taboos)

To ensure high-end aesthetic continuity, **NEVER** write or allow the following design structures:

*   ❌ **Vibrant Blocky Aesthetics:** No retro-brutalist solid blocks, raw red borders, or neon green accents (except WA logo).
*   ❌ **Generic CSS Buttons:** No un-styled buttons or raw `#0000ff` web links.
*   ❌ **Emojis as Iconography:** Emojis are strictly banned for UI navigation. Always use **Lucide React** or custom optimized inline SVGs.
*   ❌ **Hardcoded Hex Values:** Do not write hex codes in CSS or style tags (e.g. `#111827`, `#2573a3`). Always map them through CSS custom variables: `var(--color-primary)`, `var(--color-primary-dark)`.
*   ❌ **Instant Hover States:** All state transitions must have standard curves: `transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1)`.
*   ❌ **Layout-Shifting Scale:** Avoid scaling card elements on hover in a way that shifts adjacent text or layout grids.

---

## ✅ 6. Active Code Delivery Checklist

Prior to launching any new layouts or sections, verify:
- [ ] Brand colors map strictly to Slate Blue (`#2573a3`) and Dark Navy (`#1a255d`).
- [ ] Headings are configured with **Playfair Display**; clinical data uses **Inter**.
- [ ] Emojis are replaced by highly clean Lucide icons.
- [ ] No hardcoded hex values exist in inline CSS styles.
- [ ] All clickable elements display `cursor-pointer`.
- [ ] Grid layouts scale down gracefully with robust responsiveness on small screens.
