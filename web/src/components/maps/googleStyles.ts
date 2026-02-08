export const GOOGLE_DARK_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#0b0b10" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0b0b10" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#9aa0ac" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#8a9a5b" }],
  },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#1c1f2a" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#8a9a5b" }] },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#112014" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#507a4b" }],
  },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#1d2230" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#141826" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#7d8291" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#121727" }] },
  { featureType: "transit.station", elementType: "labels.text.fill", stylers: [{ color: "#8a9a5b" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0a101a" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#6b7385" }] },
];

export const GOOGLE_LIGHT_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#f6f7fb" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#5b6270" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#ffffff" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#788a42" }],
  },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#e8ebf0" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#dfe8d7" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#d7dbe5" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#c5cad5" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#c2c7d3" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#d5dae5" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#cfd9e8" }] },
];
