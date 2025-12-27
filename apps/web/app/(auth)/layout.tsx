import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-12">
        <Link
          href="/auth/login"
          className="text-xs font-semibold uppercase tracking-[0.5em] text-[color:var(--color-muted)]"
        >
          ShotChall
        </Link>
        <div className="mt-6 rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-xl shadow-orange-100/50 backdrop-blur">
          {children}
        </div>
      </div>
    </div>
  );
}
