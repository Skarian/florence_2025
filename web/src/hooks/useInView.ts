import type { RefObject } from "react";
import { useEffect, useState } from "react";

type InViewOptions = {
  rootMargin?: string;
  threshold?: number | number[];
};

export default function useInView<T extends Element>(
  ref: RefObject<T | null>,
  options: InViewOptions = {},
) {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) setInView(entry.isIntersecting);
      },
      {
        rootMargin: options.rootMargin ?? "200px 0px",
        threshold: options.threshold ?? 0.1,
      },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, options.rootMargin, options.threshold]);

  return inView;
}
