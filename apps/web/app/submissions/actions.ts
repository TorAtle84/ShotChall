"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ReactionType } from "@/lib/data/submissions";

export async function rateSubmission(submissionId: string, stars: number) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Not authenticated" };
    }

    // Validate stars (rating rules are enforced by database trigger)
    if (stars < 0 || stars > 5) {
        return { error: "Rating must be between 0 and 5" };
    }

    // Get submission to find challenge for path revalidation
    const { data: submission } = await supabase
        .from("submissions")
        .select("challenge_id")
        .eq("id", submissionId)
        .single();

    if (!submission) {
        return { error: "Submission not found" };
    }

    // Upsert rating
    const { error } = await supabase
        .from("ratings")
        .upsert(
            {
                submission_id: submissionId,
                rater_id: user.id,
                stars,
            },
            {
                onConflict: "submission_id,rater_id",
            }
        );

    if (error) {
        return { error: error.message };
    }

    revalidatePath(`/challenges/${submission.challenge_id}`);
    return { success: true };
}

export async function toggleReaction(submissionId: string, reaction: ReactionType) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Not authenticated" };
    }

    // Check if reaction exists
    const { data: existing } = await supabase
        .from("reactions")
        .select("id")
        .eq("submission_id", submissionId)
        .eq("user_id", user.id)
        .eq("reaction", reaction)
        .single();

    // Get submission for revalidation
    const { data: submission } = await supabase
        .from("submissions")
        .select("challenge_id")
        .eq("id", submissionId)
        .single();

    if (!submission) {
        return { error: "Submission not found" };
    }

    if (existing) {
        // Remove reaction
        const { error } = await supabase
            .from("reactions")
            .delete()
            .eq("id", existing.id);

        if (error) {
            return { error: error.message };
        }
    } else {
        // Add reaction
        const { error } = await supabase.from("reactions").insert({
            submission_id: submissionId,
            user_id: user.id,
            reaction,
        });

        if (error) {
            return { error: error.message };
        }
    }

    revalidatePath(`/challenges/${submission.challenge_id}`);
    return { success: true, added: !existing };
}

export async function endChallenge(challengeId: string) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Not authenticated" };
    }

    // Verify user is the challenger
    const { data: challenge } = await supabase
        .from("challenges")
        .select("challenger_id, status")
        .eq("id", challengeId)
        .single();

    if (!challenge) {
        return { error: "Challenge not found" };
    }

    if (challenge.challenger_id !== user.id) {
        return { error: "Only the challenger can end this challenge" };
    }

    if (challenge.status !== "active") {
        return { error: "Challenge is not active" };
    }

    // End the challenge
    const { error } = await supabase
        .from("challenges")
        .update({
            status: "ended",
            end_at: new Date().toISOString(),
        })
        .eq("id", challengeId);

    if (error) {
        return { error: error.message };
    }

    revalidatePath(`/challenges/${challengeId}`);
    return { success: true };
}
