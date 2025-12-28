"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { sendEmail } from "@/lib/email";
import { REPORT_REASON_LABELS, escapeHtml } from "@/lib/reporting";

const ADMIN_REDIRECT = "/admin";

type ReportDetail = {
  id: string;
  reason: string;
  details: string | null;
  status: string;
  created_at: string;
  reported_user_id: string;
  reporter: { username: string | null; display_name: string | null } | null;
  reported: { username: string | null; display_name: string | null } | null;
  submission: { id: string | null } | null;
  challenge: { id: string | null; prompt_text: string | null } | null;
};

function redirectWithStatus(
  status: "success" | "error",
  message: string,
  action?: string,
  reportId?: string
) {
  const params = new URLSearchParams();
  params.set(status, "1");
  if (message) {
    params.set("message", message);
  }
  if (action) {
    params.set("action", action);
  }
  if (reportId) {
    params.set("report", reportId);
  }
  redirect(`${ADMIN_REDIRECT}?${params.toString()}`);
}

function formatUserLabel(user: { username: string | null; display_name: string | null } | null) {
  if (!user) {
    return "Unknown";
  }
  return user.display_name || user.username || "Unknown";
}

async function loadReport(service: ReturnType<typeof createSupabaseServiceClient>, reportId: string) {
  const { data, error } = await service
    .from("reports")
    .select(
      `
      id,
      reason,
      details,
      status,
      created_at,
      reported_user_id,
      reporter:profiles!reports_reporter_id_fkey(username, display_name),
      reported:profiles!reports_reported_user_id_fkey(username, display_name),
      submission:submissions(id),
      challenge:challenges(id, prompt_text)
    `
    )
    .eq("id", reportId)
    .single();

  if (error || !data) {
    throw new Error("Report not found.");
  }

  return data as ReportDetail;
}

function buildWarningEmail(report: ReportDetail) {
  const reasonLabel = REPORT_REASON_LABELS[report.reason as keyof typeof REPORT_REASON_LABELS] ?? report.reason;
  const reportedLabel = formatUserLabel(report.reported);

  const html = `
    <h2>ShotChall warning</h2>
    <p>Hello ${escapeHtml(reportedLabel)},</p>
    <p>Your recent submission was reported for <strong>${escapeHtml(reasonLabel)}</strong>.</p>
    <p>Please review the community guidelines. Repeated violations can lead to account deletion.</p>
  `.trim();

  return {
    subject: "ShotChall warning about a reported submission",
    html,
  };
}

function buildDeletionEmail(report: ReportDetail) {
  const reasonLabel = REPORT_REASON_LABELS[report.reason as keyof typeof REPORT_REASON_LABELS] ?? report.reason;
  const reportedLabel = formatUserLabel(report.reported);

  const html = `
    <h2>ShotChall account deletion</h2>
    <p>Hello ${escapeHtml(reportedLabel)},</p>
    <p>Your account has been deleted due to a reported image (${escapeHtml(reasonLabel)}).</p>
    <p>If you believe this is a mistake, reply to this email.</p>
  `.trim();

  return {
    subject: "ShotChall account deleted",
    html,
  };
}

export async function warnReport(formData: FormData) {
  const reportId = String(formData.get("report_id") ?? "").trim();
  const notes = String(formData.get("action_notes") ?? "").trim();

  if (!reportId) {
    redirectWithStatus("error", "Missing report id.");
  }

  const { userId } = await requireAdmin();
  const service = createSupabaseServiceClient();
  const report = await loadReport(service, reportId);

  if (report.status !== "open") {
    redirectWithStatus("error", "Report is already actioned.", "warn", reportId);
  }

  const { data: userData, error: userError } = await service.auth.admin.getUserById(
    report.reported_user_id
  );

  if (userError || !userData?.user?.email) {
    redirectWithStatus("error", "Reported user email is unavailable.", "warn", reportId);
  }

  const { subject, html } = buildWarningEmail(report);

  try {
    await sendEmail({
      to: userData.user.email,
      subject,
      html,
    });
  } catch (error) {
    redirectWithStatus("error", "Unable to send warning email.", "warn", reportId);
  }

  const { error: actionError } = await service.from("report_actions").insert({
    report_id: reportId,
    admin_id: userId,
    action: "warn",
    action_notes: notes || null,
  });

  if (actionError) {
    redirectWithStatus("error", actionError.message, "warn", reportId);
  }

  const { error: updateError } = await service
    .from("reports")
    .update({ status: "actioned" })
    .eq("id", reportId);

  if (updateError) {
    redirectWithStatus("error", updateError.message, "warn", reportId);
  }

  redirectWithStatus("success", "Warning email sent.", "warn", reportId);
}

export async function deleteReportUser(formData: FormData) {
  const reportId = String(formData.get("report_id") ?? "").trim();
  const notes = String(formData.get("action_notes") ?? "").trim();

  if (!reportId) {
    redirectWithStatus("error", "Missing report id.");
  }

  const { userId } = await requireAdmin();
  const service = createSupabaseServiceClient();
  const report = await loadReport(service, reportId);

  if (report.status !== "open") {
    redirectWithStatus("error", "Report is already actioned.", "delete", reportId);
  }

  const { data: userData, error: userError } = await service.auth.admin.getUserById(
    report.reported_user_id
  );

  if (userError || !userData?.user?.email) {
    redirectWithStatus("error", "Reported user email is unavailable.", "delete", reportId);
  }

  const { subject, html } = buildDeletionEmail(report);

  try {
    await sendEmail({
      to: userData.user.email,
      subject,
      html,
    });
  } catch (error) {
    redirectWithStatus("error", "Unable to send deletion email.", "delete", reportId);
  }

  const { error: deleteError } = await service.auth.admin.deleteUser(report.reported_user_id);
  if (deleteError) {
    redirectWithStatus("error", deleteError.message, "delete", reportId);
  }

  const { error: actionError } = await service.from("report_actions").insert({
    report_id: reportId,
    admin_id: userId,
    action: "delete",
    action_notes: notes || null,
  });

  if (actionError) {
    redirectWithStatus("error", actionError.message, "delete", reportId);
  }

  const { error: updateError } = await service
    .from("reports")
    .update({ status: "actioned" })
    .eq("id", reportId);

  if (updateError) {
    redirectWithStatus("error", updateError.message, "delete", reportId);
  }

  redirectWithStatus("success", "User deleted.", "delete", reportId);
}
