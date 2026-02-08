import { useEffect, useState } from "react";

export function useMediaQuery(query: string, defaultValue = false) {
  const [matches, setMatches] = useState(defaultValue);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia(query);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMatches(media.matches);
    const handler = (event: MediaQueryListEvent) => setMatches(event.matches);
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, [query]);

  return matches;
}
