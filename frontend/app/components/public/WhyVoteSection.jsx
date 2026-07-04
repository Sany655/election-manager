import { FaShieldAlt, FaUserCheck, FaAward, FaHeart, FaUsers, FaLightbulb, FaCogs, FaBalanceScale } from "react-icons/fa";

const REASONS = [
  { icon: FaShieldAlt, label: "Transparent Leadership" },
  { icon: FaUserCheck, label: "Experienced Team" },
  { icon: FaAward, label: "Proven Professional Background" },
  { icon: FaHeart, label: "Member-First Approach" },
  { icon: FaUsers, label: "Inclusive Decision Making" },
  { icon: FaLightbulb, label: "Future-Oriented Vision" },
  { icon: FaCogs, label: "Engineering Excellence" },
  { icon: FaBalanceScale, label: "Accountability" },
];

export default function WhyVoteSection() {
  return (
    <section className="bg-white py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Why Vote for AEB
          </h2>
          <p className="mt-3 text-base text-slate-600 sm:text-lg">
            A panel built on integrity, experience and accountability.
          </p>
        </div>

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {REASONS.map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-700 text-white">
                <Icon size={18} />
              </span>
              <span className="text-base font-semibold text-slate-800">
                {label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
