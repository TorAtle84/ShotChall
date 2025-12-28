import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/data/user";

export default async function LeaderboardsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <Link
          href="/leaderboards/friends"
          className="group rounded-3xl border border-white/70 bg-white/80 p-5 shadow-sm transition hover:-translate-y-1 hover:border-[color:var(--color-accent)]"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--color-muted)]">
            Friends wins
          </p>
          <h2 className="mt-3 font-display text-xl text-[color:var(--color-foreground)]">
            Private challenge winners
          </h2>
          <p className="mt-2 text-sm text-[color:var(--color-muted)]">
            See who is on top inside your friend circle.
          </p>
          <p className="mt-4 text-xs font-semibold text-[color:var(--color-accent)]">
            View friends board
          </p>
        </Link>

        <Link
          href="/leaderboards/public"
          className="group rounded-3xl border border-white/70 bg-white/80 p-5 shadow-sm transition hover:-translate-y-1 hover:border-[color:var(--color-accent)]"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--color-muted)]">
            Public arena
          </p>
          <h2 className="mt-3 font-display text-xl text-[color:var(--color-foreground)]">
            Most returned challenges
          </h2>
          <p className="mt-2 text-sm text-[color:var(--color-muted)]">
            Track the challenges everyone is jumping into.
          </p>
          <p className="mt-4 text-xs font-semibold text-[color:var(--color-accent)]">
            View public board
          </p>
        </Link>

        <Link
          href="/leaderboards/top"
          className="group rounded-3xl border border-white/70 bg-white/80 p-5 shadow-sm transition hover:-translate-y-1 hover:border-[color:var(--color-accent)]"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--color-muted)]">
            Top challengers
          </p>
          <h2 className="mt-3 font-display text-xl text-[color:var(--color-foreground)]">
            Highest average ratings
          </h2>
          <p className="mt-2 text-sm text-[color:var(--color-muted)]">
            Celebrate the best rated photographers overall.
          </p>
          <p className="mt-4 text-xs font-semibold text-[color:var(--color-accent)]">
            View top challengers
          </p>
        </Link>
      </section>

      <section className="rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-sm">
        <h3 className="font-display text-2xl text-[color:var(--color-foreground)]">
          Pick a leaderboard to dive deeper.
        </h3>
        <p className="mt-2 text-sm text-[color:var(--color-muted)]">
          Each board lets you filter the time range and focus on the results
          that matter most.
        </p>
      </section>
    </div>
  );
}
