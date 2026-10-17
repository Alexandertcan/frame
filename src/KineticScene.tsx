import type { MeshBasicMaterial, CanvasTexture, Mesh } from "three";
import { useEffect, useRef, useState, type MutableRefObject } from "react";
export default function KineticScene({
  progress,
}: {
  progress: MutableRefObject<number>;
}) {
  const host = useRef<HTMLDivElement>(null);
  const [state, setState] = useState("正在构建空间…");
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let stopped = false,
      dispose = () => {};
    const node = host.current!;
    (async () => {
      try {
        const T = await import("three");
        if (stopped) return;
        const renderer = new T.WebGLRenderer({
          alpha: true,
          antialias: true,
          powerPreference: "low-power",
        });
        renderer.setPixelRatio(
          Math.min(devicePixelRatio, innerWidth < 760 ? 1.25 : 1.7),
        );
        renderer.setClearColor(0, 0);
        node.appendChild(renderer.domElement);
        dispose = () => {
          renderer.dispose();
          renderer.domElement.remove();
        };
        const scene = new T.Scene(),
          camera = new T.PerspectiveCamera(42, 1, 0.1, 80);
        camera.position.z = 10;
        let mobile = innerWidth < 760;
        const count = mobile ? 17000 : 44000;
        const a = new Float32Array(count * 3),
          b = new Float32Array(count * 3),
          c = new Float32Array(count * 3),
          sizes = new Float32Array(count),
          seeds = new Float32Array(count);
        let seed = 32017;
        const random = () => {
          seed = (seed * 16807) % 2147483647;
          return (seed - 1) / 2147483646;
        };
        for (let i = 0; i < count; i++) {
          const u = random(),
            v = random(),
            w = random(),
            theta = u * Math.PI * 2,
            phi = Math.acos(2 * v - 1);
          const radius =
            (w > 0.2 ? 2.25 : 2.25 * random()) *
            (1 + 0.11 * Math.sin(theta * 7 + phi * 5));
          a.set(
            [
              radius * Math.sin(phi) * Math.cos(theta),
              radius * Math.cos(phi) * 1.1,
              radius * Math.sin(phi) * Math.sin(theta),
            ],
            i * 3,
          );
          const px = (u - 0.5) * 8.5,
            py = (v - 0.5) * 5.2;
          b.set(
            [px, py, Math.sin(px * 1.05) * 1.1 + Math.cos(py * 0.75) * 0.3],
            i * 3,
          );
          const part = i % 3,
            xx = (u - 0.5) * 2.2,
            yy = (v - 0.5) * 3.4;
          const angle = (part - 1) * 0.42;
          c.set(
            [
              xx * Math.cos(angle) + (part - 1) * 2.65,
              yy + (part === 1 ? 0.25 : -0.2),
              -xx * Math.sin(angle) + (part === 1 ? 0.45 : -0.6),
            ],
            i * 3,
          );
          sizes[i] = 0.7 + random() * 1.4;
          seeds[i] = random();
        }
        const geometry = new T.BufferGeometry();
        geometry.setAttribute("position", new T.BufferAttribute(a, 3));
        geometry.setAttribute("folded", new T.BufferAttribute(b, 3));
        geometry.setAttribute("pages", new T.BufferAttribute(c, 3));
        geometry.setAttribute("aSize", new T.BufferAttribute(sizes, 1));
        geometry.setAttribute("aSeed", new T.BufferAttribute(seeds, 1));
        const material = new T.ShaderMaterial({
          transparent: true,
          depthWrite: false,
          uniforms: {
            uProgress: { value: 0 },
            uTime: { value: 0 },
            uMouse: { value: new T.Vector2(5, 5) },
            uRatio: { value: Math.min(devicePixelRatio, 1.7) },
            uReduce: { value: 0 },
          },
          vertexShader: `attribute vec3 folded;attribute vec3 pages;attribute float aSize;attribute float aSeed;uniform float uProgress,uTime,uRatio,uReduce;uniform vec2 uMouse;varying float vAlpha;varying float vSeed;void main(){float p=smoothstep(0.,.58,uProgress);float q=smoothstep(.52,1.,uProgress);vec3 pos=mix(position,folded,p);pos=mix(pos,pages,q);float drift=(1.-uReduce)*.035;pos+=vec3(sin(uTime*.3+aSeed*40.),cos(uTime*.25+aSeed*20.),sin(uTime*.4+aSeed*30.))*drift;vec2 delta=pos.xy-uMouse;float dist=length(delta);pos.xy+=normalize(delta+vec2(.001))*.12*exp(-dist*dist*.8)*(1.-uReduce);vec4 mv=modelViewMatrix*vec4(pos,1.);gl_Position=projectionMatrix*mv;gl_PointSize=clamp(aSize*uRatio*8./-mv.z,.65,4.);vAlpha=.3+.65*aSeed;vSeed=aSeed;}`,
          fragmentShader: `uniform float uProgress;varying float vAlpha,vSeed;void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;vec3 mint=vec3(.72,.9,.78);vec3 pearl=vec3(.9,.95,.86);vec3 lilac=vec3(.78,.69,.94);vec3 col=mix(mint,pearl,vSeed*.65);col=mix(col,lilac,smoothstep(.4,1.,uProgress)*.75);gl_FragColor=vec4(col,(1.-smoothstep(.18,.5,d))*vAlpha*.85);}`,
        });
        const group = new T.Group(),
          points = new T.Points(geometry, material);
        group.add(points);
        scene.add(group);
        const ringGeometry = new T.TorusGeometry(2.85, 0.012, 8, 250),
          ringMaterial = new T.MeshBasicMaterial({
            color: "#b1dfcb",
            transparent: true,
            opacity: 0.19,
          });
        const ring = new T.Mesh(ringGeometry, ringMaterial);
        ring.rotation.set(0.7, 0.45, 0.15);
        group.add(ring);
        const pageGeometry = new T.PlaneGeometry(2.2, 3.4, 1, 1),
          pageMaterials: MeshBasicMaterial[] = [],
          textures: CanvasTexture[] = [];
        const sheets: Mesh[] = [];
        ["首页", "关于", "产品"].forEach((title, i) => {
          const canvas = document.createElement("canvas");
          canvas.width = 550;
          canvas.height = 850;
          const ctx = canvas.getContext("2d")!;
          ctx.fillStyle = i === 1 ? "#d9e7dc" : i === 0 ? "#e8e9df" : "#e2d9ee";
          ctx.fillRect(0, 0, 550, 850);
          ctx.fillStyle = "#17231e";
          ctx.font = "bold 21px Arial";
          ctx.fillText("FRAME / " + title, 35, 55);
          ctx.fillRect(35, 82, 480, 1);
          ctx.font = "60px Georgia";
          ctx.fillText(
            i === 0 ? "Make room." : i === 1 ? "Made with" : "Good things.",
            35,
            180,
          );
          if (i === 1) ctx.fillText("intention.", 35, 250);
          ctx.fillStyle = i === 1 ? "#789789" : "#67736b";
          ctx.beginPath();
          ctx.ellipse(275, 425, 140, 175, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#e5e9df";
          ctx.beginPath();
          ctx.ellipse(275, 400, 84, 126, 0.35, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#17231e";
          ctx.font = "20px Arial";
          ctx.fillText("Thoughtful by design.", 35, 710);
          ctx.fillRect(35, 750, 280, 2);
          const texture = new T.CanvasTexture(canvas);
          textures.push(texture);
          const m = new T.MeshBasicMaterial({
            map: texture,
            transparent: true,
            opacity: 0,
            side: T.DoubleSide,
          });
          pageMaterials.push(m);
          const sheet = new T.Mesh(pageGeometry, m);
          sheet.position.set(
            (i - 1) * 2.65,
            i === 1 ? 0.25 : -0.2,
            i === 1 ? 0.45 : -0.6,
          );
          sheet.rotation.y = (i - 1) * 0.42;
          sheets.push(sheet);
          group.add(sheet);
        });
        const reduced = matchMedia("(prefers-reduced-motion: reduce)");
        let visible = true,
          raf = 0,
          last = performance.now(),
          time = 0,
          p = progress.current;
        const io = new IntersectionObserver(
          (es) => (visible = es[0].isIntersecting),
        );
        io.observe(node);
        const resize = () => {
          mobile = innerWidth < 760;
          const w = node.clientWidth,
            h = node.clientHeight;
          if (!w || !h) return;
          renderer.setSize(w, h);
          camera.aspect = w / h;
          camera.position.z = w < 760 ? 12.5 : 10;
          camera.updateProjectionMatrix();
        };
        const observer = new ResizeObserver(resize);
        observer.observe(node);
        resize();
        const pointer = (e: PointerEvent) => {
          const r = node.getBoundingClientRect();
          material.uniforms.uMouse.value.set(
            ((e.clientX - r.left) / r.width - 0.5) * 11,
            -((e.clientY - r.top) / r.height - 0.5) * 8,
          );
        };
        const leave = () => material.uniforms.uMouse.value.set(20, 20);
        window.addEventListener("pointermove", pointer, { passive: true });
        window.addEventListener("pointerout", leave);
        let lastRendered = -1;
        const frame = (now: number) => {
          const dt = Math.min((now - last) / 1000, 0.1);
          last = now;
          if (visible) {
            p +=
              (progress.current - p) *
              (reduced.matches ? 1 : 1 - Math.exp(-dt * 9));
            time += dt;
            material.uniforms.uProgress.value = p;
            material.uniforms.uTime.value = reduced.matches ? 0 : time;
            material.uniforms.uReduce.value = reduced.matches ? 1 : 0;
            group.rotation.y =
              (1 - p) * 0.12 +
              (reduced.matches ? 0 : Math.sin(time * 0.1) * 0.035);
            const unfold = T.MathUtils.smoothstep(p, 0.65, 1);
            group.scale.setScalar(
              mobile ? 0.64 - unfold * 0.09 : 1 - unfold * 0.28,
            );
            group.position.x = mobile
              ? 0
              : 1.2 * (1 - Math.min(p * 2, 1)) + 2.45 * unfold;
            group.position.y = mobile
              ? -2 - T.MathUtils.smoothstep(p, 0.65, 1) * 0.5
              : 0.2;
            ring.rotation.z = 0.15 + p * 1.8;
            ringMaterial.opacity = 0.19 * (1 - p);
            pageMaterials.forEach((m, i) => {
              m.opacity = Math.max(0, (p - 0.65) / 0.35) * 0.92;
              sheets[i].rotation.y = (i - 1) * (0.42 + (1 - p) * 1.8);
            });
            if (!reduced.matches || p !== lastRendered) {
              renderer.render(scene, camera);
              lastRendered = p;
            }
          }
          raf = requestAnimationFrame(frame);
        };
        raf = requestAnimationFrame(frame);
        const lost = (e: Event) => {
          e.preventDefault();
          cancelAnimationFrame(raf);
          setReady(false);
          setState("轻量场景 · 所有功能可用");
        };
        renderer.domElement.addEventListener("webglcontextlost", lost);
        dispose = () => {
          cancelAnimationFrame(raf);
          observer.disconnect();
          io.disconnect();
          window.removeEventListener("pointermove", pointer);
          window.removeEventListener("pointerout", leave);
          geometry.dispose();
          material.dispose();
          ringGeometry.dispose();
          ringMaterial.dispose();
          pageGeometry.dispose();
          pageMaterials.forEach((m) => m.dispose());
          textures.forEach((t) => t.dispose());
          renderer.dispose();
          renderer.domElement.remove();
        };
        if (stopped) {
          dispose();
          return;
        }
        setReady(true);
        setState("实时 3D · 滚动改变形态");
      } catch {
        if (!stopped) {
          dispose();
          setState("轻量场景 · 所有功能可用");
        }
      }
    })();
    return () => {
      stopped = true;
      dispose();
    };
  }, [progress]);
  return (
    <div className={`kinetic-scene ${ready ? "ready" : ""}`}>
      <div className="kinetic-fallback" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
        <span>F</span>
      </div>
      <div ref={host} className="kinetic-canvas" aria-hidden="true" />
      <span className="kinetic-status">
        <i />
        {state}
      </span>
    </div>
  );
}
