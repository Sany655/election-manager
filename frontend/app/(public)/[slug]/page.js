// Dynamic candidate profile page (served at `/<slug>`).
//
// Resolves a candidate by slug from `data/candidates.js` and renders
// the `CandidateProfile` component. Unknown slugs trigger `notFound()`
// from `next/navigation`, which routes to the existing `app/not-found.js`.
//
// This page lives inside the `(public)` route group, so it inherits
// the public layout (navbar + footer) and is intentionally not gated
// by any auth context.

import { notFound } from "next/navigation";
import CandidateProfile from "../../components/public/CandidateProfile";
import { getAllSlugs, getCandidateBySlug } from "@/data/candidates";

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const candidate = getCandidateBySlug(params.slug);
  if (!candidate) {
    return { title: "Candidate Not Found" };
  }
  return {
    title: `${candidate.name} - ${candidate.position} | AEB`,
    description: candidate.welcomeMessage || candidate.about || candidate.slogan,
  };
}

export default function CandidateProfilePage({ params }) {
  const candidate = getCandidateBySlug(params.slug);

  if (!candidate) {
    notFound();
  }

  return <CandidateProfile candidate={candidate} />;
}
