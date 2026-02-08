import type { GetStaticProps } from "next";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import EventCard from "@/components/EventCard";
import ItalyClock from "@/components/ItalyClock";
import WeatherBar from "@/components/WeatherBar";
import MobileSheetLayout from "@/components/MobileSheetLayout";
import { getEvents, getStations } from "@/lib/data";
import { italyBoundsContains } from "@/lib/geo";
import { useGeolocation } from "@/lib/useGeolocation";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { getWalkingTimeMinutes } from "@/lib/walking";
import { formatItalyDateLong, getItalyNow, italyDateKey } from "@/lib/time";
import type { Event, Station } from "@/lib/types";

const RouteMap = dynamic(() => import("@/components/RouteMap"), { ssr: false });

type TimelineProps = {
  events: Event[];
  stations: Station[];
};

type WalkingState = {
  minutes: number;
  source: "osrm" | "estimate";
};

const FLIGHT_CODE_REGEX = /\(([A-Z]{3})\)/g;
const AIRPORT_CODE_REGEX = /\(([A-Z]{3})\)/;

function getFlightCodes(title: string) {
  return Array.from(title.matchAll(FLIGHT_CODE_REGEX)).map((match) => match[1]);
}

function getAirportCodeFromName(name: string) {
  const match = name.match(AIRPORT_CODE_REGEX);
  return match ? match[1] : null;
}

export const getStaticProps: GetStaticProps<TimelineProps> = async () => {
  return {
    props: {
      events: getEvents(),
      stations: getStations(),
    },
  };
};

function eventStatus(event: Event, now: Date) {
  const start = new Date(event.startsAt);
  const end = event.endsAt
    ? new Date(event.endsAt)
    : new Date(start.getTime() + 2 * 60 * 60 * 1000);

  if (now < start) return "upcoming";
  if (now >= start && now <= end) return "current";
  return "past";
}

export default function Home({ events, stations }: TimelineProps) {
  const [activeEventId, setActiveEventId] = useState(events[0]?.id ?? "");
  const [walking, setWalking] = useState<WalkingState | null>(null);
  const [now, setNow] = useState(() => getItalyNow());
  const revealedIds = useMemo(
    () => new Set(events.map((event) => event.id)),
    [events],
  );
  const isMobile = useMediaQuery("(max-width: 1023px)");
  const geo = useGeolocation(true);
  const userCoords = geo.status === "granted" ? geo.coords : null;
  const mobileScrollRef = useRef<HTMLDivElement | null>(null);
  const mobileScrollRaf = useRef<number | null>(null);

  useEffect(() => {
    const id = window.setInterval(() => setNow(getItalyNow()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const stationsById = useMemo(() => {
    return new Map(stations.map((station) => [station.id, station]));
  }, [stations]);

  const airportsByCode = useMemo(() => {
    const map = new Map<string, { lat: number; lon: number; name: string }>();
    events.forEach((event) => {
      if (event.category !== "flight") return;
      const codeFromName = getAirportCodeFromName(event.location.name);
      if (codeFromName) {
        map.set(codeFromName, event.location);
        return;
      }
      const codes = getFlightCodes(event.title);
      if (codes[0]) map.set(codes[0], event.location);
    });
    return map;
  }, [events]);

  const groupedEvents = useMemo(() => {
    const groups = new Map<string, Event[]>();
    events.forEach((event) => {
      const key = italyDateKey(event.startsAt);
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)?.push(event);
    });
    return Array.from(groups.entries()).map(([key, items]) => ({
      key,
      title: formatItalyDateLong(items[0].startsAt),
      items,
    }));
  }, [events]);

  const allEvents = useMemo(() => events, [events]);
  const nowMarkerId = useMemo(() => {
    const idx = allEvents.findIndex(
      (event) => new Date(event.startsAt) > now,
    );
    return idx === -1 ? "" : allEvents[idx].id;
  }, [allEvents, now]);

  const activeEvent = allEvents.find((event) => event.id === activeEventId);
  const activeEventLocation = activeEvent?.location;
  const activeRoute = (() => {
    if (!activeEvent) return null;
    if (activeEvent.route?.fromStationId) {
      return {
        from:
          stationsById.get(activeEvent.route.fromStationId)?.location ??
          activeEvent.location,
        to:
          stationsById.get(activeEvent.route.toStationId)?.location ??
          activeEvent.location,
      };
    }
    if (activeEvent.category === "flight") {
      const codes = getFlightCodes(activeEvent.title);
      const from = codes[0] ? airportsByCode.get(codes[0]) : null;
      const to = codes[1] ? airportsByCode.get(codes[1]) : null;
      if (from && to) {
        return { from, to };
      }
    }
    return null;
  })();

  const eventRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const setEventRef = (id: string) => (node: HTMLDivElement | null) => {
    if (node) {
      eventRefs.current.set(id, node);
    } else {
      eventRefs.current.delete(id);
    }
  };

  useEffect(() => {
    if (isMobile) return;
    const elements = Array.from(eventRefs.current.values());
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const top = visible[0];
        if (top?.target instanceof HTMLElement) {
          const id = top.target.dataset.eventId;
          if (id) setActiveEventId(id);
        }
      },
      { threshold: [0.3, 0.55, 0.9], rootMargin: "-20% 0px -45% 0px" },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [groupedEvents, isMobile]);

  useEffect(() => {
    if (!userCoords || !activeEventLocation) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setWalking(null);
      return;
    }
    const coords = { lat: userCoords.lat, lon: userCoords.lon };
    if (!italyBoundsContains(coords.lat, coords.lon)) {
      setWalking(null);
      return;
    }

    let cancelled = false;
    getWalkingTimeMinutes(coords, {
      lat: activeEventLocation.lat,
      lon: activeEventLocation.lon,
    }).then((result) => {
      if (!cancelled) {
        setWalking(result);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [activeEventLocation, userCoords]);

  const walkingLabel = walking
    ? `${walking.minutes} min${walking.source === "estimate" ? " (est.)" : ""}`
    : null;
  const handleMobileScroll = useCallback(() => {
    if (mobileScrollRaf.current) {
      cancelAnimationFrame(mobileScrollRaf.current);
    }
    mobileScrollRaf.current = requestAnimationFrame(() => {
      const container = mobileScrollRef.current;
      if (!container) return;
      const cards = Array.from(
        container.querySelectorAll<HTMLElement>("[data-event-id]"),
      );
      if (!cards.length) return;
      const containerTop = container.getBoundingClientRect().top;
      let bestId = activeEventId;
      let minDistance = Number.POSITIVE_INFINITY;
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const distance = Math.abs(rect.top - containerTop);
        if (distance < minDistance) {
          minDistance = distance;
          const id = card.dataset.eventId;
          if (id) bestId = id;
        }
      });
      if (bestId && bestId !== activeEventId) {
        setActiveEventId(bestId);
      }
    });
  }, [activeEventId]);

  useEffect(() => {
    if (!isMobile) return;
    handleMobileScroll();
  }, [isMobile, handleMobileScroll]);

  useEffect(() => {
    return () => {
      if (mobileScrollRaf.current) {
        cancelAnimationFrame(mobileScrollRaf.current);
      }
    };
  }, []);

  return (
    <section className="space-y-8">
      <header className="hidden flex-col gap-6 lg:flex">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="chip">Timeline</p>
            <h1 className="text-3xl sm:text-4xl">
              Your Italy story, moment by moment.
            </h1>
            <p className="text-muted max-w-2xl">
              Scroll the timeline to sync the map. Every event anchors a set of
              nearby options so you can decide fast while you&apos;re on the
              ground.
            </p>
          </div>
          <div className="flex flex-col gap-3 lg:min-w-[260px]">
            <ItalyClock />
            <WeatherBar
              activeCity={activeEvent?.city}
              activeLocation={activeEvent?.location}
              userCoords={userCoords}
            />
          </div>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[7fr_5fr]">
        <div className="order-2 space-y-6 lg:order-none">
          <div className="lg:hidden">
            <MobileSheetLayout
              map={
                <RouteMap
                  activeLocation={activeEvent?.location}
                  route={activeRoute}
                  className="mobile-map"
                  interactive={false}
                />
              }
              contentRef={mobileScrollRef}
              onScroll={handleMobileScroll}
              footer={
                <div className="rounded-full border border-border/40 bg-ash/80 px-4 py-1 text-[10px] uppercase tracking-[0.4em] text-fog/70">
                  Neil &lt;3 Sandy
                </div>
              }
            >
              <div className="card space-y-4">
                <div className="space-y-3">
                  <p className="chip">Timeline</p>
                  <h1 className="text-2xl">Your Italy story, moment by moment.</h1>
                  <p className="text-muted">
                    Scroll the timeline to sync the map. Every event anchors a set of
                    nearby options so you can decide fast while you&apos;re on the
                    ground.
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <ItalyClock />
                  <WeatherBar
                    activeCity={activeEvent?.city}
                    activeLocation={activeEvent?.location}
                    userCoords={userCoords}
                  />
                </div>
              </div>
              {events.map((event) => {
                const status = eventStatus(event, now);
                const isActive = event.id === activeEventId;
                return (
                  <EventCard
                    key={event.id}
                    event={event}
                    status={status}
                    active={isActive}
                    revealed
                    walkingTime={isActive ? walkingLabel : null}
                    dense
                  />
                );
              })}
            </MobileSheetLayout>
          </div>

          <div className="hidden space-y-6 lg:block">
            {groupedEvents.map((group) => (
              <div key={group.key} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-border/40" />
                  <p className="text-xs uppercase tracking-[0.3em] text-fog/50">
                    {group.title}
                  </p>
                  <div className="h-px flex-1 bg-border/40" />
                </div>
                <div className="space-y-6">
                  {group.items.map((event) => {
                    const status = eventStatus(event, now);
                    const isActive = event.id === activeEventId;
                    const attachNowMarker = nowMarkerId === event.id;
                    return (
                      <div key={event.id} className="space-y-4">
                        {attachNowMarker ? (
                          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.4em] text-ember">
                            <span className="h-px flex-1 bg-ember/40" />
                            Now
                            <span className="h-px flex-1 bg-ember/40" />
                          </div>
                        ) : null}
                        <EventCard
                          ref={setEventRef(event.id)}
                          event={event}
                          status={status}
                          active={isActive}
                          revealed={revealedIds.has(event.id)}
                          walkingTime={isActive ? walkingLabel : null}
                          onSelect={() => {
                            setActiveEventId(event.id);
                            const node = eventRefs.current.get(event.id);
                            node?.scrollIntoView({
                              behavior: "smooth",
                              block: "center",
                            });
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="order-1 sticky top-20 lg:order-none lg:top-24 lg:self-start z-10">
          <div className="hidden lg:block space-y-4">
            <RouteMap
              activeLocation={activeEvent?.location}
              route={activeRoute}
              className="h-[240px] sm:h-[300px] lg:h-[420px]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
