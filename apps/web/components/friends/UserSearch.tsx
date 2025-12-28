"use client";

import { useState, useTransition } from "react";
import { searchUsers } from "@/lib/data/friends";
import { sendFriendRequest } from "@/app/friends/actions";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type SearchResult = {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
    isPublicChallenger: boolean;
};

export default function UserSearch() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());

    const handleSearch = async () => {
        if (query.length < 2) {
            setResults([]);
            return;
        }

        setIsSearching(true);
        const supabase = createSupabaseBrowserClient();

        const { data } = await supabase
            .from("profiles")
            .select("id, username, display_name, avatar_url, is_public_challenger")
            .ilike("username", `%${query}%`)
            .limit(10);

        if (data) {
            setResults(
                data.map((p) => ({
                    id: p.id,
                    username: p.username,
                    displayName: p.display_name,
                    avatarUrl: p.avatar_url,
                    isPublicChallenger: p.is_public_challenger,
                }))
            );
        }
        setIsSearching(false);
    };

    const handleSendRequest = async (userId: string) => {
        const result = await sendFriendRequest(userId);
        if (result.success) {
            setSentRequests((prev) => new Set(prev).add(userId));
        }
    };

    return (
        <section className="space-y-4">
            <div className="flex gap-2">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="Search by username..."
                    className="flex-1 rounded-2xl border border-white/60 bg-white/80 px-4 py-3 text-sm placeholder:text-[color:var(--color-muted)] focus:border-[color:var(--color-accent)] focus:outline-none"
                />
                <button
                    onClick={handleSearch}
                    disabled={isSearching || query.length < 2}
                    className="rounded-2xl bg-[color:var(--color-accent)] px-5 py-3 text-sm font-semibold text-white shadow-md shadow-orange-200/60 transition hover:bg-[color:var(--color-accent-strong)] disabled:opacity-50"
                >
                    {isSearching ? "..." : "Search"}
                </button>
            </div>

            {results.length > 0 && (
                <div className="space-y-3">
                    {results.map((user) => (
                        <div
                            key={user.id}
                            className="flex items-center justify-between rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm"
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-purple-400 text-sm font-bold text-white">
                                    {user.username.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-semibold text-[color:var(--color-foreground)]">
                                        {user.displayName || user.username}
                                    </p>
                                    <p className="text-xs text-[color:var(--color-muted)]">
                                        @{user.username}
                                        {user.isPublicChallenger && (
                                            <span className="ml-2 text-orange-500">• Public Challenger</span>
                                        )}
                                    </p>
                                </div>
                            </div>
                            {sentRequests.has(user.id) ? (
                                <span className="text-xs font-semibold text-green-600">
                                    Request sent!
                                </span>
                            ) : (
                                <button
                                    onClick={() => handleSendRequest(user.id)}
                                    className="rounded-xl bg-[color:var(--color-accent)] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[color:var(--color-accent-strong)]"
                                >
                                    Add Friend
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
