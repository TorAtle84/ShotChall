export const REPORT_REASONS = [
  "nudity",
  "violence",
  "harassment",
  "spam",
  "other",
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number];

export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  nudity: "Nudity",
  violence: "Violence",
  harassment: "Harassment",
  spam: "Spam",
  other: "Other",
};

const FLAGGED_WORDS = [
  "nude",
  "naked",
  "kill",
  "blood",
  "gore",
  "violence",
  "suicide",
  "self-harm",
  "weapon",
  "drugs",
  "sex",
];

export function getFlaggedWords(text: string | null | undefined) {
  if (!text) {
    return [];
  }

  const lowered = text.toLowerCase();
  const matches = new Set<string>();

  for (const word of FLAGGED_WORDS) {
    if (lowered.includes(word)) {
      matches.add(word);
    }
  }

  return Array.from(matches);
}

export function normalizeReason(value: string): ReportReason | null {
  if (REPORT_REASONS.includes(value as ReportReason)) {
    return value as ReportReason;
  }
  return null;
}

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
