export default function LeaderboardsPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="font-display text-3xl text-[color:var(--color-foreground)]">
          Leaderboards
        </h1>
        <p className="text-sm text-[color:var(--color-muted)]">
          Filter by friends, public arena, and time range.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        {["Friends", "Public Arena"].map((label) => (
          <div
            key={label}
            className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--color-muted)]">
              {label}
            </p>
            <h2 className="mt-3 font-display text-xl text-[color:var(--color-foreground)]">
              Coming soon
            </h2>
            <p className="mt-2 text-sm text-[color:var(--color-muted)]">
              Weekly, monthly, and yearly wins.
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}
