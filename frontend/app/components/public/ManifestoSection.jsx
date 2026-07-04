import {
  FaGraduationCap,
  FaLaptopCode,
  FaUsers,
  FaHandsHelping,
  FaIndustry,
} from "react-icons/fa";
import { Card, CardContent } from "@/components/ui/card";

const COMMITMENTS = [
  {
    icon: FaGraduationCap,
    title: "Professional Development",
    description:
      "Strengthen CPD programs, technical training, and certification pathways for every engineer.",
  },
  {
    icon: FaLaptopCode,
    title: "Digital Transformation",
    description:
      "Modernize IEB services with secure digital platforms, online membership, and transparent records.",
  },
  {
    icon: FaUsers,
    title: "Young Engineers",
    description:
      "Mentorship, scholarships and leadership pipelines for the next generation of engineers.",
  },
  {
    icon: FaHandsHelping,
    title: "Engineers' Welfare",
    description:
      "Improved welfare services, insurance support and member-first benefits across divisions.",
  },
  {
    icon: FaIndustry,
    title: "Industry Collaboration",
    description:
      "Stronger academia-industry partnerships, research grants and innovation programs.",
  },
];

export default function ManifestoSection() {
  return (
    <section
      id="manifesto"
      className="bg-gradient-to-b from-slate-50 to-white py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Our Election Manifesto
          </h2>
          <p className="mt-3 text-base font-semibold text-blue-700 sm:text-lg">
            A Better IEB for Every Engineer
          </p>
          <p className="mt-4 text-base text-slate-600">
            Our commitments to members, the profession and the nation.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {COMMITMENTS.map(({ icon: Icon, title, description }) => (
            <Card
              key={title}
              className="border-slate-200 transition-shadow hover:shadow-md"
            >
              <CardContent className="space-y-3 p-6">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                  <Icon size={22} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                <p className="text-sm leading-relaxed text-slate-600">
                  {description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
