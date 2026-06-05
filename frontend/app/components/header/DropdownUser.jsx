"use client";
import { useState } from "react";
import { MdOutlineFactory } from "react-icons/md";
import { FiUser } from "react-icons/fi";
import Link from "next/link";
import LogoutButton from "../user/Logout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BiChevronDown } from "react-icons/bi";
import { useAuthContext } from "@/app/context/auth_context";
import ClickOutside from "../ClickOutside";
import { FaUser } from "react-icons/fa";


const DropdownUser = () => {

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user } = useAuthContext();

  return (
    <ClickOutside onClick={() => setDropdownOpen(false)} className="relative">
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-3 focus:outline-none"
      >
        <div className="hidden text-right lg:block">
          <p className="text-sm font-medium text-foreground">{user?.name}</p>
          {/* <p className="text-xs text-muted-foreground">{user?.roles?.map(r=>r.name)}</p> */}
        </div>

        <span className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300">
          <FaUser className="h-5 w-5" />
        </span>

        <BiChevronDown className="hidden sm:block w-4 h-4 text-muted-foreground" />
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-4 w-64 rounded-md border border-border bg-background shadow-lg z-50">
          <ul className="flex flex-col gap-4 px-6 py-5 border-b border-border">
            <li className="flex items-center gap-3 text-sm font-medium text-muted-foreground hover:text-primary transition-colors cursor-pointer">
              <MdOutlineFactory size={18} /> {user?.roles?.map(r => r.name)}
            </li>
          </ul>
          <ul className="flex flex-col gap-2 px-6 py-3 border-b border-border">
            <li>
              <Link
                href="/users/profile"
                className="flex items-center gap-3 text-sm font-medium text-muted-foreground hover:text-primary transition-colors cursor-pointer"
              >
                <FiUser size={18} /> View Profile
              </Link>
            </li>
          </ul>
          <div className="px-6 py-3">
            <LogoutButton />
          </div>
        </div>
      )}
    </ClickOutside>
  );
};

export default DropdownUser;
