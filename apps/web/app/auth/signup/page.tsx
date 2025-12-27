import Link from "next/link";
import TimezoneField from "@/components/TimezoneField";
import { signUp } from "../actions";

type SignupPageProps = {
  searchParams?: { error?: string };
};

export default function SignupPage({ searchParams }: SignupPageProps) {
  const errorMessage =
    typeof searchParams?.error === "string" ? searchParams.error : "";

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-display text-2xl text-[color:var(--color-foreground)]">
          Create your account
        </h1>
        <p className="text-sm text-[color:var(--color-muted)]">
          Start a private challenge or jump into the public arena.
        </p>
      </div>

      {errorMessage ? (
        <div className="rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-900">
          {errorMessage}
        </div>
      ) : null}

      <form action={signUp} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded-2xl border border-white/60 bg-white/80 px-4 py-3 text-sm shadow-sm outline-none focus:border-[color:var(--color-accent)]"
            placeholder="you@example.com"
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="username" className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              className="w-full rounded-2xl border border-white/60 bg-white/80 px-4 py-3 text-sm shadow-sm outline-none focus:border-[color:var(--color-accent)]"
              placeholder="shotlover"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full rounded-2xl border border-white/60 bg-white/80 px-4 py-3 text-sm shadow-sm outline-none focus:border-[color:var(--color-accent)]"
              placeholder="At least 8 characters"
            />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="country" className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
              Country
            </label>
            <input
              id="country"
              name="country"
              type="text"
              required
              className="w-full rounded-2xl border border-white/60 bg-white/80 px-4 py-3 text-sm shadow-sm outline-none focus:border-[color:var(--color-accent)]"
              placeholder="Norway"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="city" className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
              City
            </label>
            <input
              id="city"
              name="city"
              type="text"
              required
              className="w-full rounded-2xl border border-white/60 bg-white/80 px-4 py-3 text-sm shadow-sm outline-none focus:border-[color:var(--color-accent)]"
              placeholder="Oslo"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label htmlFor="timezone" className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
            Timezone
          </label>
          <TimezoneField />
          <p className="text-xs text-[color:var(--color-muted)]">
            We auto-detect your timezone, but you can edit it if needed.
          </p>
        </div>
        <div className="flex items-start gap-3 text-xs text-[color:var(--color-muted)]">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            required
            className="mt-1 h-4 w-4 rounded border border-white/60 text-[color:var(--color-accent)]"
          />
          <label htmlFor="terms">
            I confirm I am 13+ and accept the Terms.
          </label>
        </div>
        <button
          type="submit"
          className="w-full rounded-2xl bg-[color:var(--color-accent)] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-200/60 transition hover:bg-[color:var(--color-accent-strong)]"
        >
          Create account
        </button>
        <p className="text-xs text-[color:var(--color-muted)]">
          Passwords must include 8+ characters, one uppercase letter, and one special character.
        </p>
      </form>

      <div className="text-sm text-[color:var(--color-muted)]">
        Already have an account?{" "}
        <Link href="/auth/login" className="font-semibold text-[color:var(--color-accent-strong)]">
          Sign in
        </Link>
      </div>
    </div>
  );
}
