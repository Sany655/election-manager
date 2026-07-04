import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaFacebookF, FaLinkedinIn, FaYoutube } from "react-icons/fa";
import { Card, CardContent } from "@/components/ui/card";

export default function ContactSection() {
  return (
    <section id="contact" className="bg-slate-50 py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Contact
          </h2>
          <p className="mt-3 text-base text-slate-600 sm:text-lg">
            Reach out to the Association of Engineers Bangladesh election
            coordination committee.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <Card className="border-slate-200">
            <CardContent className="space-y-5 p-6">
              <div>
                <p className="text-base font-bold text-slate-900">
                  Association of Engineers Bangladesh (AEB)
                </p>
                <p className="text-sm text-slate-600">
                  Election Coordination Committee
                </p>
              </div>

              <ul className="space-y-4 text-sm text-slate-700">
                <li className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                    <FaMapMarkerAlt />
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900">Address</p>
                    <p className="text-slate-600">
                      IEB Headquarters, Ramna, Dhaka 1000, Bangladesh
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                    <FaPhone />
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900">Phone</p>
                    <p className="text-slate-600">+880 0000 000 000</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                    <FaEnvelope />
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900">Email</p>
                    <p className="text-slate-600">contact@aeb-election.org</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                    <FaFacebookF />
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900">Social Media</p>
                    <div className="mt-1 flex items-center gap-3 text-slate-600">
                      <span>Facebook</span>
                      <span aria-hidden>/</span>
                      <span>LinkedIn</span>
                      <span aria-hidden>/</span>
                      <span>YouTube</span>
                    </div>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-slate-200">
            <div className="flex h-full min-h-[300px] flex-col">
              <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
                <p className="text-sm font-semibold text-slate-700">
                  Google Map
                </p>
                <span className="text-xs text-slate-500">Embed placeholder</span>
              </div>
              <div className="relative flex flex-1 items-center justify-center bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100">
                <iframe
                  title="IEB Headquarters Location"
                  src="https://www.google.com/maps?q=Dhaka,Bangladesh&output=embed"
                  className="absolute inset-0 h-full w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
