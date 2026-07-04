# Design Spec: AEB Election Landing Page & Candidate Profile Redesign

## 1. Project Context

**Subject:** Association of Engineers Bangladesh (AEB) — IEB Election 2026 public-facing pages.

**Audience:** IEB members, fellow engineers, and visitors evaluating the AEB election panel.

**Pages in scope:**
- Landing page (`/`)
- Dynamic candidate profile pages (`/[slug]`)

**Single job of these pages:** Establish trust, present the panel as a credible, professional leadership team, and make it easy to learn about each candidate.

**Current issues:**
- Candidate profile uses green (`#006747`) that does not match the logo teal.
- Landing page uses navy blue, which diverges from the logo.
- Rust/orange accent feels campaign-rally rather than institutionally professional.
- Candidate profile is very long with many sections; visual rhythm could be sharper.

---

## 2. Logo-Derived Color Palette

Analysis of `app/public/images/ieb logo.jpeg` shows:
- White/off-white background
- Charcoal/dark gray emblem
- Teal/cyan accent at hue ~165° (e.g., `#A0D2C3`)

| Token | Hex | Role |
|-------|-----|------|
| `--color-primary` | `#0F766E` | Primary teal — headers, buttons, dark bands, hover states |
| `--color-primary-dark` | `#134E4A` | Dark teal — footer, deep bands, primary hover |
| `--color-primary-light` | `#CCFBF1` | Pale teal — light section tints, subtle highlights |
| `--color-accent` | `#D97706` | Gold/amber — position badges, icons, CTAs, emphasis rules |
| `--color-accent-light` | `#FEF3C7` | Pale amber — badge backgrounds, tinted cards |
| `--color-ink` | `#0F172A` | Primary text, strong headings |
| `--color-slate` | `#334155` | Secondary headings, labels |
| `--color-steel` | `#64748B` | Muted text, borders, captions |
| `--color-canvas` | `#F8FAFC` | Page canvas, alternating section backgrounds |
| `--color-cloud` | `#F1F5F9` | Cards, tables, muted bands |
| `--color-white` | `#FFFFFF` | Cards, content surfaces |

**Rationale:** Deep teal directly references the logo teal while feeling institutional. Gold/amber is a classic complement for teal in formal contexts, signaling prestige and excellence without political-party connotations.

---

## 3. Typography

The project already loads Geist Sans and Geist Mono as local fonts. Keep these.

| Role | Font | Treatment |
|------|------|-----------|
| Display / hero headlines | Geist Sans | Bold (700–800), tight tracking (`tracking-tight`), large sizes |
| Section headings | Geist Sans | Semibold (600–700), `tracking-tight` |
| Body | Geist Sans | Regular (400), comfortable line-height (`leading-relaxed`) |
| Labels / eyebrows / membership numbers | Geist Mono | Uppercase, `tracking-widest`, small sizes (`text-[10px]`–`text-xs`) |

**Type scale:**
- Hero H1: `text-4xl sm:text-5xl lg:text-6xl`
- Section H2: `text-2xl sm:text-3xl`
- Card name: `text-lg font-bold`
- Body: `text-base sm:text-lg`
- Caption/label: `text-xs` or `text-[11px]`

---

## 4. Layout Concept

### Landing page

**Structure (top to bottom):**
1. Public navbar — teal logo mark, white background, teal hover
2. Hero — full-width teal-to-slate gradient, centered 2-column layout (text left, logo seal right)
3. About / election intro band — white background, short institutional statement
4. Candidates panel — cloud/white background, 4-column responsive grid of formal candidate cards
5. Manifesto / vision teaser — optional light teal band
6. Contact / CTA band — dark teal footer prelude
7. Public footer — dark ink/teal background

**Signature element:** A subtle blueprint-grid overlay behind the hero (already partially present) plus a circular "seal" treatment for the logo.

### Candidate profile page

**Structure (top to bottom):**
1. Hero band — deep teal `#0F766E` with circular portrait seal, name, position badge, membership number, slogan
2. Sticky side-rail + mobile jump-bar — anchor links to sections
3. Welcome message — dark teal band with blockquote
4. About — white band
5. Candidate information table — cloud band
6. Education — white band
7. Professional profile — cloud band
8. Leadership & activities — white band
9. Community engagement — cloud band
10. Vision — dark teal band
11. Mission — white band
12. Commitments — cloud band
13. Why vote — white band
14. Leadership philosophy — cloud band
15. Message to engineers — dark teal band
16. Slogan pull-quote — cloud band
17. Contact — white band
18. Gallery — cloud band
19. Back navigation — white band

**Signature element:** The "Blueprint Seal" portrait frame (existing) is retained but refined with gold tick marks instead of rust, and the diagonal grid overlay is softened.

---

## 5. Component-Level Changes

### PublicNavbar

- Change logo import to use the standard alias `images/ieb logo.jpeg`.
- Background: white with a subtle bottom border (`border-slate-200`).
- Links: slate text, teal hover, amber active indicator.
- Mobile menu: white sheet with teal accents.

### HeroSection (landing)

- Gradient: `from-teal-900 via-teal-800 to-slate-900` instead of pure blue.
- Eyebrow badge: `IEB Election 2026` with pale teal background and teal text.
- Headline: white, Geist Sans bold.
- CTA buttons:
  - Primary: white background, teal text
  - Secondary: transparent white border, white text
- Logo seal: circular white background with subtle ring, logo centered.

### ElectionPanelSection (landing)

- Section eyebrow: `AEB Panel` in mono uppercase, teal.
- Heading: slate ink, centered.
- Candidate cards:
  - White card with subtle border and shadow
  - Portrait area: pale teal gradient background
  - Circular portrait with thin teal ring
  - Position badge: amber/gold background, dark text
  - Name: slate ink bold
  - Designation: steel
  - "View Profile" link: teal with arrow, hover underline
- Hover: gentle lift (`hover:-translate-y-1 hover:shadow-lg`)

### PublicFooter

- Background: `#0F172A` or `#134E4A` (dark teal/ink)
- Text: cool gray/slate-300
- Links: hover to amber
- Social icons: slate-700 circles, hover teal or amber

### CandidateProfile

- Hero background: `#0F766E` instead of `#006747`.
- Blueprint grid overlay: opacity reduced to ~10%.
- Position badge: amber background, dark text.
- Panel badge: teal/white outline.
- Accent icons: amber `#D97706`.
- Section icons: teal background on light bands, amber icon on dark bands.
- Section title underline/hover: teal left border on side-rail links.
- Table headers: teal text instead of green.
- Back buttons:
  - Outline: teal border, teal text, teal hover fill
  - Solid: amber background, white text
- Slogan pull-quote: teal text, amber quote icon.

### CandidateProfile side-rail

- Left border: steel/25.
- Hover/active: teal left border + teal text.

### MobileJumpBar

- Background: white/95 with blur.
- Pills: white with steel border, teal hover.

---

## 6. Responsive & Accessibility

- Mobile-first: single column cards below `sm`, 2-column at `sm`, 4-column at `lg`.
- Portrait seal scales down on mobile.
- Side-rail hidden below `xl`; mobile jump-bar takes over.
- Respect `prefers-reduced-motion` for hover lifts.
- Ensure all interactive elements have visible focus rings (teal).
- Maintain color contrast ratios ≥ 4.5:1 for body text.

---

## 7. Files to Modify

| File | Changes |
|------|---------|
| `app/components/public/PublicNavbar.jsx` | Logo import style, link colors |
| `app/components/public/HeroSection.jsx` | Teal gradient, badge, button colors, logo seal ring |
| `app/components/public/ElectionPanelSection.jsx` | Card design, portrait area, badge colors, hover |
| `app/components/public/PublicFooter.jsx` | Dark background, link hover colors |
| `app/components/public/CandidateProfile.jsx` | Hero teal, amber accents, section polish, seal tick color |

---

## 8. What Is NOT Changing

- Content/copy from `data/candidates.js`.
- Page structure and section order (only visual polish).
- The sticky side-rail / mobile jump-bar behavior.
- The dynamic route at `app/(public)/[slug]/page.js`.

---

## 9. Success Criteria

1. Candidate profile no longer uses green; teal + amber palette is consistent.
2. Landing page hero aligns with the logo teal instead of navy blue.
3. Both pages feel visually cohesive and professional.
4. All existing functionality remains intact.
5. Build passes without errors and layout is responsive.
