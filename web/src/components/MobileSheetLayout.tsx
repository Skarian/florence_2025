import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, ReactNode, RefObject } from "react";

type SnapPoint = "peek" | "half" | "full";

type MobileSheetLayoutProps = {
  map: ReactNode;
  legend?: ReactNode;
  overlay?: ReactNode;
  header?: ReactNode | ((snap: SnapPoint) => ReactNode);
  children: ReactNode;
  initialSnap?: SnapPoint;
  onSnapChange?: (snap: SnapPoint) => void;
  contentRef?: RefObject<HTMLDivElement | null>;
  onScroll?: (event: React.UIEvent<HTMLDivElement>) => void;
  footer?: ReactNode;
};

const SNAP_RATIOS: Record<SnapPoint, number> = {
  peek: 0.68,
  half: 0.45,
  full: 0.12,
};

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

export default function MobileSheetLayout({
  map,
  legend,
  overlay,
  header,
  children,
  initialSnap = "half",
  onSnapChange,
  contentRef,
  onScroll,
  footer,
}: MobileSheetLayoutProps) {
  const shellRef = useRef<HTMLDivElement | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const internalContentRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = contentRef ?? internalContentRef;
  const [shellHeight, setShellHeight] = useState(0);
  const [snap, setSnap] = useState<SnapPoint>(initialSnap);
  const [offset, setOffset] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const [isNearEnd, setIsNearEnd] = useState(false);
  const headerContent = typeof header === "function" ? header(snap) : header;
  const dragState = useRef<{ startY: number; startOffset: number } | null>(null);
  const draggingRef = useRef(false);
  const moveRaf = useRef<number | null>(null);
  const pendingOffset = useRef<number | null>(null);

  useEffect(() => {
    if (!shellRef.current) return;
    const update = () => {
      const rect = shellRef.current?.getBoundingClientRect();
      if (rect) setShellHeight(rect.height);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(shellRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!shellHeight) return;
    if (draggingRef.current) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOffset((current) => {
      if (current === null) {
        return shellHeight * SNAP_RATIOS[snap];
      }
      return shellHeight * SNAP_RATIOS[snap];
    });
  }, [snap, shellHeight]);

  useEffect(() => {
    if (!onSnapChange) return;
    onSnapChange(snap);
  }, [snap, onSnapChange]);

  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;
    const nearEnd = node.scrollHeight - node.clientHeight <= 24;
    setIsNearEnd(nearEnd);
  }, [children, shellHeight, scrollRef]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(max-width: 1023px)");
    const apply = () => {
      if (media.matches) {
        document.body.classList.add("mobile-lock");
      } else {
        document.body.classList.remove("mobile-lock");
      }
    };
    apply();
    media.addEventListener("change", apply);
    return () => {
      media.removeEventListener("change", apply);
      document.body.classList.remove("mobile-lock");
    };
  }, []);

  const snapOffsets = useMemo(() => {
    return {
      full: shellHeight * SNAP_RATIOS.full,
      half: shellHeight * SNAP_RATIOS.half,
      peek: shellHeight * SNAP_RATIOS.peek,
    };
  }, [shellHeight]);

  const handlePointerDown = (event: React.PointerEvent<HTMLElement>) => {
    if (!sheetRef.current) return;
    sheetRef.current.setPointerCapture(event.pointerId);
    dragState.current = {
      startY: event.clientY,
      startOffset: offset ?? snapOffsets[snap],
    };
    setDragging(true);
    draggingRef.current = true;
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragState.current) return;
    const delta = event.clientY - dragState.current.startY;
    const next = clamp(
      dragState.current.startOffset + delta,
      snapOffsets.full,
      snapOffsets.peek,
    );
    pendingOffset.current = next;
    if (moveRaf.current == null) {
      moveRaf.current = window.requestAnimationFrame(() => {
        moveRaf.current = null;
        if (pendingOffset.current != null) {
          setOffset(pendingOffset.current);
        }
      });
    }
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!sheetRef.current || !dragState.current) return;
    sheetRef.current.releasePointerCapture(event.pointerId);
    setDragging(false);
    draggingRef.current = false;
    dragState.current = null;
    const entries = Object.entries(snapOffsets) as Array<[SnapPoint, number]>;
    let nearest = entries[0]?.[0] ?? "half";
    let nearestDistance = Number.POSITIVE_INFINITY;
    const currentOffset = offset ?? snapOffsets[snap];
    entries.forEach(([key, value]) => {
      const distance = Math.abs(value - currentOffset);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = key;
      }
    });
    setSnap(nearest);
  };

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    if (snap === "peek" && target.scrollTop > 8 && !draggingRef.current) {
      setSnap("half");
    }
    const nearEnd = target.scrollTop + target.clientHeight >= target.scrollHeight - 24;
    setIsNearEnd(nearEnd);
    onScroll?.(event);
  };

  useEffect(() => {
    return () => {
      if (moveRaf.current) {
        cancelAnimationFrame(moveRaf.current);
      }
    };
  }, []);

  return (
    <div
      ref={shellRef}
      className="mobile-sheet-shell"
      style={
        offset != null
          ? ({ "--sheet-offset": `${offset}px` } as CSSProperties)
          : undefined
      }
    >
      <div className="mobile-map-layer">
        <div className="mobile-map-frame">
          {map}
          {legend ? <div className="mobile-map-legend">{legend}</div> : null}
          {overlay ? <div className="mobile-map-overlay">{overlay}</div> : null}
        </div>
      </div>
      <div
        ref={sheetRef}
        className={`mobile-sheet ${dragging ? "is-dragging" : ""}`}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div className="mobile-sheet-surface">
          <button
            type="button"
            className="mobile-sheet-handle"
            aria-label="Drag sheet"
            onPointerDown={handlePointerDown}
          >
            <span className="mobile-sheet-grabber" />
          </button>
          {headerContent ? (
            <div className="mobile-sheet-header">{headerContent}</div>
          ) : null}
          <div
            ref={scrollRef}
            className="mobile-sheet-content"
            data-snap={snap}
            onScroll={handleScroll}
          >
            {children}
          </div>
          {footer ? (
            <div
              className={`mobile-sheet-footer ${
                isNearEnd ? "mobile-sheet-footer--visible" : ""
              }`}
            >
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
