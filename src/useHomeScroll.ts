import { useEffect, useRef, type RefObject } from "react";

const clamp = (value: number) => Math.max(0, Math.min(1, value));

/** One scroll measurement pass; CSS and the studio camera share the same clock. */
export function useHomeScroll(root: RefObject<HTMLElement | null>) {
  const studioProgress = useRef(0.5);
  useEffect(() => {
    if (!root.current) return;
    const nodes = [
      ...root.current.querySelectorAll<HTMLElement>("[data-home-motion]"),
    ];
    const footer = document.querySelector<HTMLElement>(".site-footer");
    if (footer) nodes.push(footer);
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const header = document.querySelector<HTMLElement>(".site-header");
    let raf = 0;
    const update = () => {
      raf = 0;
      for (const node of nodes) {
        const rect = node.getBoundingClientRect();
        const travel = reduced.matches
          ? 0.5
          : clamp((innerHeight - rect.top) / (innerHeight + rect.height));
        const arrive = reduced.matches
          ? 1
          : clamp(
              (innerHeight - rect.top) /
                (Math.min(rect.height, innerHeight) * 0.9),
            );
        node.style.setProperty("--travel", travel.toFixed(4));
        node.style.setProperty("--arrive", arrive.toFixed(4));
        node.style.setProperty(
          "--ink",
          `${(reduced.matches ? 1 : clamp(travel * 2.5 - 0.35)) * 100}%`,
        );
        if (node.dataset.homeMotion === "studio")
          studioProgress.current = travel;
      }
      const lightBehindHeader = nodes.some((node) => {
        if (!node.dataset.homeMotion || node.dataset.homeMotion === "aperture")
          return false;
        const rect = node.getBoundingClientRect();
        return rect.top <= 60 && rect.bottom > 60;
      });
      if (header) header.dataset.surface = lightBehindHeader ? "light" : "dark";
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", schedule);
    reduced.addEventListener("change", schedule);
    const observer = new ResizeObserver(schedule);
    observer.observe(root.current);
    update();
    return () => {
      removeEventListener("scroll", schedule);
      removeEventListener("resize", schedule);
      reduced.removeEventListener("change", schedule);
      observer.disconnect();
      cancelAnimationFrame(raf);
      if (header) delete header.dataset.surface;
    };
  }, [root]);
  return studioProgress;
}
