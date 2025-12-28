type ReactionSummaryProps = {
  reactions: {
    flame: number;
    heart: number;
    wow: number;
  };
};

const icons = {
  flame: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
      <path d="M12 2c-2.5 3-6 6-6 10.5C6 16.1 8.7 19 12 19s6-2.9 6-6.5C18 8 14.5 5 12 2zm0 14c-2 0-3.5-1.6-3.5-3.5 0-2.2 1.8-4 3.5-6 1.7 2 3.5 3.8 3.5 6 0 1.9-1.5 3.5-3.5 3.5z" />
    </svg>
  ),
  heart: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  ),
  wow: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
      <circle cx="12" cy="12" r="10" />
      <circle cx="9" cy="10" r="1.5" fill="white" />
      <circle cx="15" cy="10" r="1.5" fill="white" />
      <ellipse cx="12" cy="16" rx="2" ry="2.5" fill="white" />
    </svg>
  ),
};

const items = [
  { key: "flame", label: "Fire", color: "text-orange-400" },
  { key: "heart", label: "Heart", color: "text-rose-300" },
  { key: "wow", label: "Wow", color: "text-sky-300" },
] as const;

export default function ReactionSummary({ reactions }: ReactionSummaryProps) {
  return (
    <div className="flex items-center gap-3 rounded-full bg-black/60 px-3 py-1.5 text-xs font-semibold text-white shadow-lg shadow-black/20 backdrop-blur">
      {items.map((item) => {
        const count = reactions[item.key];
        return (
          <span
            key={item.key}
            className="flex items-center gap-1"
            aria-label={`${item.label} reactions: ${count}`}
          >
            <span className={item.color} aria-hidden="true">
              {icons[item.key]}
            </span>
            <span>{count}</span>
          </span>
        );
      })}
    </div>
  );
}
