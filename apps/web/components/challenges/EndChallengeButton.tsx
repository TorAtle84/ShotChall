"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { endChallenge } from "@/app/submissions/actions";

type Props = {
    challengeId: string;
};

export default function EndChallengeButton({ challengeId }: Props) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleEnd = () => {
        if (!confirm("Are you sure you want to end this challenge? This will pick a winner based on current ratings.")) {
            return;
        }

        startTransition(async () => {
            const result = await endChallenge(challengeId);
            if (result.success) {
                router.refresh();
            }
        });
    };

    return (
        <button
            onClick={handleEnd}
            disabled={isPending}
            className="rounded-2xl border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
        >
            {isPending ? "Ending..." : "End Challenge"}
        </button>
    );
}
