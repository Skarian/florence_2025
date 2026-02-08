import dynamic from "next/dynamic";

const GoogleRouteMap = dynamic(() => import("./maps/GoogleRouteMap"), { ssr: false });

type RouteMapProps = React.ComponentProps<typeof GoogleRouteMap>;

export default function RouteMap(props: RouteMapProps) {
  return <GoogleRouteMap {...props} />;
}
