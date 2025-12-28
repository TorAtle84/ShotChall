import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/data/user";
import {
  getFriendLeaderboard,
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

export default async function FriendsLeaderboardsPage({
  searchParams,
}: LeaderboardsPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  const params = await searchParams;
  const range = parseLeaderboardRange(params?.range);
  const friendRows = await getFriendLeaderboard(user.id, range);

  return (
    <section className="rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-sm">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--color-muted)]">
          Friends wins
        </p>
        <h2 className="font-display text-2xl text-[color:var(--color-foreground)]">
          Private challenge winners
        </h2>
        <p className="text-sm text-[color:var(--color-muted)]">
          Filter the time range to see who is leading in your circle.
        </p>
        <div className="flex flex-wrap gap-2">
          {rangeOptions.map((option) => {
            const isActive = option.value === range;
            return (
              <Link
                key={option.value}
                href={`/leaderboards/friends?range=${option.value}`}
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
  );
}
