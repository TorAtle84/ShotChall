import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/data/user";
import { getChallenge } from "@/lib/data/challenges";
import { getSubmissions, getWinner } from "@/lib/data/submissions";
import SubmissionCard from "@/components/challenges/SubmissionCard";
import EndChallengeButton from "@/components/challenges/EndChallengeButton";
import PhotoSubmit from "@/components/challenges/PhotoSubmit";

type Props = {
    params: Promise<{ id: string }>;
};

export default async function ChallengeDetailPage({ params }: Props) {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) redirect("/auth/login");

    const challenge = await getChallenge(id);
    if (!challenge) notFound();

    const submissions = await getSubmissions(id);
    const winner = challenge.status === "ended" ? await getWinner(id) : null;

    const prompt = challenge.promptText || "Photo Challenge";
    const endAt = challenge.endAt ? new Date(challenge.endAt) : null;
    const isActive = challenge.status === "active";
    const isEnded = challenge.status === "ended";
    const isPublic = challenge.visibility === "public";
    const isChallenger = challenge.challengerId === user.id;

    return (
        <div className="space-y-6">
            <header className="space-y-2">
                <Link
                    href="/challenges"
                    className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-muted)] hover:underline"
                >
                    ← Back to Challenges
                </Link>
                <h1 className="font-display text-3xl text-[color:var(--color-foreground)]">
                    {prompt}
                </h1>
                <div className="flex items-center gap-3 text-sm text-[color:var(--color-muted)]">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${isActive ? "bg-green-50 text-green-600" : "bg-gray-50 text-gray-600"
                        }`}>
                        {challenge.status}
                    </span>
                    <span>{isPublic ? "Public" : "Private"}</span>
                    {challenge.challengerUsername && (
                        <span>by @{challenge.challengerUsername}</span>
                    )}
                </div>
            </header>

            {challenge.rulesNote && (
                <section className="rounded-[28px] border border-white/70 bg-white/80 p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
                        Rules
                    </p>
                    <p className="mt-2 text-sm text-[color:var(--color-foreground)]">
                        {challenge.rulesNote}
                    </p>
                </section>
            )}

            <section className="rounded-[28px] border border-white/70 bg-white/80 p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
                    Time
                </p>
                <div className="mt-3 flex items-center gap-4">
                    <div>
                        <p className="text-sm text-[color:var(--color-muted)]">Duration</p>
                        <p className="font-display text-xl text-[color:var(--color-foreground)]">
                            {challenge.baseTimeLimitHours}h
                        </p>
                    </div>
                    {endAt && (
                        <div>
                            <p className="text-sm text-[color:var(--color-muted)]">
                                {isEnded ? "Ended" : "Ends"}
                            </p>
                            <p className="font-display text-xl text-[color:var(--color-foreground)]">
                                {endAt.toLocaleString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </p>
                        </div>
                    )}
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--color-muted)]">
                    Submissions ({submissions.length})
                </h2>
                {submissions.length === 0 ? (
                    <div className="rounded-3xl border border-white/70 bg-white/80 p-6 text-center shadow-sm">
                        <p className="text-sm text-[color:var(--color-muted)]">
                            No submissions yet. Be the first to submit!
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {submissions.map((submission) => (
                            <SubmissionCard
                                key={submission.id}
                                submission={submission}
                                isPublic={isPublic}
                                isWinner={winner?.id === submission.id}
                            />
                        ))}
                    </div>
                )}
            </section>

            <div className="space-y-4">
                {isActive && !isChallenger && (
                    <PhotoSubmit challengeId={id} userId={user.id} />
                )}
                {isActive && isChallenger && (
                    <EndChallengeButton challengeId={id} />
                )}
            </div>
        </div>
    );
}
