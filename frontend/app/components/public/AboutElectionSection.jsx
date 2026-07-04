import { FaCheckCircle } from "react-icons/fa";

const POINTS = [
  "Professional development",
  "Engineering education",
  "Policy advocacy",
  "International collaboration",
  "Continuing Professional Development (CPD)",
  "Welfare of engineers",
  "Industry-academia collaboration",
];

export default function AboutElectionSection() {
  return (
    <section
      id="about-election"
      className="bg-white py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            About the IEB Election
          </h2>
          <p className="mt-3 text-base font-semibold text-slate-700 sm:text-lg">
            Institution of Engineers, Bangladesh (IEB) Election
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-3xl space-y-4 text-base leading-relaxed text-slate-600">
          <p>
            The Institution of Engineers, Bangladesh (IEB) is the premier
            professional organization representing engineers across the
            country. The IEB election provides members with the opportunity to
            elect capable, ethical and visionary leaders who will shape
            policies, strengthen professional standards, promote engineering
            excellence, and safeguard the interests of engineers nationwide.
          </p>
          <p>
            The elected leadership plays a vital role in the following areas:
          </p>
        </div>

        <ul className="mx-auto mt-8 grid max-w-4xl gap-3 sm:grid-cols-2 lg:grid-cols-2">
          {POINTS.map((point) => (
            <li
              key={point}
              className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"
            >
              <FaCheckCircle className="mt-1 shrink-0 text-blue-700" />
              <span className="text-sm font-medium text-slate-700 sm:text-base">
                {point}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
