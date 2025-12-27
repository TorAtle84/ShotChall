import Link from "next/link";
import SubmissionCard from "@/components/SubmissionCard";

export default function ArenaPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="font-display text-3xl text-[color:var(--color-foreground)]">
          Public Arena
        </h1>
        <p className="text-sm text-[color:var(--color-muted)]">
          See what the community is shooting today.
        </p>
      </header>

      <section className="rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--color-muted)]">
              Spotlight
            </p>
            <h2 className="mt-2 font-display text-2xl text-[color:var(--color-foreground)]">
              Textures in motion
            </h2>
            <p className="mt-2 text-sm text-[color:var(--color-muted)]">
              42 submissions so far. Vote and react.
            </p>
          </div>
          <Link
            href="/challenges/new"
            className="rounded-2xl bg-[color:var(--color-accent)] px-4 py-2 text-sm font-semibold text-white shadow-md shadow-orange-200/60"
          >
            Create a public challenge
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {[
          {
            title: "Urban contrast study",
            subtitle: "12 photos - 4.2 avg stars",
            reactions: { flame: 1, heart: 3, wow: 2 },
            badge: "Live",
          },
          {
            title: "Textures in motion",
            subtitle: "8 photos - 4.6 avg stars",
            reactions: { flame: 4, heart: 5, wow: 1 },
            badge: "New",
          },
          {
            title: "Soft light portraits",
            subtitle: "18 photos - 4.1 avg stars",
            reactions: { flame: 2, heart: 7, wow: 3 },
          },
          {
            title: "Neon reflections",
            subtitle: "5 photos - 3.9 avg stars",
            reactions: { flame: 0, heart: 2, wow: 1 },
          },
        ].map((item) => (
          <SubmissionCard
            key={item.title}
            title={item.title}
            subtitle={item.subtitle}
            reactions={item.reactions}
            badge={item.badge}
          />
        ))}
      </section>
    </div>
  );
}
