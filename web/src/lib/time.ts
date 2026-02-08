export function formatItalyTime(isoString: string) {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Rome",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export function formatItalyDate(isoString: string) {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Rome",
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function formatItalyDateLong(isoString: string) {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Rome",
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function formatItalyTimeRange(startIso: string, endIso?: string) {
  if (!endIso) {
    return formatItalyTime(startIso);
  }
  return `${formatItalyTime(startIso)} – ${formatItalyTime(endIso)}`;
}

export function italyDateKey(isoString: string) {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Rome",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function getItalyNow() {
  const now = new Date();
  const italyString = now.toLocaleString("en-US", { timeZone: "Europe/Rome" });
  return new Date(italyString);
}
