'use client';
import React, { useEffect, useRef, useState } from 'react';
import { FaTimes, FaChevronLeft } from 'react-icons/fa';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import items from '../../utils/sidebar';
import SidebarItem from './SidebarItem';
import Image from 'next/image';
import logo from '@/app/public/images/bnp_logo.png';
import { APP_NAME, TAGLINE } from '@/app/utils/constants';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const trigger = useRef(null);
  const sidebar = useRef(null);
  const pathname = usePathname();

  const storedSidebarExpanded =
    typeof localStorage !== 'undefined' && localStorage.getItem('sidebar-expanded');
  const [sidebarExpanded, setSidebarExpanded] = useState(
    storedSidebarExpanded === null ? false : storedSidebarExpanded === 'true',
  );

  // Close on outside click
  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!sidebar.current || !trigger.current) return;
      if (
        !sidebarOpen ||
        sidebar.current.contains(target) ||
        trigger.current.contains(target)
      )
        return;
      setSidebarOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  }, [sidebarOpen]);

  // Close on ESC
  useEffect(() => {
    const keyHandler = ({ keyCode }) => {
      if (!sidebarOpen || keyCode !== 27) return;
      setSidebarOpen(false);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  }, [sidebarOpen]);

  // Sidebar expanded state
  useEffect(() => {
    localStorage.setItem('sidebar-expanded', sidebarExpanded.toString());
    if (sidebarExpanded) {
      document.body.classList.add('sidebar-expanded');
    } else {
      document.body.classList.remove('sidebar-expanded');
    }
  }, [sidebarExpanded]);

  return (
    <>
      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[39] lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        ref={sidebar}
        className={`fixed inset-y-0 left-0 z-[40] w-72 bg-gradient-to-b from-slate-900 to-slate-800 text-white shadow-2xl transition-transform duration-300 ease-in-out dark:from-boxdark dark:to-gray-900 lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } flex flex-col`}
      >
        {/* Header */}
        <div className="relative">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50">
            <Link href="/" className="flex items-center gap-3">
              <Image
                className="w-10 h-10 rounded-lg"
                src={logo}
                priority
                alt="Logo"
              />
              <div>
                <h1 className="text-xl font-bold text-white">{APP_NAME}</h1>
                <p className="text-xs text-slate-300">{TAGLINE}</p>
              </div>
            </Link>

            <button
              ref={trigger}
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-controls="sidebar"
              aria-expanded={sidebarOpen}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-700/50 text-slate-300 hover:text-white transition-colors"
            >
              <FaTimes size={16} />
            </button>
          </div>

          {/* Decorative element */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-500 to-transparent" />
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          {items.map((item, index) => (
            <SidebarItem key={index} item={item} pathname={pathname} />
          ))}
        </nav>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-700/50">
          <div className="text-center text-xs text-slate-400">
            <p>Copyright &copy; {new Date().getFullYear()} QP. All rights reserved.</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;