import { createSupabaseServerClient } from "@/lib/supabase/server";

export type DailyChallenge = {
    id: string;
    promptText: string;
    date: string;
    participantCount: number;
    submissionCount: number;
};

/**
 * Get today's daily challenge, creating one if it doesn't exist
 */
export async function getTodaysDailyChallenge(
    timezone: string = "UTC"
): Promise<DailyChallenge | null> {
    const supabase = await createSupabaseServerClient();

    // Get today's date in the user's timezone
    const now = new Date();
    const todayDate = new Date(
        now.toLocaleString("en-US", { timeZone: timezone })
    )
        .toISOString()
        .split("T")[0];

    // Check if daily challenge exists for today
    const { data: existing, error } = await supabase
        .from("challenges")
        .select(`
      id,
      prompt_text,
      daily_date
    `)
        .eq("is_daily", true)
        .eq("daily_date", todayDate)
        .single();

    if (existing && !error) {
        // Get participant and submission counts
        const { count: participantCount } = await supabase
            .from("challenge_members")
            .select("*", { count: "exact", head: true })
            .eq("challenge_id", existing.id)
            .eq("role", "participant");

        const { count: submissionCount } = await supabase
            .from("submissions")
            .select("*", { count: "exact", head: true })
            .eq("challenge_id", existing.id);

        return {
            id: existing.id,
            promptText: existing.prompt_text || "Daily Photo Challenge",
            date: todayDate,
            participantCount: participantCount || 0,
            submissionCount: submissionCount || 0,
        };
    }

    return null;
}

/**
 * Create today's daily challenge from a random template
 */
export async function createDailyChallenge(
    timezone: string = "UTC"
): Promise<DailyChallenge | null> {
    const supabase = await createSupabaseServerClient();

    // Get today's date
    const now = new Date();
    const todayDate = new Date(
        now.toLocaleString("en-US", { timeZone: timezone })
    )
        .toISOString()
        .split("T")[0];

    // Get a random template
    const { data: templates } = await supabase
        .from("challenge_templates")
        .select("id, text")
        .eq("is_active", true);

    if (!templates || templates.length === 0) {
        return null;
    }

    const randomTemplate = templates[Math.floor(Math.random() * templates.length)];

    // Calculate end time (end of day in UTC)
    const endAt = new Date(todayDate + "T23:59:59.999Z");

    // Create the daily challenge (as system/admin)
    const { data: challenge, error } = await supabase
        .from("challenges")
        .insert({
            type: "text",
            template_id: randomTemplate.id,
            prompt_text: randomTemplate.text,
            visibility: "public",
            status: "active",
            base_time_limit_hours: 24,
            is_daily: true,
            daily_date: todayDate,
            timezone,
            start_at: new Date().toISOString(),
            end_at: endAt.toISOString(),
        })
        .select("id, prompt_text, daily_date")
        .single();

    if (error || !challenge) {
        console.error("Failed to create daily challenge:", error);
        return null;
    }

    return {
        id: challenge.id,
        promptText: challenge.prompt_text || "Daily Photo Challenge",
        date: todayDate,
        participantCount: 0,
        submissionCount: 0,
    };
}

/**
 * Get user's daily participation streak
 */
export async function getUserStreak(userId: string): Promise<number> {
    const supabase = await createSupabaseServerClient();

    // Get all daily challenges the user has submitted to, ordered by date
    const { data: submissions } = await supabase
        .from("submissions")
        .select(`
      created_at,
      challenge:challenges!inner(is_daily, daily_date)
    `)
        .eq("user_id", userId)
        .eq("challenges.is_daily", true)
        .order("created_at", { ascending: false });

    if (!submissions || submissions.length === 0) {
        return 0;
    }

    // Calculate streak
    let streak = 0;
    const today = new Date().toISOString().split("T")[0];
    let expectedDate = today;

    for (const sub of submissions) {
        const challenge = sub.challenge as any;
        const dailyDate = challenge?.daily_date;

        if (!dailyDate) continue;

        if (dailyDate === expectedDate) {
            streak++;
            // Move to previous day
            const prevDate = new Date(expectedDate);
            prevDate.setDate(prevDate.getDate() - 1);
            expectedDate = prevDate.toISOString().split("T")[0];
        } else if (dailyDate < expectedDate) {
            // Streak broken
            break;
        }
    }

    return streak;
}

/**
 * Get streak badge tier based on streak count
 */
export function getStreakBadge(
    streak: number
): "none" | "bronze" | "silver" | "gold" | "diamond" {
    if (streak >= 50) return "diamond";
    if (streak >= 28) return "gold";
    if (streak >= 14) return "silver";
    if (streak >= 7) return "bronze";
    return "none";
}
