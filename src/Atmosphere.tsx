import { useEffect, useRef } from "react";
export { default as SoundControl } from "./SoundControl";

export function GlassRefraction() {
  const lens = useRef<SVGFEImageElement>(null);
  useEffect(() => {
    const header = document.querySelector<HTMLElement>(".site-header");
    if (!header) return;
    // Build a rounded lens: a quiet center with refraction concentrated at
    // the curved rim. Recompute only when the header changes size.
    const update = () => {
      const box = header.getBoundingClientRect();
      const scale = Math.min(1, 960 / box.width);
      const map = document.createElement("canvas");
      map.width = Math.max(1, Math.round(box.width * scale));
      map.height = Math.max(1, Math.round(box.height * scale));
      const ctx = map.getContext("2d");
      if (!ctx) return;
      const radius =
        Math.min(
          parseFloat(getComputedStyle(header).borderTopLeftRadius),
          box.height / 2,
        ) * scale;
      const pixels = ctx.createImageData(map.width, map.height);
      for (let y = 0; y < map.height; y++) {
        for (let x = 0; x < map.width; x++) {
          const px = x + 0.5 - map.width / 2,
            py = y + 0.5 - map.height / 2;
          const qx = Math.abs(px) - (map.width / 2 - radius);
          const qy = Math.abs(py) - (map.height / 2 - radius);
          const ox = Math.max(qx, 0),
            oy = Math.max(qy, 0);
          const length = Math.hypot(ox, oy);
          const distance = Math.max(
            0,
            -(length + Math.min(Math.max(qx, qy), 0) - radius),
          );
          const bend =
            Math.sin(Math.min(1, distance / (15 * scale)) * Math.PI) * 0.92;
          const nx = length ? ox / length : qx > qy ? 1 : 0;
          const ny = length ? oy / length : qx > qy ? 0 : 1;
          const i = (y * map.width + x) * 4;
          pixels.data[i] = 128 + Math.sign(px) * nx * bend * 127;
          pixels.data[i + 1] = 128 + Math.sign(py) * ny * bend * 127;
          pixels.data[i + 2] = 128;
          pixels.data[i + 3] = 255;
        }
      }
      ctx.putImageData(pixels, 0, 0);
      lens.current?.setAttribute("href", map.toDataURL());
    };
    const observer = new ResizeObserver(update);
    observer.observe(header);
    update();
    return () => observer.disconnect();
  }, []);
  return (
    <svg
      width="0"
      height="0"
      aria-hidden="true"
      style={{ position: "absolute", pointerEvents: "none" }}
    >
      <defs>
        <filter
          id="frame-header-lens"
          x="0"
          y="0"
          width="100%"
          height="100%"
          colorInterpolationFilters="sRGB"
        >
          <feImage
            ref={lens}
            x="0"
            y="0"
            width="100%"
            height="100%"
            preserveAspectRatio="none"
            result="lens-map"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="lens-map"
            scale="32"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
        <filter
          id="frame-liquid"
          x="-20%"
          y="-30%"
          width="140%"
          height="160%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.008 0.018"
            numOctaves="2"
            seed="8"
            result="waves"
          />
          <feGaussianBlur in="waves" stdDeviation="2" result="smooth-waves" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="smooth-waves"
            scale="18"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  );
}

export function InteractionAtmosphere({ route }: { route: string }) {
  const canvas = useRef<HTMLCanvasElement>(null),
    hint = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const media = matchMedia(
      "(pointer:fine) and (prefers-reduced-motion:no-preference)",
    );
    const node = canvas.current!,
      label = hint.current!;
    const context = node.getContext("2d");
    if (!context) return;
    let running = false,
      raf = 0,
      lastSpawn = 0,
      lastMove = 0,
      flow = 0;
    let pointer = { x: -100, y: -100 },
      ripples: {
        x: number;
        y: number;
        born: number;
        power: number;
        phase: number;
      }[] = [];
    function resize() {
      const ratio = Math.min(devicePixelRatio, 1.5);
      node.width = innerWidth * ratio;
      node.height = innerHeight * ratio;
      context!.setTransform(ratio, 0, 0, ratio, 0, 0);
    }
    function draw(time: number) {
      context!.clearRect(0, 0, innerWidth, innerHeight);
      ripples = ripples.filter((r) => time - r.born < 1320);
      for (const ripple of ripples) {
        // rAF timestamps can precede a pointer event dispatched in that frame.
        const p = Math.max(0, Math.min(1, (time - ripple.born) / 1320)),
          eased = 1 - (1 - p) ** 3,
          edgeFade = (1 - p) ** 1.75,
          radius = 5 + eased * ripple.power,
          wobble = Math.sin(time * 0.0022 + ripple.phase) * 0.018;
        context!.save();
        context!.translate(ripple.x, ripple.y);
        context!.rotate(-0.32 + wobble);
        // The trough gives the same wave depth on pale surfaces; the crest
        // catches light on dark surfaces. Both dissipate without a hard edge.
        context!.globalCompositeOperation = "source-over";
        context!.lineWidth = 3.5;
        const trough = context!.createLinearGradient(
          -radius,
          -radius,
          radius,
          radius,
        );
        trough.addColorStop(0, `rgba(12, 44, 36, ${0.06 * edgeFade})`);
        trough.addColorStop(0.65, `rgba(12, 44, 36, ${0.32 * edgeFade})`);
        trough.addColorStop(1, `rgba(12, 44, 36, ${0.08 * edgeFade})`);
        context!.strokeStyle = trough;
        context!.shadowBlur = 5;
        context!.shadowColor = `rgba(13, 45, 37, ${0.12 * edgeFade})`;
        context!.beginPath();
        context!.ellipse(
          1.5,
          2,
          radius + 1.5,
          (radius + 1.5) * 0.67,
          0,
          0,
          Math.PI * 2,
        );
        context!.stroke();
        context!.globalCompositeOperation = "screen";
        // A soft outer refraction fades continuously as the wave reaches its edge.
        context!.lineWidth = 2.2;
        context!.shadowBlur = 13;
        context!.shadowColor = `rgba(185, 235, 221, ${0.34 * edgeFade})`;
        context!.strokeStyle = `rgba(126, 178, 168, ${0.31 * edgeFade})`;
        context!.beginPath();
        context!.ellipse(0, 0, radius, radius * 0.67, 0, 0, Math.PI * 2);
        context!.stroke();
        // Two narrower highlights make the ring read as a moving water surface.
        context!.shadowBlur = 0;
        context!.lineWidth = 0.9;
        const crest = context!.createLinearGradient(
          -radius,
          -radius,
          radius,
          radius,
        );
        crest.addColorStop(
          0,
          `rgba(235, 255, 246, ${0.95 * edgeFade ** 1.25})`,
        );
        crest.addColorStop(
          0.5,
          `rgba(235, 255, 246, ${0.24 * edgeFade ** 1.25})`,
        );
        crest.addColorStop(
          1,
          `rgba(235, 255, 246, ${0.68 * edgeFade ** 1.25})`,
        );
        context!.strokeStyle = crest;
        context!.beginPath();
        context!.ellipse(
          -1.5,
          -1.6,
          radius - 1,
          (radius - 1) * 0.66,
          0,
          0,
          Math.PI * 2,
        );
        context!.stroke();
        const trailing = radius * (0.77 + p * 0.05);
        context!.lineWidth = 0.65;
        context!.strokeStyle = `rgba(130, 190, 178, ${0.48 * edgeFade ** 1.4})`;
        context!.beginPath();
        context!.ellipse(1, 2.5, trailing, trailing * 0.61, 0, 0, Math.PI * 2);
        context!.stroke();
        context!.restore();
      }
      raf = ripples.length ? requestAnimationFrame(draw) : 0;
    }
    function addRipple(event: PointerEvent, power: number) {
      if (!running || event.pointerType === "touch" || document.hidden) return;
      const target = event.target as Element;
      const surface = target.closest<HTMLElement>(
        ".glass-surface,.site-header,.sound-control,.sound-panel,.site-footer nav",
      );
      if (surface) {
        const box = surface.getBoundingClientRect();
        surface.style.setProperty(
          "--glass-x",
          `${((event.clientX - box.left) / box.width) * 100}%`,
        );
        surface.style.setProperty(
          "--glass-y",
          `${((event.clientY - box.top) / box.height) * 100}%`,
        );
      }
      if (
        target.closest(
          "input,textarea,select,[contenteditable],iframe,.editor-right,.editor-left",
        )
      ) {
        label.style.opacity = "0";
        return;
      }
      pointer = { x: event.clientX, y: event.clientY };
      const now = performance.now();
      if (power <= 40) {
        flow =
          now - lastMove < 120 ? Math.min(1, flow + (now - lastMove) / 450) : 0;
        lastMove = now;
      }
      if (now - lastSpawn > 34 || power > 40) {
        ripples.push({
          ...pointer,
          born: now,
          power: power > 40 ? 100 : 52 * (1 + flow * 0.04),
          phase: now * 0.0017,
        });
        if (ripples.length > 22) ripples.shift();
        lastSpawn = now;
        if (!raf) raf = requestAnimationFrame(draw);
      }
      const scene = document
        .querySelector(".experience-scroll")
        ?.getBoundingClientRect();
      const inScene =
        route === "/" &&
        !!scene &&
        scene.top < 150 &&
        scene.bottom > innerHeight * 0.9;
      if (!inScene) {
        label.style.opacity = "0";
        return;
      }
      const draggingTitle = target.closest(".draggable-title");
      label.querySelector("b")!.textContent = draggingTitle
        ? "拖动文字，靠近边缘散开"
        : "向下滚动，改变形态";
      label.style.transform = `translate3d(${Math.min(pointer.x + 24, innerWidth - 190)}px,${Math.min(pointer.y + 16, innerHeight - 60)}px,0)`;
      label.style.opacity =
        target.closest("a,button") && !draggingTitle ? "0" : "1";
    }
    const move = (e: PointerEvent) => addRipple(e, 30);
    const down = (e: PointerEvent) => addRipple(e, 62);
    const hide = () => {
      label.style.opacity = "0";
    };
    const change = () => {
      running = media.matches;
      if (!running) {
        ripples = [];
        context!.clearRect(0, 0, innerWidth, innerHeight);
        hide();
      }
    };
    change();
    resize();
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", down, { passive: true });
    window.addEventListener("resize", resize);
    window.addEventListener("scroll", hide, { passive: true });
    document.addEventListener("mouseleave", hide);
    media.addEventListener("change", change);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", hide);
      document.removeEventListener("mouseleave", hide);
      media.removeEventListener("change", change);
    };
  }, [route]);

  useEffect(() => {
    const reduce = matchMedia("(prefers-reduced-motion:reduce)");
    if (reduce.matches) return;
    const nodes = document.querySelectorAll<HTMLElement>(
      ".experience-intro>p,.experience-section-head h2,.product-heading h1,.product-feature h2,.feature-reference h2,.creator-belief h2,.collection-heading h2,.pricing-heading h1,.sponsor-heading h1",
    );
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-read");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18 },
    );
    nodes.forEach((node, i) => {
      node.dataset.readMotion = i % 2 ? "focus" : "ink";
      observer.observe(node);
    });
    return () => {
      observer.disconnect();
      nodes.forEach((n) => {
        delete n.dataset.readMotion;
        n.classList.remove("is-read");
      });
    };
  }, [route]);

  return (
    <>
      <canvas ref={canvas} className="pointer-water" aria-hidden="true" />
      <div ref={hint} className="pointer-hint" aria-hidden="true">
        <span>Scroll to shape</span>
        <b>向下滚动，改变形态</b>
      </div>
    </>
  );
}

export function Sponsorship() {
  return (
    <main className="sponsorship-page page-shell">
      <header className="sponsor-heading">
        <p className="small-label">支持，让想法继续生长。</p>
        <h1>Sponsorship</h1>
        <p>留一处空间，给一起创造的可能。</p>
      </header>
      <div className="sponsor-intro">
        <span className="sponsor-orbit" aria-hidden="true">
          <i />
          <i />
          <b>F</b>
        </span>
        <div>
          <h2>
            好想法，
            <br />
            值得被支持。
          </h2>
          <p>
            这里记录构页的支持入口与关注的工具。未来有正式合作时，会写清楚支持方式与关系。
          </p>
          <p className="sponsor-disclosure">尚无已确认的商业赞助关系。</p>
        </div>
      </div>
      <section className="sponsor-links" aria-label="展示链接">
        <a
          href="https://aleks.com/"
          target="_blank"
          rel="noreferrer"
          aria-label="访问 Aleks.com，外部展示链接"
        >
          <span className="sponsor-symbol">A.</span>
          <div>
            <h2>Aleks.com</h2>
            <p>用户指定的展示链接，域名归属及合作关系待确认。</p>
          </div>
          <span aria-hidden="true">↗</span>
        </a>
        <a
          href="https://chatgpt.com/"
          target="_blank"
          rel="noreferrer"
          aria-label="访问 ChatGPT，外部展示链接"
        >
          <span className="sponsor-symbol chat-symbol">✳</span>
          <div>
            <h2>ChatGPT</h2>
            <p>AI 工具入口。展示此链接不表示 OpenAI 对 FRAME 的赞助或背书。</p>
          </div>
          <span aria-hidden="true">↗</span>
        </a>
      </section>
      <section className="sponsor-invitation">
        <p className="small-label">继续创造</p>
        <h2>从一个想法开始。</h2>
        <p>先看看构页能做什么，再找到适合的合作方式。</p>
        <a href="/about" className="button primary">
          了解 Aleks <span aria-hidden="true">↗</span>
        </a>
      </section>
    </main>
  );
}
