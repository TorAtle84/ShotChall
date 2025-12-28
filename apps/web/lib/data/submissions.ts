import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ReactionType = "flame" | "heart" | "wow";

export type Submission = {
    id: string;
    challengeId: string;
    userId: string;
    username: string;
    imagePath: string;
    imageThumbPath: string;
    createdAt: string;
    avgRating: number | null;
    ratingCount: number;
    reactions: {
        flame: number;
        heart: number;
        wow: number;
    };
    userRating: number | null; // Current user's rating
    userReactions: ReactionType[]; // Current user's reactions
};

export async function getSubmissions(challengeId: string): Promise<Submission[]> {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data: submissions, error } = await supabase
        .from("submissions")
        .select(`
      id,
      challenge_id,
      user_id,
      image_path,
      image_thumb_path,
      created_at,
      user:profiles!submissions_user_id_fkey(username)
    `)
        .eq("challenge_id", challengeId)
        .order("created_at", { ascending: true });

    if (error || !submissions) return [];

    // Get ratings for all submissions
    const submissionIds = submissions.map((s) => s.id);

    const { data: ratings } = await supabase
        .from("ratings")
        .select("submission_id, stars, rater_id")
        .in("submission_id", submissionIds);

    const { data: reactions } = await supabase
        .from("reactions")
        .select("submission_id, reaction, user_id")
        .in("submission_id", submissionIds);

    return submissions.map((s: any) => {
        const submissionRatings = ratings?.filter((r) => r.submission_id === s.id) || [];
        const submissionReactions = reactions?.filter((r) => r.submission_id === s.id) || [];

        const avgRating = submissionRatings.length > 0
            ? submissionRatings.reduce((sum, r) => sum + r.stars, 0) / submissionRatings.length
            : null;

        const userRating = user
            ? submissionRatings.find((r) => r.rater_id === user.id)?.stars ?? null
            : null;

        const userReactions = user
            ? submissionReactions
                .filter((r) => r.user_id === user.id)
                .map((r) => r.reaction as ReactionType)
            : [];

        return {
            id: s.id,
            challengeId: s.challenge_id,
            userId: s.user_id,
            username: s.user?.username || "anonymous",
            imagePath: s.image_path,
            imageThumbPath: s.image_thumb_path,
            createdAt: s.created_at,
            avgRating,
            ratingCount: submissionRatings.length,
            reactions: {
                flame: submissionReactions.filter((r) => r.reaction === "flame").length,
                heart: submissionReactions.filter((r) => r.reaction === "heart").length,
                wow: submissionReactions.filter((r) => r.reaction === "wow").length,
            },
            userRating,
            userReactions,
        };
    });
}

export async function getWinner(challengeId: string): Promise<Submission | null> {
    const submissions = await getSubmissions(challengeId);

    if (submissions.length === 0) return null;

    // Sort by avgRating (highest first), then by createdAt (oldest first for ties)
    const sorted = [...submissions].sort((a, b) => {
        const ratingA = a.avgRating ?? 0;
        const ratingB = b.avgRating ?? 0;

        if (ratingB !== ratingA) {
            return ratingB - ratingA; // Higher rating wins
        }

        // Tie-breaker: fastest submission wins
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    return sorted[0] || null;
}
