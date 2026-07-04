# Public Landing Page & Candidate Profile Design Plan

## 1. Brief design concept

Treat the site as an official **engineering dossier** for the IEB Election 2026 AEB panel: precise, structured, and distinctly Bangladeshi without defaulting to a generic corporate look. The public navbar becomes a clean project header; the candidate profile reads like a stamped technical specification sheet. The overall direction is restrained and authoritative, with one bold "blueprint seal" gesture carrying the visual identity.

## 2. Color palette

| Name | Hex | Use |
|------|-----|-----|
| IEB Green | `#006747` | Primary brand/hero dark sections, headings on light backgrounds |
| AEB Rust | `#C84127` | Signature accent, badges, CTAs, active nav states |
| Slate Ink | `#1E293B` | Body text, primary copy |
| Blueprint Steel | `#64748B` | Rules, borders, secondary labels, muted metadata |
| Concrete | `#F1F5F9` | Alternating section bands, card backgrounds |
| Cool White | `#F8FAFC` | Page canvas, dark-section text on green |

## 3. Typography direction

- **Display / headlines**: `font-serif` (Georgia/Times New Roman/system serif). Gives an official, institutional gazette feel; kept bold and tightly tracked.
- **Body**: `font-sans` (system-ui/Inter). Clean, readable, neutral to let the content dominate.
- **Data / eyebrows / table headers**: `font-mono` (ui-monospace/Menlo/Consolas). Evokes engineering drawings and specification labels.

Type scale: large serif name in candidate hero, mono uppercase eyebrows, sans body at base `text-base`/`text-lg`.

## 4. Signature element — the deliberate aesthetic risk

**The Blueprint Seal.**

Every candidate hero centers on a circular portrait framed by a dashed/segmented engineering ring, as if stamped onto a technical drawing. Behind it, the hero carries a faint diagonal blueprint-grid overlay (`bg-[linear-gradient(...)]`). This is the one memorable choice; everything else stays quiet and structured.

## 5. Navbar redesign

### Link structure
Surface navigation collapses to **5 horizontal items + CTA** so nothing wraps on a 13-inch laptop.

1. **Home** → `#home`
2. **Candidates** → `#panel`
3. **Manifesto** → `#manifesto`
4. **About** (dropdown)
   - About AEB → `#about-aeb`
   - About IEB Election → `#about-election`
   - President's Message → `#president-message`
5. **Media** (dropdown)
   - News & Activities → `#news`
   - Gallery → `#gallery`
6. **Contact** → `#contact`
7. **CTA**: "Get Involved" → `#contact`

### Behavior
- **Desktop**: horizontal bar with the two dropdowns. Dropdowns open on hover/focus (or click for touch). AEB Rust underline on active/hover.
- **Tablet/mobile**: hamburger opens a full-width panel. Dropdowns become accordion sections with chevrons. CTA sits sticky at the bottom.
- **Logo**: replace the small circular AEB logo with the new IEB logo (`/images/ieb logo.jpeg`) on the left, with "IEB Election 2026" / "AEB Panel" text lockup.

## 6. Candidate profile redesign

### Layout concept

```
[ STICKY SIDE RAIL ]   [ MAIN CONTENT ]
- jump links            - Hero (seal portrait + name/meta)
- contact shortcuts     - Welcome (dark band)
                        - About + Candidate info table
                        - Education / Career (2-col on desktop)
                        - Leadership & Community (grid cards)
                        - Vision (AEB Rust dark band)
                        - Mission / Commitments / Why vote (grid)
                        - Philosophy + Message (alternating bands)
                        - Slogan (large centered)
                        - Contact + Gallery
                        - Back nav
```

### What changes from the current design
- **Hero**: IEB Green background with subtle diagonal blueprint grid, circular portrait inside the segmented "seal" ring, serif name, mono membership number.
- **Navigation**: sticky side rail on `lg+` with anchor links; mobile gets a compact top jump-bar.
- **Rhythm**: fewer pure white slabs. Alternating Concrete and Cool White bands; Vision/Message use dark IEB Green; accent band uses AEB Rust.
- **Lists**: replace every bordered gray list card with a cleaner 2-column grid using a small AEB Rust bullet/icon and tight vertical rhythm.
- **Tables**: education and candidate-info tables keep the shadcn `Table`, but restyle headers with mono uppercase, Blueprint Steel rules, and IEB Green header text.
- **Slogan**: large centered serif pull-quote with a thin rule above/below.
- **Gallery**: masonry-style 3-column grid with hover scale, no placeholder placeholders if empty (show a simple "Photos will be added" state).

## 7. Image path updates

| File | Current path | New path |
|------|--------------|----------|
| `app/components/public/PublicNavbar.jsx` | `/images/aeb_logo.png` | `/images/ieb logo.jpeg` |
| `app/components/public/HeroSection.jsx` | `/images/aeb_logo.png` | `/images/ieb logo.jpeg` |
| `app/components/public/PublicFooter.jsx` | `/images/aeb_logo.png` | `/images/ieb logo.jpeg` |
| `app/components/public/ElectionPanelSection.jsx` | `/images/aeb_logo.png` for Salim/Arif/Kamal/Matin | `/images/candidates/salim.png`, `/images/candidates/arif.jpg`, `/images/candidates/kamal.png`; Matin keeps `/images/no-image.png` |
| `data/candidates.js` | `/images/candidates/engr-salim-md-jane-alam.png` | `/images/candidates/salim.png` |
| `data/candidates.js` | `/images/candidates/engr-mohammed-arif-hasan-chowdhury.png` | `/images/candidates/arif.jpg` |
| `data/candidates.js` | `/images/candidates/engr-kamal-uddin-ahmed.png` | `/images/candidates/kamal.png` |

All images continue to use `next/image`.

## 8. Chunking plan

### Chunk 1 — Image reference updates
- **Complexity**: simple
- **Files changed**
  - `data/candidates.js`
  - `app/components/public/PublicNavbar.jsx`
  - `app/components/public/HeroSection.jsx`
  - `app/components/public/PublicFooter.jsx`
  - `app/components/public/ElectionPanelSection.jsx`
- **Goal**: Point all main logos and candidate photos to the newly uploaded assets.
- **Acceptance criteria**
  1. `grep` shows zero references to `/images/aeb_logo.png` in public components or candidate data.
  2. Each of the three named candidates loads the correct new photo; Matin still falls back to `/images/no-image.png`.
  3. The logo renders in navbar, hero, and footer from `/images/ieb logo.jpeg`.
- **Test coverage**: manual visual check on `/` and `/<slug>`; no new unit tests required.

### Chunk 2 — Navbar redesign
- **Complexity**: medium
- **Files changed**
  - `app/components/public/PublicNavbar.jsx` (only)
- **Goal**: Reduce visual clutter by collapsing 9 links into primary + dropdown structure and polish responsive behavior.
- **Acceptance criteria**
  1. At `1280px` wide viewport the navbar shows all primary items + CTA on a single line with no wrapping.
  2. All 9 original destinations are reachable either directly or via a dropdown/accordion.
  3. Mobile menu opens/closes with the hamburger; dropdown groups expand in accordion style.
  4. Logo uses the new path; no auth components are imported.
- **Test coverage**: manual responsive check (mobile, tablet, desktop); keyboard/focus sanity check.

### Chunk 3 — Candidate profile polish
- **Complexity**: complex
- **Files changed**
  - `app/components/public/CandidateProfile.jsx` (primary)
  - `app/components/public/PublicFooter.jsx` (only if footer accent colors need to match the new palette; otherwise unchanged)
- **Goal**: Reshape the profile page around the blueprint-seal dossier concept, applying the new palette, typography, and signature element.
- **Acceptance criteria**
  1. Hero displays the candidate photo inside a circular "seal" frame on a dark IEB Green background with a faint diagonal grid.
  2. Section sequence is easy to scan on desktop via a sticky side-rail jump menu; on mobile it collapses to a top anchor bar or accordion.
  3. Palette and typography match the plan (serif display, sans body, mono labels) across all sections.
  4. Page remains fully responsive down to 320px, keeps using `next/image`, and renders correctly for every candidate in `data/candidates.js`.
- **Test coverage**: manual visual regression on `/engr-salim-md-jane-alam`, `/engr-mohammed-arif-hasan-chowdhury`, `/engr-kamal-uddin-ahmed`, and `/engr-abdul-matin`.

## Verification strategy

1. Run the dev server and verify the navbar does not wrap at `1280px`.
2. Confirm new image paths load without 404s for logo and all candidate photos.
3. Inspect candidate profile at multiple widths; confirm seal, sticky rail, grid lists, and responsive collapse.
4. Run `npm run lint` (or the project's lint command) to catch unused imports or Tailwind class issues.

## Decision log

- **Dropdown nav vs mega-menu**: chose compact dropdowns because the audience is engineers expecting efficient navigation; mega-menu would add unnecessary weight.
- **Serif display**: deliberately chosen to avoid the common sans-only tech landing page; paired with mono labels to keep an engineering feel.
- **Blueprint seal as signature**: one bold, justifiable risk grounded in engineering drawings; avoids the default "big number + gradient card" template.
- **Palette**: IEB Green and AEB Rust echo the national flag but are desaturated enough to feel institutional rather than partisan.

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| The IEB logo file name contains a space (`ieb logo.jpeg`) causing Next.js/Image or build warnings. | medium | Ensure the public file is literally named `ieb logo.jpeg`; if builds fail, rename asset and update plan. |
| Long Bengali/English candidate names in the seal portrait cause overflow. | low | Test with the longest name; allow text wrap or truncate with CSS. |
| Sticky side rail pushes main content too narrow on small laptops. | low | Hide rail below `1280px`; use a top jump-bar instead. |
| Dropdown implementation with only existing shadcn components is clunky. | medium | Build a lightweight custom dropdown with `<Button>`/`<Card>` and document it; if NavigationMenu is already installed, prefer that. |
