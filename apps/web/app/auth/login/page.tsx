import Link from "next/link";
import { signIn } from "../actions";

type LoginPageProps = {
  searchParams: Promise<{ error?: string; email?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const errorMessage =
    typeof params?.error === "string" ? params.error : "";
  const email = typeof params?.email === "string" ? params.email : "";

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-display text-2xl text-[color:var(--color-foreground)]">
          Welcome back
        </h1>
        <p className="text-sm text-[color:var(--color-muted)]">
          Sign in to keep the challenges rolling.
        </p>
      </div>

      {errorMessage ? (
        <div className="rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-900">
          {errorMessage}
        </div>
      ) : null}

      <form action={signIn} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            defaultValue={email}
            className="w-full rounded-2xl border border-white/60 bg-white/80 px-4 py-3 text-sm shadow-sm outline-none focus:border-[color:var(--color-accent)]"
            placeholder="you@example.com"
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
            placeholder="********"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-2xl bg-[color:var(--color-accent)] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-200/60 transition hover:bg-[color:var(--color-accent-strong)]"
        >
          Sign in
        </button>
      </form>

      <div className="flex items-center justify-between text-sm text-[color:var(--color-muted)]">
        <Link href="/auth/signup" className="font-semibold text-[color:var(--color-accent-strong)]">
          Create account
        </Link>
        <Link href="/auth/verify" className="font-semibold">
          Verify email
        </Link>
      </div>
    </div>
  );
}
