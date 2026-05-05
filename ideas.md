# Design Ideas — NRMA 8090 Business Case Website

## Selected Approach: "Corporate Precision"

**Design Movement:** Swiss International Typographic Style meets modern corporate digital
**Core Principles:**
1. White canvas with NRMA blue (#003087) as the authoritative typographic colour
2. Asymmetric left-anchored layouts with strong vertical rhythm — data lives in structured grids, not centred blobs
3. Thin blue rule lines as structural dividers — no heavy borders, no cards with heavy shadows
4. Numbers and metrics are the heroes — large, bold, blue numerals with fine-weight descriptors

**Color Philosophy:**
- Background: pure white (#FFFFFF) — clinical, trustworthy, executive
- Primary: NRMA Blue (#003087) — authority, trust, NRMA brand
- Accent: NRMA Orange (#FF6600) — used sparingly for CTAs and positive savings metrics
- Muted: #F4F6FA — section backgrounds for subtle zoning
- Text: #1A2B4A (near-black blue-tinted) for body copy

**Layout Paradigm:**
- Sticky top nav with scroll-spy anchors — non-linear executive navigation
- Full-width hero with a left-aligned headline and a right-side KPI strip
- Section content uses a 2/3 + 1/3 split: narrative left, metric callout right
- Filter bar pinned below nav for section-level filtering

**Signature Elements:**
1. Large blue numerals (stat callouts) — e.g. "48.5%" in 96px bold
2. Thin horizontal blue rule (#003087, 2px) as section openers
3. Blue left-border accent on blockquotes from the PoC document

**Interaction Philosophy:**
- Scroll-spy highlights active nav item
- Filter chips animate in/out sections with fade
- Hover on stat cards reveals source annotation

**Animation:**
- Entrance: fade-up on scroll (staggered 80ms per element)
- Nav: smooth underline slide on active item
- Charts: recharts animated on mount

**Typography System:**
- Display: 'Playfair Display' — authoritative serif for section titles
- Body: 'Source Sans 3' — clean, readable, professional
- Mono: system-ui monospace for code/token references
