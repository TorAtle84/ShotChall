"use client";

import Image from "next/image";
import StarRating from "./StarRating";
import ReactionButtons from "./ReactionButtons";
import type { Submission } from "@/lib/data/submissions";

type Props = {
    submission: Submission;
    isPublic: boolean;
    isWinner?: boolean;
};

const victoryPhrases = [
    "You won! 🏆",
    "Champion! 🌟",
    "Victory! 🎉",
    "Shot of the day! 📸",
    "Best shot! 🔥",
];

export default function SubmissionCard({ submission, isPublic, isWinner }: Props) {
    const victoryPhrase = isWinner
        ? victoryPhrases[Math.floor(Math.random() * victoryPhrases.length)]
        : null;

    return (
        <div className={`rounded-3xl border shadow-sm overflow-hidden ${isWinner
                ? "border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50"
                : "border-white/70 bg-white/80"
            }`}>
            {isWinner && (
                <div className="bg-gradient-to-r from-yellow-400 to-orange-400 px-4 py-2 text-center">
                    <span className="font-display text-lg font-bold text-white">
                        {victoryPhrase}
                    </span>
                </div>
            )}

            <div className="relative aspect-square bg-gray-100">
                {submission.imagePath ? (
                    <Image
                        src={submission.imagePath}
                        alt={`Submission by ${submission.username}`}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center">
                        <span className="text-[color:var(--color-muted)]">No image</span>
                    </div>
                )}

                {/* Reaction overlay */}
                <div className="absolute bottom-3 left-3 flex gap-2">
                    {submission.reactions.flame > 0 && (
                        <span className="rounded-full bg-black/50 px-2 py-1 text-sm text-white">
                            🔥 {submission.reactions.flame}
                        </span>
                    )}
                    {submission.reactions.heart > 0 && (
                        <span className="rounded-full bg-black/50 px-2 py-1 text-sm text-white">
                            ❤️ {submission.reactions.heart}
                        </span>
                    )}
                    {submission.reactions.wow > 0 && (
                        <span className="rounded-full bg-black/50 px-2 py-1 text-sm text-white">
                            😮 {submission.reactions.wow}
                        </span>
                    )}
                </div>
            </div>

            <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-rose-400 text-xs font-bold text-white">
                            {submission.username.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-[color:var(--color-foreground)]">
                            @{submission.username}
                        </span>
                    </div>
                    {submission.avgRating !== null && (
                        <span className="text-sm font-semibold text-yellow-500">
                            ★ {submission.avgRating.toFixed(1)}
                        </span>
                    )}
                </div>

                <StarRating
                    submissionId={submission.id}
                    currentRating={submission.userRating}
                    avgRating={submission.avgRating}
                    ratingCount={submission.ratingCount}
                    isPublic={isPublic}
                />

                <ReactionButtons
                    submissionId={submission.id}
                    reactions={submission.reactions}
                    userReactions={submission.userReactions}
                />
            </div>
        </div>
    );
}
