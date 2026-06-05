'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import { BiChevronDown } from 'react-icons/bi';
import { useAuthContext } from "../../context/auth_context";

export default function SidebarItem({ item, pathname, depth = 0 }) {
  const [open, setOpen] = useState(false);
  const { hasPermission, hasAnyPermission, user, isLoading } = useAuthContext();

  // Check if current path matches this item or any of its children
  const isActive = pathname === item.path;
  const hasActiveChild = item.childrens?.some(child =>
    pathname === child.path ||
    child.childrens?.some(grandChild => pathname === grandChild.path)
  );

  // Auto-expand if has active child
  useEffect(() => {
    if (hasActiveChild) {
      setOpen(true);
    }
  }, [hasActiveChild, pathname]);

  // Recursive visibility check
  const canViewItem = (navItem) => {
    // Check own permission
    if (navItem.permission && !hasPermission(navItem.permission)) return false;
    if (navItem.permissions && !hasAnyPermission(navItem.permissions)) return false;

    // Check children (if any) -- Only show parent if at least one child is visible
    if (navItem.childrens?.length > 0) {
      return navItem.childrens.some(child => canViewItem(child));
    }

    return true;
  };

  if (isLoading) return null;

  if (!canViewItem(item)) {
    return null;
  }

  // If no specific permission on parent, but it has children
  // We might want to hide the parent if ALL children are hidden
  // This is a bit expensive to calc deeply here, so we rely on 
  // explicitly setting permissions on parents in the menu config.

  if (item.childrens) {
    return (
      <div className="w-full">
        <div
          className={`flex items-center justify-between cursor-pointer px-4 py-3 rounded-lg transition-all duration-200 group ${hasActiveChild
            ? 'bg-blue-600/20 text-blue-300 shadow-md'
            : 'hover:bg-slate-700/50 hover:text-white text-slate-300'
            } ${depth > 0 ? 'ml-4' : ''}`}
          onClick={() => setOpen(!open)}
        >
          <span className="flex items-center gap-3">
            {item.icon && (
              <span className={`text-lg transition-colors ${hasActiveChild ? 'text-blue-400' : 'text-slate-400 group-hover:text-white'
                }`}>
                {item.icon}
              </span>
            )}
            <span className="font-medium">{item.title}</span>
          </span>
          <BiChevronDown
            className={`transition-all duration-300 text-slate-400 group-hover:text-white ${open ? 'rotate-180 text-blue-400' : ''
              } ${hasActiveChild ? 'text-blue-400' : ''}`}
            size={18}
          />
        </div>

        {/* Submenu */}
        <div className={`overflow-hidden transition-all duration-300 ${open ? ' opacity-100' : 'max-h-0 opacity-0'
          }`}>
          <div className="pl-2 mt-1 space-y-1 border-l-2 border-slate-700/30 ml-6">
            {item.childrens.map((child, index) => (
              <SidebarItem
                key={index}
                item={child}
                pathname={pathname}
                depth={depth + 1}
              />
            ))}
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <Link
        href={item.path || "#"}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group relative ${isActive
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
          : 'hover:bg-slate-700/50 hover:text-white text-slate-300'
          } ${depth > 0 ? 'ml-4' : ''}`}
      >
        {/* Active indicator */}
        {isActive && (
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-blue-400 rounded-r-full" />
        )}

        {item.icon && (
          <span className={`text-lg transition-colors ${isActive
            ? 'text-white'
            : 'text-slate-400 group-hover:text-white'
            }`}>
            {item.icon}
          </span>
        )}
        <span className="font-medium">{item.title}</span>

        {/* Hover effect */}
        <div className={`absolute inset-0 rounded-lg bg-gradient-to-r from-blue-600/0 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${isActive ? 'hidden' : ''
          }`} />
      </Link>
    );
  }
}