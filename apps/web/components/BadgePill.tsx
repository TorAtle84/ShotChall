import { BadgeTier } from "@/lib/data/stats";

type BadgePillProps = {
  tier: BadgeTier;
  streak: number;
};

const badgeStyles: Record<BadgeTier, string> = {
  Bronze: "bg-amber-100 text-amber-700",
  Silver: "bg-slate-100 text-slate-700",
  Gold: "bg-yellow-100 text-yellow-700",
  Diamond: "bg-sky-100 text-sky-700",
};

export default function BadgePill({ tier, streak }: BadgePillProps) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${badgeStyles[tier]}`}
    >
      <span>{tier}</span>
      <span className="text-[color:var(--color-muted)]">{streak}-day streak</span>
    </div>
  );
}
