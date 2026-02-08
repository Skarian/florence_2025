import type { Place } from "@/lib/types";

import florence from "./florence.json";
import rome from "./rome.json";
import venice from "./venice.json";
import chianti from "./chianti.json";

export const placesByCity: Record<string, Place[]> = {
  Florence: florence as Place[],
  Rome: rome as Place[],
  Venice: venice as Place[],
  Chianti: chianti as Place[],
};

export const allPlaces: Place[] = [
  ...(florence as Place[]),
  ...(rome as Place[]),
  ...(venice as Place[]),
  ...(chianti as Place[]),
];
