import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { getFlaggedWords, REPORT_REASON_LABELS } from "@/lib/reporting";
import { warnReport, deleteReportUser } from "./actions";

type AdminPageProps = {
  searchParams?: {
    success?: string;
    error?: string;
    message?: string;
    action?: string;
    report?: string;
  };
};

type ReportRow = {
  id: string;
  reason: string;
  details: string | null;
  status: string;
  created_at: string;
  reporter: { username: string | null; display_name: string | null } | null;
  reported: { username: string | null; display_name: string | null } | null;
  submission: { id: string; image_thumb_path: string | null; image_path: string | null } | null;
  challenge: { id: string | null; prompt_text: string | null } | null;
};

const SUBMISSIONS_BUCKET =
  process.env.SUPABASE_SUBMISSIONS_BUCKET ?? "submissions";

function formatUserLabel(user: { username: string | null; display_name: string | null } | null) {
  if (!user) {
    return "Unknown";
  }
  return user.display_name || user.username || "Unknown";
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const { data: adminRow } = await supabase
    .from("profile_private")
    .select("is_admin")
    .eq("user_id", user.id)
    .single();

  if (!adminRow?.is_admin) {
    notFound();
  }

  const { data, error } = await supabase
    .from("reports")
    .select(
      `
      id,
      reason,
      details,
      status,
      created_at,
      reporter:profiles!reports_reporter_id_fkey(username, display_name),
      reported:profiles!reports_reported_user_id_fkey(username, display_name),
      submission:submissions(id, image_thumb_path, image_path),
      challenge:challenges(id, prompt_text)
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const reports = (data ?? []) as ReportRow[];

  const service = createSupabaseServiceClient();
  const reportsWithImages = await Promise.all(
    reports.map(async (report) => {
      const path = report.submission?.image_thumb_path || report.submission?.image_path;
      if (!path) {
        return { ...report, signedUrl: "" };
      }

      const { data: signed, error: signedError } = await service.storage
        .from(SUBMISSIONS_BUCKET)
        .createSignedUrl(path, 60 * 60);

      if (signedError) {
        return { ...report, signedUrl: "" };
      }

      return { ...report, signedUrl: signed?.signedUrl ?? "" };
    })
  );

  const successMessage =
    searchParams?.success === "1"
      ? searchParams?.message || "Action completed."
      : "";
  const errorMessage =
    searchParams?.error === "1" ? searchParams?.message || "Action failed." : "";

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--color-muted)]">
          Admin
        </p>
        <h1 className="font-display text-3xl text-[color:var(--color-foreground)]">
          Moderation queue
        </h1>
        <p className="text-sm text-[color:var(--color-muted)]">
          Review reports, warn offenders, or delete accounts.
        </p>
      </header>

      {successMessage ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          {successMessage}
        </div>
      ) : null}

      {errorMessage ? (
        <div className="rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-900">
          {errorMessage}
        </div>
      ) : null}

      {reportsWithImages.length === 0 ? (
        <div className="rounded-[28px] border border-white/70 bg-white/80 p-6 text-sm text-[color:var(--color-muted)]">
          No reports yet.
        </div>
      ) : (
        <div className="grid gap-6">
          {reportsWithImages.map((report) => {
            const reasonLabel =
              REPORT_REASON_LABELS[
                report.reason as keyof typeof REPORT_REASON_LABELS
              ] ?? report.reason;
            const flaggedWords = getFlaggedWords(report.details);
            const statusLabel =
              report.status === "open" ? "Open" : "Actioned";

            return (
              <article
                key={report.id}
                className="rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-sm"
              >
                <div className="flex flex-col gap-6 md:flex-row">
                  <div className="relative aspect-[4/3] w-full max-w-md overflow-hidden rounded-2xl border border-white/60 bg-[color:var(--color-surface-muted)]">
                    {report.signedUrl ? (
                      <img
                        src={report.signedUrl}
                        alt="Reported submission preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm text-[color:var(--color-muted)]">
                        No preview available
                      </div>
                    )}
                    <span className="absolute left-3 top-3 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-[color:var(--color-muted)]">
                      {statusLabel}
                    </span>
                  </div>

                  <div className="flex-1 space-y-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--color-muted)]">
                        Reason
                      </p>
                      <h2 className="mt-2 font-display text-2xl text-[color:var(--color-foreground)]">
                        {reasonLabel}
                      </h2>
                      <p className="mt-1 text-xs text-[color:var(--color-muted)]">
                        Submitted {new Date(report.created_at).toLocaleString()}
                      </p>
                    </div>

                    <div className="grid gap-3 text-sm text-[color:var(--color-muted)]">
                      <p>
                        <span className="font-semibold text-[color:var(--color-foreground)]">
                          Reporter:
                        </span>{" "}
                        {formatUserLabel(report.reporter)}
                      </p>
                      <p>
                        <span className="font-semibold text-[color:var(--color-foreground)]">
                          Reported user:
                        </span>{" "}
                        {formatUserLabel(report.reported)}
                      </p>
                      <p>
                        <span className="font-semibold text-[color:var(--color-foreground)]">
                          Submission ID:
                        </span>{" "}
                        {report.submission?.id ?? "None"}
                      </p>
                      <p>
                        <span className="font-semibold text-[color:var(--color-foreground)]">
                          Challenge prompt:
                        </span>{" "}
                        {report.challenge?.prompt_text ?? "Not available"}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--color-muted)]">
                        Details
                      </p>
                      <p className="text-sm text-[color:var(--color-muted)]">
                        {report.details || "No details provided."}
                      </p>
                      {flaggedWords.length ? (
                        <p className="text-xs font-semibold text-orange-600">
                          Flagged keywords: {flaggedWords.join(", ")}
                        </p>
                      ) : null}
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <form action={warnReport} className="space-y-3">
                        <input type="hidden" name="report_id" value={report.id} />
                        <textarea
                          name="action_notes"
                          placeholder="Optional warning note"
                          className="w-full rounded-2xl border border-white/60 bg-white/80 px-3 py-2 text-xs text-[color:var(--color-muted)]"
                          rows={2}
                          disabled={report.status !== "open"}
                        />
                        <button
                          type="submit"
                          className="w-full rounded-2xl bg-[color:var(--color-accent)] px-4 py-2 text-sm font-semibold text-white shadow-md shadow-orange-200/60 disabled:opacity-50"
                          disabled={report.status !== "open"}
                        >
                          Warn user
                        </button>
                      </form>

                      <form action={deleteReportUser} className="space-y-3">
                        <input type="hidden" name="report_id" value={report.id} />
                        <textarea
                          name="action_notes"
                          placeholder="Optional deletion note"
                          className="w-full rounded-2xl border border-white/60 bg-white/80 px-3 py-2 text-xs text-[color:var(--color-muted)]"
                          rows={2}
                          disabled={report.status !== "open"}
                        />
                        <button
                          type="submit"
                          className="w-full rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 shadow-sm disabled:opacity-50"
                          disabled={report.status !== "open"}
                        >
                          Delete user
                        </button>
                      </form>
                    </div>

                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
