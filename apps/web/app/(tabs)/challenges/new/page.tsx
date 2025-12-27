import Link from "next/link";

export default function NewChallengePage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--color-muted)]">
          Create
        </p>
        <h1 className="font-display text-3xl text-[color:var(--color-foreground)]">
          New Challenge
        </h1>
        <p className="text-sm text-[color:var(--color-muted)]">
          Choose a prompt type, set the rules, and invite your crew.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-sm">
          <h2 className="font-display text-xl text-[color:var(--color-foreground)]">Text challenge</h2>
          <p className="mt-2 text-sm text-[color:var(--color-muted)]">
            Pick a template or write your own prompt.
          </p>
        </div>
        <div className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-sm">
          <h2 className="font-display text-xl text-[color:var(--color-foreground)]">
            Photo imitation
          </h2>
          <p className="mt-2 text-sm text-[color:var(--color-muted)]">
            Upload a reference image and set the transform mode.
          </p>
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/challenges"
          className="rounded-2xl border border-white/60 bg-white/80 px-4 py-2 text-sm font-semibold text-[color:var(--color-muted)]"
        >
          Back to challenges
        </Link>
        <button
          type="button"
          className="rounded-2xl bg-[color:var(--color-accent)] px-4 py-2 text-sm font-semibold text-white shadow-md shadow-orange-200/60"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
