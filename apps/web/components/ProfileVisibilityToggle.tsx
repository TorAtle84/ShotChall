"use client";

import { useState, useTransition } from "react";
import { updateProfileVisibility } from "@/app/friends/actions";

type Props = {
    initialIsPublic: boolean;
    initialIsPublicChallenger: boolean;
};

export default function ProfileVisibilityToggle({
    initialIsPublic,
    initialIsPublicChallenger,
}: Props) {
    const [isPublic, setIsPublic] = useState(initialIsPublic);
    const [isPublicChallenger, setIsPublicChallenger] = useState(initialIsPublicChallenger);
    const [isPending, startTransition] = useTransition();

    const handleToggle = (field: "public" | "challenger") => {
        const newIsPublic = field === "public" ? !isPublic : isPublic;
        const newIsPublicChallenger = field === "challenger" ? !isPublicChallenger : isPublicChallenger;

        if (field === "public") setIsPublic(newIsPublic);
        if (field === "challenger") setIsPublicChallenger(newIsPublicChallenger);

        startTransition(async () => {
            await updateProfileVisibility(newIsPublic, newIsPublicChallenger);
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-semibold text-[color:var(--color-foreground)]">
                        Public Profile
                    </p>
                    <p className="text-xs text-[color:var(--color-muted)]">
                        Others can see your challenges and stats
                    </p>
                </div>
                <button
                    onClick={() => handleToggle("public")}
                    disabled={isPending}
                    className={`relative h-6 w-11 rounded-full transition ${isPublic ? "bg-[color:var(--color-accent)]" : "bg-gray-300"
                        }`}
                >
                    <span
                        className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${isPublic ? "translate-x-5" : "translate-x-0"
                            }`}
                    />
                </button>
            </div>

            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-semibold text-[color:var(--color-foreground)]">
                        Public Challenger
                    </p>
                    <p className="text-xs text-[color:var(--color-muted)]">
                        Anyone can send you public challenges
                    </p>
                </div>
                <button
                    onClick={() => handleToggle("challenger")}
                    disabled={isPending}
                    className={`relative h-6 w-11 rounded-full transition ${isPublicChallenger ? "bg-[color:var(--color-accent)]" : "bg-gray-300"
                        }`}
                >
                    <span
                        className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${isPublicChallenger ? "translate-x-5" : "translate-x-0"
                            }`}
                    />
                </button>
            </div>
        </div>
    );
}
