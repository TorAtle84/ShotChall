import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/data/user";
import {
  getPublicChallengeLeaderboard,
  parseLeaderboardRange,
} from "@/lib/data/leaderboards";

type LeaderboardsPageProps = {
  searchParams?: Promise<{
    range?: string;
  }>;
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

export default async function PublicLeaderboardsPage({
  searchParams,
}: LeaderboardsPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  const params = await searchParams;
  const range = parseLeaderboardRange(params?.range);
  const publicRows = await getPublicChallengeLeaderboard(range);

  return (
    <section className="rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-sm">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--color-muted)]">
          Public arena
        </p>
        <h2 className="font-display text-2xl text-[color:var(--color-foreground)]">
          Most returned challenges
        </h2>
        <p className="text-sm text-[color:var(--color-muted)]">
          Challenges with the most photos and the strongest ratings.
        </p>
        <div className="flex flex-wrap gap-2">
          {rangeOptions.map((option) => {
            const isActive = option.value === range;
            return (
              <Link
                key={option.value}
                href={`/leaderboards/public?range=${option.value}`}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition ${isActive
                    ? "bg-[color:var(--color-accent)] text-white"
                    : "border border-white/60 bg-white/80 text-[color:var(--color-muted)] hover:border-[color:var(--color-accent)]"
                  }`}
              >
                {option.label}
              </Link>
            );
          })}
        </div>
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
                  {row.submissionCount} photos | Avg {formatAvgStars(row.avgStars)} stars
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
