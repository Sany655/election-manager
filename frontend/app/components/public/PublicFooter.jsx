import Image from "next/image";
import Link from "next/link";
import {
  FaFacebookF,
  FaLinkedinIn,
  FaYoutube,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { Separator } from "@/components/ui/separator";
import logo from "images/ieb logo.jpeg";

export default function PublicFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-teal-800 bg-teal-900 text-slate-200">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-3">
              <Image
                src= {logo}
                alt="IEB Logo"
                width={56}
                height={48}
                className="h-12 w-14 bg-white object-contain p-1"
              />
              <div>
                <p className="text-base font-bold text-white">
                  Association of Engineers Bangladesh
                </p>
                <p className="text-xs text-slate-400">IEB Election Panel</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-400">
              United for professional excellence, innovation and stronger
              engineering leadership across Bangladesh.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Quick Links
            </h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="#about-election" className="hover:text-amber-400">
                  About IEB Election
                </Link>
              </li>
              <li>
                <Link href="#about-aeb" className="hover:text-amber-400">
                  About AEB
                </Link>
              </li>
              <li>
                <Link href="#panel" className="hover:text-amber-400">
                  Meet Our Candidates
                </Link>
              </li>
              <li>
                <Link href="#manifesto" className="hover:text-amber-400">
                  Election Manifesto
                </Link>
              </li>
              <li>
                <Link href="#president-message" className="hover:text-amber-400">
                  President&apos;s Message
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Contact
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              <li className="flex items-start gap-2">
                <FaMapMarkerAlt className="mt-1 shrink-0 text-amber-400" />
                <span>
                  Election Coordination Committee
                  <br />
                  IEB Headquarters, Dhaka, Bangladesh
                </span>
              </li>
              <li className="flex items-center gap-2">
                <FaPhone className="shrink-0 text-amber-400" />
                <span>+880 0000 000 000</span>
              </li>
              <li className="flex items-center gap-2">
                <FaEnvelope className="shrink-0 text-amber-400" />
                <span>contact@aeb-election.org</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Follow the Campaign
            </h3>
            <p className="mt-4 text-sm text-slate-400">
              Stay connected with our campaign updates and events.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <Link
                href="#"
                aria-label="Facebook"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-teal-800 text-slate-200 transition-colors hover:bg-amber-600 hover:text-white"
              >
                <FaFacebookF />
              </Link>
              <Link
                href="#"
                aria-label="LinkedIn"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-teal-800 text-slate-200 transition-colors hover:bg-amber-600 hover:text-white"
              >
                <FaLinkedinIn />
              </Link>
              <Link
                href="#"
                aria-label="YouTube"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-teal-800 text-slate-200 transition-colors hover:bg-amber-600 hover:text-white"
              >
                <FaYoutube />
              </Link>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-teal-800" />

        <div className="flex flex-col items-center justify-between gap-2 text-xs text-slate-400 sm:flex-row">
          <p>
            &copy; {year} Association of Engineers Bangladesh (AEB). All rights
            reserved.
          </p>
          <p>Institution of Engineers, Bangladesh (IEB) Election Panel.</p>
        </div>
      </div>
    </footer>
  );
}
