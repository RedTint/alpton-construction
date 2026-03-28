```markdown
# Design System Documentation: The Architectural Monolith

## 1. Overview & Creative North Star
**Creative North Star: "The Structural Monolith"**

This design system is a digital translation of high-end architectural principles: structural integrity, unyielding permanence, and the interplay between shadow and light. We are moving away from the "template" aesthetic of the modern web. Instead, we embrace a **High-End Editorial** approach characterized by intentional asymmetry, cinematic scale, and a "monolithic" lack of ornamentation.

The experience should feel like walking through a gallery of brutalist stone and gold leaf. We achieve this by rejecting rounded corners entirely (0px across the board) and utilizing a high-contrast palette of deep navy and sophisticated gold to guide the user’s eye. The layout is not a grid to be filled; it is a canvas where negative space is as communicative as the content itself.

---

## 2. Colors: Chromatic Depth & The No-Line Rule

The color profile is anchored by **Primary Navy (#000410)** and **Secondary Gold (#775a19)**. These are not merely accents; they represent the "structure" and the "light" of the interface.

### The "No-Line" Rule
To maintain a premium, architectural feel, **1px solid borders for sectioning are strictly prohibited.** Boundaries must be defined solely through:
1.  **Background Color Shifts:** A `surface-container-low` section sitting against a `surface` background.
2.  **Tonal Transitions:** Moving from `primary` (Navy) to `primary-container` to create internal hierarchy.

### Surface Hierarchy & Nesting
Treat the UI as physical layers of material. Use the `surface-container` tiers to create "nested" depth. 
*   **Base:** `surface` (#f9f9fc) for wide-open, airy layouts.
*   **In-set Content:** `surface-container-low` (#f3f3f6) for primary content blocks.
*   **Emphasis:** `surface-container-high` (#e8e8ea) for secondary functional areas.

### The "Glass & Gold" Rule
For floating elements (Navigation bars, dropdowns), use **Glassmorphism**. Apply a semi-transparent `surface` color with a `backdrop-blur` of 20px. This allows the navy and gold structures to bleed through, softening the monolithic edges and adding a layer of technical sophistication. For main CTAs, use a subtle gradient transitioning from `primary` (#000410) to `primary_container` (#0b1e38) to give the navy "soul" and depth.

---

## 3. Typography: The Editorial Voice

We utilize **Manrope** exclusively. It is a typeface that balances geometric modernism with functional clarity.

*   **Display Scale:** Use `display-lg` (3.5rem) for hero statements. Break the grid—allow display text to overlap container boundaries or background transitions to create an editorial, high-fashion feel.
*   **Headline Scale:** `headline-lg` (2rem) should be used sparingly to define major content shifts.
*   **The Label Strategy:** Small labels (`label-sm`, 0.6875rem) must be used for metadata. To enhance the premium feel, increase letter-spacing (tracking) on all uppercase labels.
*   **Hierarchy:** Hierarchy is achieved through massive scale contrast (e.g., a 3.5rem headline paired with a 0.875rem body) rather than just weight.

---

## 4. Elevation & Depth: Tonal Layering

In this design system, depth is not "faked" with shadows; it is earned through **Tonal Layering**.

*   **The Layering Principle:** Place a `surface-container-lowest` card on a `surface-container-low` section. This creates a soft, natural "lift" that feels like stacked fine paper rather than a digital window.
*   **Ambient Shadows:** When an element *must* float (e.g., a modal), use an **Extra-Diffused Shadow**. The blur should be large (40px+) and the opacity extremely low (4-8%). The shadow color should be a tinted version of Navy (`on-surface` #1a1c1e) to mimic natural light refraction.
*   **The Ghost Border:** If accessibility requires a container edge, use a "Ghost Border": the `outline-variant` token at **10% opacity**. Never use 100% opaque borders.
*   **Monolithic Blocks:** Encourage the use of full-bleed Navy (`primary`) blocks that transition sharply into Gold (`secondary`) accents to represent the "cut" of architectural stone.

---

## 5. Components

### Buttons
*   **Primary:** Solid Navy (#000410) with White text. Sharp 0px corners. No border.
*   **Secondary:** Solid Gold (#775a19) with White text. Use this only for "Prestige" actions (e.g., *Inquire*, *Contact Principal*).
*   **Tertiary:** Ghost style. Transparent background, `primary` text, and a 10% opacity `outline-variant` bottom-border only.

### Cards & Lists
*   **The Divider Ban:** Do not use line dividers between list items. Use the **Spacing Scale** (specifically `spacing-6` or `2rem`) to create separation.
*   **Interactive Cards:** On hover, a card should not move; instead, the background should shift from `surface-container-low` to `surface-container-highest`.

### Input Fields
*   **Style:** Minimalist. Only a bottom border (using `outline`) that thickens to 2px Navy on focus. 
*   **Labels:** Use `label-md` floating above the field. Ensure high contrast against the background.

### Navigation (The Floating Header)
*   Utilize the **Glassmorphism** rule. A persistent top bar with a 70% opacity `surface` color and a blur effect. This maintains the "Monolith" feel while allowing content to flow underneath.

---

## 6. Do’s and Don’ts

### Do
*   **Do** embrace extreme white space. If you think there is enough room, add more.
*   **Do** use asymmetrical layouts (e.g., a left-aligned headline with a right-aligned image further down the page).
*   **Do** use Navy as your primary "ink" for all text and structural backgrounds.
*   **Do** keep all corners strictly 0px to maintain the architectural theme.

### Don't
*   **Don't** use drop shadows for every card. Rely on background color shifts first.
*   **Don't** use the Gold (`secondary`) for large backgrounds. It is a precious metal; use it for highlights, buttons, and icons only.
*   **Don't** use standard "box" layouts. Overlap images and text to break the vertical flow.
*   **Don't** use rounded icons. All iconography should be linear, sharp-edged, and modern.

---

**Director’s Final Note:** This design system is about the *presence* of the brand. Every element should feel heavy, intentional, and expensive. If a component feels "default," it hasn't been designed yet. Refine it until it feels like it was carved from the same stone as the buildings it represents.```