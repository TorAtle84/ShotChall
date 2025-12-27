import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-lg shadow-orange-100/40">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[color:var(--color-muted)]">
          ShotChall
        </p>
        <h1 className="mt-4 font-display text-3xl text-[color:var(--color-foreground)] md:text-4xl">
          Your next shot starts here.
        </h1>
        <p className="mt-3 text-sm text-[color:var(--color-muted)] md:text-base">
          Challenge friends, capture the moment, and climb the leaderboard.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/challenges/new"
            className="rounded-2xl bg-[color:var(--color-accent)] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-200/60 transition hover:bg-[color:var(--color-accent-strong)]"
          >
            Start a challenge
          </Link>
          <Link
            href="/arena"
            className="rounded-2xl border border-white/60 bg-white/80 px-5 py-3 text-sm font-semibold text-[color:var(--color-muted)] transition hover:border-[color:var(--color-accent)]"
          >
            Explore arena
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-white/70 bg-white/70 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--color-muted)]">
            Active
          </p>
          <p className="mt-3 text-2xl font-semibold text-[color:var(--color-foreground)]">0</p>
          <p className="text-sm text-[color:var(--color-muted)]">Challenges in play</p>
        </div>
        <div className="rounded-3xl border border-white/70 bg-white/70 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--color-muted)]">
            Streak
          </p>
          <p className="mt-3 text-2xl font-semibold text-[color:var(--color-foreground)]">0</p>
          <p className="text-sm text-[color:var(--color-muted)]">Days in a row</p>
        </div>
        <div className="rounded-3xl border border-white/70 bg-white/70 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--color-muted)]">
            Avg rating
          </p>
          <p className="mt-3 text-2xl font-semibold text-[color:var(--color-foreground)]">--</p>
          <p className="text-sm text-[color:var(--color-muted)]">Stars received</p>
        </div>
      </section>

      <section className="rounded-[28px] border border-white/70 bg-white/75 p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--color-muted)]">
              Daily challenge
            </p>
            <h2 className="mt-2 font-display text-2xl text-[color:var(--color-foreground)]">
              Find a reflection that tells a story.
            </h2>
            <p className="mt-2 text-sm text-[color:var(--color-muted)]">
              Join the public arena and keep your streak alive.
            </p>
          </div>
          <Link
            href="/arena"
            className="rounded-2xl border border-white/60 bg-white/80 px-4 py-2 text-sm font-semibold text-[color:var(--color-muted)] transition hover:border-[color:var(--color-accent)]"
          >
            Join now
          </Link>
        </div>
      </section>
    </div>
  );
}
