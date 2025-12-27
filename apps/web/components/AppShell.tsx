import Link from "next/link";
import BottomNav from "./BottomNav";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen pb-28">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 pt-8">
        <Link
          href="/"
          className="text-sm font-semibold uppercase tracking-[0.4em] text-[color:var(--color-muted)]"
        >
          ShotChall
        </Link>
        <div className="flex items-center gap-3 rounded-full border border-white/70 bg-white/70 px-4 py-2 text-xs font-semibold text-[color:var(--color-muted)] shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--color-accent)]" />
          Daily pulse
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl px-6 pb-16 pt-8">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
