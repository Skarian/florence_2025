type MapPanelProps = {
  title?: string;
  subtitle?: string;
};

export default function MapPanel({ title, subtitle }: MapPanelProps) {
  return (
    <div className="map-panel space-y-3">
      <div>
        <p className="text-sm uppercase tracking-wide text-fog/60">
          {title ?? "Map"}
        </p>
        {subtitle ? <p className="text-sm text-fog/80">{subtitle}</p> : null}
      </div>
      <div className="flex h-72 items-center justify-center rounded-2xl border border-dashed border-border/40 bg-ink/10 text-sm text-fog/70">
        Map will render here
      </div>
    </div>
  );
}
