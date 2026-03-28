# Design System Document: Alpton Construction

## 1. Overview & Creative North Star
**Creative North Star: "The Architectural Monolith"**

This design system moves away from the "utility-first" look of standard construction websites. Instead, it adopts a high-end editorial aesthetic that mirrors the precision of modern architecture. The goal is to convey "Structural Integrity through Sophistication." 

We achieve this by breaking the rigid, boxy grid common in the industry. We use **intentional asymmetry**, where large-scale typography overlaps high-resolution imagery, and **tonal depth**, where sections are defined by subtle shifts in slate and oak rather than harsh lines. The interface should feel like a curated architectural monograph: spacious, authoritative, and meticulously detailed.

---

## 2. Colors & Surface Philosophy
The palette is rooted in the materials of the trade: Slate (`primary`), Oak (`secondary`), and Limestone (`surface`).

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to define sections or containers. Boundaries must be established through background color shifts. For example, a `surface-container-low` section should sit directly against a `surface` background. This creates a "monolithic" feel where the UI feels carved from a single block rather than assembled from parts.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. Use the following tiers to create "nested" depth:
*   **Base Layer:** `surface` (#f8f9fa) for the main page background.
*   **Sectional Shifts:** Use `surface-container-low` (#f3f4f5) for large content blocks (e.g., a "Process" section).
*   **Interactive Containers:** Use `surface-container-lowest` (#ffffff) for cards or white-space heavy forms to create a soft, natural lift.

### Signature Textures & Glass
*   **The Glassmorphism Rule:** For navigation bars or floating project labels over images, use a backdrop-blur (12px–20px) combined with `surface` at 70% opacity. 
*   **The "Structural Gradient":** For primary CTAs and Hero backgrounds, use a subtle linear gradient from `primary` (#162839) to `primary_container` (#2c3e50) at a 135-degree angle. This adds a "sheen" reminiscent of polished steel or deep evening shadows.

---

## 3. Typography
The system utilizes a dual-font strategy to balance "Architectural Boldness" with "Technical Precision."

*   **Display & Headlines (Manrope):** Chosen for its geometric precision and modern tall x-height. 
    *   *Usage:* Use `display-lg` for hero statements. Apply negative letter-spacing (-0.02em) to headlines to make them feel "compressed" and structural.
*   **Body & Labels (Inter):** A workhorse for readability.
    *   *Usage:* All form inputs and technical specifications must use `body-md`. Use `label-md` in All Caps with +0.05em tracking for sub-headers to create an editorial "tag" look.

**Hierarchy Note:** Always lead with high contrast. Pair a `display-md` headline in `on_surface` with a `label-md` kicker in `secondary` (Architectural Gold) to immediately draw the eye to the brand’s premium accent.

---

## 4. Elevation & Depth
We eschew traditional "material" shadows in favor of **Ambient Tonal Layering.**

*   **The Layering Principle:** Depth is achieved by "stacking." A `surface-container-lowest` card placed on a `surface-container-low` background provides enough contrast to signify elevation without a single pixel of shadow.
*   **Ambient Shadows:** If a card must float (e.g., a hovering project preview), use a "Whisper Shadow":
    *   `box-shadow: 0 20px 40px rgba(25, 28, 29, 0.04);`
    *   The shadow color is derived from `on_surface`, not pure black, ensuring it looks like natural ambient light.
*   **The "Ghost Border" Fallback:** If accessibility requires a border, use `outline-variant` at 15% opacity. Never use 100% opaque borders.

---

## 5. Components

### Buttons
*   **Primary:** Background: `primary` to `primary_container` gradient. Typography: `on_primary`. Shape: `md` (0.375rem).
*   **Secondary (The "Oak" Accent):** Background: `secondary` (#7b5800). Typography: `on_secondary`. Use sparingly for high-conversion actions like "Request a Quote."
*   **Tertiary:** Ghost style. No background. `on_surface` text with an underline that expands on hover.

### Architectural Cards
*   **Rule:** Forbid divider lines. Use `spacing-6` (2rem) to separate internal card elements.
*   **Header:** Image should be edge-to-edge with no padding at the top.
*   **Footer:** Use `surface-container-highest` for a subtle "base" to the card where the CTA sits.

### Portfolio Watermarking
Every portfolio image must feature a "Structural Watermark" in the bottom-right corner. 
*   **Style:** `surface` color at 20% opacity with a `backdrop-filter: blur(8px)`.
*   **Content:** Alpton Monogram + Project Year in `label-sm`.

### Input Fields
*   **State:** Default state uses `surface-container-high` background. 
*   **Focus:** Transition background to `surface-container-lowest` and add a 2px "Ghost Border" of `primary` at 30% opacity.
*   **Typography:** Labels must be `label-md` and positioned *above* the field, never as placeholders.

---

## 6. Do’s and Don’ts

### Do
*   **DO** use extreme white space. If you think there is enough space, add `spacing-4` more.
*   **DO** overlap elements. Allow a project title to bleed 20px over the edge of a project image to create a custom, high-end feel.
*   **DO** use "architectural gold" (`secondary`) only for small, high-impact moments (icons, active states, or key stats).

### Don't
*   **DON'T** use 1px dividers or borders. This is the fastest way to make the system look "cheap" or "templated."
*   **DON'T** use pure black (#000). Always use `primary` (#162839) for dark text to maintain the "Slate" sophistication.
*   **DON'T** use standard "drop shadows." If it looks like a default shadow, it hasn't been diffused enough.