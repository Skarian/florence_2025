import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

type MapFiltersOverlayProps = {
  children: ReactNode;
  buttonLabel?: string;
};

export default function MapFiltersOverlay({
  children,
  buttonLabel = "Filters",
}: MapFiltersOverlayProps) {
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

  return open ? (
    <div
      ref={panelRef}
      className="w-72 space-y-3 rounded-xl border border-border/40 bg-ash/95 p-3 text-xs text-fog/80 shadow-soft backdrop-blur"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-fog/60">Filters</p>
        <button
          type="button"
          className="text-fog/70"
          onClick={() => setOpen(false)}
        >
          Close
        </button>
      </div>
      {children}
    </div>
  ) : (
    <button
      type="button"
      className="flex h-11 w-11 items-center justify-center rounded-full border border-border/40 bg-ash/90 text-bright shadow-soft"
      aria-label={buttonLabel}
      onClick={() => setOpen(true)}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M12 8.5a3.5 3.5 0 1 0 0 7a3.5 3.5 0 0 0 0-7Z"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path
          d="M19.4 12a7.4 7.4 0 0 0-.1-1.2l2-1.5-2-3.5-2.3.8a7.7 7.7 0 0 0-2.1-1.2L12.5 2h-4l-.4 2.6a7.7 7.7 0 0 0-2.1 1.2l-2.3-.8-2 3.5 2 1.5a7.4 7.4 0 0 0 0 2.4l-2 1.5 2 3.5 2.3-.8a7.7 7.7 0 0 0 2.1 1.2l.4 2.6h4l.4-2.6a7.7 7.7 0 0 0 2.1-1.2l2.3.8 2-3.5-2-1.5c.1-.4.1-.8.1-1.2Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
