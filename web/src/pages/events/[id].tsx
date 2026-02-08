import type { GetStaticPaths, GetStaticProps } from "next";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import MapFiltersOverlay from "@/components/MapFiltersOverlay";
import MapLegendOverlay from "@/components/MapLegendOverlay";
import MobileSheetLayout from "@/components/MobileSheetLayout";
import PlaceCard from "@/components/PlaceCard";
import PlacesMap from "@/components/PlacesMapUnified";
import { getEvents, getLoops } from "@/lib/data";
import { haversineKm, italyBoundsContains } from "@/lib/geo";
import {
  CATEGORY_OPTIONS,
  PRICE_OPTIONS,
  filterPlaces,
  getAllPlaces,
  type PlaceFilters,
} from "@/lib/places";
import type { Event, Place } from "@/lib/types";
import { formatItalyDateLong, formatItalyTimeRange } from "@/lib/time";
import { isGoogleMapsListingUrl } from "@/lib/maps";
import { useGeolocation } from "@/lib/useGeolocation";
import { getWalkingTimeMinutes } from "@/lib/walking";

const timeNeededForLoop = (minutes: number): Place["timeNeeded"] => {
  if (minutes <= 30) return "30m";
  if (minutes <= 75) return "1h";
  if (minutes <= 120) return "2h";
  if (minutes <= 240) return "half-day";
  return "full-day";
};

type EventDetailProps = {
  event: Event;
  places: Place[];
  loops: ReturnType<typeof getLoops>;
};

export const getStaticPaths: GetStaticPaths = async () => {
  const events = getEvents();
  return {
    paths: events.map((event) => ({ params: { id: event.id } })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<EventDetailProps> = async (
  context,
) => {
  const events = getEvents();
  const event = events.find((item) => item.id === context.params?.id);
  if (!event) {
    return { notFound: true };
  }

  return {
    props: {
      event,
      places: getAllPlaces(),
      loops: getLoops(),
    },
  };
};

export default function EventDetail({
  event,
  places,
  loops,
}: EventDetailProps) {
  const geo = useGeolocation(true);
  const userCoords = geo.status === "granted" ? geo.coords : null;
  const [radiusKm, setRadiusKm] = useState(1.5);
  const [showUserLocation, setShowUserLocation] = useState(false);
  const [activePlaceId, setActivePlaceId] = useState<string | null>(null);
  const [filters, setFilters] = useState<PlaceFilters>({
    search: "",
    category: "all",
    price: "all",
    diet: "all",
  });
  const [walkingTimes, setWalkingTimes] = useState<Record<string, string>>({});

  const hasListing = isGoogleMapsListingUrl(event.location.googleMapsUrl);
  const showNearby =
    !["travel", "flight"].includes(event.category) &&
    !event.itinerary?.length;
  const nearbyHiddenNote = event.itinerary?.length
    ? "This event has a set itinerary, so nearby suggestions are hidden."
    : "This event is travel focused, so nearby suggestions are hidden.";

  const cityPlaces = useMemo(
    () => places.filter((place) => place.city === event.city),
    [places, event.city],
  );

  const baseDistanceById = useMemo(() => {
    const map = new Map<string, number>();
    cityPlaces.forEach((place) => {
      map.set(
        place.id,
        haversineKm(
          event.location.lat,
          event.location.lon,
          place.lat,
          place.lon,
        ),
      );
    });
    return map;
  }, [cityPlaces, event.location.lat, event.location.lon]);

  const nearbyPlaces = useMemo(
    () =>
      cityPlaces.filter(
        (place) => (baseDistanceById.get(place.id) ?? 0) <= radiusKm,
      ),
    [cityPlaces, baseDistanceById, radiusKm],
  );

  const nearbyLoops = useMemo(() => {
    return loops.filter((loop) => {
      const waypoint = loop.waypoints[0];
      if (!waypoint) return false;
      return (
        haversineKm(
          event.location.lat,
          event.location.lon,
          waypoint.lat,
          waypoint.lon,
        ) <= radiusKm
      );
    });
  }, [loops, event.location.lat, event.location.lon, radiusKm]);

  const loopPlaces = useMemo<Place[]>(() => {
    return nearbyLoops.map((loop) => {
      const waypoint = loop.waypoints[0] ?? event.location;
      return {
        id: `loop-${loop.id}`,
        name: loop.name,
        city: event.city,
        category: "activity",
        description: loop.description,
        highlight: `Walking loop starting near ${waypoint.name}.`,
        address: waypoint.address ?? waypoint.name,
        lat: waypoint.lat,
        lon: waypoint.lon,
        googleMapsUrl: waypoint.googleMapsUrl ?? event.location.googleMapsUrl ?? "",
        placeId: waypoint.placeId ?? "",
        tags: ["walking-loop"],
        dietTags: [],
        signatureItems: [],
        price: "free",
        crowdLevel: "mixed",
        crowdNote: "Varies by time of day.",
        timeNeeded: timeNeededForLoop(loop.estimatedMinutes),
        walkIntensity:
          loop.totalDistanceKm >= 4 ? "long" : loop.totalDistanceKm >= 2 ? "moderate" : "light",
        booking: { required: false },
        hoursNote: "Self-guided walking route.",
        sourceUrl: waypoint.googleMapsUrl ?? event.location.googleMapsUrl ?? "",
      };
    });
  }, [nearbyLoops, event.city, event.location]);

  const nearbyList = useMemo(
    () => [...nearbyPlaces, ...loopPlaces],
    [nearbyPlaces, loopPlaces],
  );

  const distanceById = useMemo(() => {
    const map = new Map<string, number>();
    nearbyList.forEach((place) => {
      map.set(
        place.id,
        haversineKm(
          event.location.lat,
          event.location.lon,
          place.lat,
          place.lon,
        ),
      );
    });
    return map;
  }, [nearbyList, event.location.lat, event.location.lon]);

  const planBPlaces = useMemo(() => {
    if (!event.planBPlaceIds?.length) return [];
    const ids = new Set(event.planBPlaceIds);
    return places.filter((place) => ids.has(place.id));
  }, [event.planBPlaceIds, places]);

  const filteredPlaces = useMemo(
    () => filterPlaces(nearbyList, filters),
    [nearbyList, filters],
  );

  const selectablePlaces = useMemo(() => {
    const map = new Map<string, Place>();
    filteredPlaces.forEach((place) => map.set(place.id, place));
    planBPlaces.forEach((place) => map.set(place.id, place));
    return Array.from(map.values());
  }, [filteredPlaces, planBPlaces]);

  useEffect(() => {
    if (
      activePlaceId &&
      !selectablePlaces.some((place) => place.id === activePlaceId)
    ) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActivePlaceId(null);
    }
  }, [selectablePlaces, activePlaceId]);

  const mapPlaces = useMemo(() => {
    if (!showNearby) return [];
    if (!activePlaceId) return filteredPlaces;
    const selected = selectablePlaces.find((place) => place.id === activePlaceId);
    return selected ? [selected] : filteredPlaces;
  }, [showNearby, activePlaceId, filteredPlaces, selectablePlaces]);

  const legendItems = useMemo(() => {
    return [
      {
        id: "primary",
        label: event.location.name,
        color: "#8a9a5b",
        show: true,
      },
      {
        id: "nearby",
        label: "Nearby place",
        color: "#5aa9ff",
        show: mapPlaces.length > 0 && !activePlaceId,
      },
      {
        id: "user",
        label: "You",
        color: "#34d399",
        show: Boolean(showUserLocation && userCoords),
      },
    ].filter((item) => item.show);
  }, [
    event.location.name,
    mapPlaces.length,
    activePlaceId,
    showUserLocation,
    userCoords,
  ]);

  // nearbyLoops now represented as loopPlaces within nearbyList

  useEffect(() => {
    if (!userCoords) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setWalkingTimes({});
      return;
    }
    if (!italyBoundsContains(userCoords.lat, userCoords.lon)) {
      setWalkingTimes({});
      return;
    }

    let cancelled = false;
    const fetchTimes = async () => {
      const entries = await Promise.all(
        filteredPlaces.map(async (place) => {
          const result = await getWalkingTimeMinutes(userCoords, {
            lat: place.lat,
            lon: place.lon,
          });
          const label = `${result.minutes} min${
            result.source === "estimate" ? " (est.)" : ""
          }`;
          return [place.id, label] as const;
        }),
      );
      if (!cancelled) {
        setWalkingTimes(Object.fromEntries(entries));
      }
    };

    fetchTimes();
    return () => {
      cancelled = true;
    };
  }, [filteredPlaces, userCoords]);

  const mobileSections = useMemo(() => {
    const sections: ReactNode[] = [];
    sections.push(
      <div key="summary" className="card space-y-3">
        <Link
          href="/"
          className="text-xs uppercase tracking-wide text-fog/60 hover:text-bright"
        >
          ← Back to timeline
        </Link>
        <p className="chip">Activity</p>
        <h1 className="text-2xl">{event.title}</h1>
        {event.description ? (
          <p className="text-muted">{event.description}</p>
        ) : null}
        <div className="text-sm text-fog/70">
          {formatItalyDateLong(event.startsAt)} |{" "}
          {formatItalyTimeRange(event.startsAt, event.endsAt)}
        </div>
        <div className="space-y-1 text-sm">
          <p className="text-lg text-bright">{event.location.name}</p>
          {event.location.address ? (
            <p className="text-sm text-fog/70">{event.location.address}</p>
          ) : null}
          <div className="flex flex-wrap items-center gap-3 text-sm">
            {hasListing ? (
              <a
                href={event.location.googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="underline decoration-white/30 underline-offset-4"
              >
                Open Google Maps
              </a>
            ) : (
              <span className="text-xs uppercase tracking-wide text-fog/50">
                Map link unavailable
              </span>
            )}
            {event.itinerary?.length ? (
              <a href="#itinerary" className="pill">
                View itinerary
              </a>
            ) : null}
          </div>
        </div>
      </div>,
    );

    if (event.itinerary?.length) {
      sections.push(
        <div key="itinerary" id="itinerary" className="card space-y-3">
          <p className="text-xs uppercase tracking-wide text-fog/60">
            Itinerary
          </p>
          <ol className="space-y-2 text-sm text-fog/70">
            {event.itinerary.map((step, index) => (
              <li key={`${event.id}-it-mobile-${index}`}>{step}</li>
            ))}
          </ol>
        </div>,
      );
    }

    if (showNearby) {
      if (planBPlaces.length) {
        sections.push(
          <div key="planb-intro" className="card space-y-2">
            <p className="text-xs uppercase tracking-wide text-fog/60">
              Plan B picks
            </p>
            <p className="text-sm text-fog/70">
              {planBPlaces.length} backup options.
            </p>
          </div>,
        );
        planBPlaces.forEach((place) => {
          sections.push(
            <PlaceCard
              key={`planb-${place.id}`}
              place={place}
              compact
              dense
              onSelect={() =>
                setActivePlaceId((prev) => (prev === place.id ? null : place.id))
              }
              active={place.id === activePlaceId}
            />,
          );
        });
      }

      if (filteredPlaces.length) {
        filteredPlaces.forEach((place) => {
          sections.push(
            <PlaceCard
              key={place.id}
              place={place}
              compact
              dense
              distanceKm={distanceById.get(place.id)}
              walkingTime={walkingTimes[place.id]}
              onSelect={() =>
                setActivePlaceId((prev) => (prev === place.id ? null : place.id))
              }
              active={place.id === activePlaceId}
            />,
          );
        });
      } else if (!planBPlaces.length) {
        sections.push(
          <div key="no-nearby" className="card space-y-2">
            <p className="text-xs uppercase tracking-wide text-fog/60">
              No nearby matches
            </p>
            <p className="text-sm text-fog/70">
              Try expanding the radius or clearing filters.
            </p>
          </div>,
        );
      }
    } else {
      sections.push(
        <div key="nearby-hidden" className="card space-y-2">
          <p className="text-xs uppercase tracking-wide text-fog/60">
            Things to do near here
          </p>
          <p className="text-sm text-fog/70">{nearbyHiddenNote}</p>
        </div>,
      );
    }

    return sections;
  }, [
    event,
    hasListing,
    nearbyHiddenNote,
    showNearby,
    planBPlaces,
    filteredPlaces,
    distanceById,
    walkingTimes,
    activePlaceId,
  ]);

  return (
    <section className="space-y-8">
      <header className="hidden space-y-3 lg:block">
        <p className="chip">Activity</p>
        <h1 className="text-3xl sm:text-4xl">{event.title}</h1>
        {event.description ? (
          <p className="text-muted max-w-2xl">{event.description}</p>
        ) : null}
        <div className="flex flex-wrap items-center gap-3 text-sm text-fog/70">
          <span>Near {event.location.name}</span>
          <span>|</span>
          <span>{formatItalyDateLong(event.startsAt)}</span>
          <span>|</span>
          <span>{formatItalyTimeRange(event.startsAt, event.endsAt)}</span>
        </div>
      </header>

      <div className="lg:hidden">
        <MobileSheetLayout
          map={
            <PlacesMap
              places={mapPlaces}
              primaryLocation={event.location}
              userLocation={userCoords}
              showUserLocation={showUserLocation}
              className="mobile-map"
              interactive={false}
            />
          }
          legend={
            <MapLegendOverlay
              items={legendItems}
              controls={
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    className="h-3 w-3 accent-ember"
                    checked={showUserLocation}
                    onChange={(event) =>
                      setShowUserLocation(event.target.checked)
                    }
                  />
                  Show my location
                </label>
              }
            />
          }
          overlay={
            showNearby ? (
              <div className="pointer-events-auto absolute bottom-3 right-3">
                <MapFiltersOverlay>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-fog/60">
                        Things to do near here
                      </p>
                      <p className="text-xs text-fog/50">
                        Suggestions, not scheduled events.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {[1.5, 3, 5].map((radius) => (
                        <button
                          key={radius}
                          type="button"
                          className={`pill ${
                            radiusKm === radius ? "text-bright" : ""
                          }`}
                          onClick={() => setRadiusKm(radius)}
                        >
                          {radius} km
                        </button>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <label className="text-xs uppercase tracking-wide text-fog/60">
                        Category
                        <select
                          className="mt-1 block rounded-xl border border-border/40 bg-ash/80 px-3 py-2 text-sm text-bright"
                          value={filters.category}
                          onChange={(event) =>
                            setFilters((prev) => ({
                              ...prev,
                              category: event.target
                                .value as PlaceFilters["category"],
                            }))
                          }
                        >
                          {CATEGORY_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="text-xs uppercase tracking-wide text-fog/60">
                        Price
                        <select
                          className="mt-1 block rounded-xl border border-border/40 bg-ash/80 px-3 py-2 text-sm text-bright"
                          value={filters.price}
                          onChange={(event) =>
                            setFilters((prev) => ({
                              ...prev,
                              price: event.target
                                .value as PlaceFilters["price"],
                            }))
                          }
                        >
                          {PRICE_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="text-xs uppercase tracking-wide text-fog/60">
                        Diet
                        <select
                          className="mt-1 block rounded-xl border border-border/40 bg-ash/80 px-3 py-2 text-sm text-bright"
                          value={filters.diet}
                          onChange={(event) =>
                            setFilters((prev) => ({
                              ...prev,
                              diet: event.target.value,
                            }))
                          }
                        >
                          <option value="all">All</option>
                          <option value="veg-friendly">Veg-friendly</option>
                          <option value="vegan-friendly">Vegan-friendly</option>
                          <option value="gluten-free">Gluten-free</option>
                        </select>
                      </label>
                    </div>
                    <input
                      type="search"
                      placeholder="Search nearby places"
                      className="w-full rounded-xl border border-border/40 bg-ash/80 px-4 py-2 text-sm text-bright placeholder:text-fog/50"
                      value={filters.search}
                      onChange={(event) =>
                        setFilters((prev) => ({
                          ...prev,
                          search: event.target.value,
                        }))
                      }
                    />
                  </div>
                </MapFiltersOverlay>
              </div>
            ) : null
          }
          footer={
            <div className="rounded-full border border-border/40 bg-ash/80 px-4 py-1 text-[10px] uppercase tracking-[0.4em] text-fog/70">
              Neil &lt;3 Sandy
            </div>
          }
        >
          {mobileSections}
        </MobileSheetLayout>
      </div>

      <div className="hidden lg:grid gap-8 lg:grid-cols-[7fr_5fr]">
        <div className="space-y-6">
          <div className="card space-y-3">
            <p className="text-xs uppercase tracking-wide text-fog/60">
              Location
            </p>
            <p className="text-lg text-bright">{event.location.name}</p>
            {event.location.address ? (
              <p className="text-sm text-fog/70">{event.location.address}</p>
            ) : null}
            <div className="flex flex-wrap items-center gap-3 text-sm">
              {hasListing ? (
                <a
                  href={event.location.googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="underline decoration-white/30 underline-offset-4"
                >
                  Open Google Maps
                </a>
              ) : (
                <span className="text-xs uppercase tracking-wide text-fog/50">
                  Map link unavailable
                </span>
              )}
              {event.itinerary?.length ? (
                <a href="#itinerary" className="pill">
                  View itinerary
                </a>
              ) : null}
            </div>
          </div>

          {event.itinerary && event.itinerary.length ? (
            <div id="itinerary" className="card space-y-3">
              <p className="text-xs uppercase tracking-wide text-fog/60">
                Itinerary
              </p>
              <ol className="space-y-2 text-sm text-fog/70">
                {event.itinerary.map((step, index) => (
                  <li key={`${event.id}-it-${index}`}>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          ) : null}

          {showNearby ? (
            <div className="card space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-fog/60">
                    Things to do near here
                  </p>
                  <p className="text-xs text-fog/50">
                    Suggestions, not scheduled events.
                  </p>
                </div>
                <div className="flex gap-2">
                  {[1.5, 3, 5].map((radius) => (
                    <button
                      key={radius}
                      type="button"
                      className={`pill ${
                        radiusKm === radius ? "text-bright" : ""
                      }`}
                      onClick={() => setRadiusKm(radius)}
                    >
                      {radius} km
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <label className="text-xs uppercase tracking-wide text-fog/60">
                  Category
                  <select
                    className="mt-1 block rounded-xl border border-border/40 bg-ash/80 px-3 py-2 text-sm text-bright"
                    value={filters.category}
                    onChange={(event) =>
                      setFilters((prev) => ({
                        ...prev,
                        category: event.target.value as PlaceFilters["category"],
                      }))
                    }
                  >
                    {CATEGORY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="text-xs uppercase tracking-wide text-fog/60">
                  Price
                  <select
                    className="mt-1 block rounded-xl border border-border/40 bg-ash/80 px-3 py-2 text-sm text-bright"
                    value={filters.price}
                    onChange={(event) =>
                      setFilters((prev) => ({
                        ...prev,
                        price: event.target.value as PlaceFilters["price"],
                      }))
                    }
                  >
                    {PRICE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="text-xs uppercase tracking-wide text-fog/60">
                  Diet
                  <select
                    className="mt-1 block rounded-xl border border-border/40 bg-ash/80 px-3 py-2 text-sm text-bright"
                    value={filters.diet}
                    onChange={(event) =>
                      setFilters((prev) => ({
                        ...prev,
                        diet: event.target.value,
                      }))
                    }
                  >
                    <option value="all">All</option>
                    <option value="veg-friendly">Veg-friendly</option>
                    <option value="vegan-friendly">Vegan-friendly</option>
                    <option value="gluten-free">Gluten-free</option>
                  </select>
                </label>
              </div>

              <input
                type="search"
                placeholder="Search nearby places"
                className="w-full rounded-xl border border-border/40 bg-ash/80 px-4 py-2 text-sm text-bright placeholder:text-fog/50"
                value={filters.search}
                onChange={(event) =>
                  setFilters((prev) => ({
                    ...prev,
                    search: event.target.value,
                  }))
                }
              />

              {planBPlaces.length ? (
                <div className="space-y-3">
                  <p className="text-xs uppercase tracking-wide text-fog/60">
                    Plan B picks
                  </p>
                  <div className="grid gap-4 md:grid-cols-2">
                    {planBPlaces.map((place) => (
                      <PlaceCard
                        key={place.id}
                        place={place}
                        compact
                        onSelect={() =>
                          setActivePlaceId((prev) =>
                            prev === place.id ? null : place.id,
                          )
                        }
                        active={place.id === activePlaceId}
                      />
                    ))}
                  </div>
                </div>
              ) : null}

              {filteredPlaces.length ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {filteredPlaces.map((place) => (
                    <PlaceCard
                      key={place.id}
                      place={place}
                      compact
                      distanceKm={distanceById.get(place.id)}
                      walkingTime={walkingTimes[place.id]}
                      onSelect={() =>
                        setActivePlaceId((prev) =>
                          prev === place.id ? null : place.id,
                        )
                      }
                      active={place.id === activePlaceId}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-fog/70">
                  No nearby matches. Try expanding the radius or clearing
                  filters.
                </p>
              )}

              {/* walking loops are folded into the nearby list */}
            </div>
          ) : (
            <div className="card space-y-2">
              <p className="text-xs uppercase tracking-wide text-fog/60">
                Things to do near here
              </p>
              <p className="text-sm text-fog/70">{nearbyHiddenNote}</p>
            </div>
          )}

          <Link href="/" className="pill">
            Back to timeline
          </Link>
        </div>

        <div className="hidden lg:block space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="panel flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm text-fog/70">
            <div className="flex flex-wrap items-center gap-3 text-xs text-fog/70">
              {legendItems.map((item) => (
                <span key={item.id} className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full border border-ink/50"
                    style={{ backgroundColor: item.color }}
                  />
                  {item.label}
                </span>
              ))}
            </div>
            <label className="flex items-center gap-2 text-xs text-fog/70">
              <input
                type="checkbox"
                className="h-4 w-4 accent-ember"
                checked={showUserLocation}
                onChange={(event) => setShowUserLocation(event.target.checked)}
              />
              Show my location
            </label>
          </div>
          <PlacesMap
            places={mapPlaces}
            primaryLocation={event.location}
            userLocation={userCoords}
            showUserLocation={showUserLocation}
            className="h-[240px] sm:h-[300px] lg:h-[420px]"
          />
          <div className="panel space-y-2 px-4 py-3 text-sm text-fog/70">
            <p className="text-xs uppercase tracking-wide text-fog/60">
              Activity details
            </p>
            <p>{event.location.name}</p>
            <p>{event.city}</p>
            <p>{event.category}</p>
            <p>
              {formatItalyDateLong(event.startsAt)} |{" "}
              {formatItalyTimeRange(event.startsAt, event.endsAt)}
            </p>
            {event.location.address ? <p>{event.location.address}</p> : null}
            {event.location.description ? (
              <p>{event.location.description}</p>
            ) : null}
            {event.booking?.vendor ? (
              <p>Booking: {event.booking.vendor}</p>
            ) : null}
            {event.booking?.confirmation ? (
              <p>Confirmation: {event.booking.confirmation}</p>
            ) : null}
            {event.people?.length ? (
              <p>People: {event.people.join(", ")}</p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
