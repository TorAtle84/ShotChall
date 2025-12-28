import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { getChallengeWinners, RatingLite, SubmissionLite } from "./results";

export type BadgeTier = "Bronze" | "Silver" | "Gold" | "Diamond";

export type UserStats = {
  wins: number;
  avgStars: number | null;
  streak: number;
  badge: BadgeTier | null;
};

const BADGE_LEVELS: { tier: BadgeTier; minDays: number }[] = [
  { tier: "Diamond", minDays: 50 },
  { tier: "Gold", minDays: 28 },
  { tier: "Silver", minDays: 14 },
  { tier: "Bronze", minDays: 7 },
];

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function getBadgeTier(streak: number): BadgeTier | null {
  for (const level of BADGE_LEVELS) {
    if (streak >= level.minDays) {
      return level.tier;
    }
  }
  return null;
}

function parseDateToUtc(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number);
  if (!year || !month || !day) {
    return null;
  }
  return Date.UTC(year, month - 1, day);
}

function calculateStreak(dates: string[]) {
  const unique = Array.from(new Set(dates)).filter(Boolean);
  if (unique.length === 0) {
    return 0;
  }

  const sorted = unique
    .map((value) => parseDateToUtc(value))
    .filter((value): value is number => value !== null)
    .sort((a, b) => a - b);

  if (sorted.length === 0) {
    return 0;
  }

  let streak = 1;
  let last = sorted[sorted.length - 1];

  for (let i = sorted.length - 2; i >= 0; i -= 1) {
    const current = sorted[i];
    const diffDays = Math.round((last - current) / ONE_DAY_MS);
    if (diffDays === 1) {
      streak += 1;
      last = current;
      continue;
    }
    if (diffDays > 1) {
      break;
    }
  }

  return streak;
}

export async function getUserStats(userId: string): Promise<UserStats> {
  const service = createSupabaseServiceClient();

  const { data: userSubmissions } = await service
    .from("submissions")
    .select("id, challenge_id, created_at")
    .eq("user_id", userId);

  const submissionIds = (userSubmissions ?? []).map((submission) => submission.id);

  let avgStars: number | null = null;

  if (submissionIds.length) {
    const { data: ratings } = await service
      .from("ratings")
      .select("submission_id, stars")
      .in("submission_id", submissionIds);

    const ratingCount = ratings?.length ?? 0;
    if (ratingCount > 0) {
      const sum = ratings?.reduce((total, row) => total + row.stars, 0) ?? 0;
      avgStars = sum / ratingCount;
    }
  }

  let wins = 0;

  if (userSubmissions && userSubmissions.length) {
    const challengeIds = Array.from(
      new Set(userSubmissions.map((submission) => submission.challenge_id))
    );

    if (challengeIds.length) {
      const { data: challenges } = await service
        .from("challenges")
        .select("id")
        .eq("visibility", "private")
        .eq("status", "ended")
        .in("id", challengeIds);

      const endedIds = (challenges ?? []).map((challenge) => challenge.id);

      if (endedIds.length) {
        const { data: submissions } = await service
          .from("submissions")
          .select("id, challenge_id, user_id, created_at")
          .in("challenge_id", endedIds);

        if (submissions && submissions.length) {
          const allSubmissionIds = submissions.map((submission) => submission.id);
          const { data: ratings } = await service
            .from("ratings")
            .select("submission_id, stars")
            .in("submission_id", allSubmissionIds);

          const winners = getChallengeWinners(
            submissions as SubmissionLite[],
            (ratings ?? []) as RatingLite[]
          );

          for (const winner of winners.values()) {
            if (winner.userId === userId) {
              wins += 1;
            }
          }
        }
      }
    }
  }

  const { data: dailyRows } = await service
    .from("submissions")
    .select("challenge:challenges(is_daily, daily_date)")
    .eq("user_id", userId);

  const dailyDates = (dailyRows ?? [])
    .map((row) => {
      const challenge = Array.isArray(row.challenge)
        ? row.challenge[0]
        : row.challenge;
      if (!challenge?.is_daily || !challenge.daily_date) {
        return null;
      }
      return challenge.daily_date;
    })
    .filter((value): value is string => Boolean(value));

  const streak = calculateStreak(dailyDates);
  const badge = getBadgeTier(streak);

  return {
    wins,
    avgStars,
    streak,
    badge,
  };
}
