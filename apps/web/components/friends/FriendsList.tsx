"use client";

import { useState, useTransition } from "react";
import { removeFriend } from "@/app/friends/actions";

type Friend = {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
    friendshipId: string;
};

export default function FriendsList({ friends }: { friends: Friend[] }) {
    return (
        <div className="space-y-3">
            {friends.map((friend) => (
                <FriendCard key={friend.id} friend={friend} />
            ))}
        </div>
    );
}

function FriendCard({ friend }: { friend: Friend }) {
    const [isPending, startTransition] = useTransition();
    const [removed, setRemoved] = useState(false);

    const handleRemove = () => {
        startTransition(async () => {
            const result = await removeFriend(friend.friendshipId);
            if (result.success) {
                setRemoved(true);
            }
        });
    };

    if (removed) return null;

    return (
        <div className="flex items-center justify-between rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm">
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-rose-400 text-sm font-bold text-white">
                    {friend.username.charAt(0).toUpperCase()}
                </div>
                <div>
                    <p className="font-semibold text-[color:var(--color-foreground)]">
                        {friend.displayName || friend.username}
                    </p>
                    <p className="text-xs text-[color:var(--color-muted)]">
                        @{friend.username}
                    </p>
                </div>
            </div>
            <button
                onClick={handleRemove}
                disabled={isPending}
                className="rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
            >
                {isPending ? "..." : "Remove"}
            </button>
        </div>
    );
}
