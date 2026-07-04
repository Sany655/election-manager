// Full candidate profile view used by the dynamic route at `/<slug>`.
//
// Renders every section from the IEB AEB Election Website design spec,
// styled as an "engineering dossier" with the new palette:
//   IEB Green teal-700, AEB Rust amber-600, Slate Ink #1E293B,
//   Blueprint Steel #64748B, Concrete #F1F5F9, Cool White #F8FAFC.
//
// Typography:
//   display/headlines -> font-serif
//   body              -> font-sans
//   labels/eyebrows   -> font-mono (uppercase, tracking-wider)
//
// Signature element: a circular portrait framed by a dashed/segmented
// engineering "seal" ring on a faint diagonal blueprint grid (hero only).
//
// Receives a single `candidate` prop matching the schema exported by
// `data/candidates.js`.

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FaQuoteLeft,
  FaUserTie,
  FaGraduationCap,
  FaBriefcase,
  FaUsers,
  FaHandsHelping,
  FaEye,
  FaBullseye,
  FaCheckCircle,
  FaVoteYea,
  FaLightbulb,
  FaEnvelope,
  FaPhone,
  FaGlobe,
  FaFacebook,
  FaLinkedin,
  FaImages,
  FaArrowLeft,
  FaHome,
  FaIdBadge,
} from "react-icons/fa";
import NO_IMAGE from "images/no-image.png";

// Side-rail jump links. Order matches the rendered section sequence.
const SECTION_NAV = [
  { id: "welcome", label: "Welcome", icon: FaQuoteLeft },
  { id: "about", label: "About", icon: FaUserTie },
  { id: "info", label: "Profile", icon: FaIdBadge },
  { id: "education", label: "Education", icon: FaGraduationCap },
  { id: "professional", label: "Career", icon: FaBriefcase },
  { id: "leadership", label: "Leadership", icon: FaUsers },
  { id: "community", label: "Community", icon: FaHandsHelping },
  { id: "vision", label: "Vision", icon: FaEye },
  { id: "mission", label: "Mission", icon: FaBullseye },
  { id: "commitments", label: "Commitments", icon: FaCheckCircle },
  { id: "why-vote", label: "Why Vote", icon: FaVoteYea },
  { id: "philosophy", label: "Philosophy", icon: FaLightbulb },
  { id: "message", label: "Message", icon: FaEnvelope },
  { id: "slogan", label: "Slogan", icon: FaQuoteLeft },
  { id: "contact", label: "Contact", icon: FaEnvelope },
  { id: "gallery", label: "Gallery", icon: FaImages },
];

/**
 * The signature "Blueprint Seal": circular portrait inside a dashed /
 * segmented engineering ring, evoking a stamp on a technical drawing.
 */
function BlueprintSeal({ src, alt }) {
  // 24 tick marks around the ring; every 6th is rendered as a major mark.
  const ticks = Array.from({ length: 24 }, (_, i) => i);
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[260px] sm:max-w-[280px]">
      <svg
        viewBox="0 0 200 200"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        {/* Outer dashed circle */}
        <circle
          cx="100"
          cy="100"
          r="97"
          fill="none"
          stroke="rgba(248,250,252,0.55)"
          strokeWidth="0.8"
          strokeDasharray="3 3"
        />
        {/* Inner hairline circle */}
        <circle
          cx="100"
          cy="100"
          r="86"
          fill="none"
          stroke="rgba(248,250,252,0.45)"
          strokeWidth="0.6"
        />
        {/* Tick marks every 15 degrees */}
        {ticks.map((i) => {
          const angle = (i * (360 / 24) * Math.PI) / 180;
          const isMajor = i % 6 === 0;
          const innerR = isMajor ? 80 : 84;
          const outerR = 90;
          const x1 = 100 + Math.cos(angle) * innerR;
          const y1 = 100 + Math.sin(angle) * innerR;
          const x2 = 100 + Math.cos(angle) * outerR;
          const y2 = 100 + Math.sin(angle) * outerR;
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={isMajor ? "rgba(217,119,6,1)" : "rgba(248,250,252,0.75)"}
              strokeWidth={isMajor ? 1.6 : 0.8}
              strokeLinecap="round"
            />
          );
        })}
        {/* Cardinal crosshair marks */}
        {[
          [0, -1],
          [0, 1],
          [-1, 0],
          [1, 0],
        ].map(([dx, dy], i) => (
          <line
            key={`card-${i}`}
            x1={100 + dx * 78}
            y1={100 + dy * 78}
            x2={100 + dx * 94}
            y2={100 + dy * 94}
            stroke="rgba(217,119,6,1)"
            strokeWidth="2"
            strokeLinecap="round"
          />
        ))}
      </svg>
      {/* Portrait inset */}
      <div className="absolute inset-[18%] overflow-hidden rounded-full ring-1 ring-white/40 shadow-2xl">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 640px) 60vw, (max-width: 1024px) 40vw, 280px"
          className="object-cover"
          priority
        />
      </div>
    </div>
  );
}

/**
 * Hero: IEB Green band with a faint diagonal blueprint-grid overlay
 * behind the seal, serif candidate name, mono membership number,
 * panel + position badges, and an italic serif slogan.
 */
function HeroSection({ candidate, photoSrc }) {
  return (
    <section className="relative overflow-hidden bg-teal-700 text-slate-50">
      {/* Diagonal blueprint grid overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.10]"
        style={{
          backgroundImage:
            "linear-gradient(45deg, rgba(248,250,252,0.5) 1px, transparent 1px), linear-gradient(-45deg, rgba(248,250,252,0.5) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      {/* Soft rust radial highlight */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(217,119,6,0.18),transparent_55%)]"
      />

      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 sm:py-14 lg:grid-cols-[280px_1fr] lg:items-center lg:gap-12 lg:px-8 lg:py-20">
        {/* Seal portrait */}
        <div className="flex justify-center lg:justify-start">
          <BlueprintSeal src={photoSrc} alt={candidate.name} />
        </div>

        {/* Candidate metadata */}
        <div className="text-center lg:text-left">
          <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-start">
            <Badge className="border border-white/25 bg-white/10 font-mono text-[10px] uppercase tracking-widest text-white hover:bg-white/10">
              {candidate.panel || "AEB"}
            </Badge>
            <Badge className="bg-amber-600 font-mono text-[10px] uppercase tracking-widest text-white hover:bg-amber-600">
              {candidate.position}
            </Badge>
          </div>

          <h1 className="mt-5 font-serif text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            {candidate.name}
          </h1>

          {candidate.designation ? (
            <p className="mt-3 flex items-center justify-center gap-2 font-sans text-base text-white/85 sm:text-lg lg:justify-start">
              <FaUserTie className="shrink-0 text-amber-600" />
              <span>{candidate.designation}</span>
            </p>
          ) : null}

          {candidate.membershipNo ? (
            <p className="mt-2 flex items-center justify-center gap-2 font-mono text-[11px] uppercase tracking-widest text-white/70 lg:justify-start">
              <FaIdBadge className="shrink-0" />
              <span>Membership No: {candidate.membershipNo}</span>
            </p>
          ) : null}

          {candidate.slogan ? (
            <p className="mt-6 border-t border-white/20 pt-5 font-serif text-lg italic text-white/95 sm:text-xl">
              &ldquo;{candidate.slogan}&rdquo;
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

/**
 * Section wrapper. `tone` controls background and text color:
 *   - "light"  Cool White canvas, Slate Ink text (default)
 *   - "muted"  Concrete band, Slate Ink text (alternating)
 *   - "dark"   IEB Green band, Cool White text (vision / message)
 */
function Section({
  id,
  icon: Icon,
  title,
  eyebrow,
  children,
  tone = "light",
  showSeparator = true,
}) {
  const isDark = tone === "dark";
  const bg = {
    light: "bg-slate-50 text-slate-900",
    muted: "bg-slate-100 text-slate-900",
    dark: "bg-teal-900 text-slate-50",
  }[tone];

  return (
    <section id={id} className={`${bg} py-14 sm:py-16 lg:py-20`}>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          {Icon ? (
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                isDark
                  ? "bg-white/10 text-amber-500"
                  : "bg-slate-100 text-teal-700"
              }`}
            >
              <Icon className="text-lg" />
            </span>
          ) : null}
          <div>
            {eyebrow ? (
              <p
                className={`font-mono text-[11px] uppercase tracking-widest ${
                  isDark ? "text-amber-500" : "text-slate-500"
                }`}
              >
                {eyebrow}
              </p>
            ) : null}
            <h2
              className={`mt-1 font-serif text-2xl font-bold tracking-tight sm:text-3xl ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              {title}
            </h2>
          </div>
        </div>
        {showSeparator ? (
          <Separator
            className={`my-6 ${
              isDark ? "bg-white/15" : "bg-slate-500/30"
            }`}
          />
        ) : null}
        {children}
      </div>
    </section>
  );
}

/**
 * Two-column grid of items, each prefixed by a small AEB Rust icon
 * (default: FaCheckCircle). No bordered cards, tight vertical rhythm.
 */
function ListBlock({ items, icon: Icon = FaCheckCircle }) {
  if (!items || items.length === 0) {
    return (
      <p className="text-sm italic text-slate-500">
        Information will be updated soon.
      </p>
    );
  }
  return (
    <ul className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
      {items.map((item, idx) => (
        <li
          key={`${item}-${idx}`}
          className="flex items-start gap-3 font-sans text-sm leading-relaxed text-slate-900 sm:text-base"
        >
          <Icon className="mt-[3px] shrink-0 text-base text-amber-600" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Sticky side rail of anchor links. Hidden below the `xl` breakpoint
 * (1280px) to avoid squeezing the main content on smaller laptops.
 */
function SideRail() {
  return (
    <nav
      aria-label="Profile sections"
      className="sticky top-24 hidden xl:block"
    >
      <p className="mb-4 font-mono text-[10px] uppercase tracking-widest text-slate-500">
        On this page
      </p>
      <ul className="space-y-1 border-l border-[#64748B]/25 pl-0">
        {SECTION_NAV.map(({ id, label }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              className="block border-l border-transparent py-1.5 pl-3 font-sans text-xs text-slate-500 transition-colors hover:border-teal-700 hover:text-teal-700"
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/**
 * Compact, horizontally-scrolling top jump-bar for screens below `xl`.
 * Sticks just below the public navbar (`top-16` = 64px).
 */
function MobileJumpBar() {
  return (
    <div className="sticky top-16 z-30 -mx-4 mb-8 overflow-x-auto bg-slate-50/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 xl:hidden">
      <div className="flex gap-2 whitespace-nowrap">
        {SECTION_NAV.map(({ id, label }) => (
          <a
            key={id}
            href={`#${id}`}
            className="shrink-0 rounded-full border border-slate-400/30 bg-white px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-slate-700 transition-colors hover:border-teal-700 hover:bg-teal-700 hover:text-white"
          >
            {label}
          </a>
        ))}
      </div>
    </div>
  );
}

function ContactItem({ icon: Icon, label, value, href, external }) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="flex items-start gap-3 rounded-lg border border-slate-500/20 bg-white p-4 transition-shadow hover:shadow-md"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-teal-700">
        <Icon />
      </span>
      <div className="min-w-0">
        <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
          {label}
        </p>
        <p className="mt-1 break-all text-sm font-medium text-slate-900">
          {value}
        </p>
      </div>
    </a>
  );
}

export default function CandidateProfile({ candidate }) {
  if (!candidate) return null;

  const photoSrc = candidate.photo || NO_IMAGE;
  const infoEntries = candidate.candidateInfo
    ? Object.entries(candidate.candidateInfo)
    : [];

  const hasContact =
    candidate.contact &&
    Object.values(candidate.contact).some(
      (v) => typeof v === "string" && v.trim() !== ""
    );

  const galleryItems =
    candidate.gallery && candidate.gallery.length > 0
      ? candidate.gallery
      : null;

  return (
    <article className="bg-slate-50 text-slate-900">
      <HeroSection candidate={candidate} photoSrc={photoSrc} />

      {/* Content container with optional sticky side rail at xl+ */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 xl:grid xl:grid-cols-[200px_1fr] xl:gap-10">
        <SideRail />

        <div className="min-w-0">
          <MobileJumpBar />

          {/* Welcome Message — dark band */}
          {candidate.welcomeMessage ? (
            <Section
              id="welcome"
              icon={FaQuoteLeft}
              eyebrow="Welcome"
              title="A Message from the Candidate"
              tone="dark"
            >
              <blockquote className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10 backdrop-blur sm:p-8">
                <FaQuoteLeft className="text-2xl text-amber-600" />
                <p className="mt-4 font-sans text-base leading-relaxed text-white/90 sm:text-lg">
                  {candidate.welcomeMessage}
                </p>
              </blockquote>
            </Section>
          ) : null}

          {/* About — light band */}
          {candidate.about ? (
            <Section
              id="about"
              icon={FaUserTie}
              eyebrow="About"
              title="About the Candidate"
              tone="light"
            >
              <p className="font-sans text-base leading-relaxed text-slate-900 sm:text-lg">
                {candidate.about}
              </p>
            </Section>
          ) : null}

          {/* Candidate Information Table — muted band */}
          {infoEntries.length > 0 ? (
            <Section
              id="info"
              icon={FaIdBadge}
              eyebrow="Profile"
              title="Candidate Information"
              tone="muted"
            >
              <Card className="border-slate-500/20 bg-white">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-slate-500/30 hover:bg-transparent">
                        <TableHead className="w-1/3 font-mono text-[11px] uppercase tracking-widest text-teal-700">
                          Field
                        </TableHead>
                        <TableHead className="font-mono text-[11px] uppercase tracking-widest text-teal-700">
                          Details
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {infoEntries.map(([key, value]) => (
                        <TableRow
                          key={key}
                          className="border-b border-slate-500/15 last:border-0"
                        >
                          <TableCell className="font-semibold capitalize text-slate-900">
                            {key.replace(/([A-Z])/g, " $1").trim()}
                          </TableCell>
                          <TableCell className="text-slate-900">
                            {value || (
                              <span className="italic text-slate-500">
                                Not provided
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </Section>
          ) : null}

          {/* Education — light band */}
          <Section
            id="education"
            icon={FaGraduationCap}
            eyebrow="Academic"
            title="Education"
            tone="light"
          >
            {candidate.education && candidate.education.length > 0 ? (
              <Card className="border-slate-500/20 bg-white">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-slate-500/30 hover:bg-transparent">
                        <TableHead className="font-mono text-[11px] uppercase tracking-widest text-teal-700">
                          Degree
                        </TableHead>
                        <TableHead className="font-mono text-[11px] uppercase tracking-widest text-teal-700">
                          Institution
                        </TableHead>
                        <TableHead className="w-32 font-mono text-[11px] uppercase tracking-widest text-teal-700">
                          Year
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {candidate.education.map((edu, idx) => (
                        <TableRow
                          key={`${edu.degree || "edu"}-${idx}`}
                          className="border-b border-slate-500/15 last:border-0"
                        >
                          <TableCell className="font-medium text-slate-900">
                            {edu.degree || (
                              <span className="italic text-slate-500">
                                Not provided
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-slate-900">
                            {edu.institution || (
                              <span className="italic text-slate-500">
                                Not provided
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-slate-900">
                            {edu.year || (
                              <span className="italic text-slate-500">
                                —
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ) : (
              <p className="text-sm italic text-slate-500">
                Education details will be updated soon.
              </p>
            )}
          </Section>

          {/* Professional Profile — muted band */}
          {candidate.professionalProfile ? (
            <Section
              id="professional"
              icon={FaBriefcase}
              eyebrow="Career"
              title="Professional Profile"
              tone="muted"
            >
              <p className="font-sans text-base leading-relaxed text-slate-900 sm:text-lg">
                {candidate.professionalProfile}
              </p>
            </Section>
          ) : null}

          {/* Leadership — light band */}
          <Section
            id="leadership"
            icon={FaUsers}
            eyebrow="Experience"
            title="Leadership & Professional Activities"
            tone="light"
          >
            <ListBlock items={candidate.leadership} icon={FaUsers} />
          </Section>

          {/* Community Engagement — muted band */}
          <Section
            id="community"
            icon={FaHandsHelping}
            eyebrow="Service"
            title="Community Engagement & Social Service"
            tone="muted"
          >
            <ListBlock
              items={candidate.communityEngagement}
              icon={FaHandsHelping}
            />
          </Section>

          {/* Vision — dark band */}
          {candidate.vision ? (
            <Section
              id="vision"
              icon={FaEye}
              eyebrow="Vision"
              title="Vision"
              tone="dark"
            >
              <blockquote className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10 sm:p-8">
                <FaQuoteLeft className="text-2xl text-amber-600" />
                <p className="mt-4 font-sans text-base leading-relaxed text-white/90 sm:text-lg">
                  {candidate.vision}
                </p>
              </blockquote>
            </Section>
          ) : null}

          {/* Mission — light band (AEB Rust bullets) */}
          <Section
            id="mission"
            icon={FaBullseye}
            eyebrow="Mission"
            title="Mission"
            tone="light"
          >
            <ListBlock items={candidate.mission} icon={FaBullseye} />
          </Section>

          {/* Commitments — muted band (AEB Rust bullets) */}
          <Section
            id="commitments"
            icon={FaCheckCircle}
            eyebrow="Commitments"
            title="Our Commitments"
            tone="muted"
          >
            <ListBlock items={candidate.commitments} icon={FaCheckCircle} />
          </Section>

          {/* Why Vote — light band (AEB Rust bullets) */}
          <Section
            id="why-vote"
            icon={FaVoteYea}
            eyebrow="Why Vote"
            title="Why Vote for Me?"
            tone="light"
          >
            <ListBlock items={candidate.whyVote} icon={FaVoteYea} />
          </Section>

          {/* Leadership Philosophy — muted band */}
          {candidate.leadershipPhilosophy ? (
            <Section
              id="philosophy"
              icon={FaLightbulb}
              eyebrow="Philosophy"
              title="Leadership Philosophy"
              tone="muted"
            >
              <blockquote className="rounded-2xl border border-teal-700/20 bg-white p-6 sm:p-8">
                <FaQuoteLeft className="text-2xl text-amber-600" />
                <p className="mt-4 font-serif text-base italic leading-relaxed text-slate-900 sm:text-lg">
                  {candidate.leadershipPhilosophy}
                </p>
              </blockquote>
            </Section>
          ) : null}

          {/* Message to Engineers — dark band */}
          {candidate.messageToEngineers ? (
            <Section
              id="message"
              icon={FaEnvelope}
              eyebrow="To Fellow Engineers"
              title="Message to Fellow Engineers"
              tone="dark"
            >
              <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10 backdrop-blur sm:p-8">
                <p className="whitespace-pre-line font-sans text-base leading-relaxed text-white/90 sm:text-lg">
                  {candidate.messageToEngineers}
                </p>
              </div>
            </Section>
          ) : null}

          {/* Slogan — accent pull-quote with thin rules above/below */}
          {candidate.slogan ? (
            <Section
              id="slogan"
              icon={FaQuoteLeft}
              eyebrow="Campaign Slogan"
              title="Slogan"
              tone="muted"
              showSeparator={false}
            >
              <div className="mx-auto max-w-3xl text-center">
                <hr className="mx-auto mb-8 w-24 border-t border-[#64748B]/40" />
                <FaQuoteLeft className="mx-auto text-3xl text-amber-600" />
                <p className="mt-4 font-serif text-2xl italic leading-snug text-teal-700 sm:text-3xl lg:text-4xl">
                  &ldquo;{candidate.slogan}&rdquo;
                </p>
                <hr className="mx-auto mt-8 w-24 border-t border-[#64748B]/40" />
              </div>
            </Section>
          ) : null}

          {/* Contact — light band */}
          <Section
            id="contact"
            icon={FaEnvelope}
            eyebrow="Get in Touch"
            title="Contact Information"
            tone="light"
          >
            {hasContact ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {candidate.contact?.phone ? (
                  <ContactItem
                    icon={FaPhone}
                    label="Phone"
                    value={candidate.contact.phone}
                    href={`tel:${candidate.contact.phone}`}
                  />
                ) : null}
                {candidate.contact?.email ? (
                  <ContactItem
                    icon={FaEnvelope}
                    label="Email"
                    value={candidate.contact.email}
                    href={`mailto:${candidate.contact.email}`}
                  />
                ) : null}
                {candidate.contact?.website ? (
                  <ContactItem
                    icon={FaGlobe}
                    label="Website"
                    value={candidate.contact.website}
                    href={candidate.contact.website}
                    external
                  />
                ) : null}
                {candidate.contact?.facebook ? (
                  <ContactItem
                    icon={FaFacebook}
                    label="Facebook"
                    value={candidate.contact.facebook}
                    href={candidate.contact.facebook}
                    external
                  />
                ) : null}
                {candidate.contact?.linkedIn ? (
                  <ContactItem
                    icon={FaLinkedin}
                    label="LinkedIn"
                    value={candidate.contact.linkedIn}
                    href={candidate.contact.linkedIn}
                    external
                  />
                ) : null}
              </div>
            ) : (
              <p className="text-sm italic text-slate-500">
                Contact details will be updated soon.
              </p>
            )}
          </Section>

          {/* Gallery — muted band */}
          <Section
            id="gallery"
            icon={FaImages}
            eyebrow="Gallery"
            title="Campaign Gallery"
            tone="muted"
          >
            {galleryItems ? (
              <div className="columns-2 gap-3 sm:columns-3">
                {galleryItems.map((src, idx) => (
                  <div
                    key={`${src}-${idx}`}
                    className="mb-3 break-inside-avoid group relative overflow-hidden rounded-lg border border-slate-500/20 bg-slate-100"
                  >
                    <Image
                      src={src}
                      alt={`${candidate.name} campaign photo ${idx + 1}`}
                      width={600}
                      height={600}
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 600px"
                      className="h-auto w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-500/35 bg-white px-6 py-12 text-center">
                <FaImages className="mx-auto text-3xl text-slate-500/60" />
                <p className="mt-3 font-sans text-sm text-slate-500">
                  Photos will be added as the campaign progresses.
                </p>
              </div>
            )}
          </Section>

          {/* Back Navigation */}
          <section className="bg-slate-50 py-12">
            <div className="mx-auto flex max-w-5xl flex-col items-center justify-center gap-3 px-4 sm:flex-row sm:px-6 lg:px-8">
              <Button
                asChild
                variant="outline"
                className="border-teal-700 text-teal-700 hover:bg-teal-700 hover:text-white"
              >
                <Link href="/#panel">
                  <FaArrowLeft />
                  Back to Candidates
                </Link>
              </Button>
              <Button
                asChild
                className="bg-amber-600 text-white hover:bg-amber-600/90"
              >
                <Link href="/">
                  <FaHome />
                  Back to Home
                </Link>
              </Button>
            </div>
          </section>
        </div>
      </div>
    </article>
  );
}
