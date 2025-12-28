import Link from "next/link";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";
import InviteFriends from "@/components/InviteFriends";
import { getCurrentUser, maskEmail } from "@/lib/data/user";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-[color:var(--color-foreground)]">
            Your Profile
          </h1>
          <p className="text-sm text-[color:var(--color-muted)]">
            Keep your public challenger status and stats visible.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/settings"
            className="rounded-2xl border border-white/60 bg-white/80 px-4 py-2 text-sm font-semibold text-[color:var(--color-muted)]"
          >
            Settings
          </Link>
          <LogoutButton />
        </div>
      </header>

      <section className="rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--color-muted)]">
                Username
              </p>
              <h2 className="font-display text-2xl text-[color:var(--color-foreground)]">
                {user.username}
              </h2>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--color-muted)]">
                Email
              </p>
              <p className="text-sm text-[color:var(--color-foreground)]">
                {maskEmail(user.email)}
              </p>
            </div>
            {user.city && user.country && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--color-muted)]">
                  Location
                </p>
                <p className="text-sm text-[color:var(--color-foreground)]">
                  {user.city}, {user.country}
                </p>
              </div>
            )}
          </div>
          <button
            type="button"
            className="rounded-2xl bg-[color:var(--color-accent)] px-4 py-2 text-sm font-semibold text-white shadow-md shadow-orange-200/60"
          >
            Enable public link
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-white/70 bg-white/70 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--color-muted)]">
            Wins
          </p>
          <p className="mt-3 text-2xl font-semibold text-[color:var(--color-foreground)]">0</p>
        </div>
        <div className="rounded-3xl border border-white/70 bg-white/70 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--color-muted)]">
            Avg stars
          </p>
          <p className="mt-3 text-2xl font-semibold text-[color:var(--color-foreground)]">--</p>
        </div>
        <div className="rounded-3xl border border-white/70 bg-white/70 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--color-muted)]">
            Streak
          </p>
          <p className="mt-3 text-2xl font-semibold text-[color:var(--color-foreground)]">0</p>
        </div>
      </section>

      <InviteFriends userId={user.id} username={user.username} />
    </div>
  );
}
