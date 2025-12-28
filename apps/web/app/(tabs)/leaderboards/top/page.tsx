import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/data/user";
import { getTopChallengers } from "@/lib/data/leaderboards";

function formatAvgStars(value: number | null) {
  if (value === null) {
    return "--";
  }
  return value.toFixed(1);
}

export default async function TopChallengersPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  const topChallengers = await getTopChallengers();

  return (
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
  );
}
