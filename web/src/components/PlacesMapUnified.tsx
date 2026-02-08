import dynamic from "next/dynamic";

const GooglePlacesMap = dynamic(() => import("./maps/GooglePlacesMap"), {
  ssr: false,
});

type PlacesMapProps = React.ComponentProps<typeof GooglePlacesMap>;

export default function PlacesMapUnified(props: PlacesMapProps) {
  return <GooglePlacesMap {...props} />;
}
