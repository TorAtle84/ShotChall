"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { acceptChallenge, declineChallenge } from "@/app/challenges/actions";
import type { Challenge } from "@/lib/data/challenges";

type Props = {
    challenge: Challenge;
    showAccept?: boolean;
};

export default function ChallengeCard({ challenge, showAccept }: Props) {
    const [isPending, startTransition] = useTransition();
    const [handled, setHandled] = useState(false);

    const handleAccept = () => {
        startTransition(async () => {
            const result = await acceptChallenge(challenge.id);
            if (result.success) setHandled(true);
        });
    };

    const handleDecline = () => {
        startTransition(async () => {
            const result = await declineChallenge(challenge.id);
            if (result.success) setHandled(true);
        });
    };

    if (handled) return null;

    const prompt = challenge.promptText || "Photo Challenge";
    const timeLeft = challenge.endAt
        ? getTimeLeft(new Date(challenge.endAt))
        : null;

    const statusColors = {
        active: "text-green-600 bg-green-50",
        ended: "text-gray-600 bg-gray-50",
        draft: "text-yellow-600 bg-yellow-50",
        cancelled: "text-red-600 bg-red-50",
    };

    return (
        <div className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <span
                            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusColors[challenge.status]
                                }`}
                        >
                            {challenge.status}
                        </span>
                        <span className="text-xs text-[color:var(--color-muted)]">
                            {challenge.visibility === "public" ? "Public" : "Private"}
                        </span>
                    </div>
                    <Link href={`/challenges/${challenge.id}`}>
                        <h2 className="mt-2 font-display text-xl text-[color:var(--color-foreground)] hover:underline">
                            {prompt.length > 50 ? prompt.slice(0, 50) + "..." : prompt}
                        </h2>
                    </Link>
                    {challenge.challengerUsername && (
                        <p className="mt-1 text-sm text-[color:var(--color-muted)]">
                            by @{challenge.challengerUsername}
                        </p>
                    )}
                    {timeLeft && (
                        <p className="mt-2 text-sm text-[color:var(--color-accent)]">
                            {timeLeft}
                        </p>
                    )}
                </div>

                {showAccept && (
                    <div className="flex gap-2">
                        <button
                            onClick={handleDecline}
                            disabled={isPending}
                            className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
                        >
                            Decline
                        </button>
                        <button
                            onClick={handleAccept}
                            disabled={isPending}
                            className="rounded-xl bg-[color:var(--color-accent)] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[color:var(--color-accent-strong)] disabled:opacity-50"
                        >
                            {isPending ? "..." : "Accept"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

function getTimeLeft(endAt: Date): string {
    const now = new Date();
    const diff = endAt.getTime() - now.getTime();

    if (diff <= 0) return "Ended";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
        const days = Math.floor(hours / 24);
        return `${days}d ${hours % 24}h left`;
    }

    return `${hours}h ${minutes}m left`;
}
