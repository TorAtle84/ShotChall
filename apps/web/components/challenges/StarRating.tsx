"use client";

import { useState, useTransition } from "react";
import { rateSubmission } from "@/app/submissions/actions";

type Props = {
    submissionId: string;
    currentRating: number | null;
    avgRating: number | null;
    ratingCount: number;
    isPublic: boolean;
};

export default function StarRating({
    submissionId,
    currentRating,
    avgRating,
    ratingCount,
    isPublic,
}: Props) {
    const [isPending, startTransition] = useTransition();
    const [rating, setRating] = useState(currentRating);
    const [hoveredStar, setHoveredStar] = useState<number | null>(null);

    const minStars = isPublic ? 1 : 0;
    const maxStars = 5;

    const handleRate = (stars: number) => {
        if (stars < minStars) return;

        setRating(stars);
        startTransition(async () => {
            await rateSubmission(submissionId, stars);
        });
    };

    const displayRating = hoveredStar ?? rating ?? 0;

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-1">
                {Array.from({ length: maxStars }, (_, i) => {
                    const starValue = i + 1;
                    const isFilled = starValue <= displayRating;

                    return (
                        <button
                            key={i}
                            onClick={() => handleRate(starValue)}
                            onMouseEnter={() => setHoveredStar(starValue)}
                            onMouseLeave={() => setHoveredStar(null)}
                            disabled={isPending}
                            className={`text-2xl transition ${isFilled ? "text-yellow-400" : "text-gray-300"
                                } hover:scale-110 disabled:opacity-50`}
                        >
                            ★
                        </button>
                    );
                })}
                {!isPublic && (
                    <button
                        onClick={() => handleRate(0)}
                        disabled={isPending}
                        className={`ml-2 rounded px-2 py-1 text-xs ${rating === 0
                                ? "bg-gray-200 text-gray-700"
                                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                            }`}
                    >
                        0
                    </button>
                )}
            </div>

            {ratingCount > 0 && avgRating !== null && (
                <p className="text-xs text-[color:var(--color-muted)]">
                    {avgRating.toFixed(1)} avg • {ratingCount} {ratingCount === 1 ? "rating" : "ratings"}
                </p>
            )}
        </div>
    );
}
