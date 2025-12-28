import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/data/user";
import { getFriends, getPendingFriendRequests } from "@/lib/data/friends";
import FriendsList from "@/components/friends/FriendsList";
import PendingRequests from "@/components/friends/PendingRequests";
import UserSearch from "@/components/friends/UserSearch";

export default async function FriendsPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/auth/login");

    const [friends, pendingRequests] = await Promise.all([
        getFriends(),
        getPendingFriendRequests(),
    ]);

    return (
        <div className="space-y-6">
            <header className="space-y-2">
                <h1 className="font-display text-3xl text-[color:var(--color-foreground)]">
                    Friends
                </h1>
                <p className="text-sm text-[color:var(--color-muted)]">
                    Add friends to challenge them in private photo battles.
                </p>
            </header>

            <UserSearch />

            {pendingRequests.length > 0 && (
                <section className="space-y-4">
                    <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--color-muted)]">
                        Pending Requests ({pendingRequests.length})
                    </h2>
                    <PendingRequests requests={pendingRequests} />
                </section>
            )}

            <section className="space-y-4">
                <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--color-muted)]">
                    Your Friends ({friends.length})
                </h2>
                {friends.length === 0 ? (
                    <div className="rounded-[28px] border border-white/70 bg-white/80 p-6 text-center shadow-sm">
                        <p className="text-sm text-[color:var(--color-muted)]">
                            No friends yet. Search for users to add them!
                        </p>
                    </div>
                ) : (
                    <FriendsList friends={friends} />
                )}
            </section>
        </div>
    );
}
