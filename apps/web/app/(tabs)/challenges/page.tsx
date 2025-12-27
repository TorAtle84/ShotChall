import Link from "next/link";

export default function ChallengesPage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-[color:var(--color-foreground)]">
            Your Challenges
          </h1>
          <p className="text-sm text-[color:var(--color-muted)]">
            Track invites, submissions, and wins.
          </p>
        </div>
        <Link
          href="/challenges/new"
          className="rounded-2xl bg-[color:var(--color-accent)] px-4 py-2 text-sm font-semibold text-white shadow-md shadow-orange-200/60"
        >
          New challenge
        </Link>
      </header>

      <section className="grid gap-4">
        {["Awaiting your shot", "Rating in progress", "Winner announced"].map(
          (label) => (
            <div
              key={label}
              className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--color-muted)]">
                {label}
              </p>
              <h2 className="mt-3 font-display text-xl text-[color:var(--color-foreground)]">
                Golden hour portrait
              </h2>
              <p className="mt-2 text-sm text-[color:var(--color-muted)]">
                Ends in 6h - 3 participants
              </p>
            </div>
          )
        )}
      </section>
    </div>
  );
}
