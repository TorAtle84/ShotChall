import Link from "next/link";
import VerifyEmailStatus from "@/components/VerifyEmailStatus";
import { resendVerification } from "../actions";

type VerifyPageProps = {
  searchParams?: {
    error?: string;
    email?: string;
    sent?: string;
    code?: string;
    token_hash?: string;
    type?: string;
  };
};

export default function VerifyPage({ searchParams }: VerifyPageProps) {
  const errorMessage =
    typeof searchParams?.error === "string" ? searchParams.error : "";
  const email =
    typeof searchParams?.email === "string" ? searchParams.email : "";
  const sent = searchParams?.sent === "1";
  const code =
    typeof searchParams?.code === "string" ? searchParams.code : undefined;
  const tokenHash =
    typeof searchParams?.token_hash === "string"
      ? searchParams.token_hash
      : undefined;
  const type =
    typeof searchParams?.type === "string" ? searchParams.type : undefined;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-display text-2xl text-[color:var(--color-foreground)]">
          Verify your email
        </h1>
        <p className="text-sm text-[color:var(--color-muted)]">
          We sent a verification link to {email || "your inbox"}.
        </p>
      </div>

      <VerifyEmailStatus code={code} tokenHash={tokenHash} type={type} />

      {sent ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Verification email sent.
        </div>
      ) : null}

      {errorMessage ? (
        <div className="rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-900">
          {errorMessage}
        </div>
      ) : null}

      <form action={resendVerification} className="space-y-4">
        {email ? (
          <input type="hidden" name="email" value={email} />
        ) : (
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-muted)]"
            >
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
        )}
        <button
          type="submit"
          className="w-full rounded-2xl border border-white/60 bg-white/80 px-4 py-3 text-sm font-semibold text-[color:var(--color-muted)] transition hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent-strong)]"
        >
          Resend verification
        </button>
      </form>

      <div className="text-sm text-[color:var(--color-muted)]">
        Already verified?{" "}
        <Link href="/auth/login" className="font-semibold text-[color:var(--color-accent-strong)]">
          Sign in
        </Link>
      </div>
    </div>
  );
}
