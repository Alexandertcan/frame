import { useEffect, useRef, useState, type PointerEvent } from "react";
import { createPortal } from "react-dom";
import { createSoundscape, soundPresets, type SoundPreset } from "./soundscape";

function preferences() {
  try {
    const saved = JSON.parse(localStorage.getItem("frame-sound-v1") || "null");
    return {
      preset: (soundPresets.some((p) => p.id === saved?.preset)
        ? saved.preset
        : "coast") as SoundPreset,
      volume:
        typeof saved?.volume === "number" && Number.isFinite(saved.volume)
          ? Math.max(0, Math.min(100, saved.volume))
          : 26,
    };
  } catch {
    return { preset: "coast" as SoundPreset, volume: 26 };
  }
}

export default function SoundControl() {
  const [settings, setSettings] = useState(preferences);
  const latest = useRef(settings);
  latest.current = settings;
  const audio = useRef<ReturnType<typeof createSoundscape> | null>(null);
  const wanted = useRef(false),
    operation = useRef(0);
  const [playing, setPlaying] = useState(false),
    [error, setError] = useState("");
  const [open, setOpen] = useState(false),
    [holding, setHolding] = useState(false);
  const suspendTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const holdTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const suppressClick = useRef(false),
    origin = useRef<{ x: number; y: number } | null>(null);
  const opener = useRef<HTMLElement | null>(null),
    panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem("frame-sound-v1", JSON.stringify(settings));
    } catch {
      /* Sound remains usable without storage. */
    }
    audio.current?.preset(settings.preset);
    if (wanted.current && !document.hidden)
      audio.current?.volume(settings.volume / 100);
  }, [settings]);

  useEffect(() => {
    const visibility = () => {
      const engine = audio.current;
      if (!engine) return;
      clearTimeout(suspendTimer.current);
      const request = ++operation.current;
      if (document.hidden) {
        engine.volume(0);
        suspendTimer.current = setTimeout(() => {
          void engine.context.suspend().catch(() => {});
        }, 350);
      } else if (wanted.current) {
        void engine.context
          .resume()
          .then(() => {
            if (operation.current === request && wanted.current)
              engine.volume(latest.current.volume / 100);
          })
          .catch(() => {
            wanted.current = false;
            setPlaying(false);
            setError("点击声音按钮重新开启。");
          });
      }
    };
    document.addEventListener("visibilitychange", visibility);
    return () => {
      ++operation.current;
      document.removeEventListener("visibilitychange", visibility);
      clearTimeout(suspendTimer.current);
      clearTimeout(holdTimer.current);
      audio.current?.close();
      audio.current = null;
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.querySelector<HTMLInputElement>("input:checked")?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        setOpen(false);
      }
      if (event.key === "Tab") {
        const items = [
          ...panel.current!.querySelectorAll<HTMLElement>(
            "button:not(:disabled),input,a[href]",
          ),
        ];
        const first = items[0],
          last = items.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", keydown, true);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", keydown, true);
      opener.current?.focus();
    };
  }, [open]);

  async function toggle() {
    clearTimeout(suspendTimer.current);
    const enabled = !wanted.current,
      request = ++operation.current;
    wanted.current = enabled;
    setPlaying(enabled);
    setError("");
    if (!enabled) {
      const engine = audio.current;
      engine?.volume(0);
      if (engine)
        suspendTimer.current = setTimeout(() => {
          void engine.context.suspend().catch(() => {});
        }, 350);
      return;
    }
    try {
      audio.current ||= createSoundscape(latest.current.preset);
      await audio.current.context.resume();
      if (request === operation.current && wanted.current && !document.hidden)
        audio.current.volume(latest.current.volume / 100);
    } catch {
      if (request === operation.current) {
        wanted.current = false;
        setPlaying(false);
        setError("声音暂不可用，页面仍可正常使用。");
      }
    }
  }
  function cancelHold() {
    clearTimeout(holdTimer.current);
    setHolding(false);
    origin.current = null;
  }
  function down(event: PointerEvent<HTMLButtonElement>) {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    suppressClick.current = false;
    origin.current = { x: event.clientX, y: event.clientY };
    opener.current = event.currentTarget;
    setHolding(true);
    holdTimer.current = setTimeout(() => {
      suppressClick.current = true;
      cancelHold();
      setOpen(true);
    }, 700);
  }
  const active = soundPresets.find((p) => p.id === settings.preset)!;
  return (
    <div className="sound-control">
      <button
        className={`sound-toggle ${playing ? "playing" : ""} ${holding ? "is-holding" : ""}`}
        aria-label={playing ? "静音背景声音" : "开启背景声音"}
        aria-pressed={playing}
        aria-describedby="sound-help"
        title="点击开关声音 · 长按调节"
        onPointerDown={down}
        onPointerMove={(event) => {
          if (
            origin.current &&
            Math.hypot(
              event.clientX - origin.current.x,
              event.clientY - origin.current.y,
            ) > 14
          ) {
            suppressClick.current = true;
            cancelHold();
          }
        }}
        onPointerUp={cancelHold}
        onPointerCancel={() => {
          suppressClick.current = true;
          cancelHold();
        }}
        onTouchEnd={(event) => {
          // A long touch can retarget its compatibility click to the new
          // backdrop. Suppress that click at the original touch endpoint.
          if (suppressClick.current) {
            event.preventDefault();
            suppressClick.current = false;
          }
        }}
        onLostPointerCapture={cancelHold}
        onContextMenu={(event) => event.preventDefault()}
        onClick={() => {
          if (suppressClick.current) {
            suppressClick.current = false;
            return;
          }
          void toggle();
        }}
      >
        <svg className="sound-hold-ring" viewBox="0 0 48 48" aria-hidden="true">
          <circle cx="24" cy="24" r="21" pathLength="100" />
        </svg>
        <span className="sound-bars" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <i key={i} />
          ))}
        </span>
      </button>
      <button
        className="sound-settings-trigger"
        aria-label="声音设置"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={(event) => {
          opener.current = event.currentTarget;
          setOpen(true);
        }}
        title="声音设置"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="m3 4.5 3 3 3-3"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <span id="sound-help" className="sr-only">
        点击开关声音，长按 0.7
        秒或使用旁边的声音设置按钮选择声音和音量。默认静音。
      </span>
      {error && (
        <span role="status" className="sound-error">
          {error}
        </span>
      )}
      {open &&
        createPortal(
          <div
            className="sound-backdrop"
            onClick={(event) => {
              if (event.target === event.currentTarget) setOpen(false);
            }}
          >
            <div
              ref={panel}
              className="sound-panel liquid-glass"
              role="dialog"
              aria-modal="true"
              aria-labelledby="sound-heading"
            >
              <div className="sound-panel-heading">
                <div>
                  <span className="sound-eyebrow">留一点空间给灵感</span>
                  <h2 id="sound-heading">
                    声音空间<span aria-hidden="true">.</span>
                  </h2>
                </div>
                <button
                  className="sound-close"
                  aria-label="关闭声音设置"
                  onClick={() => setOpen(false)}
                >
                  ×
                </button>
              </div>
              <fieldset className="sound-presets">
                <legend className="sr-only">声音类型</legend>
                {soundPresets.map((preset) => (
                  <label
                    className={`sound-preset ${settings.preset === preset.id ? "selected" : ""}`}
                    key={preset.id}
                  >
                    <input
                      type="radio"
                      name="sound-preset"
                      aria-label={preset.name}
                      checked={settings.preset === preset.id}
                      onChange={() =>
                        setSettings((s) => ({ ...s, preset: preset.id }))
                      }
                    />
                    <span className="sound-preset-mark" aria-hidden="true">
                      {preset.mark}
                    </span>
                    <span>
                      <b>{preset.name}</b>
                      <small>{preset.detail}</small>
                    </span>
                    <span className="sound-selected" aria-hidden="true">
                      {settings.preset === preset.id ? "✓" : ""}
                    </span>
                  </label>
                ))}
              </fieldset>
              <div className="sound-volume">
                <label htmlFor="sound-volume">
                  音量{" "}
                  <output htmlFor="sound-volume">{settings.volume}%</output>
                </label>
                <input
                  id="sound-volume"
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  aria-label="音量"
                  value={settings.volume}
                  style={{ backgroundSize: `${settings.volume}% 100%` }}
                  onChange={(event) =>
                    setSettings((s) => ({
                      ...s,
                      volume: Number(event.target.value),
                    }))
                  }
                />
                <span>轻一点，听得更久。</span>
              </div>
              <div className="sound-panel-bottom">
                <div>
                  <span className={`sound-live-dot ${playing ? "on" : ""}`} />
                  <span className="sound-current">{active.name}</span>
                  <small>{playing ? "正在播放" : "已暂停"}</small>
                </div>
                <button className="sound-play" onClick={() => void toggle()}>
                  {playing ? "暂停声音" : "开始聆听"}
                  <span aria-hidden="true">{playing ? "Ⅱ" : "▷"}</span>
                </button>
              </div>
              <p className="sound-origin">
                原创合成音景 · 非商业曲目录音 · 切换时柔和过渡
              </p>
              {error && (
                <p className="sound-panel-error" role="alert">
                  {error}
                </p>
              )}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
