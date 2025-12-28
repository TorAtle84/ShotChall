"use client";

import { useTransition } from "react";
import { toggleReaction } from "@/app/submissions/actions";
import type { ReactionType } from "@/lib/data/submissions";

type Props = {
    submissionId: string;
    reactions: {
        flame: number;
        heart: number;
        wow: number;
    };
    userReactions: ReactionType[];
};

const reactionIcons: Record<ReactionType, { icon: string; label: string }> = {
    flame: { icon: "🔥", label: "Fire" },
    heart: { icon: "❤️", label: "Love" },
    wow: { icon: "😮", label: "Wow" },
};

export default function ReactionButtons({
    submissionId,
    reactions,
    userReactions,
}: Props) {
    const [isPending, startTransition] = useTransition();

    const handleToggle = (reaction: ReactionType) => {
        startTransition(async () => {
            await toggleReaction(submissionId, reaction);
        });
    };

    return (
        <div className="flex gap-2">
            {(Object.keys(reactionIcons) as ReactionType[]).map((reaction) => {
                const isActive = userReactions.includes(reaction);
                const count = reactions[reaction];
                const { icon, label } = reactionIcons[reaction];

                return (
                    <button
                        key={reaction}
                        onClick={() => handleToggle(reaction)}
                        disabled={isPending}
                        aria-label={label}
                        className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-sm transition ${isActive
                                ? "bg-orange-100 text-orange-600"
                                : "bg-white/80 text-gray-600 hover:bg-gray-100"
                            } disabled:opacity-50`}
                    >
                        <span>{icon}</span>
                        {count > 0 && <span className="font-medium">{count}</span>}
                    </button>
                );
            })}
        </div>
    );
}
