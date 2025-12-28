"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { sendEmail } from "@/lib/email";
import {
  REPORT_REASON_LABELS,
  escapeHtml,
  getFlaggedWords,
  normalizeReason,
} from "@/lib/reporting";

const ADMIN_EMAIL_DEFAULT = "flytlink.app@gmail.com";
const SUBMISSIONS_BUCKET =
  process.env.SUPABASE_SUBMISSIONS_BUCKET ?? "submissions";

type AdminEmailPayload = {
  reportId: string;
  reason: string;
  details: string | null;
  createdAt: string;
  reporter?: { username: string | null; display_name: string | null } | null;
  reported?: { username: string | null; display_name: string | null } | null;
  submission?: { id: string; image_path: string | null; image_thumb_path: string | null } | null;
  challenge?: { id: string; prompt_text: string | null } | null;
  signedImageUrl?: string | null;
};

function getAdminEmail() {
  return process.env.ADMIN_EMAIL || ADMIN_EMAIL_DEFAULT;
}

function formatUserLabel(user?: { username: string | null; display_name: string | null } | null) {
  if (!user) {
    return "Unknown";
  }
  return user.display_name || user.username || "Unknown";
}

function buildAdminReportEmail(payload: AdminEmailPayload) {
  const reasonLabel = REPORT_REASON_LABELS[payload.reason as keyof typeof REPORT_REASON_LABELS] ?? payload.reason;
  const flaggedWords = getFlaggedWords(payload.details);
  const reporterLabel = formatUserLabel(payload.reporter);
  const reportedLabel = formatUserLabel(payload.reported);
  const details = payload.details ? escapeHtml(payload.details) : "No details provided.";
  const challengeText = payload.challenge?.prompt_text
    ? escapeHtml(payload.challenge.prompt_text)
    : "Not provided.";

  const flaggedHtml = flaggedWords.length
    ? `<p><strong>Flagged keywords:</strong> ${flaggedWords.join(", ")}</p>`
    : "";

  const imageHtml = payload.signedImageUrl
    ? `<p><a href="${payload.signedImageUrl}">View image</a></p>`
    : "";

  const html = `
    <h2>New report received</h2>
    <p><strong>Reason:</strong> ${escapeHtml(reasonLabel)}</p>
    <p><strong>Reporter:</strong> ${escapeHtml(reporterLabel)}</p>
    <p><strong>Reported user:</strong> ${escapeHtml(reportedLabel)}</p>
    <p><strong>Submitted at:</strong> ${escapeHtml(payload.createdAt)}</p>
    <p><strong>Report ID:</strong> ${escapeHtml(payload.reportId)}</p>
    <p><strong>Submission ID:</strong> ${escapeHtml(payload.submission?.id ?? "None")}</p>
    <p><strong>Challenge ID:</strong> ${escapeHtml(payload.challenge?.id ?? "None")}</p>
    <p><strong>Challenge prompt:</strong> ${challengeText}</p>
    <p><strong>Details:</strong> ${details}</p>
    ${flaggedHtml}
    ${imageHtml}
  `.trim();

  const subject = `ShotChall report: ${reasonLabel}`;

  return { subject, html };
}

type ReportQueryResult = {
  id: string;
  reason: string;
  details: string | null;
  created_at: string;
  reporter: { username: string | null; display_name: string | null } | null;
  reported: { username: string | null; display_name: string | null } | null;
  submission: { id: string; image_path: string | null; image_thumb_path: string | null } | null;
  challenge: { id: string; prompt_text: string | null } | null;
};

async function notifyAdmin(reportId: string) {
  const service = createSupabaseServiceClient();
  const { data, error } = await service
    .from("reports")
    .select(
      `
      id,
      reason,
      details,
      created_at,
      submission_id,
      challenge_id,
      reporter:profiles!reports_reporter_id_fkey(username, display_name),
      reported:profiles!reports_reported_user_id_fkey(username, display_name),
      submission:submissions(id, image_path, image_thumb_path),
      challenge:challenges(id, prompt_text)
    `
    )
    .eq("id", reportId)
    .single();

  if (error || !data) {
    throw new Error("Unable to load report details.");
  }

  const report = data as unknown as ReportQueryResult;

  let signedImageUrl: string | null = null;
  const imagePath = report.submission?.image_thumb_path || report.submission?.image_path;

  if (imagePath) {
    const { data: signed, error: signedError } = await service.storage
      .from(SUBMISSIONS_BUCKET)
      .createSignedUrl(imagePath, 60 * 60);
    if (!signedError) {
      signedImageUrl = signed?.signedUrl ?? null;
    }
  }

  const emailPayload: AdminEmailPayload = {
    reportId: report.id,
    reason: report.reason,
    details: report.details,
    createdAt: report.created_at,
    reporter: report.reporter,
    reported: report.reported,
    submission: report.submission,
    challenge: report.challenge,
    signedImageUrl,
  };

  const { subject, html } = buildAdminReportEmail(emailPayload);

  await sendEmail({
    to: getAdminEmail(),
    subject,
    html,
  });
}

function redirectWithStatus(path: string, status: "success" | "error", message?: string, extra?: Record<string, string>) {
  const params = new URLSearchParams();
  params.set(status, "1");
  if (message) {
    params.set("message", message);
  }
  if (extra) {
    Object.entries(extra).forEach(([key, value]) => params.set(key, value));
  }
  redirect(`${path}?${params.toString()}`);
}

export async function createPictureReport(formData: FormData) {
  const submissionId = String(formData.get("submission_id") ?? "").trim();
  const reasonValue = String(formData.get("reason") ?? "").trim();
  const details = String(formData.get("details") ?? "").trim();

  const reason = normalizeReason(reasonValue);
  if (!submissionId || !reason) {
    redirectWithStatus("/reports/new", "error", "Submission and reason are required.");
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?error=Please sign in to report.");
  }

  const { data: submission, error: submissionError } = await supabase
    .from("submissions")
    .select("id, user_id, challenge_id")
    .eq("id", submissionId)
    .single();

  if (submissionError || !submission) {
    redirectWithStatus("/reports/new", "error", "Submission not found.");
  }

  if (submission.user_id === user.id) {
    redirectWithStatus("/reports/new", "error", "You cannot report your own submission.");
  }

  const { data: report, error: reportError } = await supabase
    .from("reports")
    .insert({
      reporter_id: user.id,
      reported_user_id: submission.user_id,
      submission_id: submission.id,
      challenge_id: submission.challenge_id,
      reason,
      details: details || null,
    })
    .select("id")
    .single();

  if (reportError || !report) {
    redirectWithStatus("/reports/new", "error", reportError?.message || "Unable to submit report.");
  }

  let emailFailed = false;
  try {
    await notifyAdmin(report.id);
  } catch (error) {
    emailFailed = true;
  }

  const extra: Record<string, string> = { type: "submission" };
  if (emailFailed) {
    extra.email = "failed";
  }

  redirectWithStatus("/reports/new", "success", undefined, extra);
}

export async function createUserReport(formData: FormData) {
  const reportedUserId = String(formData.get("reported_user_id") ?? "").trim();
  const reasonValue = String(formData.get("reason") ?? "").trim();
  const details = String(formData.get("details") ?? "").trim();

  const reason = normalizeReason(reasonValue);
  if (!reportedUserId || !reason) {
    redirectWithStatus("/reports/new", "error", "Reported user and reason are required.");
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?error=Please sign in to report.");
  }

  if (reportedUserId === user.id) {
    redirectWithStatus("/reports/new", "error", "You cannot report your own account.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", reportedUserId)
    .single();

  if (profileError || !profile) {
    redirectWithStatus("/reports/new", "error", "User not found.");
  }

  const { data: report, error: reportError } = await supabase
    .from("reports")
    .insert({
      reporter_id: user.id,
      reported_user_id: reportedUserId,
      reason,
      details: details || null,
    })
    .select("id")
    .single();

  if (reportError || !report) {
    redirectWithStatus("/reports/new", "error", reportError?.message || "Unable to submit report.");
  }

  let emailFailed = false;
  try {
    await notifyAdmin(report.id);
  } catch (error) {
    emailFailed = true;
  }

  const extra: Record<string, string> = { type: "user" };
  if (emailFailed) {
    extra.email = "failed";
  }

  redirectWithStatus("/reports/new", "success", undefined, extra);
}
