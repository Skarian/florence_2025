import Link from "next/link";
import { forwardRef } from "react";
import type { Event } from "@/lib/types";
import { formatItalyDate, formatItalyTimeRange } from "@/lib/time";
import { isGoogleMapsListingUrl } from "@/lib/maps";

type EventCardProps = {
  event: Event;
  status: "past" | "current" | "upcoming";
  active?: boolean;
  revealed?: boolean;
  walkingTime?: string | null;
  dense?: boolean;
  onSelect?: () => void;
};

const EventCard = forwardRef<HTMLDivElement, EventCardProps>(
  (
    {
      event,
      status,
      active,
      revealed,
      walkingTime,
      dense,
      onSelect,
    },
    ref,
  ) => {
    const isRevealed = revealed ?? true;
    const hasListing = isGoogleMapsListingUrl(event.location.googleMapsUrl);
    const hasItinerary = Boolean(event.itinerary?.length);
    const showThingsToDo =
      !["travel", "flight"].includes(event.category) && !hasItinerary;
    const showItinerary = hasItinerary;
    return (
      <div
        ref={ref}
        data-event-id={event.id}
        className={`card ${dense ? "space-y-3" : "space-y-4"} transition duration-500 motion-reduce:transition-none ${
          active ? "border-ember/70 shadow-strong" : "border-border/40"
        } ${
          isRevealed ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
        } motion-reduce:translate-y-0 motion-reduce:opacity-100`}
        onClick={onSelect}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-fog/60">
              {formatItalyDate(event.startsAt)}
            </p>
            <p
              className={`font-semibold text-bright ${
                dense ? "text-base" : "text-lg"
              }`}
            >
              {formatItalyTimeRange(event.startsAt, event.endsAt)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="chip">{event.city}</span>
            <span className="chip">{event.category}</span>
            <span className="chip">
              {status === "current"
                ? "Now"
                : status === "past"
                  ? "Past"
                  : "Up next"}
            </span>
          </div>
        </div>

        <div>
          <h3 className={dense ? "text-lg" : "text-xl"}>{event.title}</h3>
          {event.description && !dense ? (
            <p className="text-sm text-fog/70">{event.description}</p>
          ) : null}
        </div>

        {!dense && event.planBPlaceIds && event.planBPlaceIds.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wide text-fog/60">Plan B</p>
            <p className="text-sm text-fog/70">
              {event.planBPlaceIds.length} backup picks saved.
            </p>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-fog/70">
          {hasListing ? (
            <a
              href={event.location.googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              className="underline decoration-white/30 underline-offset-4 hover:text-bright"
            >
              Open Google Maps
            </a>
          ) : (
            <span className="text-xs uppercase tracking-wide text-fog/50">
              Map link unavailable
            </span>
          )}
          {walkingTime ? (
            <span className="text-xs uppercase tracking-wide text-olive/90">
              Walk {walkingTime}
            </span>
          ) : null}
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-xs text-fog/60">
            <span className="block">{event.location.name}</span>
            {event.location.address ? (
              <span className="block">{event.location.address}</span>
            ) : null}
          </p>
          {showThingsToDo ? (
            <Link
              href={`/events/${event.id}`}
              className="pill pill-cta w-full flex-col items-center justify-center text-center leading-tight sm:w-auto"
            >
              <span>Things to do</span>
              <span className="text-xs text-fog/60">near here</span>
            </Link>
          ) : null}
          {showItinerary ? (
            <Link href={`/events/${event.id}`} className="pill w-full sm:w-auto">
              View itinerary
            </Link>
          ) : null}
        </div>
      </div>
    );
  },
);

EventCard.displayName = "EventCard";

export default EventCard;
