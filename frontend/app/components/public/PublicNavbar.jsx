"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaBars, FaChevronDown, FaTimes } from "react-icons/fa";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import logo from "images/ieb logo.jpeg";

const DIRECT_LINKS = [
  { label: "Home", href: "/#home" },
  { label: "Candidates", href: "/#panel" },
  { label: "Manifesto", href: "/#manifesto" },
  { label: "Contact", href: "/#contact" },
];

const DROPDOWN_LINKS = [
  {
    key: "about",
    label: "About",
    items: [
      { label: "About AEB", href: "/#about-aeb" },
      { label: "About IEB Election", href: "/#about-election" },
      { label: "President's Message", href: "/#president-message" },
    ],
  },
  {
    key: "media",
    label: "Media",
    items: [
      { label: "News & Activities", href: "/#news" },
      { label: "Gallery", href: "/#gallery" },
    ],
  },
];

const CLOSE_DELAY = 120;

export default function PublicNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [mobileAccordion, setMobileAccordion] = useState(null);
  const closeTimerRef = useRef(null);
  const navRef = useRef(null);

  // Close any open dropdown when clicking outside the navbar.
  useEffect(() => {
    function handlePointerDown(event) {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    }
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setOpenDropdown(null);
        setMobileOpen(false);
        setMobileAccordion(null);
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Lock body scroll when the mobile panel is open.
  useEffect(() => {
    if (mobileOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
    return undefined;
  }, [mobileOpen]);

  function cancelClose() {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }

  function scheduleClose() {
    cancelClose();
    closeTimerRef.current = setTimeout(() => {
      setOpenDropdown(null);
      closeTimerRef.current = null;
    }, CLOSE_DELAY);
  }

  function handleDropdownEnter(key) {
    cancelClose();
    setOpenDropdown(key);
  }

  function handleDropdownLeave() {
    scheduleClose();
  }

  function toggleDropdown(key) {
    setOpenDropdown((current) => (current === key ? null : key));
  }

  function handleLinkClick() {
    setOpenDropdown(null);
    setMobileOpen(false);
    setMobileAccordion(null);
  }

  function toggleMobileAccordion(key) {
    setMobileAccordion((current) => (current === key ? null : key));
  }

  return (
    <header
      ref={navRef}
      className="sticky top-0 z-40 border-b border-slate-200 bg-slate-50/95 backdrop-blur supports-[backdrop-filter]:bg-slate-50/80"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="#home"
          onClick={handleLinkClick}
          className="flex items-center gap-3"
        >
          <Image
            src={logo}
            alt="IEB Logo"
            width={48}
            height={40}
            className="h-10 w-12 object-contain"
            priority
          />
          <div className="leading-tight">
            <p className="font-serif text-base font-bold text-teal-700 sm:text-lg">
              IEB Election 2026
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500 sm:text-[11px]">
              AEB Panel
            </p>
          </div>
        </Link>

        <nav
          aria-label="Primary"
          className="hidden lg:flex lg:items-center lg:gap-1"
        >
          {DIRECT_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group relative rounded-md px-3 py-2 text-sm font-medium text-slate-900 transition-colors hover:text-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600/40"
            >
              {link.label}
              <span className="pointer-events-none absolute inset-x-3 bottom-1 h-0.5 origin-center scale-x-0 rounded-full bg-amber-600 transition-transform duration-200 group-hover:scale-x-100" />
            </Link>
          ))}

          {DROPDOWN_LINKS.map((group) => {
            const isOpen = openDropdown === group.key;
            return (
              <div
                key={group.key}
                className="relative"
                onMouseEnter={() => handleDropdownEnter(group.key)}
                onMouseLeave={handleDropdownLeave}
              >
                <button
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={isOpen}
                  aria-controls={`nav-menu-${group.key}`}
                  onClick={() => toggleDropdown(group.key)}
                  onFocus={() => handleDropdownEnter(group.key)}
                  onKeyDown={(event) => {
                    if (event.key === "ArrowDown" || event.key === "Enter") {
                      event.preventDefault();
                      handleDropdownEnter(group.key);
                    }
                  }}
                  className={cn(
                    "group inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600/40",
                    isOpen
                      ? "text-teal-700"
                      : "text-slate-900 hover:text-teal-700"
                  )}
                >
                  {group.label}
                  <FaChevronDown
                    aria-hidden="true"
                    className={cn(
                      "h-3 w-3 transition-transform duration-200",
                      isOpen && "rotate-180"
                    )}
                  />
                  <span
                    className={cn(
                      "pointer-events-none absolute inset-x-3 bottom-1 h-0.5 origin-center rounded-full bg-amber-600 transition-transform duration-200",
                      isOpen ? "scale-x-100" : "scale-x-0"
                    )}
                  />
                </button>
                <div
                  id={`nav-menu-${group.key}`}
                  role="menu"
                  aria-label={group.label}
                  className={cn(
                    "absolute left-0 top-full z-50 min-w-[14rem] origin-top rounded-md border border-slate-200 bg-slate-50 p-1.5 shadow-lg transition-all duration-150",
                    isOpen
                      ? "pointer-events-auto translate-y-0 opacity-100"
                      : "pointer-events-none -translate-y-1 opacity-0"
                  )}
                >
                  {group.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      role="menuitem"
                      onClick={handleLinkClick}
                      className="group/item relative flex items-center rounded px-3 py-2 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-100 hover:text-teal-700 focus-visible:bg-slate-100 focus-visible:text-teal-700 focus-visible:outline-none"
                    >
                      <span className="mr-2 h-1.5 w-1.5 rounded-full bg-amber-600 opacity-70 transition-opacity group-hover/item:opacity-100" />
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        <div className="hidden lg:block">
          <Button
            asChild
            size="sm"
            className="bg-amber-600 px-4 font-semibold text-slate-50 hover:bg-amber-700"
          >
            <Link href="#contact">Get Involved</Link>
          </Button>
        </div>

        <button
          type="button"
          aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav-panel"
          onClick={() => setMobileOpen((value) => !value)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md text-slate-900 transition-colors hover:bg-slate-100 hover:text-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600/40 lg:hidden"
        >
          {mobileOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>
      </div>

      <div
        id="mobile-nav-panel"
        className={cn(
          "absolute inset-x-0 top-full origin-top overflow-hidden border-t border-slate-200 bg-slate-50 shadow-xl transition-all duration-200 lg:hidden",
          mobileOpen
            ? "max-h-[calc(100vh-4rem)] opacity-100"
            : "pointer-events-none max-h-0 opacity-0"
        )}
      >
        <nav
          aria-label="Primary mobile"
          className="flex max-h-[calc(100vh-8rem)] flex-col gap-1 overflow-y-auto px-4 py-4 sm:px-6"
        >
          {DIRECT_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={handleLinkClick}
              className="rounded-md px-3 py-3 text-base font-medium text-slate-900 transition-colors hover:bg-slate-100 hover:text-teal-700"
            >
              {link.label}
            </Link>
          ))}

          {DROPDOWN_LINKS.map((group) => {
            const isExpanded = mobileAccordion === group.key;
            return (
              <div
                key={group.key}
                className="overflow-hidden rounded-md border border-slate-200"
              >
                <button
                  type="button"
                  aria-expanded={isExpanded}
                  aria-controls={`mobile-section-${group.key}`}
                  onClick={() => toggleMobileAccordion(group.key)}
                  className={cn(
                    "flex w-full items-center justify-between px-3 py-3 text-base font-medium transition-colors",
                    isExpanded
                      ? "bg-slate-100 text-teal-700"
                      : "text-slate-900 hover:bg-slate-100 hover:text-teal-700"
                  )}
                >
                  <span>{group.label}</span>
                  <FaChevronDown
                    aria-hidden="true"
                    className={cn(
                      "h-3.5 w-3.5 transition-transform duration-200",
                      isExpanded && "rotate-180"
                    )}
                  />
                </button>
                <div
                  id={`mobile-section-${group.key}`}
                  className={cn(
                    "grid transition-[grid-template-rows] duration-200",
                    isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  )}
                >
                  <div className="overflow-hidden">
                    <ul className="flex flex-col gap-0.5 border-t border-slate-200 bg-slate-50 px-2 py-2">
                      {group.items.map((item) => (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={handleLinkClick}
                            className="flex items-center rounded px-3 py-2.5 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-100 hover:text-teal-700"
                          >
                            <span className="mr-2 h-1.5 w-1.5 rounded-full bg-amber-600" />
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </nav>

        <div className="sticky bottom-0 border-t border-slate-200 bg-slate-50 px-4 py-4 sm:px-6">
          <Button
            asChild
            className="h-11 w-full bg-amber-600 text-base font-semibold text-slate-50 hover:bg-amber-700"
          >
            <Link href="#contact" onClick={handleLinkClick}>
              Get Involved
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
