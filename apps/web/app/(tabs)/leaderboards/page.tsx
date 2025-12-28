import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/data/user";
import {
  getFriendLeaderboard,
  getPublicChallengeLeaderboard,
  getTopChallengers,
  parseLeaderboardRange,
} from "@/lib/data/leaderboards";

type LeaderboardsPageProps = {
  searchParams?: {
    range?: string;
  };
};

const rangeOptions = [
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "year", label: "Year" },
];

function formatAvgStars(value: number | null) {
  if (value === null) {
    return "--";
  }
  return value.toFixed(1);
}

export default async function LeaderboardsPage({
  searchParams,
}: LeaderboardsPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  const range = parseLeaderboardRange(searchParams?.range);
  const [friendRows, publicRows, topChallengers] = await Promise.all([
    getFriendLeaderboard(user.id, range),
    getPublicChallengeLeaderboard(range),
    getTopChallengers(),
  ]);

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <h1 className="font-display text-3xl text-[color:var(--color-foreground)]">
          Leaderboards
        </h1>
        <p className="text-sm text-[color:var(--color-muted)]">
          Track wins, public momentum, and the top challengers.
        </p>
        <div className="flex flex-wrap gap-2">
          {rangeOptions.map((option) => {
            const isActive = option.value === range;
            return (
              <Link
                key={option.value}
                href={`/leaderboards?range=${option.value}`}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                  isActive
                    ? "bg-[color:var(--color-accent)] text-white"
                    : "border border-white/60 bg-white/80 text-[color:var(--color-muted)] hover:border-[color:var(--color-accent)]"
                }`}
              >
                {option.label}
              </Link>
            );
          })}
        </div>
      </header>

      <section className="rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--color-muted)]">
              Friends wins
            </p>
            <h2 className="mt-2 font-display text-2xl text-[color:var(--color-foreground)]">
              Private challenge winners
            </h2>
          </div>
        </div>

        {friendRows.length === 0 ? (
          <p className="mt-4 text-sm text-[color:var(--color-muted)]">
            No wins recorded in this time range yet.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {friendRows.map((row, index) => (
              <div
                key={row.userId}
                className="flex items-center justify-between rounded-2xl border border-white/70 bg-white/90 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-[color:var(--color-muted)]">
                    #{index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[color:var(--color-foreground)]">
                      {row.displayName || row.username}
                    </p>
                    <p className="text-xs text-[color:var(--color-muted)]">
                      @{row.username}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-[color:var(--color-foreground)]">
                  {row.wins} wins
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-sm">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--color-muted)]">
            Public arena
          </p>
          <h2 className="font-display text-2xl text-[color:var(--color-foreground)]">
            Most returned challenges
          </h2>
        </div>

        {publicRows.length === 0 ? (
          <p className="mt-4 text-sm text-[color:var(--color-muted)]">
            No public challenges to rank yet.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {publicRows.map((row, index) => (
              <div
                key={row.challengeId}
                className="flex items-center justify-between rounded-2xl border border-white/70 bg-white/90 px-4 py-3"
              >
                <div>
                  <p className="text-xs font-semibold text-[color:var(--color-muted)]">
                    #{index + 1}
                  </p>
                  <p className="text-sm font-semibold text-[color:var(--color-foreground)]">
                    {row.title}
                  </p>
                  <p className="text-xs text-[color:var(--color-muted)]">
                    {row.submissionCount} photos · Avg {formatAvgStars(row.avgStars)} stars
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-sm">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--color-muted)]">
            Top challengers
          </p>
          <h2 className="font-display text-2xl text-[color:var(--color-foreground)]">
            Highest average ratings
          </h2>
          <p className="text-xs text-[color:var(--color-muted)]">
            Minimum of 10 rated submissions.
          </p>
        </div>

        {topChallengers.length === 0 ? (
          <p className="mt-4 text-sm text-[color:var(--color-muted)]">
            No challengers meet the minimum yet.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {topChallengers.map((row, index) => (
              <div
                key={row.userId}
                className="flex items-center justify-between rounded-2xl border border-white/70 bg-white/90 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-[color:var(--color-muted)]">
                    #{index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[color:var(--color-foreground)]">
                      {row.displayName || row.username}
                    </p>
                    <p className="text-xs text-[color:var(--color-muted)]">
                      @{row.username}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-[color:var(--color-foreground)]">
                    {formatAvgStars(row.avgStars)} stars
                  </p>
                  <p className="text-xs text-[color:var(--color-muted)]">
                    {row.ratedSubmissions} rated submissions
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
