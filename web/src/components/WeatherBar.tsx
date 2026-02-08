import { useEffect, useState } from "react";
import type { Location } from "@/lib/types";
import { getItalyNow } from "@/lib/time";
import { italyBoundsContains } from "@/lib/geo";

type WeatherBarProps = {
  activeCity?: string;
  activeLocation?: Location;
  userCoords?: { lat: number; lon: number } | null;
};

type WeatherState = {
  temperature?: number;
  feelsLike?: number;
  code?: number;
};

const FLORENCE = { lat: 43.773544, lon: 11.255181 };
const TRIP_START = new Date("2026-02-08T00:00:00+01:00");
const WEATHER_CACHE = new Map<
  string,
  { state: WeatherState; timestamp: number }
>();
const WEATHER_TTL_MS = 20 * 60 * 1000;

function cacheKey(lat: number, lon: number) {
  return `${lat.toFixed(3)},${lon.toFixed(3)}`;
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path
        fill="currentColor"
        d="M12 4.5a1 1 0 0 1 1 1V7a1 1 0 1 1-2 0V5.5a1 1 0 0 1 1-1Zm0 10a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm7.5-1.5a1 1 0 1 1 0-2h-1.5a1 1 0 1 1 0-2h1.5a1 1 0 1 1 0 2h-1.5a1 1 0 1 1 0 2h1.5ZM12 17a1 1 0 0 1 1 1v1.5a1 1 0 1 1-2 0V18a1 1 0 0 1 1-1Zm-7.5-5.5a1 1 0 1 1 0-2H6a1 1 0 1 1 0-2H4.5a1 1 0 1 1 0 2H6a1 1 0 1 1 0 2H4.5Zm11.46-6.04a1 1 0 0 1 1.41 0l.7.7a1 1 0 0 1-1.41 1.42l-.7-.7a1 1 0 0 1 0-1.42ZM6.43 16.49a1 1 0 0 1 1.41 0l.7.7a1 1 0 0 1-1.41 1.42l-.7-.7a1 1 0 0 1 0-1.42Zm10.54 1.42a1 1 0 0 1 0-1.42l.7-.7a1 1 0 1 1 1.41 1.42l-.7.7a1 1 0 0 1-1.41 0ZM7.13 7.17a1 1 0 0 1 0-1.42l.7-.7a1 1 0 1 1 1.41 1.42l-.7.7a1 1 0 0 1-1.41 0Z"
      />
    </svg>
  );
}

function CloudIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path
        fill="currentColor"
        d="M7.5 18a4.5 4.5 0 0 1-.5-8.97A5.5 5.5 0 0 1 17 8.5a4 4 0 1 1 1 7.95H7.5Z"
      />
    </svg>
  );
}

function RainIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path
        fill="currentColor"
        d="M7.5 16.5a4.5 4.5 0 0 1-.5-8.97A5.5 5.5 0 0 1 17 7a4 4 0 1 1 1 7.95H7.5Zm1.5 2.75a.75.75 0 0 1 1.5 0v1.5a.75.75 0 1 1-1.5 0v-1.5Zm4 0a.75.75 0 0 1 1.5 0v1.5a.75.75 0 1 1-1.5 0v-1.5Zm4 0a.75.75 0 0 1 1.5 0v1.5a.75.75 0 1 1-1.5 0v-1.5Z"
      />
    </svg>
  );
}

function StormIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path
        fill="currentColor"
        d="M7.5 16a4.5 4.5 0 0 1-.5-8.97A5.5 5.5 0 0 1 17 6.5a4 4 0 1 1 1 7.95H13l-2 4.5h2l-1.5 4 5-6H13l2-3h-7.5Z"
      />
    </svg>
  );
}

function SnowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path
        fill="currentColor"
        d="M11 4a1 1 0 1 1 2 0v2.59l1.3-1.3a1 1 0 1 1 1.4 1.42L13.41 9H16a1 1 0 1 1 0 2h-2.59l2.3 2.29a1 1 0 0 1-1.4 1.42L13 12.41V15a1 1 0 1 1-2 0v-2.59l-1.3 1.3a1 1 0 0 1-1.4-1.42L10.59 11H8a1 1 0 1 1 0-2h2.59L8.3 6.71A1 1 0 1 1 9.7 5.29L11 6.59V4Z"
      />
    </svg>
  );
}

function weatherMeta(code?: number) {
  if (code === undefined || code === null) {
    return { label: "Weather", Icon: CloudIcon };
  }
  if (code === 0) return { label: "Clear", Icon: SunIcon };
  if ([1, 2].includes(code)) return { label: "Partly cloudy", Icon: CloudIcon };
  if (code === 3) return { label: "Overcast", Icon: CloudIcon };
  if ([45, 48].includes(code)) return { label: "Fog", Icon: CloudIcon };
  if ([51, 53, 55].includes(code)) return { label: "Drizzle", Icon: RainIcon };
  if ([61, 63, 65, 80, 81, 82].includes(code))
    return { label: "Rain", Icon: RainIcon };
  if ([71, 73, 75, 77, 85, 86].includes(code))
    return { label: "Snow", Icon: SnowIcon };
  if ([95, 96, 99].includes(code)) return { label: "Storm", Icon: StormIcon };
  return { label: "Weather", Icon: CloudIcon };
}

function toFahrenheit(celsius?: number) {
  if (celsius === undefined || celsius === null) return undefined;
  return (celsius * 9) / 5 + 32;
}

export default function WeatherBar({
  activeCity,
  activeLocation,
  userCoords,
}: WeatherBarProps) {
  const italyNow = getItalyNow();
  const beforeTrip = italyNow < TRIP_START;
  const inItaly =
    userCoords?.lat !== undefined &&
    userCoords?.lon !== undefined &&
    italyBoundsContains(userCoords.lat, userCoords.lon);

  const target = beforeTrip
    ? { ...FLORENCE, label: "Florence" }
    : inItaly && userCoords
      ? { ...userCoords, label: "Near you" }
      : activeLocation
        ? {
            lat: activeLocation.lat,
            lon: activeLocation.lon,
            label: activeCity ?? activeLocation.name,
          }
        : { ...FLORENCE, label: "Florence" };

  const [state, setState] = useState<WeatherState>({});
  const [status, setStatus] = useState<"idle" | "loading" | "ready">("idle");

  useEffect(() => {
    let cancelled = false;
    const fetchWeather = async () => {
      const key = cacheKey(target.lat, target.lon);
      const cached = WEATHER_CACHE.get(key);
      if (cached && Date.now() - cached.timestamp < WEATHER_TTL_MS) {
        setState(cached.state);
        setStatus("ready");
        return;
      }

      setStatus("loading");
      try {
        const url = new URL("https://api.open-meteo.com/v1/forecast");
        url.searchParams.set("latitude", String(target.lat));
        url.searchParams.set("longitude", String(target.lon));
        url.searchParams.set(
          "current",
          "temperature_2m,apparent_temperature,weather_code",
        );
        url.searchParams.set("timezone", "Europe/Rome");
        const response = await fetch(url.toString());
        if (!response.ok) throw new Error("Weather fetch failed");
        const data = await response.json();
        if (cancelled) return;
        const current = data.current ?? {};
        const nextState = {
          temperature: current.temperature_2m,
          feelsLike: current.apparent_temperature,
          code: current.weather_code,
        };
        WEATHER_CACHE.set(key, { state: nextState, timestamp: Date.now() });
        setState(nextState);
        setStatus("ready");
      } catch {
        if (!cancelled) {
          setStatus("ready");
          setState({});
        }
      }
    };
    fetchWeather();
    return () => {
      cancelled = true;
    };
  }, [target.lat, target.lon]);

  const meta = weatherMeta(state.code);
  const Icon = meta.Icon;
  const tempF = toFahrenheit(state.temperature);
  const feelsF = toFahrenheit(state.feelsLike);

  return (
    <div className="panel flex items-center justify-between gap-4 px-4 py-3">
      <div>
        <p className="text-xs uppercase tracking-wide text-fog/60">
          {target.label === "Near you"
            ? "Weather near you"
            : `Weather in ${target.label ?? "Florence"}`}
        </p>
        <p className="text-sm text-fog/70">{meta.label}</p>
      </div>
      <div className="flex items-center gap-3 text-bright">
        <Icon />
        <div className="text-right">
          {status === "loading" ? (
            <p className="text-sm text-fog/60">Loading…</p>
          ) : (
            <>
              <p className="text-lg font-semibold">
                {tempF !== undefined
                  ? `${Math.round(tempF)}°F`
                  : "—"}
              </p>
              <p className="text-xs text-fog/60">
                Feels like{" "}
                {feelsF !== undefined
                  ? `${Math.round(feelsF)}°F`
                  : "—"}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
