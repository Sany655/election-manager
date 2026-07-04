import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FaUsers, FaEye, FaFileAlt } from "react-icons/fa";
import logo from 'images/ieb logo.jpeg'


export default function HeroSection() {
  return (
    <section
      id="home"
      className="relative overflow-hidden bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900 text-white"
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_55%)]"
      />
      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:py-24 lg:px-8">
        <div>
          <span className="inline-flex items-center rounded-full bg-teal-100/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-teal-50 ring-1 ring-inset ring-white/20">
            IEB Election 2026
          </span>
          <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            Association of Engineers Bangladesh (AEB)
          </h1>
          <p className="mt-3 text-lg font-medium text-teal-50 sm:text-xl">
            United for Professional Excellence, Innovation and Stronger
            Engineering Leadership
          </p>
          <p className="mt-4 max-w-xl text-sm text-teal-50/90 sm:text-base">
            Vote for experienced, visionary and dedicated engineering
            professionals committed to building a stronger, transparent and
            member-focused IEB.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button
              asChild
              size="lg"
              className="bg-white text-teal-900 hover:bg-teal-50"
            >
              <Link href="#panel">
                <FaUsers />
                Meet Our Candidates
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
            >
              <Link href="#manifesto">
                <FaEye />
                Our Vision
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
            >
              <Link href="#manifesto">
                <FaFileAlt />
                Election Manifesto
              </Link>
            </Button>
          </div>
        </div>

        <div className="flex justify-center lg:justify-end">
          <div className="relative">
            <div className="absolute inset-0 -z-0 rounded-full bg-white/10 blur-3xl" />
            <div className="relative z-10 flex h-56 w-56 items-center justify-center rounded-full bg-white/95 p-6 shadow-2xl ring-4 ring-teal-200/30 sm:h-72 sm:w-72 overflow-hidden">
              <Image
                src= {logo}
                alt="IEB Logo"
                width={240}
                height={120}
                className="h-full w-full object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
