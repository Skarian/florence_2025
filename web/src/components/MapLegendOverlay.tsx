import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

export type LegendItem = {
  id: string;
  label: string;
  color: string;
};

type MapLegendOverlayProps = {
  items: LegendItem[];
  controls?: ReactNode;
  buttonLabel?: string;
};

export default function MapLegendOverlay({
  items,
  controls,
  buttonLabel = "Legend",
}: MapLegendOverlayProps) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (event: PointerEvent) => {
      if (panelRef.current?.contains(event.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, [open]);

  if (!items.length && !controls) {
    return null;
  }

  return open ? (
    <div
      ref={panelRef}
      className="w-60 space-y-3 rounded-xl border border-border/40 bg-ash/95 p-3 text-xs text-fog/80 shadow-soft backdrop-blur"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-fog/60">Legend</p>
        <button
          type="button"
          className="text-fog/70"
          onClick={() => setOpen(false)}
        >
          Close
        </button>
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-full border border-ink/50"
              style={{ backgroundColor: item.color }}
            />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
      {controls ? <div className="pt-1">{controls}</div> : null}
    </div>
  ) : (
    <button
      type="button"
      className="pill pill-cta text-xs"
      onClick={() => setOpen(true)}
    >
      {buttonLabel}
    </button>
  );
}
