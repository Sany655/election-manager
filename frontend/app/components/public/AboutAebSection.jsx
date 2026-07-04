import { FaCheckCircle } from "react-icons/fa";

const BELIEFS = [
  "Professional integrity",
  "Transparent governance",
  "Member-centric services",
  "Engineering innovation",
  "Youth leadership development",
  "National development through engineering excellence",
];

export default function AboutAebSection() {
  return (
    <section
      id="about-aeb"
      className="bg-slate-50 py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            About AEB
          </h2>
          <p className="mt-3 text-base font-semibold text-slate-700 sm:text-lg">
            Association of Engineers Bangladesh (AEB)
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-3xl space-y-4 text-base leading-relaxed text-slate-600">
          <p>
            The Association of Engineers Bangladesh (AEB) is a platform of
            committed engineering professionals dedicated to promoting
            excellence, integrity, innovation and inclusive leadership within
            the engineering community.
          </p>
          <p>AEB believes in:</p>
        </div>

        <ul className="mx-auto mt-8 grid max-w-4xl gap-3 sm:grid-cols-2">
          {BELIEFS.map((belief) => (
            <li
              key={belief}
              className="flex items-start gap-3 rounded-lg border border-blue-100 bg-white px-4 py-3 shadow-sm"
            >
              <FaCheckCircle className="mt-1 shrink-0 text-blue-700" />
              <span className="text-sm font-medium text-slate-700 sm:text-base">
                {belief}
              </span>
            </li>
          ))}
        </ul>

        <p className="mx-auto mt-8 max-w-3xl text-center text-base italic leading-relaxed text-slate-600">
          Our objective is to build a stronger and more dynamic Institution of
          Engineers Bangladesh by ensuring accountable leadership and
          meaningful participation of all engineers.
        </p>
      </div>
    </section>
  );
}
