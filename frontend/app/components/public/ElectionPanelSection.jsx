import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FaArrowRight, FaUserTie } from "react-icons/fa";
import arif from "images/candidates/arif.jpg"
import salim from "images/candidates/salim.png"
import kamal from "images/candidates/kamal.png"
import noImage from "images/no-image.png";


const CANDIDATES = [
  {
    slug: "engr-salim-md-jane-alam",
    name: "Engr. Salim Md. Jane Alam",
    position: "President",
    designation: "Managing Director, Chattogram WASA",
    photo: salim,
  },
  {
    slug: "engr-kamal-uddin-ahmed",
    name: "Engr. Kamal Uddin Ahmed",
    position: "Honorary Secretary",
    designation: "Chief Engineer, PDB, Chittagong",
    photo: kamal,
  },
  {
    slug: "engr-abdul-matin",
    name: "Engr. Abdul Matin",
    position: "Honorary Secretary",
    designation: "Honorary Secretary Candidate",
    photo: noImage,
  },
  {
    slug: "engr-mohammed-arif-hasan-chowdhury",
    name: "Engr. Mohammed Arif Hasan Chowdhury",
    position: "Central Council Member",
    designation:
      "Assistant Professor, CSE, University of Science & Technology Chattogram (USTC)",
    photo: arif,
  },
];

export default function ElectionPanelSection() {
  return (
    <section id="panel" className="bg-white py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-3 font-mono text-xs font-semibold uppercase tracking-widest text-teal-700">
            AEB Election Panel
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Meet Our Election Panel
          </h2>
          <p className="mt-3 text-base text-slate-600 sm:text-lg">
            Experienced, visionary engineers committed to a stronger IEB.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {CANDIDATES.map((candidate) => (
            <Card
              key={candidate.slug}
              className="group flex h-full flex-col overflow-hidden border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative flex h-48 shrink-0 items-center justify-center bg-gradient-to-br from-teal-50 to-slate-100">
                <Image
                  src={candidate.photo}
                  alt={candidate.name}
                  width={160}
                  height={160}
                  className="h-36 w-36 rounded-full object-contain ring-4 ring-white shadow-lg transition-transform duration-300 group-hover:scale-105"
                />
                <Badge
                  variant="default"
                  className="absolute right-3 top-3 bg-amber-600 text-white shadow-sm hover:bg-amber-600"
                >
                  AEB
                </Badge>
              </div>
              <CardContent className="flex flex-1 flex-col gap-3 p-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">
                    {candidate.position}
                  </p>
                  <h3 className="mt-1 text-lg font-bold leading-tight text-slate-900">
                    {candidate.name}
                  </h3>
                </div>
                <div className="flex flex-1 items-start gap-2 text-sm text-slate-600">
                  <FaUserTie className="mt-1 shrink-0 text-slate-400" />
                  <span>{candidate.designation}</span>
                </div>
                <Link
                  href={`/${candidate.slug}`}
                  className="mt-auto inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-teal-700 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:bg-amber-600 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2 active:scale-95"
                >
                  View Profile
                  <FaArrowRight className="text-xs transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
