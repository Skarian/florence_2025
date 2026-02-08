import { haversineKm } from "@/lib/geo";

type WalkingResult = {
  minutes: number;
  source: "osrm" | "estimate";
};

const WALKING_CACHE = new Map<
  string,
  { value: WalkingResult; timestamp: number }
>();
const WALKING_TTL_MS = 15 * 60 * 1000;

function cacheKey(from: { lat: number; lon: number }, to: { lat: number; lon: number }) {
  return [
    from.lat.toFixed(4),
    from.lon.toFixed(4),
    to.lat.toFixed(4),
    to.lon.toFixed(4),
  ].join("|");
}

export async function getWalkingTimeMinutes(
  from: { lat: number; lon: number },
  to: { lat: number; lon: number },
): Promise<WalkingResult> {
  const key = cacheKey(from, to);
  const cached = WALKING_CACHE.get(key);
  if (cached && Date.now() - cached.timestamp < WALKING_TTL_MS) {
    return cached.value;
  }

  const fallback = () => {
    const distanceKm = haversineKm(from.lat, from.lon, to.lat, to.lon);
    const minutes = Math.max(1, Math.round((distanceKm / 4.8) * 60));
    return { minutes, source: "estimate" } as WalkingResult;
  };

  try {
    const url = `https://router.project-osrm.org/route/v1/walking/${from.lon},${from.lat};${to.lon},${to.lat}?overview=false`;
    const response = await fetch(url);
    if (!response.ok) {
      const result = fallback();
      WALKING_CACHE.set(key, { value: result, timestamp: Date.now() });
      return result;
    }
    const data = await response.json();
    const seconds = data.routes?.[0]?.duration;
    if (!seconds) {
      const result = fallback();
      WALKING_CACHE.set(key, { value: result, timestamp: Date.now() });
      return result;
    }
    const result: WalkingResult = {
      minutes: Math.max(1, Math.round(seconds / 60)),
      source: "osrm",
    };
    WALKING_CACHE.set(key, { value: result, timestamp: Date.now() });
    return result;
  } catch {
    const result = fallback();
    WALKING_CACHE.set(key, { value: result, timestamp: Date.now() });
    return result;
  }
}
