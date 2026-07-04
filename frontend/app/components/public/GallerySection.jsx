import { FaImages } from "react-icons/fa";

const PLACEHOLDERS = Array.from({ length: 8 }, (_, i) => i + 1);

export default function GallerySection() {
  return (
    <section id="gallery" className="bg-white py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Gallery
          </h2>
          <p className="mt-3 text-base text-slate-600 sm:text-lg">
            Campaign photos, member meets and event highlights.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {PLACEHOLDERS.map((index) => (
            <div
              key={index}
              className="group relative flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-blue-100 via-slate-100 to-white text-slate-500"
            >
              <div className="flex flex-col items-center gap-2 transition-transform group-hover:scale-105">
                <FaImages className="text-3xl text-blue-700/70" />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Campaign Photo {index}
                </span>
              </div>
              <div className="pointer-events-none absolute inset-0 bg-blue-900/0 transition-colors group-hover:bg-blue-900/10" />
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-slate-500">
          Photos will be updated as the campaign progresses.
        </p>
      </div>
    </section>
  );
}
