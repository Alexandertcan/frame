import {
  useEffect,
  useId,
  useRef,
  useState,
  type PointerEvent,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";

export default function DraggableTitle({
  lines = ["Make it", "feel like you."],
  as: Heading = "h1",
  label = "拖动首页标题",
  active = true,
}: {
  lines?: readonly [string, string];
  as?: "h1" | "h2";
  label?: string;
  active?: boolean;
}) {
  const [offset, setOffset] = useState({ x: 0, y: 0 }),
    [burst, setBurst] = useState(false),
    [edgeScale, setEdgeScale] = useState(1),
    [origin, setOrigin] = useState({ x: 0, y: 0 }),
    [dragging, setDragging] = useState(false);
  const grip = useRef<{ x: number; y: number; ox: number; oy: number } | null>(
    null,
  );
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const ref = useRef<HTMLButtonElement>(null);
  const instructionsId = useId();
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    if (!active) reset();
  }, [active]);
  function reset() {
    clearTimeout(timer.current);
    grip.current = null;
    setBurst(false);
    setDragging(false);
    setOffset({ x: 0, y: 0 });
    setEdgeScale(1);
  }
  function scatter(point?: { x: number; y: number }) {
    const rect = ref.current?.getBoundingClientRect();
    setOrigin(
      point || {
        x: rect ? rect.left + rect.width / 2 : innerWidth / 2,
        y: rect ? rect.top + rect.height / 2 : innerHeight / 2,
      },
    );
    grip.current = null;
    setDragging(false);
    setBurst(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(reset, 2600);
  }
  function down(e: PointerEvent<HTMLButtonElement>) {
    if (e.button !== 0 || burst || !active) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    grip.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
    setDragging(true);
  }
  function move(e: PointerEvent<HTMLButtonElement>) {
    if (!grip.current) return;
    setOffset({
      x: grip.current.ox + e.clientX - grip.current.x,
      y: grip.current.oy + e.clientY - grip.current.y,
    });
    const edge = Math.min(
      e.clientX,
      innerWidth - e.clientX,
      e.clientY,
      innerHeight - e.clientY,
    );
    const proximity = Math.max(0, Math.min(1, (180 - edge) / 152));
    setEdgeScale(
      matchMedia("(prefers-reduced-motion: reduce)").matches
        ? 1
        : 1 + proximity * proximity * 0.85,
    );
    if (
      e.clientX < 28 ||
      e.clientX > innerWidth - 28 ||
      e.clientY < 28 ||
      e.clientY > innerHeight - 28
    )
      scatter({ x: e.clientX, y: e.clientY });
  }
  const letters = (text: string, start: number) =>
    [...text].map((letter, i) => {
      const n = start + i;
      const angle = n * 2.39996;
      return (
        <span
          className={`title-letter${letter === " " ? " word-space" : ""}`}
          key={i}
          style={
            {
              "--scatter-x": `${Math.cos(angle) * (160 + n * 8)}px`,
              "--scatter-y": `${Math.sin(angle) * (130 + n * 7)}px`,
              "--scatter-turn": `${(n % 2 ? 1 : -1) * (45 + n * 12)}deg`,
              "--scatter-delay": `${n * 9}ms`,
            } as CSSProperties
          }
        >
          {letter === " " ? "\u00a0" : letter}
        </span>
      );
    });
  return (
    <div
      className={`title-playground ${burst ? "is-burst" : ""} ${dragging ? "is-dragging" : ""}`}
    >
      <Heading
        aria-label={lines.join(" ")}
        style={{
          transform: `translate3d(${offset.x}px,${offset.y}px,0) scale(${edgeScale})`,
        }}
      >
        <button
          ref={ref}
          className="draggable-title"
          aria-label={label}
          aria-describedby={instructionsId}
          tabIndex={active ? 0 : -1}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={() => {
            grip.current = null;
            setDragging(false);
          }}
          onPointerCancel={reset}
          onLostPointerCapture={() => {
            grip.current = null;
            setDragging(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.preventDefault();
              reset();
            }
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              burst ? reset() : scatter();
            }
            if (e.key.startsWith("Arrow")) {
              e.preventDefault();
              if (burst) return;
              const x =
                offset.x +
                (e.key === "ArrowLeft" ? -24 : e.key === "ArrowRight" ? 24 : 0);
              const y =
                offset.y +
                (e.key === "ArrowUp" ? -24 : e.key === "ArrowDown" ? 24 : 0);
              setOffset({ x, y });
              const r = ref.current!.getBoundingClientRect();
              if (
                r.left < 28 ||
                r.right > innerWidth - 28 ||
                r.top < 28 ||
                r.bottom > innerHeight - 28
              )
                scatter();
            }
          }}
        >
          <span className="title-line">{letters(lines[0], 0)}</span>
          <em className="title-line">
            {letters(lines[1], [...lines[0]].length)}
          </em>
        </button>
      </Heading>
      <span id={instructionsId} className="sr-only">
        可以拖动文字，靠近屏幕边缘时放大，随后柔和散满屏幕。也可用方向键移动，回车体验散开，Esc
        复位。
      </span>
      {(burst || offset.x !== 0 || offset.y !== 0) && (
        <button
          className="title-reset"
          onClick={reset}
          aria-label="复位标题"
          tabIndex={active ? 0 : -1}
        >
          ↺ 复位标题
        </button>
      )}
      <span role="status" className="sr-only">
        {burst ? "标题已散开，可以复位或等待它回到原位。" : ""}
      </span>
      {burst &&
        !matchMedia("(prefers-reduced-motion: reduce)").matches &&
        createPortal(
          <div
            className="title-atmosphere"
            aria-hidden="true"
            style={
              {
                "--origin-x": `${origin.x}px`,
                "--origin-y": `${origin.y}px`,
              } as CSSProperties
            }
          >
            <i className="burst-wash" />
            <i className="burst-orbit" />
            {Array.from({ length: 84 }, (_, i) => {
              const text = lines.join("").replaceAll(" ", "");
              return (
                <span
                  className="burst-fragment"
                  key={i}
                  style={
                    {
                      "--end-x": `${(i % 12) * 8.6 + 2 + Math.sin(i * 3) * 2}vw`,
                      "--end-y": `${Math.floor(i / 12) * 15.5 + 3 + Math.cos(i * 2) * 3}vh`,
                      "--turn": `${(i % 2 ? 1 : -1) * (30 + i * 7)}deg`,
                      "--size": `${22 + (i % 6) * 10}px`,
                      "--delay": `${(i % 9) * 15}ms`,
                    } as CSSProperties
                  }
                >
                  {text[i % text.length]}
                </span>
              );
            })}
          </div>,
          document.body,
        )}
    </div>
  );
}
