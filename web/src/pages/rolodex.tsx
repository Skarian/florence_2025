import { useEffect, useMemo, useState } from "react";
import MapLegendOverlay from "@/components/MapLegendOverlay";
import MobileSheetLayout from "@/components/MobileSheetLayout";
import PlaceCard from "@/components/PlaceCard";
import PlacesMap from "@/components/PlacesMapUnified";
import {
  CATEGORY_OPTIONS,
  CITY_OPTIONS,
  PRICE_OPTIONS,
  filterPlaces,
  getPlacesByCity,
  type PlaceFilters,
} from "@/lib/places";

export default function RolodexPage() {
  const [city, setCity] = useState(CITY_OPTIONS[0] ?? "Florence");
  const [filters, setFilters] = useState<PlaceFilters>({
    search: "",
    category: "all",
    price: "all",
    diet: "all",
  });
  const [activePlaceId, setActivePlaceId] = useState<string | null>(null);

  const cityPlaces = useMemo(() => getPlacesByCity(city), [city]);
  const filteredPlaces = useMemo(
    () => filterPlaces(cityPlaces, filters),
    [cityPlaces, filters],
  );
  const activePlace =
    filteredPlaces.find((place) => place.id === activePlaceId) ?? null;
  const legendItems = useMemo(() => {
    return [
      {
        id: "places",
        label: "Places",
        color: "#5aa9ff",
        show: filteredPlaces.length > 0,
      },
    ].filter((item) => item.show);
  }, [filteredPlaces]);

  useEffect(() => {
    if (
      activePlaceId &&
      !filteredPlaces.some((place) => place.id === activePlaceId)
    ) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActivePlaceId(null);
    }
  }, [filteredPlaces, activePlaceId]);

  const mobileSections = [
    <div key="mobile-controls" className="card space-y-4">
      <div>
        <p className="chip">Rolodex</p>
        <h1 className="text-2xl">A deep bench of options.</h1>
        <p className="text-muted">
          Curated by neighborhood so you can pick quickly on the ground.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {CITY_OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            className={`pill ${
              option === city ? "border-ember/60 bg-ember/15 text-bright" : ""
            }`}
            onClick={() => {
              setCity(option);
              setActivePlaceId(null);
            }}
          >
            {option}
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
    </div>,
    ...(filteredPlaces.length
      ? filteredPlaces.map((place) => (
          <PlaceCard
            key={place.id}
            place={place}
            compact
            dense
            onSelect={() => setActivePlaceId(place.id)}
            active={place.id === activePlaceId}
          />
        ))
      : [
          <div key="no-results" className="card space-y-3">
            <p className="text-xs uppercase tracking-wide text-fog/60">
              No matches
            </p>
            <p className="text-sm text-fog/70">
              Try a broader category or clear filters.
            </p>
          </div>,
        ]),
  ];

  return (
    <section className="space-y-8">
      <header className="hidden space-y-3 lg:block">
        <p className="chip">Rolodex</p>
        <h1 className="text-3xl sm:text-4xl">
          A deep bench of options, curated by neighborhood.
        </h1>
        <p className="text-muted max-w-2xl">
          Every place will include photos, highlights, pricing signals, and diet
          flags so you can pick quickly on the ground.
        </p>
      </header>
      <div className="hidden space-y-6 lg:block">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {CITY_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                className={`pill ${
                  option === city
                    ? "border-ember/60 bg-ember/15 text-bright"
                    : ""
                }`}
                onClick={() => {
                  setCity(option);
                  setActivePlaceId(null);
                }}
              >
                {option}
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
      </div>

      <div className="grid gap-8 lg:grid-cols-[7fr_5fr]">
        <div className="lg:hidden">
          <MobileSheetLayout
            map={
              <PlacesMap
                places={filteredPlaces}
                activePlaceId={activePlaceId}
                className="mobile-map"
                interactive={false}
              />
            }
            legend={<MapLegendOverlay items={legendItems} />}
            header={(snap) =>
              snap === "peek" ? (
                <div className="rounded-2xl border border-border/40 bg-slate/80 px-4 py-3 text-sm text-fog/80 shadow-soft">
                  {activePlace ? (
                    <div className="space-y-1">
                      <p className="text-base text-bright">{activePlace.name}</p>
                      <p className="text-xs text-fog/60">
                        {activePlace.address}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs uppercase tracking-wide text-fog/60">
                      Pick a place below
                    </p>
                  )}
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

        <div className="hidden lg:space-y-6 lg:block">
          {filteredPlaces.length ? (
            <div className="grid gap-6 md:grid-cols-2">
              {filteredPlaces.map((place) => (
                <PlaceCard
                  key={place.id}
                  place={place}
                  onSelect={() => setActivePlaceId(place.id)}
                  active={place.id === activePlaceId}
                />
              ))}
            </div>
          ) : (
            <div className="card space-y-3">
              <p className="text-xs uppercase tracking-wide text-fog/60">
                No matches
              </p>
              <p className="text-sm text-fog/70">
                Try a broader category or clear filters.
              </p>
            </div>
          )}
        </div>
        <div className="hidden lg:block">
          <PlacesMap
            places={filteredPlaces}
            activePlaceId={activePlaceId}
            className="h-[320px] sm:h-[360px] lg:h-[480px]"
          />
        </div>
      </div>
    </section>
  );
}
