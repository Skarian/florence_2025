import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import type { Location } from "@/lib/types";
import { GOOGLE_DARK_STYLE, GOOGLE_LIGHT_STYLE } from "./googleStyles";
import { ICONS } from "./googleIcons";
import { loadGoogleMaps } from "@/lib/googleMapsLoader";

type MapRoute = {
  from: Location;
  to: Location;
};

type GoogleRouteMapProps = {
  activeLocation?: Location | null;
  route?: MapRoute | null;
  className?: string;
  interactive?: boolean;
  onInteract?: () => void;
};

const DEFAULT_CENTER = { lat: 43.773544, lng: 11.255181 };

export default function GoogleRouteMap({
  activeLocation,
  route,
  className,
  interactive = true,
  onInteract,
}: GoogleRouteMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<{
    active?: google.maps.Marker;
    from?: google.maps.Marker;
    to?: google.maps.Marker;
  }>({});
  const routeRef = useRef<google.maps.Polyline | null>(null);
  const theme = useTheme();
  const lastKeyRef = useRef<string | null>(null);
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
  }, [theme.resolvedTheme, interactive, activeLocation, route]);

  const updateMap = (map: google.maps.Map) => {
    setFading(true);
    // Clear markers if missing map
    if (!map) return;

    const markers = markersRef.current;

    const upsertMarker = (
      key: keyof typeof markers,
      position: google.maps.LatLngLiteral,
      icon: string,
    ) => {
      if (markers[key]) {
        markers[key]!.setPosition(position);
        markers[key]!.setIcon(icon);
      } else {
        markers[key] = new google.maps.Marker({
          position,
          map,
          icon,
        });
      }
    };

    const clearMarker = (key: keyof typeof markers) => {
      if (markers[key]) {
        markers[key]!.setMap(null);
        markers[key] = undefined;
      }
    };

    // Active point only when no route
    if (activeLocation && !route) {
      upsertMarker("active", { lat: activeLocation.lat, lng: activeLocation.lon }, ICONS.active);
    } else {
      clearMarker("active");
    }

    if (route) {
      upsertMarker("from", { lat: route.from.lat, lng: route.from.lon }, ICONS.routePointFrom);
      upsertMarker("to", { lat: route.to.lat, lng: route.to.lon }, ICONS.routePointTo);
      const path = [
        { lat: route.from.lat, lng: route.from.lon },
        { lat: route.to.lat, lng: route.to.lon },
      ];
      if (!routeRef.current) {
        routeRef.current = new google.maps.Polyline({
          path,
          strokeColor: "#8a9a5b",
          strokeOpacity: 0.85,
          strokeWeight: 4,
          icons: [
            {
              icon: {
                path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                strokeColor: "#8a9a5b",
                scale: 3,
              },
              offset: "50%",
              repeat: "120px",
            },
          ],
        });
        routeRef.current.setMap(map);
      } else {
        routeRef.current.setPath(path);
      }
    } else {
      if (routeRef.current) {
        routeRef.current.setMap(null);
        routeRef.current = null;
      }
      clearMarker("from");
      clearMarker("to");
    }

    // Fit/pan smoothly only when target changes
    const key = route
      ? `route:${route.from.lat},${route.from.lon}-${route.to.lat},${route.to.lon}`
      : activeLocation
        ? `point:${activeLocation.lat},${activeLocation.lon}`
        : "default";
    if (key === lastKeyRef.current) return;
    lastKeyRef.current = key;

    let idleListener: google.maps.MapsEventListener | null = null;

    if (route) {
      const bounds = new google.maps.LatLngBounds();
      bounds.extend({ lat: route.from.lat, lng: route.from.lon });
      bounds.extend({ lat: route.to.lat, lng: route.to.lon });
      map.fitBounds(bounds, 60);
      const listener = google.maps.event.addListenerOnce(map, "bounds_changed", () => {
        const zoom = map.getZoom();
        if (zoom && zoom > 15) map.setZoom(15);
      });
      setTimeout(() => google.maps.event.removeListener(listener), 500);
      idleListener = google.maps.event.addListenerOnce(map, "idle", () => setFading(false));
      google.maps.event.addListenerOnce(map, "tilesloaded", () => setFading(false));
    } else if (activeLocation) {
      map.panTo({ lat: activeLocation.lat, lng: activeLocation.lon });
      map.setZoom(14);
      idleListener = google.maps.event.addListenerOnce(map, "idle", () => setFading(false));
      google.maps.event.addListenerOnce(map, "tilesloaded", () => setFading(false));
    } else {
      map.panTo(DEFAULT_CENTER);
      map.setZoom(11);
      idleListener = google.maps.event.addListenerOnce(map, "idle", () => setFading(false));
      google.maps.event.addListenerOnce(map, "tilesloaded", () => setFading(false));
    }
    if (!idleListener) {
      setFading(false);
    }
    // Safety timeout to clear overlay if events never fire
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
