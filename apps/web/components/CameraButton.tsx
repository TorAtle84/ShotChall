import Link from "next/link";

export default function CameraButton() {
  return (
    <Link
      href="/challenges/new"
      aria-label="Create a challenge"
      className="relative -mt-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[color:var(--color-accent)] text-white shadow-lg shadow-orange-200/60 transition hover:-translate-y-0.5 hover:bg-[color:var(--color-accent-strong)]"
    >
      <span className="absolute inset-0 rounded-2xl border border-white/40" />
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 7h3l2-2h8l2 2h3" />
        <rect x="3" y="7" width="18" height="12" rx="3" />
        <circle cx="12" cy="13" r="3.5" />
      </svg>
    </Link>
  );
}
