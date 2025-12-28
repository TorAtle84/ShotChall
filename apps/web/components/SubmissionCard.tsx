import Link from "next/link";
import ReactionSummary from "./ReactionSummary";

type SubmissionCardProps = {
  title: string;
  subtitle: string;
  reactions: {
    flame: number;
    heart: number;
    wow: number;
  };
  badge?: string;
  reportSubmissionId?: string;
};

export default function SubmissionCard({
  title,
  subtitle,
  reactions,
  badge,
  reportSubmissionId,
}: SubmissionCardProps) {
  const reportHref = reportSubmissionId
    ? `/reports/new?submission_id=${encodeURIComponent(reportSubmissionId)}`
    : "";
  const reportDisabled = !reportHref;

  return (
    <article className="rounded-3xl border border-white/70 bg-white/80 p-4 shadow-sm">
      <div
        className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/60"
        role="img"
        aria-label={title}
      >
        <div className="absolute inset-0 bg-[linear-gradient(140deg,#ffe1c7_0%,#d8e6ff_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#ffffff55,transparent_60%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />
        {reportDisabled ? (
          <span
            aria-hidden="true"
            className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-white/70 bg-white/70 text-xs font-semibold text-[color:var(--color-muted)] opacity-70 shadow-sm"
            title="Reporting opens when submissions are live."
          >
            !
          </span>
        ) : (
          <Link
            href={reportHref}
            aria-label="Report submission"
            className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-white/70 bg-white/70 text-xs font-semibold text-[color:var(--color-muted)] shadow-sm transition hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent-strong)]"
          >
            !
          </Link>
        )}
        {badge ? (
          <span className="absolute right-3 top-3 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-[color:var(--color-muted)]">
            {badge}
          </span>
        ) : null}
        <div className="absolute bottom-3 left-3">
          <ReactionSummary reactions={reactions} />
        </div>
      </div>
      <div className="mt-4 space-y-1">
        <h3 className="font-display text-xl text-[color:var(--color-foreground)]">
          {title}
        </h3>
        <p className="text-sm text-[color:var(--color-muted)]">{subtitle}</p>
      </div>
    </article>
  );
}
