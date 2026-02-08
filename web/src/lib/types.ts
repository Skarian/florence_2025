export type PlaceCategory =
  | "food"
  | "market"
  | "museum"
  | "activity"
  | "tour"
  | "viewpoint"
  | "landmark"
  | "shopping"
  | "station"
  | "lodging"
  | "other";

export type Location = {
  name: string;
  address?: string;
  lat: number;
  lon: number;
  description?: string;
  googleMapsUrl?: string;
  placeId?: string;
};

export type Booking = {
  provider?: string;
  vendor?: string;
  confirmation?: string;
  pnr?: string;
  url?: string;
  notes?: string;
  amount?: number;
  currency?: string;
};

export type RouteInfo = {
  fromStationId: string;
  toStationId: string;
  mode?: string;
  lineName?: string;
};

export type Event = {
  id: string;
  title: string;
  category: string;
  startsAt: string;
  endsAt?: string;
  location: Location;
  description?: string;
  city: string;
  people?: string[];
  booking?: Booking;
  relatedStayId?: string;
  route?: RouteInfo | null;
  planBPlaceIds?: string[];
  loop?: { loopId: string } | null;
  itinerary?: string[];
  visibility?: "primary" | "context";
};

export type Place = {
  id: string;
  name: string;
  category: PlaceCategory;
  city: string;
  description: string;
  highlight: string;
  address: string;
  lat: number;
  lon: number;
  googleMapsUrl: string;
  placeId: string;
  tags: string[];
  dietTags: string[];
  signatureItems: string[];
  price: "$" | "$$" | "$$$" | "$$$$" | "free";
  crowdLevel: "quiet" | "mixed" | "busy" | "varies";
  crowdNote: string;
  timeNeeded: "15m" | "30m" | "1h" | "2h" | "half-day" | "full-day";
  walkIntensity: "light" | "moderate" | "long";
  booking: {
    required: boolean;
    url?: string;
    notes?: string;
  };
  hoursNote: string;
  sourceUrl: string;
};

export type LoopRoute = {
  id: string;
  name: string;
  description: string;
  waypoints: Location[];
  totalDistanceKm: number;
  estimatedMinutes: number;
};

export type Station = {
  id: string;
  name: string;
  city: string;
  description?: string;
  location: Location;
};

export type Stay = {
  id: string;
  name: string;
  location: Location;
  city: string;
  checkIn: string;
  checkOut: string;
  guests: string[];
  description?: string;
  booking?: Booking;
};

export type TripFacts = {
  metadata: {
    generatedAt: string;
    sourceFiles: string[];
    notes?: string;
  };
  people: {
    primary: string[];
    guests: string[];
  };
  stays: Stay[];
  stations: Station[];
  events: Event[];
  walkingLoops: LoopRoute[];
};
