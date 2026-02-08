import { allPlaces, placesByCity } from "../../data/rolodex";
import type { Place, PlaceCategory } from "@/lib/types";

export const CITY_OPTIONS = Object.keys(placesByCity);

export const CATEGORY_OPTIONS: { value: PlaceCategory | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "museum", label: "Museums" },
  { value: "landmark", label: "Landmarks" },
  { value: "market", label: "Markets" },
  { value: "food", label: "Food" },
  { value: "viewpoint", label: "Views" },
  { value: "tour", label: "Tours" },
  { value: "activity", label: "Activities" },
  { value: "shopping", label: "Shopping" },
  { value: "other", label: "Other" },
];

export const PRICE_OPTIONS = ["all", "$", "$$", "$$$", "$$$$", "free"] as const;

export type PlaceFilters = {
  search: string;
  category: PlaceCategory | "all";
  price: (typeof PRICE_OPTIONS)[number];
  diet: string | "all";
};

const normalize = (value: string) => value.toLowerCase().trim();

export function getAllPlaces() {
  return allPlaces;
}

export function getPlacesByCity(city: string) {
  return placesByCity[city] ?? [];
}

export function filterPlaces(places: Place[], filters: PlaceFilters) {
  const search = normalize(filters.search);
  return places.filter((place) => {
    if (filters.category !== "all" && place.category !== filters.category) {
      return false;
    }
    if (filters.price !== "all" && place.price !== filters.price) {
      return false;
    }
    if (filters.diet !== "all" && !place.dietTags.includes(filters.diet)) {
      return false;
    }
    if (!search) return true;
    const haystack = normalize(
      `${place.name} ${place.description} ${place.highlight} ${place.tags.join(" ")}`,
    );
    return haystack.includes(search);
  });
}
