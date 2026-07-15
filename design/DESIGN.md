# Design System Document

## 1. Overview & Creative North Star

### The Creative North Star: "The Artisanal Weaver"

This design system is built to bridge the gap between digital precision and the tactile, organic warmth of handcrafted crochet. It moves away from the rigid, blocky "template" look of modern e-commerce, opting instead for a high-end editorial feel that mimics a physical lookbook.

The system achieves this through **Intentional Asymmetry** and **Tonal Depth**. By overlapping elements, using organic rounded corners (up to `xl`), and integrating wavy, yarn-inspired line accents, we create a layout that feels woven rather than assembled. The goal is to make the user feel like they are stepping into a vibrant studio, not just a website.

---

## 2. Colors

Our palette is energetic and unabashedly vibrant, drawing from the saturated dyes of premium yarn.

- **Primary (`#a7295a`) & Primary Container (`#ff709f`)**: Used for brand moments and high-action CTAs.
- **Secondary (`#00675d`)**: Provides a grounding, sophisticated teal anchor to the warmer corals.
- **Tertiary (`#7f5200`)**: A sunny, honey-yellow used for accents and "handmade" callouts.
- **Surface & Background (`#dcfdf8`)**: A minty-fresh light mode base that allows vibrant product photography to pop.

### The "No-Line" Rule

To maintain a premium, seamless aesthetic, **designers are prohibited from using 1px solid borders for sectioning.** Structural boundaries must be defined solely by:

1.  **Background Shifts**: Using `surface-container-low` against a `surface` background.
2.  **Organic Shapes**: Large-scale, soft-edged sections that bleed off the grid to create visual flow.

### Signature Textures & Gradients

Flat colors can feel clinical. Use subtle linear gradients transitioning from `primary` to `primary-container` on major CTAs or background organic blobs. This adds a "soul" to the interface that mimics the way light hits physical yarn.

---

## 3. Typography

The typography system is a dialogue between the "Artisan" (the Serif) and the "Studio" (the Sans-Serif).

- **Display & Headline (Newsreader)**: A bold, elegant serif. This font carries the brand's voice. Use `display-lg` (3.5rem) for hero sections to establish an editorial hierarchy. It should feel authoritative yet artistic.
- **Body & Labels (Manrope)**: A clean, modern sans-serif. This provides the functional clarity required for e-commerce. It is spaced generously to ensure readability against the vibrant background colors.
- **Hierarchy Logic**: Headers should always lead with a "high-contrast" approach—large serifs followed by small, all-caps sans-serif labels (`label-md`) to create a sophisticated, curated look.

---

## 4. Elevation & Depth

We eschew traditional material shadows in favor of **Tonal Layering** and **Atmospheric Perspective**.

### The Layering Principle

Depth is achieved by stacking the surface-container tiers.

- **Level 1 (Base)**: `surface` (#dcfdf8).
- **Level 2 (Section)**: `surface-container-low` (#d3f8f2).
- **Level 3 (Object/Card)**: `surface-container-lowest` (#ffffff) for maximum lift.

### Ambient Shadows

If a floating effect (like a "Add to Cart" sticky button) is required, use a shadow with a blur radius of 40px+ and an opacity of 6%. The shadow color should be a tinted version of `on-surface` (#153430), never a generic grey.

### Glassmorphism & Depth

For floating navigation bars or overlays, use **Glassmorphism**:

- **Fill**: `surface-container-lowest` at 70% opacity.
- **Backdrop Blur**: 12px to 20px.
- **Effect**: This creates a "frosted glass" look that lets the organic shapes and vibrant colors of the background bleed through, making the UI feel integrated.

---

## 5. Components

### Buttons

- **Primary**: Pill-shaped (`full` roundedness), using a gradient from `primary` to `primary_dim`. High-contrast `on_primary` text.
- **Secondary**: `surface-container-highest` background with `on_surface` text. No border.
- **Tertiary/Ghost**: Newsreader serif text with a subtle `primary` underline that resembles a single strand of yarn.

### Cards & Lists

- **The "No-Divider" Mandate**: Forbid the use of horizontal lines. Separate list items using vertical white space (`spacing-6`) or alternating tonal shifts in the background.
- **Image Containers**: Use `xl` (1.5rem) rounded corners. For a signature look, apply a slight "wobble" or organic mask to featured images.

### Input Fields

- **Style**: Background-fill only using `surface-container-high`.
- **The "Ghost Border"**: For accessibility, use a 1px border at 10% opacity of `outline-variant`. It should be barely felt, only perceived.

### Chips & Tags

- Use `secondary_container` with `on_secondary_container` text for product categories. The shape should be "organic-pill" (asymmetrical radii like 1rem, 0.5rem, 1rem, 0.5rem).

---

## 6. Do's and Don'ts

### Do:

- **Overlap Elements**: Let a crochet hook illustration or a ball of yarn overlap a card and a background section simultaneously to create depth.
- **Use High-Scale Contrast**: Pair a very large `display-lg` title with a very small `label-sm` subtitle for an editorial magazine feel.
- **Embrace White Space**: Use `spacing-16` and `spacing-20` to let products breathe. High-end design is defined by what you leave out.

### Don't:

- **Don't use 100% Black**: Always use `on_surface` (#153430) for text to maintain the "soft" artistic vibe.
- **Don't use Grids Rigidity**: Avoid perfectly aligned columns of 3. Offset the second item in a row slightly downward to mimic a handmade, "imperfect" arrangement.
- **Don't use Sharp Corners**: Nothing in crochet is sharp. Ensure all components use at least `md` (0.75rem) roundedness.
