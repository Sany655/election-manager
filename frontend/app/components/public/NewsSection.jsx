import {
  FaUserPlus,
  FaHandshake,
  FaChalkboardTeacher,
  FaBullhorn,
  FaNewspaper,
  FaCalendarAlt,
} from "react-icons/fa";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const NEWS = [
  {
    icon: FaUserPlus,
    title: "Candidate Introduction Program",
    description:
      "Meet our candidates and learn about their vision for a stronger IEB.",
    tag: "Upcoming",
  },
  {
    icon: FaHandshake,
    title: "Meet the Members",
    description:
      "Open forums and division-level meet-and-greets across the country.",
    tag: "Tour",
  },
  {
    icon: FaChalkboardTeacher,
    title: "Professional Seminar",
    description:
      "Seminars on innovation, CPD, and the future of engineering in Bangladesh.",
    tag: "Seminar",
  },
  {
    icon: FaBullhorn,
    title: "Election Campaign Updates",
    description:
      "Latest announcements and milestones from the AEB election campaign.",
    tag: "Campaign",
  },
  {
    icon: FaNewspaper,
    title: "Press Releases",
    description:
      "Official statements and media coverage of the AEB panel and candidates.",
    tag: "Media",
  },
  {
    icon: FaCalendarAlt,
    title: "Upcoming Events",
    description:
      "Stay tuned for division visits, debates, and member dialogues.",
    tag: "Events",
  },
];

export default function NewsSection() {
  return (
    <section id="news" className="bg-slate-50 py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Latest News &amp; Campaign Activities
          </h2>
          <p className="mt-3 text-base text-slate-600 sm:text-lg">
            Follow our journey as we engage members across Bangladesh.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {NEWS.map(({ icon: Icon, title, description, tag }) => (
            <Card
              key={title}
              className="border-slate-200 transition-shadow hover:shadow-md"
            >
              <CardContent className="space-y-3 p-6">
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                    <Icon size={18} />
                  </span>
                  <Badge variant="outline" className="border-blue-200 text-blue-700">
                    {tag}
                  </Badge>
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
