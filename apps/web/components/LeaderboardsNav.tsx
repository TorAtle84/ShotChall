"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/leaderboards/friends", label: "Friends wins" },
  { href: "/leaderboards/public", label: "Public arena" },
  { href: "/leaderboards/top", label: "Top challengers" },
];

export default function LeaderboardsNav() {
  const pathname = usePathname();

  return (
    <div className="flex flex-wrap gap-2">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
              isActive
                ? "bg-[color:var(--color-accent)] text-white"
                : "border border-white/60 bg-white/80 text-[color:var(--color-muted)] hover:border-[color:var(--color-accent)]"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
