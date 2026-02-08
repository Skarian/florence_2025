type GoogleMapsNamespace = typeof google.maps;

let mapsPromise: Promise<GoogleMapsNamespace> | null = null;

export function loadGoogleMaps(apiKey: string) {
  if (mapsPromise) return mapsPromise;
  if (!apiKey) {
    throw new Error("Google Maps API key is missing (NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)");
  }

  mapsPromise = new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Google Maps can only be loaded in the browser"));
      return;
    }
    const win = window as typeof window & { google?: typeof google };
    if (win.google?.maps) {
      resolve(win.google.maps);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      apiKey,
    )}&libraries=places&v=weekly`;
    script.async = true;
    script.defer = true;
    script.onerror = () => reject(new Error("Failed to load Google Maps JS API"));
    script.onload = () => {
      const maps = win.google?.maps;
      if (maps) {
        resolve(maps);
      } else {
        reject(new Error("Google Maps JS API loaded without maps namespace"));
      }
    };
    document.head.appendChild(script);
  });

  return mapsPromise;
}
