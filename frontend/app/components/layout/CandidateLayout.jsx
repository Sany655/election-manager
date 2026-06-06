"use client";

import React, { useState } from "react";
import Header from "../header";
import { useAuthContext } from "@/app/context/auth_context";
import { FaUserTie, FaSignOutAlt } from "react-icons/fa";
import Link from "next/link";

const CandidateLayout = ({ children, title }) => {
  const { logout } = useAuthContext();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-900">
      {/* Sidebar for Candidate (Simplified) */}
      <aside
        className={`absolute left-0 top-0 z-9999 flex h-screen w-64 flex-col overflow-y-hidden bg-slate-900 duration-300 ease-linear dark:bg-boxdark lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5 mt-4">
          <Link href="/candidate-portal" className="text-white text-2xl font-bold flex items-center gap-2">
             <FaUserTie className="text-blue-500" />
             Candidate
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="block lg:hidden text-white"
          >
            X
          </button>
        </div>
        <div className="flex flex-col overflow-y-auto duration-300 ease-linear">
          <nav className="mt-5 py-4 px-4 lg:mt-9 lg:px-6">
            <div>
              <ul className="mb-6 flex flex-col gap-1.5">
                <li>
                  <Link
                    href="/candidate-portal"
                    className={`group relative flex items-center gap-2.5 rounded-sm px-4 py-2 font-medium text-slate-300 duration-300 ease-in-out hover:bg-slate-800`}
                  >
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>
          </nav>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          title={title}
        />

        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-6 lg:px-8">
          <div className="mx-auto max-w-screen-2xl space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default CandidateLayout;
