import { useEffect, useState } from "react";
import { getItalyNow } from "@/lib/time";

export default function ItalyClock() {
  const [now, setNow] = useState(() => getItalyNow());

  useEffect(() => {
    const id = window.setInterval(() => setNow(getItalyNow()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const time = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Rome",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(now);

  const date = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Rome",
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(now);

  return (
    <div className="panel flex items-center justify-between gap-4 px-4 py-3">
      <div>
        <p className="text-xs uppercase tracking-wide text-fog/60">Italy time</p>
        <p className="text-lg font-semibold text-bright">{time}</p>
      </div>
      <p className="text-sm text-fog/70">{date}</p>
    </div>
  );
}
