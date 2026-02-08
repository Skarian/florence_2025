export function googleMapsUrlForLatLng(
  lat: number,
  lon: number,
  label?: string,
) {
  const query = `${lat},${lon}`;
  const encodedLabel = label ? `(${encodeURIComponent(label)})` : "";
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    query,
  )}${encodedLabel}`;
}

export function googleMapsUrlForAddress(address: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    address,
  )}`;
}

export function isGoogleMapsListingUrl(url?: string) {
  if (!url) return false;
  const normalized = url.toLowerCase();
  return (
    normalized.includes("/maps/place") ||
    normalized.includes("place_id=") ||
    normalized.includes("cid=")
  );
}
