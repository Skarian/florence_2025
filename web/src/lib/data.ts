import rawTripFacts from "../../data/generated/trip_facts.json";
import { overrides } from "../../data/overrides";
import type {
  Event,
  LoopRoute,
  Station,
  Stay,
  TripFacts,
} from "@/lib/types";

type OverrideMap<T> = Record<string, Partial<T>>;

const tripFacts = rawTripFacts as TripFacts;

function applyOverrides<T extends { id: string }>(
  items: T[],
  map?: OverrideMap<T>,
) {
  if (!map) {
    return items;
  }
  return items.map((item) => ({
    ...item,
    ...(map[item.id] ?? {}),
  }));
}

export function getTripFacts() {
  return {
    ...tripFacts,
    stays: applyOverrides(tripFacts.stays, overrides.stays as OverrideMap<Stay>),
    stations: applyOverrides(
      tripFacts.stations,
      overrides.stations as OverrideMap<Station>,
    ),
    events: applyOverrides(
      tripFacts.events,
      overrides.events as OverrideMap<Event>,
    ),
    walkingLoops: applyOverrides(
      tripFacts.walkingLoops,
      overrides.loops as OverrideMap<LoopRoute>,
    ),
  };
}

export function getEvents() {
  const { events } = getTripFacts();
  return [...events].sort(
    (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
  );
}

export function getStations() {
  const { stations } = getTripFacts();
  return stations;
}

export function getStays() {
  const { stays } = getTripFacts();
  return stays;
}

export function getLoops() {
  const { walkingLoops } = getTripFacts();
  return walkingLoops;
}
