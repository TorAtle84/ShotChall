import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/data/user";
import LogoutButton from "@/components/LogoutButton";

export default async function SettingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="font-display text-3xl text-[color:var(--color-foreground)]">
          Settings
        </h1>
        <p className="text-sm text-[color:var(--color-muted)]">
          Manage privacy, notifications, and account controls.
        </p>
      </header>

      <section className="rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-sm">
        <h2 className="font-display text-xl text-[color:var(--color-foreground)]">
          Quiet hours
        </h2>
        <p className="mt-2 text-sm text-[color:var(--color-muted)]">
          Notifications are muted between 22:00 and 06:00 in your timezone.
        </p>
        <div className="mt-4 flex gap-4">
          <div className="flex-1">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
              From
            </label>
            <select
              className="mt-1 w-full rounded-xl border border-white/60 bg-white/80 px-3 py-2 text-sm"
              defaultValue="22:00"
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={`${i.toString().padStart(2, "0")}:00`}>
                  {i.toString().padStart(2, "0")}:00
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
              To
            </label>
            <select
              className="mt-1 w-full rounded-xl border border-white/60 bg-white/80 px-3 py-2 text-sm"
              defaultValue="06:00"
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={`${i.toString().padStart(2, "0")}:00`}>
                  {i.toString().padStart(2, "0")}:00
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-sm">
        <h2 className="font-display text-xl text-[color:var(--color-foreground)]">
          Account
        </h2>
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-[color:var(--color-foreground)]">
                Email
              </p>
              <p className="text-sm text-[color:var(--color-muted)]">
                {user.email}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-[color:var(--color-foreground)]">
                Timezone
              </p>
              <p className="text-sm text-[color:var(--color-muted)]">
                {user.timezone || "Not set"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-red-100 bg-red-50/50 p-6 shadow-sm">
        <h2 className="font-display text-xl text-red-800">
          Danger zone
        </h2>
        <p className="mt-2 text-sm text-red-600">
          Permanently delete your account and all data.
        </p>
        <div className="mt-4 flex gap-3">
          <LogoutButton />
          <button
            type="button"
            className="rounded-2xl border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
          >
            Delete account
          </button>
        </div>
      </section>
    </div>
  );
}
