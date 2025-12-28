import LeaderboardsNav from "@/components/LeaderboardsNav";

export default function LeaderboardsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <h1 className="font-display text-3xl text-[color:var(--color-foreground)]">
          Leaderboards
        </h1>
        <p className="text-sm text-[color:var(--color-muted)]">
          Track wins, public momentum, and the top challengers.
        </p>
        <LeaderboardsNav />
      </header>
      {children}
    </div>
  );
}
