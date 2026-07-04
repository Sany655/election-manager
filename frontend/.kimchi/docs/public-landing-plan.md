# Public Landing Page & Candidate Profile Plan

## 1. Route Mapping

| URL | File Path | Notes |
|-----|-----------|-------|
| `/` | `app/(public)/page.js` | New public landing page |
| `/[candidate-name]` | `app/(public)/[slug]/page.js` | Dynamic candidate profile |
| `/dashboard` | `app/(main)/dashboard/page.js` | Moved from `/` |

## 2. Created Files

| File | Purpose |
|------|---------|
| `app/(public)/layout.js` | Public layout shell with navbar and footer; no sidebar, no auth guards |
| `app/(public)/page.js` | Landing page rendering all design-spec sections |
| `app/(public)/[slug]/page.js` | Dynamic candidate profile page driven by `generateStaticParams` |
| `data/candidates.js` | Single source of truth for all candidate data and slugs |
| `app/components/public/PublicNavbar.jsx` | Responsive public navigation bar |
| `app/components/public/PublicFooter.jsx` | Public footer with contact info and social links |
| `app/components/public/HeroSection.jsx` | Banner, headline, subheadline, and CTA buttons |
| `app/components/public/AboutElectionSection.jsx` | About the IEB Election content |
| `app/components/public/AboutAebSection.jsx` | About AEB panel content |
| `app/components/public/ElectionPanelSection.jsx` | Candidate cards grid with links to profiles |
| `app/components/public/ManifestoSection.jsx` | Manifesto highlights |
| `app/components/public/WhyVoteSection.jsx` | Why vote for AEB bullet list |
| `app/components/public/PresidentMessageSection.jsx` | President's message block |
| `app/components/public/NewsSection.jsx` | Latest news and campaign activities |
| `app/components/public/GallerySection.jsx` | Campaign photo gallery |
| `app/components/public/ContactSection.jsx` | Contact details and map placeholder |
| `app/components/public/CandidateProfile.jsx` | Reusable candidate detail view |

## 3. Modified Files

| File | Change |
|------|--------|
| `app/page.js` | Remove/replace dashboard content; the `(public)` route group now owns `/` |
| `app/(main)/dashboard/page.js` | Receives the existing dashboard content moved from `app/page.js` |
| `next.config.mjs` | Update only if static export or image host rules are required (likely no change) |

## 4. Candidate Data Schema

Each candidate object exported from `data/candidates.js` follows this schema:

| Field | Type | Example |
|-------|------|---------|
| `id` | string | `"arif-chowdhury"` |
| `slug` | string | `"engr-mohammed-arif-hasan-chowdhury"` |
| `name` | string | `"Engr. Mohammed Arif Hasan Chowdhury"` |
| `position` | string | `"Central Council Member"` |
| `photo` | string | `"/images/candidates/arif.png"` |
| `membershipNo` | string | `"FIEB 14653"` |
| `designation` | string | `"Assistant Professor, CSE, USTC"` |
| `panel` | string | `"Association of Engineers Bangladesh (AEB)"` |
| `slogan` | string | `"Knowledge • Leadership • Service"` |
| `welcomeMessage` | string | `"The strength of IEB lies in its members..."` |
| `about` | string | `"Engr. Mohammed Arif Hasan Chowdhury is an accomplished engineer..."` |
| `candidateInfo` | object | `{ name, membershipNo, electionPosition, profession, discipline, panel }` |
| `education` | array of objects | `[{ degree, institution, year? }]` |
| `professionalProfile` | string | `"Engr. Arif has developed an interdisciplinary career..."` |
| `leadership` | array of strings | `["Council Member: IEB Chittagong Division (25-26)", ...]` |
| `communityEngagement` | array of strings | `["Educational development initiatives", ...]` |
| `vision` | string | `"To build an Institution of Engineers, Bangladesh that embraces innovation..."` |
| `mission` | array of strings | `["Strengthen member participation...", ...]` |
| `commitments` | array of strings | `["Transparent and accountable leadership", ...]` |
| `whyVote` | array of strings | `["Academic excellence", "Engineering expertise", ...]` |
| `leadershipPhilosophy` | string | `"Leadership is not measured by position..."` |
| `messageToEngineers` | string | `"Dear Fellow Engineers, our profession continues to evolve..."` |
| `contact` | object | `{ phone, email, website, facebook, linkedIn }` |
| `gallery` | array of strings | `["/images/gallery/arif-1.jpg", ...]` |

## 5. Chunking Plan

### Chunk 1 — Scaffold Public Layout & Routes
- **Files**: `app/(public)/layout.js`, `app/(public)/page.js`, `app/(main)/dashboard/page.js`, `app/page.js`
- **Complexity**: simple
- **Acceptance Criteria**:
  1. `/` renders the public landing page and `/dashboard` renders the moved dashboard without errors.
  2. `app/page.js` no longer duplicates the dashboard; the `(public)` route group owns `/`.
  3. Public layout renders a navbar and footer and excludes `DefaultLayout`, `Sidebar`, `Header`, and `ProtectedRoute`.

### Chunk 2 — Build Landing Page Sections
- **Files**: `app/components/public/PublicNavbar.jsx`, `app/components/public/PublicFooter.jsx`, `app/components/public/HeroSection.jsx`, `app/components/public/AboutElectionSection.jsx`, `app/components/public/AboutAebSection.jsx`, `app/components/public/ElectionPanelSection.jsx`, `app/components/public/ManifestoSection.jsx`, `app/components/public/WhyVoteSection.jsx`, `app/components/public/PresidentMessageSection.jsx`, `app/components/public/NewsSection.jsx`, `app/components/public/GallerySection.jsx`, `app/components/public/ContactSection.jsx`
- **Complexity**: simple
- **Acceptance Criteria**:
  1. All sections from the design spec appear on `/` in the order: Hero, About IEB Election, About AEB, Meet Our Election Panel, Manifesto, Why Vote, President's Message, News, Gallery, Contact.
  2. Each panel candidate card links to `/<slug>` and displays photo, name, position, and short designation.
  3. Sections are responsive on mobile and use existing shadcn components (`card`, `badge`, `button`, `separator`, `tabs`) where appropriate.

### Chunk 3 — Candidate Data File
- **Files**: `data/candidates.js`
- **Complexity**: simple
- **Acceptance Criteria**:
  1. File exports a single `candidates` array containing at least the profiles from the design spec (President, Honorary Secretary, Central Council Member).
  2. Every object contains all fields listed in the schema, with empty arrays or `""` placeholders where data is not yet available.
  3. Each `slug` is URL-safe and unique.

### Chunk 4 — Candidate Profile Page
- **Files**: `app/(public)/[slug]/page.js`, `app/components/public/CandidateProfile.jsx`
- **Complexity**: complex
- **Acceptance Criteria**:
  1. `generateStaticParams` returns params for every `slug` in `data/candidates.js`.
  2. Visiting `/<slug>` renders the matching candidate profile with all sections: hero banner, candidate info table, education, professional profile, leadership, community engagement, vision, mission, commitments, why vote, leadership philosophy, message to engineers, contact, and gallery.
  3. Unknown slugs render the existing `not-found.js` page.

### Chunk 5 — Final Route Validation
- **Files**: `next.config.mjs` (if needed)
- **Complexity**: simple
- **Acceptance Criteria**:
  1. `next.config.mjs` is inspected and updated only if image domains or export settings require it; otherwise left unchanged.
  2. No conflicting route definitions remain between `app/page.js` and `app/(public)/page.js`.
  3. Both internal dashboard links and public candidate profile links resolve to the correct URLs.
