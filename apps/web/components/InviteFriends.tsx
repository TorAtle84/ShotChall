"use client";

import { useState } from "react";

type InviteFriendsProps = {
    userId: string;
    username: string;
};

export default function InviteFriends({ userId, username }: InviteFriendsProps) {
    const [copied, setCopied] = useState(false);

    const inviteUrl =
        typeof window !== "undefined"
            ? `${window.location.origin}/invite/${encodeURIComponent(username)}`
            : "";

    const shareUrl =
        typeof window !== "undefined"
            ? `${window.location.origin}/?ref=${userId.slice(0, 8)}`
            : "";

    const handleCopyInvite = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    const handleShare = async () => {
        const shareData = {
            title: "Join me on ShotChall!",
            text: `Challenge me on ShotChall - the photo challenge app!`,
            url: shareUrl,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                // User cancelled or error - fall back to copy
                handleCopyInvite();
            }
        } else {
            handleCopyInvite();
        }
    };

    return (
        <section className="rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h2 className="font-display text-xl text-[color:var(--color-foreground)]">
                        Invite Friends
                    </h2>
                    <p className="mt-2 text-sm text-[color:var(--color-muted)]">
                        Share your link and challenge friends to join ShotChall!
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={handleCopyInvite}
                        className="rounded-2xl border border-white/60 bg-white/80 px-4 py-2 text-sm font-semibold text-[color:var(--color-muted)] transition hover:border-[color:var(--color-accent)]"
                    >
                        {copied ? "Copied!" : "Copy link"}
                    </button>
                    <button
                        type="button"
                        onClick={handleShare}
                        className="rounded-2xl bg-[color:var(--color-accent)] px-4 py-2 text-sm font-semibold text-white shadow-md shadow-orange-200/60"
                    >
                        Share
                    </button>
                </div>
            </div>
        </section>
    );
}
