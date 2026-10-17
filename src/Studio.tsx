import { useEffect, useRef, useState, type RefObject } from "react";
import { appPath } from "./paths";
const targets = {
  create: { label: "开始创建", path: "/workspace", point: [0.3, 1.8, 0.3] },
  inspiration: {
    label: "浏览案例",
    path: "/inspiration",
    point: [-2.3, 1.6, -1.2],
  },
  projects: { label: "我的项目", path: "/projects", point: [-2.7, 0.7, 1.15] },
  tool: { label: "材质台", path: "", point: [2.95, 1.8, -0.85] },
};
type Key = keyof typeof targets;
export default function Studio({
  navigate,
  scrollProgress,
}: {
  navigate: (path: string) => void;
  scrollProgress?: RefObject<number>;
}) {
  const host = useRef<HTMLDivElement>(null);
  const jump = useRef<(key: Key) => void>(() => {});
  const [state, setState] = useState("正在加载原创工作室…");
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState<Key | null>(null);
  const [tool, setTool] = useState(false);
  useEffect(() => {
    let stopped = false;
    let cleanup = () => {};
    const node = host.current!;
    if (
      innerWidth < 760 ||
      new URLSearchParams(location.search).has("static")
    ) {
      setState("静态工作室 · 轻量模式");
      return;
    }
    let timer = window.setTimeout(() => {
      if (!stopped) setState("场景加载较慢 · 文字入口可直接使用");
    }, 7000);
    (async () => {
      try {
        const THREE = await import("three");
        const { GLTFLoader } =
          await import("three/addons/loaders/GLTFLoader.js");
        const { RoomEnvironment } =
          await import("three/addons/environments/RoomEnvironment.js");
        if (stopped) return;
        const r = new THREE.WebGLRenderer({
          alpha: true,
          antialias: true,
          powerPreference: "low-power",
        });
        r.setPixelRatio(Math.min(devicePixelRatio, 1.6));
        r.setClearColor(0x000000, 0);
        r.shadowMap.enabled = true;
        r.shadowMap.type = THREE.PCFSoftShadowMap;
        r.toneMapping = THREE.ACESFilmicToneMapping;
        r.toneMappingExposure = 0.94;
        node.appendChild(r.domElement);
        cleanup = () => {
          r.dispose();
          r.domElement.remove();
        };
        const scene = new THREE.Scene();
        const pmrem = new THREE.PMREMGenerator(r);
        const env = new RoomEnvironment();
        const envMap = pmrem.fromScene(env, 0.04);
        scene.environment = envMap.texture;
        scene.environmentIntensity = 0.65;
        cleanup = () => {
          envMap.dispose();
          pmrem.dispose();
          r.dispose();
          r.domElement.remove();
        };
        env.dispose();
        const camera = new THREE.OrthographicCamera();
        const base = new THREE.Vector3(9, 9, 13);
        const baseLook = new THREE.Vector3(0, 1.35, -0.1);
        camera.position.copy(base);
        const look = baseLook.clone();
        const destination = base.clone();
        const destLook = baseLook.clone();
        const sun = new THREE.DirectionalLight(0xfff1dc, 2.5);
        sun.position.set(-3, 8, 6);
        sun.castShadow = true;
        sun.shadow.mapSize.set(2048, 2048);
        sun.shadow.camera.left = -7;
        sun.shadow.camera.right = 7;
        sun.shadow.camera.top = 7;
        sun.shadow.camera.bottom = -7;
        sun.shadow.bias = -0.0002;
        sun.shadow.normalBias = 0.03;
        scene.add(sun);
        const fill = new THREE.DirectionalLight(0xdfeaff, 1.4);
        fill.position.set(5, 5, -2);
        scene.add(fill);
        scene.add(new THREE.AmbientLight(0xffffff, 0.55));
        const gltf = await new GLTFLoader().loadAsync(
          appPath("/studio/studio.glb"),
          (e) => {
            if (!stopped && e.total)
              setState(
                `正在加载工作室 ${Math.round((e.loaded / e.total) * 100)}%`,
              );
          },
        );
        if (stopped) {
          r.dispose();
          r.domElement.remove();
          envMap.dispose();
          pmrem.dispose();
          return;
        }
        scene.add(gltf.scene);
        gltf.scene.traverse((o) => {
          if (o instanceof THREE.Mesh) {
            o.castShadow = true;
            o.receiveShadow = true;
          }
        });
        const resize = () => {
          const w = node.clientWidth,
            h = node.clientHeight;
          if (!w || !h) return;
          const ratio = w / h;
          const width = 12.5;
          camera.left = -width / 2;
          camera.right = width / 2;
          camera.top = width / ratio / 2;
          camera.bottom = -width / ratio / 2;
          camera.near = 0.1;
          camera.far = 100;
          camera.updateProjectionMatrix();
          r.setSize(w, h);
        };
        const observer = new ResizeObserver(resize);
        observer.observe(node);
        resize();
        const reduced = matchMedia("(prefers-reduced-motion: reduce)");
        let routeTimer = 0,
          raf = 0,
          visible = true;
        const pointer = new THREE.Vector2();
        const ray = new THREE.Raycaster();
        let hover: Key | null = null;
        const find = (event: PointerEvent) => {
          const rect = node.getBoundingClientRect();
          pointer.set(
            ((event.clientX - rect.left) / rect.width) * 2 - 1,
            (-(event.clientY - rect.top) / rect.height) * 2 + 1,
          );
          ray.setFromCamera(pointer, camera);
          const hits = ray.intersectObject(gltf.scene, true);
          let item = hits[0]?.object;
          while (item) {
            if (item.name in targets) return item.name as Key;
            item = item.parent!;
          }
          return null;
        };
        const move = (e: PointerEvent) => {
          hover = find(e);
          r.domElement.style.cursor = hover ? "pointer" : "default";
          if (!routeTimer) setActive(hover);
        };
        const choose = (key: Key) => {
          window.clearTimeout(routeTimer);
          setActive(key);
          if (key === "tool") {
            routeTimer = 0;
            destination.copy(base);
            destLook.copy(baseLook);
            setTool((v) => !v);
            return;
          }
          const p = new THREE.Vector3(...targets[key].point);
          destLook.copy(p);
          destination
            .copy(p)
            .add(base.clone().sub(baseLook).multiplyScalar(0.73));
          routeTimer = window.setTimeout(
            () => navigate(targets[key].path),
            reduced.matches ? 120 : 850,
          );
        };
        jump.current = choose;
        const click = (e: PointerEvent) => {
          const key = find(e);
          if (key) choose(key);
        };
        const key = (e: KeyboardEvent) => {
          if (e.key === "Escape") {
            clearTimeout(routeTimer);
            routeTimer = 0;
            destination.copy(base);
            destLook.copy(baseLook);
            setActive(null);
          }
        };
        r.domElement.addEventListener("pointermove", move);
        r.domElement.addEventListener("pointerup", click);
        window.addEventListener("keydown", key);
        const io = new IntersectionObserver((es) => {
          visible = es[0].isIntersecting;
        });
        io.observe(node);
        let last = performance.now();
        const frame = (time: number) => {
          const dt = Math.min((time - last) / 1000, 0.1);
          last = time;
          if (visible) {
            if (!routeTimer && scrollProgress) {
              const orbit = reduced.matches
                ? 0
                : (scrollProgress.current - 0.5) * 0.48;
              destination.set(
                base.x * Math.cos(orbit) + base.z * Math.sin(orbit),
                base.y + orbit * 3,
                base.z * Math.cos(orbit) - base.x * Math.sin(orbit),
              );
              destLook.copy(baseLook);
              node.dataset.cameraOrbit = orbit.toFixed(4);
            }
            const alpha = reduced.matches ? 1 : 1 - Math.exp(-dt * 7);
            camera.position.lerp(destination, alpha);
            look.lerp(destLook, alpha);
            camera.lookAt(look);
            r.render(scene, camera);
          }
          raf = requestAnimationFrame(frame);
        };
        raf = requestAnimationFrame(frame);
        const lost = (event: Event) => {
          event.preventDefault();
          cancelAnimationFrame(raf);
          setReady(false);
          setState("3D 显示已中断 · 静态入口继续可用");
        };
        r.domElement.addEventListener("webglcontextlost", lost);
        clearTimeout(timer);
        setReady(true);
        setState("原创 3D 工作室 · 点击物件探索");
        cleanup = () => {
          clearTimeout(routeTimer);
          cancelAnimationFrame(raf);
          observer.disconnect();
          io.disconnect();
          window.removeEventListener("keydown", key);
          r.domElement.removeEventListener("webglcontextlost", lost);
          gltf.scene.traverse((o) => {
            if (o instanceof THREE.Mesh) {
              o.geometry.dispose();
              const mats = Array.isArray(o.material)
                ? o.material
                : [o.material];
              mats.forEach((m) => m.dispose());
            }
          });
          envMap.dispose();
          pmrem.dispose();
          r.dispose();
          r.domElement.remove();
        };
      } catch {
        cleanup();
        if (!stopped) {
          setReady(false);
          clearTimeout(timer);
          setState("静态工作室 · 全部入口可用");
        }
      }
    })();
    return () => {
      stopped = true;
      clearTimeout(timer);
      cleanup();
    };
  }, [navigate, scrollProgress]);
  function choose(key: Key) {
    if (ready) jump.current(key);
    else if (key === "tool") setTool((v) => !v);
    else navigate(targets[key].path);
  }
  return (
    <div className="studio-visual">
      <img
        src={appPath("/studio/studio.png")}
        alt="原创数字设计工作室：设计工作台、参考样本架、项目档案和材质转轮"
        className={`studio-still ${ready ? "is-hidden" : ""}`}
      />
      <div
        ref={host}
        className={`studio-canvas ${ready ? "is-ready" : ""}`}
        aria-hidden="true"
      />
      <div className="studio-hotspots">
        {(["inspiration", "projects", "create", "tool"] as Key[]).map((key) => (
          <button
            key={key}
            className={`hotspot hotspot-${key} ${active === key ? "is-active" : ""}`}
            onClick={() => choose(key)}
            aria-label={targets[key].label}
          >
            <span className="hotspot-dot" />
            <span className="hotspot-label">
              {targets[key].label} <span>↗</span>
            </span>
          </button>
        ))}
      </div>
      <div className="studio-status">
        <span className="status-dot" />
        {state}
      </div>
      {tool && (
        <div className="material-note">
          <button
            className="plain"
            onClick={() => setTool(false)}
            aria-label="关闭材质说明"
          >
            ×
          </button>
          <b>从材质，建立风格。</b>
          <p>
            拉丝铝、陶瓷、棉纸与信号黄。工作室和编辑界面，共用同一套设计语言。
          </p>
          <div className="swatches">
            <i style={{ background: "#d1d4d3" }} />
            <i style={{ background: "#eeece4" }} />
            <i style={{ background: "#252723" }} />
            <i style={{ background: "#f1d745" }} />
          </div>
        </div>
      )}
    </div>
  );
}
