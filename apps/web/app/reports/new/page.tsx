import { createPictureReport, createUserReport } from "../actions";
import { REPORT_REASONS, REPORT_REASON_LABELS } from "@/lib/reporting";

type ReportPageProps = {
  searchParams?: Promise<{
    submission_id?: string;
    reported_user_id?: string;
    success?: string;
    error?: string;
    message?: string;
    email?: string;
  }>;
};

export default async function ReportPage({ searchParams }: ReportPageProps) {
  const params = await searchParams;
  const submissionId =
    typeof params?.submission_id === "string"
      ? params.submission_id
      : "";
  const reportedUserId =
    typeof params?.reported_user_id === "string"
      ? params.reported_user_id
      : "";
  const successMessage =
    params?.success === "1"
      ? params.message || "Report submitted."
      : "";
  const errorMessage =
    params?.error === "1"
      ? params.message || "Unable to submit report."
      : "";
  const emailFailed = params?.email === "failed";

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="font-display text-3xl text-[color:var(--color-foreground)]">
          Report content
        </h1>
        <p className="text-sm text-[color:var(--color-muted)]">
          Reports are reviewed by the ShotChall team.
        </p>
      </header>

      {successMessage ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          {successMessage}
          {emailFailed ? " Admin email failed to send." : ""}
        </div>
      ) : null}

      {errorMessage ? (
        <div className="rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-900">
          {errorMessage}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-sm">
          <h2 className="font-display text-2xl text-[color:var(--color-foreground)]">
            Report a submission
          </h2>
          <p className="mt-2 text-sm text-[color:var(--color-muted)]">
            Use this when reporting a specific photo.
          </p>

          <form action={createPictureReport} className="mt-6 space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="submission_id"
                className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-muted)]"
              >
                Submission ID
              </label>
              <input
                id="submission_id"
                name="submission_id"
                type="text"
                required
                defaultValue={submissionId}
                className="w-full rounded-2xl border border-white/60 bg-white/80 px-4 py-3 text-sm shadow-sm outline-none focus:border-[color:var(--color-accent)]"
                placeholder="UUID of the submission"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="reason"
                className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-muted)]"
              >
                Reason
              </label>
              <select
                id="reason"
                name="reason"
                required
                className="w-full rounded-2xl border border-white/60 bg-white/80 px-4 py-3 text-sm shadow-sm outline-none focus:border-[color:var(--color-accent)]"
              >
                <option value="">Select a reason</option>
                {REPORT_REASONS.map((reason) => (
                  <option key={reason} value={reason}>
                    {REPORT_REASON_LABELS[reason]}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="details"
                className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-muted)]"
              >
                Details (optional)
              </label>
              <textarea
                id="details"
                name="details"
                rows={4}
                className="w-full rounded-2xl border border-white/60 bg-white/80 px-4 py-3 text-sm shadow-sm outline-none focus:border-[color:var(--color-accent)]"
                placeholder="Share any extra context for the review."
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-2xl bg-[color:var(--color-accent)] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-200/60 transition hover:bg-[color:var(--color-accent-strong)]"
            >
              Submit report
            </button>
          </form>
        </section>

        <section className="rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-sm">
          <h2 className="font-display text-2xl text-[color:var(--color-foreground)]">
            Report a user
          </h2>
          <p className="mt-2 text-sm text-[color:var(--color-muted)]">
            Use this for profile-level issues.
          </p>

          <form action={createUserReport} className="mt-6 space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="reported_user_id"
                className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-muted)]"
              >
                Reported user ID
              </label>
              <input
                id="reported_user_id"
                name="reported_user_id"
                type="text"
                required
                defaultValue={reportedUserId}
                className="w-full rounded-2xl border border-white/60 bg-white/80 px-4 py-3 text-sm shadow-sm outline-none focus:border-[color:var(--color-accent)]"
                placeholder="UUID of the user"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="reason-user"
                className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-muted)]"
              >
                Reason
              </label>
              <select
                id="reason-user"
                name="reason"
                required
                className="w-full rounded-2xl border border-white/60 bg-white/80 px-4 py-3 text-sm shadow-sm outline-none focus:border-[color:var(--color-accent)]"
              >
                <option value="">Select a reason</option>
                {REPORT_REASONS.map((reason) => (
                  <option key={reason} value={reason}>
                    {REPORT_REASON_LABELS[reason]}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="details-user"
                className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-muted)]"
              >
                Details (optional)
              </label>
              <textarea
                id="details-user"
                name="details"
                rows={4}
                className="w-full rounded-2xl border border-white/60 bg-white/80 px-4 py-3 text-sm shadow-sm outline-none focus:border-[color:var(--color-accent)]"
                placeholder="Share any extra context for the review."
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-2xl border border-white/60 bg-white/80 px-4 py-3 text-sm font-semibold text-[color:var(--color-muted)] transition hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent-strong)]"
            >
              Submit report
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
