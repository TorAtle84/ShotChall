"use client";

import { useEffect, useState } from "react";

export default function TimezoneField() {
  const [timezone, setTimezone] = useState("");

  useEffect(() => {
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (detected) {
      setTimezone(detected);
    }
  }, []);

  return (
    <input
      id="timezone"
      name="timezone"
      type="text"
      required
      value={timezone}
      onChange={(event) => setTimezone(event.target.value)}
      className="w-full rounded-2xl border border-white/60 bg-white/80 px-4 py-3 text-sm shadow-sm outline-none focus:border-[color:var(--color-accent)]"
      placeholder="e.g. Europe/Oslo"
    />
  );
}
