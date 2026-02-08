import Image from "next/image";
import { useRef } from "react";
import type { Place } from "@/lib/types";
import { isGoogleMapsListingUrl } from "@/lib/maps";
import useInView from "@/hooks/useInView";
import usePlacePhoto from "@/hooks/usePlacePhoto";

const priceLabel: Record<Place["price"], string> = {
  $: "$",
  $$: "$$",
  $$$: "$$$",
  $$$$: "$$$$",
  free: "Free",
};

const crowdLabel: Record<Place["crowdLevel"], string> = {
  quiet: "Quiet",
  mixed: "Mixed",
  busy: "Busy",
  varies: "Varies",
};

type PlaceCardProps = {
  place: Place;
  distanceKm?: number;
  walkingTime?: string | null;
  compact?: boolean;
  dense?: boolean;
  onSelect?: () => void;
  active?: boolean;
};

export default function PlaceCard({
  place,
  distanceKm,
  walkingTime,
  compact,
  dense,
  onSelect,
  active,
}: PlaceCardProps) {
  const hasListing = isGoogleMapsListingUrl(place.googleMapsUrl);
  const interactive = Boolean(onSelect);
  const isWalkingLoop = place.tags.includes("walking-loop");
  const categoryLabel = isWalkingLoop ? "walking loop" : place.category;
  const cardRef = useRef<HTMLDivElement | null>(null);
  const inView = useInView(cardRef);
  const photo = usePlacePhoto(place.placeId, { enabled: inView });
  const imageAspectClass = dense ? "aspect-[2/1]" : "aspect-[4/3]";
  const chips = dense
    ? [priceLabel[place.price], crowdLabel[place.crowdLevel], place.timeNeeded]
    : [
        priceLabel[place.price],
        crowdLabel[place.crowdLevel],
        place.timeNeeded,
        place.walkIntensity,
      ];
  const titleClass = dense ? "text-base" : "text-xl";
  const highlightClass = dense ? "text-xs text-ember/80" : "text-sm text-ember/90";
  const addressClass = dense ? "text-[0.7rem]" : "text-xs";

  return (
    <div
      className={`card ${dense ? "p-3 space-y-2" : "space-y-4"} transition ${
        active
          ? "border-ember/70 shadow-strong ring-2 ring-ember/40 bg-ember/5"
          : "border-border/40"
      }`}
      onClick={onSelect}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      ref={cardRef}
      onKeyDown={
        interactive
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onSelect?.();
              }
            }
          : undefined
      }
    >
      <div className={dense ? "space-y-2" : "space-y-3"}>
        <div className="relative overflow-hidden rounded-xl">
          {photo.isLoading ? (
            <div className={`relative ${imageAspectClass} bg-ash/80`}>
              <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-ash/70 via-slate/60 to-ink/80" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span
                  className="h-7 w-7 animate-spin rounded-full border-2 border-fog/40 border-t-bright"
                  aria-label="Loading place photo"
                />
              </div>
            </div>
          ) : photo.url ? (
            <div className={`relative ${imageAspectClass}`}>
              <Image
                src={photo.url}
                alt={place.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          ) : (
            <div className={`relative ${imageAspectClass} bg-ink/70`}>
              <div className="absolute inset-0 flex items-center justify-center px-4 text-center text-[0.65rem] uppercase tracking-[0.24em] text-fog/50">
                Photo unavailable
              </div>
            </div>
          )}
        </div>
        {photo.url && photo.attributions.length ? (
          <p className="text-[0.65rem] text-fog/60">
            Photo by{" "}
            {photo.attributions.map((attr, index) => {
              const label = attr.displayName || "Unknown";
              return attr.uri ? (
                <a
                  key={`${label}-${index}`}
                  href={attr.uri}
                  target="_blank"
                  rel="noreferrer"
                  className="underline decoration-white/30 underline-offset-4 hover:text-bright"
                >
                  {label}
                </a>
              ) : (
                <span key={`${label}-${index}`}>{label}</span>
              );
            })}
            {" "}via Google Maps
          </p>
        ) : null}
        <div>
          <p className="text-xs uppercase tracking-wide text-fog/60">
            {place.city} - {categoryLabel}
          </p>
          <h3 className={`${titleClass} text-bright`}>{place.name}</h3>
          <p className={highlightClass}>{place.highlight}</p>
          <p className={`${addressClass} text-fog/60`}>{place.address}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {chips.map((chip) => (
          <span key={chip} className="chip">
            {chip}
          </span>
        ))}
      </div>

      {!compact ? (
        <p className="text-sm text-fog/70">{place.description}</p>
      ) : null}

      {!dense && place.signatureItems.length ? (
        <div className="flex flex-wrap gap-2">
          {place.signatureItems.slice(0, 3).map((item) => (
            <span key={item} className="chip">
              {item}
            </span>
          ))}
        </div>
      ) : null}

      {!dense && place.dietTags.length ? (
        <div className="flex flex-wrap gap-2">
          {place.dietTags.slice(0, 3).map((tag) => (
            <span key={tag} className="chip">
              {tag}
            </span>
          ))}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-fog/70">
        <div className="flex flex-wrap items-center gap-3">
          {distanceKm !== undefined ? (
            <span>{distanceKm.toFixed(1)} km away</span>
          ) : null}
          {walkingTime ? <span>Walk {walkingTime}</span> : null}
        </div>
        {hasListing ? (
          <a
            href={place.googleMapsUrl}
            target="_blank"
            rel="noreferrer"
            className="underline decoration-white/30 underline-offset-4 hover:text-bright"
          >
            Open Google Maps
          </a>
        ) : (
          <span className="text-xs uppercase tracking-wide text-fog/50">
            Map link pending place ID
          </span>
        )}
      </div>
    </div>
  );
}
