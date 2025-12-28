"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type CreateChallengeInput = {
    type: "text" | "photo";
    templateId?: string;
    promptText?: string;
    referenceImagePath?: string;
    transformMode?: string;
    rulesNote?: string;
    visibility: "private" | "public";
    timeLimitHours: number;
    recipientIds?: string[]; // For private challenges
};

export async function createChallenge(input: CreateChallengeInput) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Not authenticated" };
    }

    // Validate time limit
    if (input.timeLimitHours < 6 || input.timeLimitHours > 48) {
        return { error: "Time limit must be between 6 and 48 hours" };
    }

    // For private challenges, must have recipients
    if (input.visibility === "private" && (!input.recipientIds || input.recipientIds.length === 0)) {
        return { error: "Private challenges require at least one recipient" };
    }

    // Max 10 recipients
    if (input.recipientIds && input.recipientIds.length > 10) {
        return { error: "Maximum 10 recipients per challenge" };
    }

    const startAt = new Date();
    const endAt = new Date(startAt.getTime() + input.timeLimitHours * 60 * 60 * 1000);

    // Create the challenge
    const { data: challenge, error: challengeError } = await supabase
        .from("challenges")
        .insert({
            challenger_id: user.id,
            type: input.type,
            template_id: input.templateId || null,
            prompt_text: input.promptText || null,
            reference_image_path: input.referenceImagePath || null,
            transform_mode: input.transformMode || null,
            rules_note: input.rulesNote || null,
            visibility: input.visibility,
            status: "active",
            base_time_limit_hours: input.timeLimitHours,
            start_at: startAt.toISOString(),
            end_at: endAt.toISOString(),
        })
        .select("id")
        .single();

    if (challengeError || !challenge) {
        return { error: challengeError?.message || "Failed to create challenge" };
    }

    // Add challenger as a member
    await supabase.from("challenge_members").insert({
        challenge_id: challenge.id,
        user_id: user.id,
        role: "challenger",
        status: "accepted",
        joined_at: new Date().toISOString(),
    });

    // Add recipients as participants (for private challenges)
    if (input.visibility === "private" && input.recipientIds) {
        const members = input.recipientIds.map((userId) => ({
            challenge_id: challenge.id,
            user_id: userId,
            role: "participant" as const,
            status: "invited" as const,
        }));

        await supabase.from("challenge_members").insert(members);
    }

    revalidatePath("/challenges");
    return { success: true, challengeId: challenge.id };
}

export async function acceptChallenge(challengeId: string) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Not authenticated" };
    }

    const { error } = await supabase
        .from("challenge_members")
        .update({
            status: "accepted",
            joined_at: new Date().toISOString(),
        })
        .eq("challenge_id", challengeId)
        .eq("user_id", user.id)
        .eq("status", "invited");

    if (error) {
        return { error: error.message };
    }

    revalidatePath(`/challenges/${challengeId}`);
    return { success: true };
}

export async function declineChallenge(challengeId: string) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Not authenticated" };
    }

    const { error } = await supabase
        .from("challenge_members")
        .update({ status: "declined" })
        .eq("challenge_id", challengeId)
        .eq("user_id", user.id)
        .eq("status", "invited");

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/challenges");
    return { success: true };
}

export async function joinPublicChallenge(challengeId: string) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Not authenticated" };
    }

    // Check if challenge is public and active
    const { data: challenge } = await supabase
        .from("challenges")
        .select("visibility, status")
        .eq("id", challengeId)
        .single();

    if (!challenge || challenge.visibility !== "public" || challenge.status !== "active") {
        return { error: "Cannot join this challenge" };
    }

    // Check if already a member
    const { data: existing } = await supabase
        .from("challenge_members")
        .select("id")
        .eq("challenge_id", challengeId)
        .eq("user_id", user.id)
        .single();

    if (existing) {
        return { error: "Already joined this challenge" };
    }

    const { error } = await supabase.from("challenge_members").insert({
        challenge_id: challengeId,
        user_id: user.id,
        role: "participant",
        status: "accepted",
        public_consent: true,
        joined_at: new Date().toISOString(),
    });

    if (error) {
        return { error: error.message };
    }

    revalidatePath(`/challenges/${challengeId}`);
    return { success: true };
}

export async function submitToChallenge(challengeId: string, imagePath: string, thumbPath: string) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Not authenticated" };
    }

    // Check if user is an accepted participant
    const { data: member } = await supabase
        .from("challenge_members")
        .select("status")
        .eq("challenge_id", challengeId)
        .eq("user_id", user.id)
        .single();

    if (!member || member.status !== "accepted") {
        return { error: "Must accept the challenge before submitting" };
    }

    // Check if already submitted
    const { data: existing } = await supabase
        .from("submissions")
        .select("id")
        .eq("challenge_id", challengeId)
        .eq("user_id", user.id)
        .single();

    if (existing) {
        return { error: "Already submitted to this challenge" };
    }

    // Create submission
    const { error } = await supabase.from("submissions").insert({
        challenge_id: challengeId,
        user_id: user.id,
        image_path: imagePath,
        image_thumb_path: thumbPath,
    });

    if (error) {
        return { error: error.message };
    }

    // Update member status
    await supabase
        .from("challenge_members")
        .update({ status: "submitted" })
        .eq("challenge_id", challengeId)
        .eq("user_id", user.id);

    revalidatePath(`/challenges/${challengeId}`);
    return { success: true };
}
