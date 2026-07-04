import { FaQuoteLeft, FaSignature } from "react-icons/fa";

export default function PresidentMessageSection() {
  return (
    <section
      id="president-message"
      className="bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 py-16 text-white sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Message from the President
          </h2>
        </div>

        <div className="mt-10 rounded-2xl bg-white/5 p-8 ring-1 ring-white/10 backdrop-blur sm:p-10">
          <FaQuoteLeft className="text-3xl text-blue-300" />
          <div className="mt-4 space-y-4 text-base leading-relaxed text-blue-50 sm:text-lg">
            <p>
              <span className="font-semibold text-white">Dear Fellow Engineers,</span>
            </p>
            <p>
              The future of our engineering profession depends upon visionary
              leadership, transparency, innovation, and active participation
              from every member. Association of Engineers Bangladesh (AEB) is
              committed to strengthening the Institution of Engineers,
              Bangladesh through accountable governance, professional
              excellence, and inclusive development.
            </p>
            <p>
              Our team consists of experienced professionals from diverse
              engineering disciplines who have dedicated their careers to
              serving both the profession and the nation.
            </p>
            <p>
              Together, let us build a stronger, smarter, and globally
              respected engineering community.
            </p>
            <p>
              We seek your trust, support, and valuable vote.
            </p>
            <p className="font-semibold text-white">Thank you.</p>
          </div>

          <div className="mt-8 flex items-center gap-4 border-t border-white/10 pt-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-700 text-white">
              <FaSignature size={24} />
            </div>
            <div>
              <p className="text-lg font-bold text-white">
                Engr. Salim Md. Jane Alam
              </p>
              <p className="text-sm text-blue-200">
                President, Association of Engineers Bangladesh (AEB)
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
