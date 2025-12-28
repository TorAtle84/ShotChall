"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import CameraButton from "./CameraButton";

const navItems = [
  {
    href: "/",
    label: "Home",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 11.5 12 4l9 7.5" />
        <path d="M5 10.5v8h5v-5h4v5h5v-8" />
      </svg>
    ),
  },
  {
    href: "/challenges",
    label: "Challenges",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="4" y="4" width="7" height="7" rx="2" />
        <rect x="13" y="4" width="7" height="7" rx="2" />
        <rect x="4" y="13" width="7" height="7" rx="2" />
        <rect x="13" y="13" width="7" height="7" rx="2" />
      </svg>
    ),
  },
  {
    href: "/friends",
    label: "Friends",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="9" cy="7" r="3" />
        <path d="M3 19c1.5-3 3.5-5 6-5s4.5 2 6 5" />
        <circle cx="17" cy="9" r="2.5" />
        <path d="M15 19c.8-2 2-3.5 4-3.5" />
      </svg>
    ),
  },
  {
    href: "/profile",
    label: "Profile",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="8" r="3.5" />
        <path d="M4 20c1.8-3.6 5-5.4 8-5.4s6.2 1.8 8 5.4" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-4 z-50">
      <div className="mx-auto flex w-[min(94vw,520px)] items-center justify-between rounded-[28px] border border-white/80 bg-white/80 px-5 py-3 shadow-xl shadow-slate-200/60 backdrop-blur">
        {navItems.slice(0, 2).map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex flex-col items-center gap-1 text-xs font-semibold transition ${isActive
                  ? "text-[color:var(--color-accent-strong)]"
                  : "text-[color:var(--color-muted)] hover:text-[color:var(--color-accent)]"
                }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
        <CameraButton />
        {navItems.slice(2).map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex flex-col items-center gap-1 text-xs font-semibold transition ${isActive
                  ? "text-[color:var(--color-accent-strong)]"
                  : "text-[color:var(--color-muted)] hover:text-[color:var(--color-accent)]"
                }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
