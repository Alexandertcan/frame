import {
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Icon from "./Icons";
import DraggableTitle from "./DraggableTitle";
import { useHomeScroll } from "./useHomeScroll";
import ComputerShowcase from "./ComputerShowcase";
const KineticScene = lazy(() => import("./KineticScene"));
const Studio = lazy(() => import("./Studio"));
export default function Experience({
  navigate,
  openDemo,
  interfacePreview,
}: {
  navigate: (path: string) => void;
  openDemo: () => void;
  interfacePreview: ReactNode;
}) {
  const page = useRef<HTMLElement>(null);
  const studioProgress = useHomeScroll(page);
  const scroll = useRef<HTMLElement>(null),
    progress = useRef(0),
    [phase, setPhase] = useState(0);
  useEffect(() => {
    const element = scroll.current!;
    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = element.getBoundingClientRect();
      const p = Math.max(
        0,
        Math.min(1, -rect.top / Math.max(1, rect.height - innerHeight)),
      );
      progress.current = p;
      element.style.setProperty("--progress", String(p));
      element.style.setProperty("--intro", String(1 - Math.min(1, p / 0.27)));
      element.style.setProperty(
        "--middle",
        String(Math.max(0, 1 - Math.abs(p - 0.47) / 0.22)),
      );
      element.style.setProperty(
        "--ending",
        String(Math.max(0, (p - 0.72) / 0.28)),
      );
      element.style.setProperty(
        "--wash",
        String(p > 0.65 ? (p - 0.65) / 0.35 : 0),
      );
      setPhase(p < 0.28 ? 0 : p < 0.7 ? 1 : 2);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);
  function chapter(index: number) {
    const rect = scroll.current!.getBoundingClientRect();
    const reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;
    window.scrollTo({
      top:
        window.scrollY +
        rect.top +
        (rect.height - innerHeight) * [0, 0.47, 0.98][index],
      behavior: reduce ? "instant" : "smooth",
    });
  }
  return (
    <main className="experience-page" ref={page}>
      <section
        ref={scroll}
        className="experience-scroll"
        data-phase={phase}
        aria-label="从想法到网站的动态设计体验"
      >
        <div className="experience-stage">
          <Suspense
            fallback={<div className="scene-loading">正在构建空间…</div>}
          >
            <KineticScene progress={progress} />
          </Suspense>
          <div className="experience-grain" aria-hidden="true" />
          <div className="experience-topline">
            <span>构页 / 数字设计工作室</span>
            <span className="exp-demo">原创交互体验</span>
          </div>
          <div
            className="experience-chapter chapter-intro"
            aria-hidden={phase !== 0}
          >
            <span className="exp-eyebrow">给想法，一个新的维度。</span>
            <DraggableTitle active={phase === 0} />
            <p>
              输入内容，生成有自己风格的网站。
              <br />
              从第一个想法，到每一页的表达。
            </p>
            <div className="experience-actions">
              <a href="/workspace" className="button glass-primary">
                开始创建
                <Icon name="arrow" />
              </a>
              <a href="/inspiration" className="button glass-secondary">
                浏览案例
                <Icon name="grid" />
              </a>
            </div>
          </div>
          <div
            className="experience-chapter chapter-fold"
            aria-hidden={phase !== 1}
          >
            <span className="exp-eyebrow">内容，不必只有一种形状。</span>
            <DraggableTitle
              as="h2"
              lines={["Change your", "perspective."]}
              label="拖动方向标题"
              active={phase === 1}
            />
            <p>
              让布局展开，让风格交融。
              <br />
              选择适合自己的表达。
            </p>
          </div>
          <div
            className="experience-chapter chapter-pages"
            aria-hidden={phase !== 2}
          >
            <span className="exp-eyebrow">每一页，都属于同一个你。</span>
            <DraggableTitle
              as="h2"
              lines={["Many pages.", "One identity."]}
              label="拖动网站标题"
              active={phase === 2}
            />
            <p>
              首页、关于、产品。
              <br />
              共用设计规则，保留各自的节奏。
            </p>
            <button
              className="button glass-primary"
              onClick={openDemo}
              tabIndex={phase === 2 ? 0 : -1}
            >
              进入工作台
              <Icon name="arrow" />
            </button>
          </div>
          <div className="experience-bottom">
            <span className="static-scroll-hint">
              Scroll to shape
              <br />
              <b>向下滚动，改变形态</b>
            </span>
            <nav aria-label="体验章节" className="chapter-dock glass-surface">
              {["想法", "方向", "网站"].map((s, i) => (
                <button
                  key={s}
                  className={phase === i ? "active" : ""}
                  onClick={() => chapter(i)}
                  aria-current={phase === i ? "step" : undefined}
                >
                  <i />
                  {s}
                </button>
              ))}
            </nav>
            <span className="exp-scroll-line" aria-hidden="true">
              <i />
            </span>
          </div>
        </div>
      </section>
      <section className="experience-intro" data-home-motion="ink">
        <span>一个输入，多个可能。</span>
        <p>
          <span className="ink-line">先有内容。</span>
          <br />
          <em className="ink-line">然后，让它有自己的样子。</em>
        </p>
        <a href="/product" className="text-button">
          看看构页如何工作
          <Icon name="arrow" />
        </a>
      </section>
      <section
        className="experience-workbench"
        id="inside"
        data-home-motion="unfold"
      >
        <div className="experience-section-head">
          <div>
            <span>真实界面 / 可交互样本</span>
            <h2>
              效果要看得见。
              <br />
              每一页，也要改得动。
            </h2>
          </div>
          <button className="text-button" onClick={openDemo}>
            打开工作台
            <Icon name="arrow" />
          </button>
        </div>
        <div className="folding-interface">{interfacePreview}</div>
        <div className="experience-smallprint">
          <span>SUPER INTELLIGENCE / 太空旅行概念样本</span>
          <span>可编辑内容 · 共用样式 · 完整静态导出</span>
        </div>
      </section>
      <section className="experience-studio" data-home-motion="studio">
        <div>
          <span className="small-label">从展示，走进工作。</span>
          <h2>
            你的数字
            <br />
            设计工作室。
          </h2>
          <p>
            参考、页面、素材与想法，
            <br />
            在同一个空间里各就其位。
          </p>
          <a className="button secondary" href="/workspace">
            开始一个项目
            <Icon name="arrow" />
          </a>
        </div>
        <div className="experience-room">
          <Suspense
            fallback={<img src="/studio/studio.png" alt="工作室静态场景" />}
          >
            <Studio navigate={navigate} scrollProgress={studioProgress} />
          </Suspense>
        </div>
      </section>
      <section className="experience-case" data-home-motion="showcase">
        <div className="experience-section-head">
          <div>
            <span>FRAME 出品 / 作品实机样本</span>
            <h2>
              从一个想法，
              <br />
              到一个完整世界。
            </h2>
          </div>
          <a href="/inspiration" className="text-button">
            进入案例与网站集
            <Icon name="arrow" />
          </a>
        </div>
        <div className="featured-computer-case">
          <ComputerShowcase />
          <div className="computer-case-copy">
            <span className="small-label">SUPER INTELLIGENCE</span>
            <h3>
              六个页面。
              <br />
              <em>同一个宇宙。</em>
            </h3>
            <p>
              太空旅行、航天器、新闻与价格。
              <br />
              让品牌、内容和实时 3D，在每一页连起来。
            </p>
            <div className="computer-case-actions">
              <button className="button primary" onClick={openDemo}>
                用这个样本开始
                <Icon name="arrow" />
              </button>
              <a href="/inspiration/super-intelligence" className="text-button">
                查看完整作品 <Icon name="external" size={14} />
              </a>
            </div>
            <small>
              预置概念作品 · 可编辑、保存并导出
              <br />
              虚构品牌样本，可编辑并独立导出。
            </small>
          </div>
        </div>
      </section>
      <section className="experience-cta" data-home-motion="aperture">
        <div className="cta-aperture" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
        <span>下一页，交给你。</span>
        <DraggableTitle
          as="h2"
          lines={["What's your", "next idea?"]}
          label="拖动灵感标题"
        />
        <a href="/workspace" className="button glass-primary">
          开始创建你的网站
          <Icon name="arrow" />
        </a>
        <a className="text-button" href="/pricing">
          找到适合的方案
          <Icon name="arrow" />
        </a>
      </section>
    </main>
  );
}
