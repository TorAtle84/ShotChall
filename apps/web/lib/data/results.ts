export type SubmissionLite = {
  id: string;
  challenge_id: string;
  user_id: string;
  created_at: string;
};

export type RatingLite = {
  submission_id: string;
  stars: number;
};

export type ChallengeWinner = {
  userId: string;
  avgStars: number;
  createdAt: number;
};

type RatingStats = {
  sum: number;
  count: number;
};

export function getChallengeWinners(
  submissions: SubmissionLite[],
  ratings: RatingLite[]
) {
  const ratingStats = new Map<string, RatingStats>();

  for (const rating of ratings) {
    const current = ratingStats.get(rating.submission_id) ?? {
      sum: 0,
      count: 0,
    };
    current.sum += rating.stars;
    current.count += 1;
    ratingStats.set(rating.submission_id, current);
  }

  const winners = new Map<string, ChallengeWinner>();

  for (const submission of submissions) {
    const stats = ratingStats.get(submission.id);
    const avgStars = stats && stats.count ? stats.sum / stats.count : 0;
    const createdAt = Date.parse(submission.created_at);
    const existing = winners.get(submission.challenge_id);

    if (
      !existing ||
      avgStars > existing.avgStars ||
      (avgStars === existing.avgStars && createdAt < existing.createdAt)
    ) {
      winners.set(submission.challenge_id, {
        userId: submission.user_id,
        avgStars,
        createdAt,
      });
    }
  }

  return winners;
}
