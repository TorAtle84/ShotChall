import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { getChallengeWinners, RatingLite, SubmissionLite } from "./results";

export type LeaderboardRange = "week" | "month" | "year";

export type FriendLeaderboardRow = {
  userId: string;
  username: string;
  displayName: string | null;
  wins: number;
};

export type PublicChallengeRow = {
  challengeId: string;
  title: string;
  submissionCount: number;
  avgStars: number | null;
};

export type TopChallengerRow = {
  userId: string;
  username: string;
  displayName: string | null;
  avgStars: number;
  ratedSubmissions: number;
};

const RANGE_DAYS: Record<LeaderboardRange, number> = {
  week: 7,
  month: 30,
  year: 365,
};

const MIN_RATED_SUBMISSIONS = 10;

export function parseLeaderboardRange(value?: string): LeaderboardRange {
  if (value === "week" || value === "month" || value === "year") {
    return value;
  }
  return "week";
}

function getRangeStart(range: LeaderboardRange) {
  const days = RANGE_DAYS[range];
  const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return start.toISOString();
}

async function getFriendIds(userId: string) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("friendships")
    .select("requester_id, addressee_id")
    .eq("status", "accepted")
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);

  const ids = new Set<string>([userId]);

  for (const row of data ?? []) {
    const friendId =
      row.requester_id === userId ? row.addressee_id : row.requester_id;
    if (friendId) {
      ids.add(friendId);
    }
  }

  return Array.from(ids);
}

export async function getFriendLeaderboard(
  userId: string,
  range: LeaderboardRange
) {
  const friendIds = await getFriendIds(userId);
  if (friendIds.length === 0) {
    return [];
  }

  const service = createSupabaseServiceClient();
  const since = getRangeStart(range);

  const { data: challenges } = await service
    .from("challenges")
    .select("id")
    .eq("visibility", "private")
    .eq("status", "ended")
    .gte("end_at", since);

  if (!challenges || challenges.length === 0) {
    return [];
  }

  const challengeIds = challenges.map((challenge) => challenge.id);

  const { data: submissions } = await service
    .from("submissions")
    .select("id, challenge_id, user_id, created_at")
    .in("challenge_id", challengeIds)
    .in("user_id", friendIds);

  if (!submissions || submissions.length === 0) {
    return [];
  }

  const submissionIds = submissions.map((submission) => submission.id);
  const { data: ratings } = await service
    .from("ratings")
    .select("submission_id, stars")
    .in("submission_id", submissionIds);

  const winners = getChallengeWinners(
    submissions as SubmissionLite[],
    (ratings ?? []) as RatingLite[]
  );

  const winsByUser = new Map<string, number>();

  for (const winner of winners.values()) {
    if (!friendIds.includes(winner.userId)) {
      continue;
    }
    winsByUser.set(winner.userId, (winsByUser.get(winner.userId) ?? 0) + 1);
  }

  const winnerIds = Array.from(winsByUser.keys());
  if (winnerIds.length === 0) {
    return [];
  }

  const { data: profiles } = await service
    .from("profiles")
    .select("id, username, display_name")
    .in("id", winnerIds);

  const profileMap = new Map(
    (profiles ?? []).map((profile) => [profile.id, profile])
  );

  const rows: FriendLeaderboardRow[] = winnerIds.map((id) => {
    const profile = profileMap.get(id);
    return {
      userId: id,
      username: profile?.username ?? "unknown",
      displayName: profile?.display_name ?? null,
      wins: winsByUser.get(id) ?? 0,
    };
  });

  rows.sort((a, b) => b.wins - a.wins || a.username.localeCompare(b.username));
  return rows;
}

export async function getPublicChallengeLeaderboard(range: LeaderboardRange) {
  const service = createSupabaseServiceClient();
  const since = getRangeStart(range);

  const { data: challenges } = await service
    .from("challenges")
    .select("id, prompt_text, template_id, created_at")
    .eq("visibility", "public")
    .neq("status", "draft")
    .gte("created_at", since);

  if (!challenges || challenges.length === 0) {
    return [];
  }

  const templateIds = Array.from(
    new Set(challenges.map((challenge) => challenge.template_id).filter(Boolean))
  ) as string[];

  let templateMap = new Map<string, string>();
  if (templateIds.length) {
    const { data: templates } = await service
      .from("challenge_templates")
      .select("id, text")
      .in("id", templateIds);
    templateMap = new Map(
      (templates ?? []).map((template) => [template.id, template.text])
    );
  }

  const challengeIds = challenges.map((challenge) => challenge.id);
  const { data: submissions } = await service
    .from("submissions")
    .select("id, challenge_id")
    .in("challenge_id", challengeIds);

  if (!submissions || submissions.length === 0) {
    return [];
  }

  const submissionIds = submissions.map((submission) => submission.id);
  const { data: ratings } = await service
    .from("ratings")
    .select("submission_id, stars")
    .in("submission_id", submissionIds);

  const submissionToChallenge = new Map(
    submissions.map((submission) => [submission.id, submission.challenge_id])
  );

  const statsByChallenge = new Map<
    string,
    { submissionCount: number; ratingSum: number; ratingCount: number }
  >();

  for (const submission of submissions) {
    const current = statsByChallenge.get(submission.challenge_id) ?? {
      submissionCount: 0,
      ratingSum: 0,
      ratingCount: 0,
    };
    current.submissionCount += 1;
    statsByChallenge.set(submission.challenge_id, current);
  }

  for (const rating of ratings ?? []) {
    const challengeId = submissionToChallenge.get(rating.submission_id);
    if (!challengeId) {
      continue;
    }
    const current = statsByChallenge.get(challengeId) ?? {
      submissionCount: 0,
      ratingSum: 0,
      ratingCount: 0,
    };
    current.ratingSum += rating.stars;
    current.ratingCount += 1;
    statsByChallenge.set(challengeId, current);
  }

  const rows: PublicChallengeRow[] = challenges.map((challenge) => {
    const stats = statsByChallenge.get(challenge.id) ?? {
      submissionCount: 0,
      ratingSum: 0,
      ratingCount: 0,
    };
    const avgStars =
      stats.ratingCount > 0 ? stats.ratingSum / stats.ratingCount : null;
    const title =
      challenge.prompt_text ||
      (challenge.template_id ? templateMap.get(challenge.template_id) : null) ||
      "Photo challenge";

    return {
      challengeId: challenge.id,
      title,
      submissionCount: stats.submissionCount,
      avgStars,
    };
  });

  rows.sort((a, b) => {
    if (b.submissionCount !== a.submissionCount) {
      return b.submissionCount - a.submissionCount;
    }
    return (b.avgStars ?? 0) - (a.avgStars ?? 0);
  });

  return rows.slice(0, 10);
}

export async function getTopChallengers() {
  const service = createSupabaseServiceClient();
  const { data: ratings } = await service
    .from("ratings")
    .select("submission_id, stars, submission:submissions(user_id)");

  if (!ratings || ratings.length === 0) {
    return [];
  }

  const statsByUser = new Map<
    string,
    { sum: number; count: number; submissions: Set<string> }
  >();

  for (const row of ratings) {
    const submission = Array.isArray(row.submission)
      ? row.submission[0]
      : row.submission;
    const userId = submission?.user_id;

    if (!userId) {
      continue;
    }

    const stats =
      statsByUser.get(userId) ?? {
        sum: 0,
        count: 0,
        submissions: new Set<string>(),
      };

    stats.sum += row.stars;
    stats.count += 1;
    if (row.submission_id) {
      stats.submissions.add(row.submission_id);
    }
    statsByUser.set(userId, stats);
  }

  const qualifiedIds = Array.from(statsByUser.entries())
    .filter(([, stats]) => stats.submissions.size >= MIN_RATED_SUBMISSIONS)
    .map(([userId]) => userId);

  if (qualifiedIds.length === 0) {
    return [];
  }

  const { data: profiles } = await service
    .from("profiles")
    .select("id, username, display_name")
    .in("id", qualifiedIds);

  const profileMap = new Map(
    (profiles ?? []).map((profile) => [profile.id, profile])
  );

  const rows: TopChallengerRow[] = qualifiedIds.map((userId) => {
    const profile = profileMap.get(userId);
    const stats = statsByUser.get(userId);
    const avgStars = stats && stats.count ? stats.sum / stats.count : 0;

    return {
      userId,
      username: profile?.username ?? "unknown",
      displayName: profile?.display_name ?? null,
      avgStars,
      ratedSubmissions: stats?.submissions.size ?? 0,
    };
  });

  rows.sort((a, b) => {
    if (b.avgStars !== a.avgStars) {
      return b.avgStars - a.avgStars;
    }
    return b.ratedSubmissions - a.ratedSubmissions;
  });

  return rows.slice(0, 10);
}
