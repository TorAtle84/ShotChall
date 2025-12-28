"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function sendFriendRequest(addresseeId: string) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Not authenticated" };
    }

    if (user.id === addresseeId) {
        return { error: "Cannot send request to yourself" };
    }

    // Check if friendship already exists
    const { data: existing } = await supabase
        .from("friendships")
        .select("id, status")
        .or(`and(requester_id.eq.${user.id},addressee_id.eq.${addresseeId}),and(requester_id.eq.${addresseeId},addressee_id.eq.${user.id})`)
        .single();

    if (existing) {
        return { error: "Friend request already exists" };
    }

    const { error } = await supabase.from("friendships").insert({
        requester_id: user.id,
        addressee_id: addresseeId,
        status: "pending",
    });

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/friends");
    return { success: true };
}

export async function acceptFriendRequest(friendshipId: string) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Not authenticated" };
    }

    const { error } = await supabase
        .from("friendships")
        .update({ status: "accepted" })
        .eq("id", friendshipId)
        .eq("addressee_id", user.id)
        .eq("status", "pending");

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/friends");
    return { success: true };
}

export async function declineFriendRequest(friendshipId: string) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Not authenticated" };
    }

    const { error } = await supabase
        .from("friendships")
        .update({ status: "declined" })
        .eq("id", friendshipId)
        .eq("addressee_id", user.id)
        .eq("status", "pending");

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/friends");
    return { success: true };
}

export async function removeFriend(friendshipId: string) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Not authenticated" };
    }

    const { error } = await supabase
        .from("friendships")
        .delete()
        .eq("id", friendshipId)
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/friends");
    return { success: true };
}

export async function updateProfileVisibility(isPublic: boolean, isPublicChallenger: boolean) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Not authenticated" };
    }

    const { error } = await supabase
        .from("profiles")
        .update({
            is_public: isPublic,
            is_public_challenger: isPublicChallenger,
        })
        .eq("id", user.id);

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/profile");
    return { success: true };
}
