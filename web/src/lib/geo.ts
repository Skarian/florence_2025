const EARTH_RADIUS_KM = 6371;

export function haversineKm(
  aLat: number,
  aLon: number,
  bLat: number,
  bLon: number,
) {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLon = toRad(bLon - aLon);
  const lat1 = toRad(aLat);
  const lat2 = toRad(bLat);

  const sinLat = Math.sin(dLat / 2);
  const sinLon = Math.sin(dLon / 2);
  const a =
    sinLat * sinLat +
    Math.cos(lat1) * Math.cos(lat2) * sinLon * sinLon;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

export function italyBoundsContains(lat: number, lon: number) {
  return lat >= 36.0 && lat <= 47.2 && lon >= 6.6 && lon <= 18.8;
}
