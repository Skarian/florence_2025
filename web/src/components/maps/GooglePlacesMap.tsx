import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import type { Location, Place } from "@/lib/types";
import { GOOGLE_DARK_STYLE, GOOGLE_LIGHT_STYLE } from "./googleStyles";
import { ICONS } from "./googleIcons";
import { loadGoogleMaps } from "@/lib/googleMapsLoader";

const DEFAULT_CENTER = { lat: 43.773544, lng: 11.255181 };

type GooglePlacesMapProps = {
  places: Place[];
  primaryLocation?: Location | null;
  userLocation?: { lat: number; lon: number } | null;
  showUserLocation?: boolean;
  activePlaceId?: string | null;
  className?: string;
  interactive?: boolean;
  onInteract?: () => void;
};

export default function GooglePlacesMap({
  places,
  primaryLocation,
  userLocation,
  showUserLocation,
  activePlaceId,
  className,
  interactive = true,
  onInteract,
}: GooglePlacesMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<Map<string, google.maps.Marker>>(new Map());
  const primaryRef = useRef<google.maps.Marker | null>(null);
  const userRef = useRef<google.maps.Marker | null>(null);
  const theme = useTheme();
  const lastBoundsKeyRef = useRef<string | null>(null);
  const lastFocusKeyRef = useRef<string | null>(null);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey || !containerRef.current) return;

    loadGoogleMaps(apiKey).then(() => {
      if (cancelled || !containerRef.current) return;
      const map = new google.maps.Map(containerRef.current, {
        center: DEFAULT_CENTER,
        zoom: 12,
        styles: theme.resolvedTheme === "light" ? GOOGLE_LIGHT_STYLE : GOOGLE_DARK_STYLE,
        disableDefaultUI: true,
        gestureHandling: interactive ? "auto" : "none",
        draggable: interactive,
        keyboardShortcuts: interactive,
        backgroundColor:
          theme.resolvedTheme === "light" ? "#f8f8f6" : "#0b0d10", // avoid white flash
      });
      mapRef.current = map;
      map.addListener("dragstart", () => onInteract?.());
      map.addListener("zoom_changed", () => onInteract?.());
      updateMap(map);
    });

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.setOptions({
      styles: theme.resolvedTheme === "light" ? GOOGLE_LIGHT_STYLE : GOOGLE_DARK_STYLE,
      gestureHandling: interactive ? "auto" : "none",
      draggable: interactive,
      keyboardShortcuts: interactive,
    });
    updateMap(map);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    theme.resolvedTheme,
    interactive,
    places,
    primaryLocation,
    userLocation,
    showUserLocation,
    activePlaceId,
  ]);

  const updateMap = (map: google.maps.Map) => {
    setFading(true);
    // Update place markers
    const markers = markersRef.current;
    const seen = new Set<string>();
    places.forEach((place) => {
      const position = { lat: place.lat, lng: place.lon };
      const existing = markers.get(place.id);
      const icon = place.id === activePlaceId ? ICONS.active : ICONS.place;
      if (existing) {
        existing.setPosition(position);
        existing.setIcon(icon);
      } else {
        const marker = new google.maps.Marker({
          position,
          map,
          icon,
        });
        markers.set(place.id, marker);
      }
      seen.add(place.id);
    });
    // remove stale markers
    Array.from(markers.keys()).forEach((id) => {
      if (!seen.has(id)) {
        markers.get(id)?.setMap(null);
        markers.delete(id);
      }
    });

    // primary marker
    if (primaryLocation) {
      const pos = { lat: primaryLocation.lat, lng: primaryLocation.lon };
      if (primaryRef.current) {
        primaryRef.current.setPosition(pos);
      } else {
        primaryRef.current = new google.maps.Marker({
          position: pos,
          map,
          icon: ICONS.primary,
        });
      }
    } else if (primaryRef.current) {
      primaryRef.current.setMap(null);
      primaryRef.current = null;
    }

    // user marker
    if (showUserLocation && userLocation) {
      const pos = { lat: userLocation.lat, lng: userLocation.lon };
      if (userRef.current) {
        userRef.current.setPosition(pos);
      } else {
        userRef.current = new google.maps.Marker({
          position: pos,
          map,
          icon: ICONS.user,
        });
      }
    } else if (userRef.current) {
      userRef.current.setMap(null);
      userRef.current = null;
    }

    // Build a deterministic key of all points to avoid re-fitting on every prop change
    const boundsPoints: Array<{ lat: number; lon: number }> = [];
    places.forEach((p) => boundsPoints.push({ lat: p.lat, lon: p.lon }));
    if (primaryLocation) boundsPoints.push({ lat: primaryLocation.lat, lon: primaryLocation.lon });
    if (showUserLocation && userLocation)
      boundsPoints.push({ lat: userLocation.lat, lon: userLocation.lon });

    const boundsKey = boundsPoints
      .map((p) => `${p.lat.toFixed(6)},${p.lon.toFixed(6)}`)
      .sort()
      .join("|");

    const activeKey = activePlaceId ? `active:${activePlaceId}` : "active:none";

    const activePlace = activePlaceId
      ? places.find((p) => p.id === activePlaceId)
      : undefined;

    // Fit only when the point set changes (first load or data change)
    let idleListener: google.maps.MapsEventListener | null = null;

    if (boundsKey && boundsKey !== lastBoundsKeyRef.current) {
      lastBoundsKeyRef.current = boundsKey;
      lastFocusKeyRef.current = activeKey;
      const bounds = new google.maps.LatLngBounds();
      boundsPoints.forEach((p) => bounds.extend({ lat: p.lat, lng: p.lon }));
      map.fitBounds(bounds, 60);
      const listener = google.maps.event.addListenerOnce(map, "bounds_changed", () => {
        const zoom = map.getZoom();
        if (zoom && zoom > 15) map.setZoom(15);
      });
      setTimeout(() => google.maps.event.removeListener(listener), 500);
      idleListener = google.maps.event.addListenerOnce(map, "idle", () => setFading(false));
      google.maps.event.addListenerOnce(map, "tilesloaded", () => setFading(false));
    } else if (activePlace && activeKey !== lastFocusKeyRef.current) {
      // Gently pan to the newly selected place without changing zoom drastically
      lastFocusKeyRef.current = activeKey;
      map.panTo({ lat: activePlace.lat, lng: activePlace.lon });
      const zoom = map.getZoom();
      if (zoom && zoom < 13) {
        map.setZoom(13);
      }
      idleListener = google.maps.event.addListenerOnce(map, "idle", () => setFading(false));
      google.maps.event.addListenerOnce(map, "tilesloaded", () => setFading(false));
    } else if (!activePlace && activeKey !== lastFocusKeyRef.current && primaryLocation) {
      lastFocusKeyRef.current = activeKey;
      map.panTo({ lat: primaryLocation.lat, lng: primaryLocation.lon });
      idleListener = google.maps.event.addListenerOnce(map, "idle", () => setFading(false));
      google.maps.event.addListenerOnce(map, "tilesloaded", () => setFading(false));
    }

    if (!boundsKey) {
      map.setCenter(DEFAULT_CENTER);
      map.setZoom(11);
      idleListener = google.maps.event.addListenerOnce(map, "idle", () => setFading(false));
      google.maps.event.addListenerOnce(map, "tilesloaded", () => setFading(false));
    }

    if (!idleListener) {
      setFading(false);
    }
    window.setTimeout(() => setFading(false), 600);
  };

  return (
    <div
      className={`map-panel overflow-hidden p-0 ${className ?? ""} map-fade`}
      data-fading={fading ? "true" : "false"}
    >
      <div ref={containerRef} className="h-full w-full map-inner" />
      <div className="map-dim" aria-hidden />
    </div>
  );
}
