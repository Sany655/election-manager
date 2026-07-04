# AEB Landing + Candidate Profile Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the AEB public landing page and dynamic candidate profile pages to use a logo-derived teal + gold/amber palette, creating a cohesive, professional election-of-engineers visual identity.

**Architecture:** All changes are presentational and localized to the public marketing components. Tailwind utility classes drive the new palette using standard Tailwind shades (`teal-700`, `amber-600`, `slate-900`, etc.) wherever possible. No data model, route, or API changes are required.

**Tech Stack:** Next.js 14 (App Router), React, Tailwind CSS, shadcn/ui components (Button, Badge, Card, Separator, Table), react-icons.

---

## File Structure

| File | Responsibility |
|------|----------------|
| `app/components/public/PublicNavbar.jsx` | Public site navbar: logo, nav links, mobile menu |
| `app/components/public/HeroSection.jsx` | Landing page hero: headline, CTAs, logo seal |
| `app/components/public/ElectionPanelSection.jsx` | Landing page candidate panel grid |
| `app/components/public/PublicFooter.jsx` | Public site footer |
| `app/components/public/CandidateProfile.jsx` | Dynamic candidate profile page |

---

## Color Mapping (Tailwind-first)

| Design Token | Tailwind Class | Hex |
|--------------|----------------|-----|
| Primary teal | `teal-700` | `#0F766E` |
| Primary dark | `teal-900` | `#134E4A` |
| Primary light | `teal-100` | `#CCFBF1` |
| Primary pale | `teal-50` | `#F0FDFA` |
| Accent gold | `amber-600` | `#D97706` |
| Accent pale | `amber-100` | `#FEF3C7` |
| Ink | `slate-900` | `#0F172A` |
| Slate | `slate-700` | `#334155` |
| Steel | `slate-500` | `#64748B` |
| Canvas | `slate-50` | `#F8FAFC` |
| Cloud | `slate-100` | `#F1F5F9` |

Use arbitrary hex values only when a precise brand color is required and no Tailwind shade matches. Prefer Tailwind classes for maintainability.

---

## Task 1: Update PublicNavbar colors and import style

**Files:**
- Modify: `app/components/public/PublicNavbar.jsx`

- [ ] **Step 1: Change logo import to `images/ieb logo.jpeg` alias**

Replace:
```jsx
import logo from "images/ieb logo.jpeg"
```
with:
```jsx
import logo from "images/ieb logo.jpeg";
```
(Ensure semicolon for consistency; no functional change.)

- [ ] **Step 2: Update navbar background and link colors**

Change the top-level `<header>` from any existing dark/slate styling to:
- Background: `bg-white`
- Border bottom: `border-b border-slate-200`
- Logo text: `text-slate-900`
- Nav links: `text-slate-700 hover:text-teal-700`
- Active/current link: `text-teal-700`
- CTA button (if any): `bg-teal-700 text-white hover:bg-teal-800`
- Mobile menu button: `text-slate-700 hover:text-teal-700`
- Mobile menu panel: `bg-white border-l border-slate-200`
- Mobile accordion trigger: `text-slate-700 hover:text-teal-700`
- Dropdown menus: `bg-white border border-slate-200 shadow-lg`

- [ ] **Step 3: Verify visually**

Run dev server and check the navbar renders white with teal hover states.

---

## Task 2: Update HeroSection to teal palette

**Files:**
- Modify: `app/components/public/HeroSection.jsx`

- [ ] **Step 1: Update gradient background**

Replace:
```jsx
className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 text-white"
```
with:
```jsx
className="relative overflow-hidden bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900 text-white"
```

- [ ] **Step 2: Update eyebrow badge**

Replace the eyebrow span classes:
```jsx
className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-100 ring-1 ring-inset ring-white/20"
```
with:
```jsx
className="inline-flex items-center rounded-full bg-teal-100/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-teal-50 ring-1 ring-inset ring-white/20"
```

- [ ] **Step 3: Update CTA buttons**

Primary button (`bg-white text-blue-900 hover:bg-blue-50`):
```jsx
className="bg-white text-teal-900 hover:bg-teal-50"
```

Secondary outline buttons (`border-white/40 ... text-white hover:bg-white/10 hover:text-white`):
```jsx
className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
```
(Keep existing transparent style; it already works.)

- [ ] **Step 4: Refine logo seal ring**

On the circular logo container, add or update:
```jsx
className="... ring-4 ring-teal-200/30"
```

- [ ] **Step 5: Build and verify**

Run `npm run build` and confirm no errors. Start dev server and visually inspect the hero.

---

## Task 3: Redesign ElectionPanelSection candidate cards

**Files:**
- Modify: `app/components/public/ElectionPanelSection.jsx`

- [ ] **Step 1: Add a section eyebrow above the heading**

Insert before the `<h2>`:
```jsx
<p className="mb-3 font-mono text-xs font-semibold uppercase tracking-widest text-teal-700">
  AEB Election Panel
</p>
```

- [ ] **Step 2: Update section heading and subtext colors**

Heading: `text-slate-900`
Subtext: `text-slate-600`

- [ ] **Step 3: Redesign candidate cards**

For the card container:
```jsx
<Card className="group overflow-hidden border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
```

For the portrait area:
```jsx
<div className="relative flex h-48 items-center justify-center bg-gradient-to-br from-teal-50 to-slate-100">
```

For the portrait image:
```jsx
<Image
  src={candidate.photo}
  alt={candidate.name}
  width={144}
  height={144}
  className="h-36 w-36 rounded-full object-contain ring-4 ring-white shadow-lg transition-transform duration-300 group-hover:scale-105"
/>
```

For the AEB badge:
```jsx
<Badge className="absolute right-3 top-3 bg-amber-600 text-white hover:bg-amber-600">
  AEB
</Badge>
```

For the position label:
```jsx
<p className="text-xs font-semibold uppercase tracking-wider text-amber-600">
  {candidate.position}
</p>
```

For the name:
```jsx
<h3 className="mt-1 text-lg font-bold leading-tight text-slate-900">
  {candidate.name}
</h3>
```

For the designation icon:
```jsx
<FaUserTie className="mt-1 shrink-0 text-slate-400" />
```

For the "View Profile" link:
```jsx
<Link
  href={`/${candidate.slug}`}
  className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 transition-colors hover:text-teal-900"
>
  View Profile <FaArrowRight className="text-xs transition-transform group-hover:translate-x-1" />
</Link>
```

- [ ] **Step 4: Build and verify**

Run `npm run build` and visually inspect the candidate panel at `/`.

---

## Task 4: Update PublicFooter to dark teal palette

**Files:**
- Modify: `app/components/public/PublicFooter.jsx`

- [ ] **Step 1: Change footer background**

Replace:
```jsx
className="border-t border-slate-200 bg-slate-900 text-slate-200"
```
with:
```jsx
className="border-t border-teal-800 bg-teal-900 text-slate-200"
```

- [ ] **Step 2: Update heading and link colors**

Section headings: `text-white`
Body text: `text-slate-300`
Quick links: `text-slate-300 hover:text-amber-400`
Contact icons: `text-amber-400`
Social icon circles: `bg-teal-800 text-slate-200 hover:bg-amber-600 hover:text-white`
Bottom separator: `bg-teal-800`
Copyright text: keep `text-slate-400`

- [ ] **Step 3: Build and verify**

Run `npm run build` and scroll to the footer.

---

## Task 5: Update CandidateProfile from green to teal + amber

**Files:**
- Modify: `app/components/public/CandidateProfile.jsx`

- [ ] **Step 1: Update hero background color**

In `HeroSection`, replace:
```jsx
className="relative overflow-hidden bg-[#006747] text-[#F8FAFC]"
```
with:
```jsx
className="relative overflow-hidden bg-teal-700 text-slate-50"
```

- [ ] **Step 2: Update blueprint grid overlay opacity**

Reduce opacity from `opacity-[0.18]` to `opacity-[0.10]`:
```jsx
className="pointer-events-none absolute inset-0 opacity-[0.10]"
```

- [ ] **Step 3: Update radial highlight**

Change rust highlight to amber:
```jsx
className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(217,119,6,0.18),transparent_55%)]"
```

- [ ] **Step 4: Update badge colors**

Panel badge:
```jsx
className="border border-white/25 bg-white/10 font-mono text-[10px] uppercase tracking-widest text-white hover:bg-white/10"
```
(Position badge remains teal-700 on amber.)

Position badge:
```jsx
className="bg-amber-600 font-mono text-[10px] uppercase tracking-widest text-white hover:bg-amber-600"
```

- [ ] **Step 5: Update seal tick colors**

In `BlueprintSeal`:
- Outer dashed circle: keep `rgba(248,250,252,0.55)`
- Inner hairline: keep `rgba(248,250,252,0.45)`
- Major ticks: change `rgba(200,65,39,1)` to `rgba(217,119,6,1)` (amber)
- Minor ticks: keep `rgba(248,250,252,0.75)`
- Cardinal crosshairs: change to amber

- [ ] **Step 6: Update Section component colors**

For `tone="light"`: keep `bg-slate-50 text-slate-900`
For `tone="muted"`: keep `bg-slate-100 text-slate-900`
For `tone="dark"`: change to `bg-teal-900 text-slate-50`

Icon container on light bands:
```jsx
className="bg-slate-100 text-teal-700"
```

Icon container on dark bands:
```jsx
className="bg-white/10 text-amber-500"
```

Eyebrow on light bands:
```jsx
className="font-mono text-[11px] uppercase tracking-widest text-slate-500"
```

Eyebrow on dark bands:
```jsx
className="font-mono text-[11px] uppercase tracking-widest text-amber-500"
```

Headings on light bands: `text-slate-900`
Headings on dark bands: `text-white`

Separator on light bands: `bg-slate-500/30`
Separator on dark bands: `bg-white/15`

- [ ] **Step 7: Update ListBlock icon color**

Replace rust with amber:
```jsx
<Icon className="mt-[3px] shrink-0 text-base text-amber-600" />
```

- [ ] **Step 8: Update SideRail colors**

Container label: `text-slate-500`
Links: `text-slate-500 hover:border-teal-700 hover:text-teal-700`

- [ ] **Step 9: Update MobileJumpBar colors**

Container: `bg-slate-50/95`
Pills:
```jsx
className="shrink-0 rounded-full border border-slate-400/30 bg-white px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-slate-700 transition-colors hover:border-teal-700 hover:bg-teal-700 hover:text-white"
```

- [ ] **Step 10: Update ContactItem colors**

Icon circle:
```jsx
className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-teal-700"
```

Label: `text-slate-500`
Value: `text-slate-900`

- [ ] **Step 11: Update blockquote accents**

In the "Welcome" blockquote, change rust quote icon to amber:
```jsx
<FaQuoteLeft className="text-2xl text-amber-500" />
```

In the "Vision" blockquote:
```jsx
<FaQuoteLeft className="text-2xl text-amber-500" />
```

In the "Leadership Philosophy" blockquote:
```jsx
<FaQuoteLeft className="text-2xl text-amber-600" />
```

- [ ] **Step 12: Update slogan pull-quote**

Change slogan text from green to teal:
```jsx
className="... text-teal-700"
```

Quote icon:
```jsx
<FaQuoteLeft className="mx-auto text-3xl text-amber-600" />
```

- [ ] **Step 13: Update table header colors**

In both the Candidate Information and Education tables:
```jsx
className="... text-teal-700"
```

- [ ] **Step 14: Update back navigation buttons**

Outline back button:
```jsx
className="border-teal-700 text-teal-700 hover:bg-teal-700 hover:text-white"
```

Solid home button:
```jsx
className="bg-amber-600 text-white hover:bg-amber-700"
```

- [ ] **Step 15: Build and verify**

Run `npm run build` and visually inspect a candidate profile page (e.g., `/engr-salim-md-jane-alam`).

---

## Task 6: Final build, verification, and responsive check

**Files:**
- All modified files above

- [ ] **Step 1: Run production build**

```bash
npm run build
```
Expected: Build completes with no errors.

- [ ] **Step 2: Run linter**

```bash
npm run lint
```
Expected: No new lint errors.

- [ ] **Step 3: Verify responsive behavior**

Open the dev server and check at:
- Mobile (375px): navbar mobile menu, hero stacking, single-column cards, profile jump bar
- Tablet (768px): 2-column candidate grid
- Desktop (1024px+): 4-column candidate grid, candidate profile side-rail visible

- [ ] **Step 4: Verify color consistency**

Spot-check that no green (`#006747`, `green-`, `emerald-`) or rust (`#C84127`) references remain in the modified public components.

---

## Spec Coverage Check

| Spec Requirement | Implementing Task |
|------------------|-------------------|
| Teal primary from logo | Tasks 2, 5 |
| Gold/amber accent | Tasks 2, 3, 4, 5 |
| Landing page hero teal instead of navy | Task 2 |
| Candidate profile green → teal | Task 5 |
| Rust accent → amber | Tasks 3, 5 |
| Professional candidate cards | Task 3 |
| Cohesive footer | Task 4 |
| Responsive + accessible | Tasks 1–6 |

---

## Placeholder Scan

No TBD, TODO, or vague steps. Every task includes exact file paths, class names, and verification commands.
