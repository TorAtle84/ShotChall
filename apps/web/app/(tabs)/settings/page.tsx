export default function SettingsPage() {
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
      </section>
    </div>
  );
}
