import { useEffect, useState } from "react";

type GeoState =
  | { status: "idle" }
  | { status: "granted"; coords: { lat: number; lon: number } }
  | { status: "denied" }
  | { status: "error"; message: string };

export function useGeolocation(enabled = true) {
  const [state, setState] = useState<GeoState>({ status: "idle" });

  useEffect(() => {
    if (!enabled || typeof navigator === "undefined") {
      return;
    }

    if (!navigator.geolocation) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState({ status: "error", message: "Geolocation unavailable" });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          status: "granted",
          coords: {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          },
        });
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setState({ status: "denied" });
        } else {
          setState({ status: "error", message: error.message });
        }
      },
      { enableHighAccuracy: false, timeout: 8000 },
    );
  }, [enabled]);

  return state;
}
