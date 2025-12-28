"use client";

import { useState, useTransition } from "react";
import { acceptFriendRequest, declineFriendRequest } from "@/app/friends/actions";

type Friendship = {
    id: string;
    requesterId: string;
    requester?: {
        id: string;
        username: string;
        displayName: string;
        avatarUrl: string | null;
    };
};

export default function PendingRequests({ requests }: { requests: Friendship[] }) {
    return (
        <div className="space-y-3">
            {requests.map((request) => (
                <RequestCard key={request.id} request={request} />
            ))}
        </div>
    );
}

function RequestCard({ request }: { request: Friendship }) {
    const [isPending, startTransition] = useTransition();
    const [handled, setHandled] = useState(false);

    const handleAccept = () => {
        startTransition(async () => {
            const result = await acceptFriendRequest(request.id);
            if (result.success) setHandled(true);
        });
    };

    const handleDecline = () => {
        startTransition(async () => {
            const result = await declineFriendRequest(request.id);
            if (result.success) setHandled(true);
        });
    };

    if (handled) return null;

    const user = request.requester;
    if (!user) return null;

    return (
        <div className="flex items-center justify-between rounded-2xl border border-orange-100 bg-orange-50/50 p-4 shadow-sm">
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-rose-400 text-sm font-bold text-white">
                    {user.username.charAt(0).toUpperCase()}
                </div>
                <div>
                    <p className="font-semibold text-[color:var(--color-foreground)]">
                        {user.displayName || user.username}
                    </p>
                    <p className="text-xs text-[color:var(--color-muted)]">
                        @{user.username} wants to be your friend
                    </p>
                </div>
            </div>
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
        </div>
    );
}
