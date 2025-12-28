import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/data/user";
import { getMyChallenges, getReceivedChallenges } from "@/lib/data/challenges";
import ChallengeCard from "@/components/challenges/ChallengeCard";

export default async function ChallengesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const [myChallenges, receivedChallenges] = await Promise.all([
    getMyChallenges(),
    getReceivedChallenges(),
  ]);

  const pendingChallenges = receivedChallenges.filter(
    (c) => c.status === "active"
  );
  const activeChallenges = myChallenges.filter((c) => c.status === "active");
  const endedChallenges = [...myChallenges, ...receivedChallenges].filter(
    (c) => c.status === "ended"
  );

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

      {pendingChallenges.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--color-muted)]">
            Invites ({pendingChallenges.length})
          </h2>
          <div className="grid gap-4">
            {pendingChallenges.map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                showAccept
              />
            ))}
          </div>
        </section>
      )}

      <section className="space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--color-muted)]">
          Active Challenges ({activeChallenges.length})
        </h2>
        {activeChallenges.length === 0 ? (
          <div className="rounded-3xl border border-white/70 bg-white/80 p-6 text-center shadow-sm">
            <p className="text-sm text-[color:var(--color-muted)]">
              No active challenges. Create one to get started!
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {activeChallenges.map((challenge) => (
              <ChallengeCard key={challenge.id} challenge={challenge} />
            ))}
          </div>
        )}
      </section>

      {endedChallenges.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--color-muted)]">
            Completed ({endedChallenges.length})
          </h2>
          <div className="grid gap-4">
            {endedChallenges.slice(0, 5).map((challenge) => (
              <ChallengeCard key={challenge.id} challenge={challenge} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
