# Code Review: Public Landing Page & Candidate Profile Pages

## Verdict: NEEDS_FIXES

The public landing page and candidate profile pages build successfully and the route mapping is correct. However, there are correctness and maintenance issues that must be addressed before approval.

## Issues

### 1. Missing public image assets cause broken images at runtime

- **File path**: `public/` (does not exist)
- **Referenced in**:
  - `app/components/public/HeroSection.jsx` line 58: `src="/images/aeb_logo.png"`
  - `app/components/public/PublicNavbar.jsx` line 38: `src="/images/aeb_logo.png"`
  - `app/components/public/PublicFooter.jsx` line 19: `src="/images/aeb_logo.png"`
  - `app/components/public/ElectionPanelSection.jsx` lines 13-34: all candidate photos point to `src="/images/aeb_logo.png"`
  - `data/candidates.js` lines 9, 118, 186, 251: `photo: "/images/candidates/..."` and fallback `/images/no-image.png`
- **Description**: The repository has no `public/images/` directory. Every `<Image>` component and candidate `photo` field references files that do not exist, so all logos, candidate cards, and profile hero images will be broken at runtime. The build succeeds because Next.js does not validate static image paths at build time when they are string URLs.
- **Suggested fix**: Add the required image assets under `public/images/` (e.g. `public/images/aeb_logo.png`, `public/images/no-image.png`, and `public/images/candidates/*.png`) or switch to remote URLs with appropriate `next.config.mjs` `images.remotePatterns` entries.

### 2. Election panel section duplicates candidate data instead of using the source of truth

- **File path**: `app/components/public/ElectionPanelSection.jsx` lines 8-34
- **Description**: The component defines its own hard-coded `CANDIDATES` array rather than importing from `data/candidates.js`. This creates two sources of truth and produces inconsistencies:
  - `data/candidates.js` lists Engr. Kamal Uddin Ahmed as `position: "Honorary Secretary"`, but the panel card labels him `"Chairman"` (line 20).
  - All four panel cards use `photo: "/images/aeb_logo.png"` while the data file points to distinct candidate photos.
  - The panel data will drift whenever a candidate is edited in `data/candidates.js`.
- **Suggested fix**: Import `candidates` from `data/candidates.js` and map over it to render the cards, using each candidate's `slug`, `name`, `position`, `designation`, and `photo`.

### 3. `npx next lint` cannot run due to unconfigured ESLint and dependency conflict

- **File path**: project root (no `.eslintrc.json` / `eslint.config.*` exists)
- **Description**: Running `npx next lint` prompts for ESLint setup. When invoked with `npx next lint --strict`, Next.js attempts to install `eslint@^8` and `eslint-config-next`, but npm fails with a peer-dependency conflict because the resolver picks `eslint-config-next@16.2.10` which requires `eslint>=9.0.0`. Therefore linting cannot be executed in this workspace.
- **Suggested fix**: Install a Next.js 14-compatible config, e.g.
  ```bash
  npm install -D eslint@^8 eslint-config-next@14.2.35
  ```
  then create `.eslintrc.json`:
  ```json
  { "extends": "next/core-web-vitals" }
  ```
  and re-run `npx next lint`.

### 4. Unused imports in `CandidateProfile.jsx`

- **File path**: `app/components/public/CandidateProfile.jsx` line 14
- **Description**: `CardHeader` and `CardTitle` are imported from `@/components/ui/card` but are never used. This will produce an ESLint warning once linting is configured.
- **Suggested fix**: Remove the unused imports:
  ```js
  import { Card, CardContent } from "@/components/ui/card";
  ```

### 5. Public 404 page renders the dashboard layout

- **File path**: `app/not-found.js` lines 12, 14
- **Description**: `not-found.js` wraps the error UI in `<DefaultLayout>`, which renders the authenticated-app sidebar/header. When an unknown candidate slug triggers `notFound()` from the public `(public)` route group, users will see the dashboard chrome instead of the public navbar/footer.
- **Suggested fix**: Either create `app/(public)/not-found.js` that uses `PublicNavbar`/`PublicFooter`, or make the root `app/not-found.js` layout-agnostic so it does not inherit the dashboard UI for public routes.

### 6. Candidate roster does not match the full design-spec table

- **File path**: `data/candidates.js` lines 1-277
- **Description**: The design spec lists positions for two Presidents, two Vice Presidents, one Honorary Secretary, three Central Council Members, an ERC President, an ERC Secretary, and two Council Members. The data file only contains four candidates. The plan spec accepts "at least" the documented profiles, so this is a content completeness gap rather than a hard failure.
- **Suggested fix**: Add the remaining candidate profiles from the design spec with placeholder values where data is pending, and ensure each slug remains unique and URL-safe.

## What Was Verified

- `app/page.js` was deleted and `app/(public)/page.js` now owns `/`.
- `/dashboard` resolves to `app/(main)/dashboard/page.js`, which still imports `DefaultLayout`/`ProtectedRoute`/`useAuthContext`.
- `app/(public)/layout.js` does not import `DefaultLayout`, `ProtectedRoute`, `Sidebar`, `Header`, or auth context.
- `data/candidates.js` is valid JavaScript, exports `candidates`, `getCandidateBySlug`, and `getAllSlugs`, and contains only URL-safe unique slugs.
- `app/(public)/[slug]/page.js` uses `generateStaticParams` and `notFound()` fallback; build output confirmed static generation for all four slugs:
  - `/engr-salim-md-jane-alam`
  - `/engr-mohammed-arif-hasan-chowdhury`
  - `/engr-kamal-uddin-ahmed`
  - `/engr-abdul-matin`
- `npx next build --no-lint` completed successfully (110 static/dynamic pages generated).
- Section order on the landing page matches the plan spec: Hero, About IEB Election, About AEB, Meet Our Election Panel, Manifesto, Why Vote, President's Message, News, Gallery, Contact.

## Commands Run

```bash
npx next lint                 # failed - ESLint not configured / peer-dependency conflict
npx next lint --strict        # failed - ERESOLVE peer dependency eslint>=9.0.0
npx next build --no-lint      # succeeded
```

## Notes

- Contact details and social links in `PublicFooter.jsx` and `ContactSection.jsx` use placeholder values (e.g. `+880 0000 000 000`, `contact@aeb-election.org`, `#`). These are consistent with the design spec's "To be added" placeholders and are not flagged as bugs.
- Accessibility basics are in place: images have `alt` text, the mobile nav toggle has `aria-label`/`aria-expanded`, and the map iframe has a `title`.
