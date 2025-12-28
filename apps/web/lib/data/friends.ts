import { createSupabaseServerClient } from "@/lib/supabase/server";

export type FriendshipStatus = "pending" | "accepted" | "declined";

export type Friendship = {
    id: string;
    requesterId: string;
    addresseeId: string;
    status: FriendshipStatus;
    createdAt: string;
    requester?: {
        id: string;
        username: string;
        displayName: string;
        avatarUrl: string | null;
    };
    addressee?: {
        id: string;
        username: string;
        displayName: string;
        avatarUrl: string | null;
    };
};

export type Friend = {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
    friendshipId: string;
};

export async function getFriends(): Promise<Friend[]> {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from("friendships")
        .select(`
      id,
      requester_id,
      addressee_id,
      requester:profiles!friendships_requester_id_fkey(id, username, display_name, avatar_url),
      addressee:profiles!friendships_addressee_id_fkey(id, username, display_name, avatar_url)
    `)
        .eq("status", "accepted")
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

    if (error || !data) return [];

    return data.map((f: any) => {
        const isRequester = f.requester_id === user.id;
        const friend = isRequester ? f.addressee : f.requester;
        return {
            id: friend.id,
            username: friend.username,
            displayName: friend.display_name,
            avatarUrl: friend.avatar_url,
            friendshipId: f.id,
        };
    });
}

export async function getPendingFriendRequests(): Promise<Friendship[]> {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from("friendships")
        .select(`
      id,
      requester_id,
      addressee_id,
      status,
      created_at,
      requester:profiles!friendships_requester_id_fkey(id, username, display_name, avatar_url)
    `)
        .eq("addressee_id", user.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

    if (error || !data) return [];

    return data.map((f: any) => ({
        id: f.id,
        requesterId: f.requester_id,
        addresseeId: f.addressee_id,
        status: f.status,
        createdAt: f.created_at,
        requester: {
            id: f.requester.id,
            username: f.requester.username,
            displayName: f.requester.display_name,
            avatarUrl: f.requester.avatar_url,
        },
    }));
}

export async function getSentFriendRequests(): Promise<Friendship[]> {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from("friendships")
        .select(`
      id,
      requester_id,
      addressee_id,
      status,
      created_at,
      addressee:profiles!friendships_addressee_id_fkey(id, username, display_name, avatar_url)
    `)
        .eq("requester_id", user.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

    if (error || !data) return [];

    return data.map((f: any) => ({
        id: f.id,
        requesterId: f.requester_id,
        addresseeId: f.addressee_id,
        status: f.status,
        createdAt: f.created_at,
        addressee: {
            id: f.addressee.id,
            username: f.addressee.username,
            displayName: f.addressee.display_name,
            avatarUrl: f.addressee.avatar_url,
        },
    }));
}

export async function getFriendshipStatus(
    otherUserId: string
): Promise<"none" | "pending_sent" | "pending_received" | "accepted"> {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return "none";

    const { data, error } = await supabase
        .from("friendships")
        .select("id, requester_id, status")
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
        .or(`requester_id.eq.${otherUserId},addressee_id.eq.${otherUserId}`);

    if (error || !data || data.length === 0) return "none";

    // Find the friendship between these two users
    const friendship = data.find(
        (f) =>
            (f.requester_id === user.id || f.requester_id === otherUserId)
    );

    if (!friendship) return "none";

    if (friendship.status === "accepted") return "accepted";
    if (friendship.requester_id === user.id) return "pending_sent";
    return "pending_received";
}

export async function searchUsers(query: string) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || query.length < 2) return [];

    const { data, error } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url, is_public_challenger")
        .ilike("username", `%${query}%`)
        .neq("id", user.id)
        .limit(20);

    if (error || !data) return [];

    return data.map((p) => ({
        id: p.id,
        username: p.username,
        displayName: p.display_name,
        avatarUrl: p.avatar_url,
        isPublicChallenger: p.is_public_challenger,
    }));
}
