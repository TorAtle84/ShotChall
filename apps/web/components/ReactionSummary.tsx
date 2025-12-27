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
      <path d="M12 3c-2 2.4-4.5 4.9-4.5 8.2a4.5 4.5 0 0 0 9 0c0-3.3-2.5-5.8-4.5-8.2z" />
    </svg>
  ),
  heart: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
      <path d="M12 20s-7-4.4-7-9.1C5 8.5 6.6 7 8.5 7c1.5 0 2.8.7 3.5 1.9C12.8 7.7 14 7 15.5 7 17.4 7 19 8.5 19 10.9 19 15.6 12 20 12 20z" />
    </svg>
  ),
  wow: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
      <path d="M12 3l2.2 4.9 5.3.5-4 3.4 1.2 5.1-4.7-2.8-4.7 2.8 1.2-5.1-4-3.4 5.3-.5L12 3z" />
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
