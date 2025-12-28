import Link from "next/link";
import { getTodaysDailyChallenge, getUserStreak, getStreakBadge } from "@/lib/data/daily";
import { getCurrentUser } from "@/lib/data/user";

export default async function DailyChallengeCard() {
    const user = await getCurrentUser();
    if (!user) return null;

    const daily = await getTodaysDailyChallenge(user.timezone || "UTC");
    const streak = await getUserStreak(user.id);
    const badge = getStreakBadge(streak);

    const badgeEmojis = {
        none: "",
        bronze: "🥉",
        silver: "🥈",
        gold: "🥇",
        diamond: "💎",
    };

    return (
        <section className="rounded-[28px] border border-orange-200 bg-gradient-to-br from-orange-50 to-rose-50 p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-600">
                            Daily Challenge
                        </p>
                        {streak > 0 && (
                            <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-600">
                                🔥 {streak} day streak {badgeEmojis[badge]}
                            </span>
                        )}
                    </div>
                    {daily ? (
                        <>
                            <h2 className="font-display text-xl text-[color:var(--color-foreground)]">
                                {daily.promptText}
                            </h2>
                            <p className="text-sm text-[color:var(--color-muted)]">
                                {daily.participantCount} participants • {daily.submissionCount} submissions
                            </p>
                        </>
                    ) : (
                        <p className="text-sm text-[color:var(--color-muted)]">
                            No daily challenge yet. Check back soon!
                        </p>
                    )}
                </div>
                {daily && (
                    <Link
                        href={`/challenges/${daily.id}`}
                        className="rounded-2xl bg-[color:var(--color-accent)] px-4 py-2 text-sm font-semibold text-white shadow-md shadow-orange-200/60"
                    >
                        Join
                    </Link>
                )}
            </div>
        </section>
    );
}
