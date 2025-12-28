import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/data/user";
import { getUserStreak } from "@/lib/data/daily";
import DailyChallengeCard from "@/components/DailyChallengeCard";

export default async function HomePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const streak = await getUserStreak(user.id);

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
            href="/challenges"
            className="rounded-2xl border border-white/60 bg-white/80 px-5 py-3 text-sm font-semibold text-[color:var(--color-muted)] transition hover:border-[color:var(--color-accent)]"
          >
            Your challenges
          </Link>
          <Link
            href="/leaderboards"
            className="rounded-2xl border border-white/60 bg-white/80 px-5 py-3 text-sm font-semibold text-[color:var(--color-muted)] transition hover:border-[color:var(--color-accent)]"
          >
            Leaderboards
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-white/70 bg-white/70 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--color-muted)]">
            Streak
          </p>
          <p className="mt-3 text-2xl font-semibold text-[color:var(--color-foreground)]">
            {streak > 0 ? `🔥 ${streak}` : "0"}
          </p>
          <p className="text-sm text-[color:var(--color-muted)]">Days in a row</p>
        </div>
        <div className="rounded-3xl border border-white/70 bg-white/70 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--color-muted)]">
            Welcome
          </p>
          <p className="mt-3 text-2xl font-semibold text-[color:var(--color-foreground)]">
            @{user.username}
          </p>
          <p className="text-sm text-[color:var(--color-muted)]">Ready to shoot?</p>
        </div>
        <div className="rounded-3xl border border-white/70 bg-white/70 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--color-muted)]">
            Friends
          </p>
          <Link
            href="/friends"
            className="mt-3 block text-2xl font-semibold text-[color:var(--color-accent)] hover:underline"
          >
            Find →
          </Link>
          <p className="text-sm text-[color:var(--color-muted)]">Add challengers</p>
        </div>
      </section>

      <DailyChallengeCard />
    </div>
  );
}
