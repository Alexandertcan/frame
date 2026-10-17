import { useEffect, useMemo, useRef, useState } from "react";
import { Preview } from "./Workspace";
import { spaceSite } from "./space-demo";

/** The same editable six-page sample, presented inside a physical monitor. */
export default function ComputerShowcase() {
  const site = useMemo(() => spaceSite(), []);
  const [pageId, setPageId] = useState(site.pages[0].id);
  const [visible, setVisible] = useState(false);
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "360px" },
    );
    observer.observe(host.current!);
    return () => observer.disconnect();
  }, []);
  return (
    <div className="computer-showcase" ref={host}>
      <div className="promo-computer">
        <div className="computer-display">
          <i className="computer-camera" aria-hidden="true" />
          <div className="computer-screen">
            {visible ? (
              <Preview site={site} pageId={pageId} />
            ) : (
              <img
                src="/assets/frame-orbit.jpg"
                alt="SUPER INTELLIGENCE 太空旅行网站预览"
                loading="lazy"
              />
            )}
          </div>
          <div className="computer-chin" aria-hidden="true">
            <b>FRAME</b>
            <span>Designed to become yours.</span>
            <i />
          </div>
        </div>
        <div className="computer-neck" aria-hidden="true" />
        <div className="computer-foot" aria-hidden="true" />
      </div>
      <div
        className="computer-page-switcher"
        role="group"
        aria-label="宣传电脑页面"
      >
        {site.pages.map((page) => (
          <button
            key={page.id}
            aria-pressed={pageId === page.id}
            onClick={() => setPageId(page.id)}
          >
            {page.title}
          </button>
        ))}
      </div>
      <p className="computer-caption">
        切换页面，直接体验网站。<span>FRAME 原创概念样本</span>
      </p>
    </div>
  );
}
