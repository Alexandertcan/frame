import { useState, useEffect, useCallback } from "react";
import Icon from "./Icons";
import Workspace, { Preview } from "./Workspace";
import { references, type Reference } from "./data";
import {
  type Project,
  type Site,
  directions,
  packProjects,
  unpackProjects,
} from "./core";
import Experience from "./Experience";
import SpaceSampleCard from "./SpaceSampleCard";
import { spaceSite, spaceProject, upgradeSpaceDemo } from "./space-demo";
import { Login, Pricing, CreatorAbout } from "./AccountPages";
import { WebsiteCollections, ByotoneStudy } from "./collections";
import {
  SoundControl,
  InteractionAtmosphere,
  Sponsorship,
  GlassRefraction,
} from "./Atmosphere";
function readLocal<T>(key: string, initial: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : initial;
  } catch {
    return initial;
  }
}
const links = [
  ["/product", "产品"],
  ["/inspiration", "案例库"],
  ["/pricing", "价格"],
  ["/about", "关于"],
  ["/sponsorship", "支持"],
  ["/projects", "我的项目"],
];
export default function App() {
  const [route, setRoute] = useState(location.pathname);
  const [projects, setProjects] = useState<Project[]>(() =>
    (() => {
      try {
        const stored = unpackProjects(
          localStorage.getItem("frame-projects-v1"),
        );
        const upgraded = upgradeSpaceDemo(stored);
        if (upgraded.some((p, i) => p !== stored[i])) {
          try {
            localStorage.setItem("frame-projects-v1", packProjects(upgraded));
          } catch {
            /* Keep the usable in-memory project when storage is full. */
          }
        }
        return upgraded;
      } catch {
        return [];
      }
    })(),
  );
  const [favorites, setFavorites] = useState<string[]>(() =>
    readLocal("frame-favorites", []),
  );
  const [pendingRefs, setRefs] = useState<string[]>(() =>
    readLocal("frame-references", []),
  );
  const [toast, setToast] = useState("");
  const [menu, setMenu] = useState(false);
  useEffect(() => {
    if (!menu) return;
    const dismiss = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenu(false);
        document.querySelector<HTMLButtonElement>(".mobile-menu")?.focus();
      }
    };
    const outside = (event: PointerEvent) => {
      if (!(event.target as Element).closest(".site-header")) setMenu(false);
    };
    addEventListener("keydown", dismiss);
    addEventListener("pointerdown", outside);
    return () => {
      removeEventListener("keydown", dismiss);
      removeEventListener("pointerdown", outside);
    };
  }, [menu]);
  const [detail, setDetail] = useState<Reference | null>(null);
  const [manage, setManage] = useState<{
    type: "rename" | "delete";
    id: string;
  } | null>(null);
  const [rename, setRename] = useState("");
  const [storageError, setStorageError] = useState("");
  const [visit, setVisit] = useState(0);
  const [targetProject, setTargetProject] = useState("new");
  const notify = useCallback((text: string) => setToast(text), []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 4500);
    return () => clearTimeout(t);
  }, [toast]);
  const navigate = useCallback((path: string) => {
    history.pushState(null, "", path);
    setRoute(location.pathname);
    setVisit((x) => x + 1);
    setMenu(false);
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);
  useEffect(() => {
    const pop = () => {
      setRoute(location.pathname);
      setVisit((x) => x + 1);
      setMenu(false);
    };
    window.addEventListener("popstate", pop);
    return () => window.removeEventListener("popstate", pop);
  }, []);
  useEffect(() => {
    const click = (e: MouseEvent) => {
      const a = (e.target as Element).closest("a");
      if (
        a &&
        a.origin === location.origin &&
        !a.target &&
        !a.download &&
        a.pathname !== location.pathname &&
        e.button === 0 &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.shiftKey
      ) {
        e.preventDefault();
        navigate(a.pathname + a.search + a.hash);
      }
    };
    document.addEventListener("click", click);
    return () => document.removeEventListener("click", click);
  }, [navigate]);
  useEffect(() => {
    const title =
      route === "/"
        ? "数字设计工作室"
        : route === "/workspace"
          ? "创建与编辑"
          : route === "/product"
            ? "产品"
            : route === "/inspiration"
              ? "案例库"
              : route === "/about"
                ? "关于"
                : "我的项目";
    document.title = `${route === "/sponsorship" ? "Sponsorship" : route === "/pricing" ? "价格" : route === "/login" || route === "/auth/callback" ? "邮箱登录" : route === "/inspiration/byotone" ? "Byotōne 精选研究" : route === "/inspiration/super-intelligence" ? "SUPER INTELLIGENCE / FRAME 出品" : title} · 构页 / FRAME`;
    document.body.dataset.page =
      route === "/" ? "home" : route === "/workspace" ? "workspace" : "content";
  }, [route, visit]);
  const saveProject = useCallback((p: Project) => {
    try {
      const current = unpackProjects(localStorage.getItem("frame-projects-v1"));
      const next = current.some((x) => x.id === p.id)
        ? current.map((x) => (x.id === p.id ? p : x))
        : [p, ...current];
      localStorage.setItem("frame-projects-v1", packProjects(next));
      setProjects(next);
      setStorageError("");
      return true;
    } catch {
      setStorageError(
        "本地保存失败，可能是存储空间不足。请减少素材大小或先导出网站。",
      );
      return false;
    }
  }, []);
  function toggleFavorite(id: string) {
    const next = favorites.includes(id)
      ? favorites.filter((x) => x !== id)
      : [...favorites, id];
    try {
      localStorage.setItem("frame-favorites", JSON.stringify(next));
      setFavorites(next);
    } catch {
      notify("收藏保存失败，请检查浏览器存储空间");
    }
  }
  function addReference(id: string) {
    const query = new URLSearchParams(location.search);
    const current = projects.find(
      (p) =>
        p.id ===
        (targetProject === "new" ? query.get("project") : targetProject),
    );
    if (current) {
      if (
        saveProject({
          ...current,
          referenceIds: [...new Set([...current.referenceIds, id])],
        })
      )
        notify("已加入项目参考");
    } else {
      const next = [...new Set([...pendingRefs, id])];
      try {
        localStorage.setItem("frame-references", JSON.stringify(next));
        setRefs(next);
        notify("已加入待创建项目的参考");
      } catch {
        notify("参考保存失败");
      }
    }
  }
  function demo() {
    const p = spaceProject();
    if (saveProject(p)) navigate("/workspace?project=" + p.id);
  }
  function duplicate(p: Project) {
    const copy = structuredClone(p);
    copy.id = crypto.randomUUID();
    copy.name = p.name + " 副本";
    copy.updated = new Date().toISOString();
    saveProject(copy);
    notify("项目已复制");
  }
  function remove() {
    if (!manage) return;
    try {
      const next = projects.filter((p) => p.id !== manage.id);
      localStorage.setItem("frame-projects-v1", packProjects(next));
      setProjects(next);
      setManage(null);
      notify("项目已删除");
    } catch {
      notify("项目删除失败，请检查浏览器存储");
    }
  }
  const isEditor =
    route === "/workspace" &&
    new URLSearchParams(location.search).has("project");
  return (
    <>
      <GlassRefraction />
      <a className="skip-link" href="#main-content">
        跳转到主要内容
      </a>
      <header className={`site-header ${isEditor ? "workspace-header" : ""}`}>
        <a href="/" className="brand" aria-label="构页 FRAME 首页">
          <span className="logo-mark">
            <i />
            <i />
            <i />
          </span>
          <b>FRAME</b>
          <span className="brand-cn">构页</span>
        </a>
        <nav
          id="primary-navigation"
          className={menu ? "is-open" : ""}
          aria-label="主导航"
        >
          {links.map(([url, text]) => (
            <a
              className={route === url ? "active" : ""}
              href={url}
              key={url}
              aria-current={route === url ? "page" : undefined}
            >
              {text}
            </a>
          ))}
        </nav>
        <div className="header-end">
          <SoundControl />
          <a className="header-login" href="/login">
            邮箱登录
          </a>
          <a href="/workspace" className="button primary compact">
            开始创建
            <Icon name="arrow" size={15} />
          </a>
          <button
            className="icon-button mobile-menu"
            aria-label={menu ? "关闭导航" : "打开导航"}
            aria-expanded={menu}
            aria-controls="primary-navigation"
            onClick={() => setMenu((x) => !x)}
          >
            <Icon name={menu ? "close" : "menu"} />
          </button>
        </div>
      </header>
      {storageError && (
        <div className="storage-error" role="alert">
          {storageError}
        </div>
      )}
      <div id="main-content" key={visit}>
        {route === "/" && (
          <Experience
            navigate={navigate}
            openDemo={demo}
            interfacePreview={<DemoUI openDemo={demo} />}
          />
        )}
        {route === "/pricing" && <Pricing />}
        {route === "/login" && <Login />}
        {route === "/auth/callback" && <Login callback />}
        {route === "/inspiration/byotone" && <ByotoneStudy />}
        {route === "/inspiration/super-intelligence" && (
          <SpaceStudy useSample={demo} />
        )}
        {route === "/product" && <Product openDemo={demo} />}
        {route === "/about" && <CreatorAbout />}
        {route === "/sponsorship" && <Sponsorship />}
        {route === "/inspiration" && (
          <Inspiration
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            showDetail={setDetail}
            addReference={addReference}
            pendingRefs={pendingRefs}
            projects={projects}
            targetProject={targetProject}
            setTargetProject={setTargetProject}
          />
        )}
        {route === "/projects" && (
          <main className="page-shell projects-page">
            <div className="page-heading">
              <div>
                <p className="small-label">你的工作档案</p>
                <h1>继续一个想法。</h1>
                <p className="muted">项目保存在当前浏览器中，随时回来继续。</p>
              </div>
              <a href="/workspace" className="button primary">
                <Icon name="plus" />
                新建项目
              </a>
            </div>
            {projects.length ? (
              <div className="project-grid">
                {projects.map((p) => (
                  <article className="project-card" key={p.id}>
                    <button
                      className={`project-cover ${p.site.direction}`}
                      onClick={() => navigate("/workspace?project=" + p.id)}
                      aria-label={`继续编辑 ${p.name}`}
                    >
                      <div className="project-cover-nav">
                        {p.site.name}
                        <span>About &nbsp; Product</span>
                      </div>
                      <div className="project-cover-body">
                        <b>{p.site.pages[0].headline}</b>
                        <div className="mini-still">
                          <div className="mini-vase" />
                        </div>
                      </div>
                      <span className="cover-page-count">
                        {p.site.pages.length} 个页面
                      </span>
                    </button>
                    <div className="project-info">
                      <div>
                        <h3>
                          <a href={"/workspace?project=" + p.id}>{p.name}</a>
                        </h3>
                        <p>
                          更新于{" "}
                          {new Date(p.updated).toLocaleDateString("zh-CN")}
                        </p>
                      </div>
                      <div className="project-actions">
                        <button
                          className="icon-button"
                          aria-label={`重命名 ${p.name}`}
                          onClick={() => {
                            setRename(p.name);
                            setManage({ type: "rename", id: p.id });
                          }}
                        >
                          <Icon name="edit" size={16} />
                        </button>
                        <button
                          className="icon-button"
                          aria-label={`复制 ${p.name}`}
                          onClick={() => duplicate(p)}
                        >
                          <Icon name="copy" size={16} />
                        </button>
                        <button
                          className="icon-button"
                          aria-label={`删除 ${p.name}`}
                          onClick={() =>
                            setManage({ type: "delete", id: p.id })
                          }
                        >
                          <Icon name="trash" size={16} />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-projects">
                <div className="archive-illustration">
                  <i />
                  <i />
                  <i />
                  <span>YOUR NEXT IDEA</span>
                </div>
                <h2>档案里，还有一块空白。</h2>
                <p>从一段介绍开始，做成一个有自己风格的网站。</p>
                <a href="/workspace" className="button primary">
                  创建第一个项目
                  <Icon name="arrow" />
                </a>
                <button className="text-button" onClick={demo}>
                  快速创建样本
                </button>
              </div>
            )}
          </main>
        )}
        {route === "/workspace" && (
          <Workspace
            projects={projects}
            saveProject={saveProject}
            navigate={navigate}
            pendingRefs={pendingRefs}
            notify={notify}
          />
        )}
        {![
          "/",
          "/product",
          "/about",
          "/inspiration",
          "/projects",
          "/workspace",
          "/login",
          "/pricing",
          "/auth/callback",
          "/sponsorship",
          "/inspiration/byotone",
          "/inspiration/super-intelligence",
        ].includes(route) && (
          <main className="page-shell empty-projects">
            <h1>这个页面还没有成形。</h1>
            <p>返回工作室，继续浏览。</p>
            <a href="/" className="button primary">
              返回首页
            </a>
          </main>
        )}
      </div>
      {route !== "/workspace" && <Footer />}
      <InteractionAtmosphere route={route} />
      {toast && (
        <div className="toast" role="status">
          <Icon name="check" />
          {toast}
          <button
            className="plain"
            aria-label="关闭提示"
            onClick={() => setToast("")}
          >
            ×
          </button>
        </div>
      )}
      {detail && (
        <Dialog title={detail.name} close={() => setDetail(null)}>
          <div className={`reference-study ${detail.className}`}>
            <ReferenceArt reference={detail} />
            <span>原创构图摘要 · 非原站截图</span>
          </div>
          <div className="modal-reference-text">
            <div className="tag-row">
              <span>{detail.industry}</span>
              <span>{detail.style}</span>
              <span>{detail.type}</span>
            </div>
            <h3>设计特点</h3>
            <p>{detail.description}</p>
            <h3>适合什么内容</h3>
            <p>{detail.fit}</p>
            <p className="fine-print">{detail.verified}</p>
            <div className="modal-actions">
              <a
                href={detail.url}
                target="_blank"
                rel="noreferrer"
                className="button secondary"
              >
                查看真实来源
                <Icon name="external" />
              </a>
              <button
                className="button primary"
                onClick={() => addReference(detail.id)}
              >
                加入项目参考
                <Icon name="plus" />
              </button>
            </div>
          </div>
        </Dialog>
      )}
      {manage && (
        <Dialog
          title={manage.type === "delete" ? "删除这个项目？" : "重命名项目"}
          close={() => setManage(null)}
        >
          {manage.type === "delete" ? (
            <>
              <p>
                “{projects.find((p) => p.id === manage.id)?.name}
                ”及其本地编辑记录将被删除。建议先导出需要保留的网站。
              </p>
              <div className="modal-actions">
                <button
                  className="button secondary"
                  onClick={() => setManage(null)}
                >
                  保留项目
                </button>
                <button className="button danger-button" onClick={remove}>
                  确认删除
                </button>
              </div>
            </>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const p = projects.find((p) => p.id === manage.id);
                if (
                  p &&
                  rename.trim() &&
                  saveProject({
                    ...p,
                    name: rename.trim(),
                    updated: new Date().toISOString(),
                  })
                ) {
                  setManage(null);
                  notify("项目名称已更新");
                }
              }}
            >
              <label>
                项目名称
                <input
                  autoFocus
                  value={rename}
                  maxLength={100}
                  onChange={(e) => setRename(e.target.value)}
                />
              </label>
              <div className="modal-actions">
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => setManage(null)}
                >
                  取消
                </button>
                <button className="button primary" disabled={!rename.trim()}>
                  保存名称
                </button>
              </div>
            </form>
          )}
        </Dialog>
      )}
    </>
  );
}
function DemoUI({ openDemo }: { openDemo: () => void }) {
  const [tab, setTab] = useState("首页");
  const site = spaceSite();
  return (
    <div className="demo-ui">
      <div className="demo-ui-top">
        <div className="preview-dots">
          <i />
          <i />
          <i />
        </div>
        <b>SUPER INTELLIGENCE</b>
        <span className="save-state">
          <Icon name="check" size={12} />
          概念样本 · 本地编辑
        </span>
        <button className="demo-export" onClick={openDemo}>
          打开工作台 <Icon name="external" size={12} />
        </button>
      </div>
      <div className="demo-ui-body">
        <aside>
          <p>页面</p>
          {site.pages.map(({ title: t }) => (
            <button
              key={t}
              className={tab === t ? "active" : ""}
              onClick={() => setTab(t)}
            >
              <Icon name="file" size={14} />
              {t}
              <span>↗</span>
            </button>
          ))}
          <p className="demo-layers-title">共享设计</p>
          <div className="swatches">
            <i style={{ background: "#a7dcf5" }} />
            <i style={{ background: "#080f19" }} />
            <i style={{ background: "#e8f1f5" }} />
          </div>
          <small>
            深空 · 精密工程
            <br />
            字体 · 配色 · 导航
          </small>
        </aside>
        <div className="demo-canvas">
          <Preview
            site={site}
            pageId={
              (site.pages.find((p) => p.title === tab) || site.pages[0]).id
            }
            width={1200}
          />
        </div>
        <aside className="demo-chat">
          <span className="frame-symbol">F</span>
          <h3>
            每一页，
            <br />
            都是你的表达。
          </h3>
          <p>点击左侧页面切换预览。打开工作台，修改真实文字和全站样式。</p>
          <button className="button primary compact" onClick={openDemo}>
            试着改一改
            <Icon name="arrow" size={14} />
          </button>
          <span className="demo-badge">原创预置样本</span>
        </aside>
      </div>
    </div>
  );
}
function Product({ openDemo }: { openDemo: () => void }) {
  return (
    <main className="product-page">
      <section className="page-shell product-heading">
        <p className="small-label">从想法到完整网站</p>
        <h1>
          让内容做主角。
          <br />
          让设计有方向。
        </h1>
        <div>
          <p>
            构页帮助你整理内容，做出设计选择，
            <br />
            再把它们变成可以浏览、修改和导出的多页网站。
          </p>
          <button className="button primary" onClick={openDemo}>
            体验完整工作台
            <Icon name="arrow" />
          </button>
        </div>
      </section>
      <section className="page-shell">
        <DemoUI openDemo={openDemo} />
      </section>
      <section className="product-feature section-space">
        <div>
          <span className="feature-index">01 / 内容</span>
          <h2>
            从一段介绍，
            <br />
            长出完整结构。
          </h2>
          <p>
            用途、受众与真实文案，比“做得高级一点”更有用。先组织首页、关于、产品与联系，再为每一页选择合适的表达。
          </p>
        </div>
        <div className="structure-demo">
          <div className="content-note">
            <small>你的内容</small>
            <p>我们用天然材质，制作可以长久陪伴的家具与器物。</p>
          </div>
          <div className="structure-arrow">↓</div>
          {[
            "首页 / 建立第一印象",
            "关于 / 介绍品牌方式",
            "产品 / 呈现器物细节",
          ].map((s, i) => (
            <div className="structure-demo-row" key={s}>
              <Icon name="file" />
              <span>{s}</span>
              <span>{i + 1}</span>
            </div>
          ))}
          <span className="fine-print">界面示意 · 可在创建流程中编辑</span>
        </div>
      </section>
      <section className="feature-reference section-space">
        <span className="feature-index">02 / 方向</span>
        <div className="section-intro">
          <h2>
            有参考，
            <br />
            也有自己的判断。
          </h2>
          <p>
            对比布局、字体、颜色与适合原因。
            <br />
            选择设计方法，让你的内容形成自己的风格。
          </p>
        </div>
        <div className="direction-summary">
          {directions.map((d) => (
            <article key={d.id}>
              <span className="direction-number">{d.en}</span>
              <h3>{d.name}</h3>
              <div className="swatches">
                {d.colors.map((c) => (
                  <i key={c} style={{ background: c }} />
                ))}
              </div>
              <p>{d.layout}</p>
            </article>
          ))}
        </div>
        <a href="/inspiration" className="text-button">
          浏览经过核验的参考
          <Icon name="arrow" />
        </a>
      </section>
      <section className="product-feature section-space">
        <div>
          <span className="feature-index">03 / 修改与交付</span>
          <h2>
            改一处细节。
            <br />
            或更新整个品牌。
          </h2>
          <p>
            当前页面的内容独立编辑。字体、颜色、导航和页脚保持全站一致。随时撤销，对比版本，检查桌面与手机。
          </p>
          <p>导出 HTML、CSS 和素材，无需回到构页，也能独立运行。</p>
        </div>
        <div className="export-demo">
          <div>
            <Icon name="download" size={24} />
            <h3>your-website.zip</h3>
            <span>完整静态网站</span>
          </div>
          <ul>
            {[
              "index.html",
              "about.html",
              "product.html",
              "styles.css",
              "assets/",
              "README.txt",
            ].map((f) => (
              <li key={f}>
                <Icon name={f === "assets/" ? "folder" : "file"} size={16} />
                {f}
                <Icon name="check" size={13} />
              </li>
            ))}
          </ul>
          <button className="button primary" onClick={openDemo}>
            创建并导出
            <Icon name="arrow" />
          </button>
        </div>
      </section>
      <section className="product-limits page-shell">
        <h3>这一版，能做什么。</h3>
        <p>
          当前流程支持内容输入、三种预置方向、多页编辑、响应式预览、本地保存和完整静态导出。服务端预留真实模型适配；未配置并验证
          API 时，不声称已完成真实 AI
          生成。邮箱登录接口已预留，配置后可用；支付和业务后端尚未接入。
        </p>
      </section>
    </main>
  );
}
function ReferenceArt({ reference: r }: { reference: Reference }) {
  return (
    <div className="reference-art" aria-hidden="true">
      {r.id === "nick" ? (
        <>
          <div className="ref-grid-lines" />
          <span className="ref-small">RACE / FORM / MOTION</span>
          <b>98</b>
          <span className="ref-name">NICK HO</span>
          <i className="ref-track" />
        </>
      ) : r.id === "leo" ? (
        <>
          <div className="ref-arch" />
          <div className="ref-flower">
            {Array.from({ length: 8 }, (_, i) => (
              <i
                style={{ transform: `rotate(${i * 45}deg) translateY(-40px)` }}
                key={i}
              />
            ))}
            <span />
          </div>
          <span className="ref-name">Form & light</span>
        </>
      ) : (
        <>
          <div className="ref-desk" />
          <div className="ref-monitor">
            <span>
              Ideas
              <br />
              live here.
            </span>
          </div>
          <div className="ref-books">
            <i />
            <i />
            <i />
          </div>
          <div className="ref-lamp" />
          <span className="ref-name">A functional space</span>
        </>
      )}
    </div>
  );
}
function Inspiration({
  favorites,
  toggleFavorite,
  showDetail,
  addReference,
  pendingRefs,
  projects,
  targetProject,
  setTargetProject,
}: {
  projects: Project[];
  targetProject: string;
  setTargetProject: (id: string) => void;
  favorites: string[];
  toggleFavorite: (id: string) => void;
  showDetail: (r: Reference) => void;
  addReference: (id: string) => void;
  pendingRefs: string[];
}) {
  const [q, setQ] = useState("");
  const [industry, setIndustry] = useState("全部行业");
  const [style, setStyle] = useState("全部风格");
  const [type, setType] = useState("全部页面");
  const [onlyFav, setOnlyFav] = useState(false);
  const results = references.filter(
    (r) =>
      (!q ||
        [r.name, r.description, r.industry, r.style]
          .join(" ")
          .toLowerCase()
          .includes(q.toLowerCase())) &&
      (industry === "全部行业" || r.industry === industry) &&
      (style === "全部风格" || r.style === style) &&
      (type === "全部页面" || r.type === type) &&
      (!onlyFav || favorites.includes(r.id)),
  );
  return (
    <main className="page-shell inspiration-page">
      <div className="page-heading">
        <div>
          <p className="small-label">设计样本架</p>
          <h1>
            好设计，
            <br />
            有迹可循。
          </h1>
          <p className="muted">看懂一个案例为何适合，再找到你自己的方向。</p>
        </div>
        <div className="reference-count">
          <b>03</b>
          <span>
            首批实地浏览案例
            <br />
            真实来源，清楚归属
          </span>
        </div>
      </div>
      <SpaceSampleCard />
      <div className="library-controls">
        <label className="search-box">
          <Icon name="search" />
          <input
            aria-label="搜索案例"
            placeholder="搜索风格、品牌或关键词"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          {q && (
            <button
              className="plain"
              aria-label="清除搜索"
              onClick={() => setQ("")}
            >
              ×
            </button>
          )}
        </label>
        <div className="library-filters">
          <select
            aria-label="行业筛选"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
          >
            {["全部行业", ...new Set(references.map((r) => r.industry))].map(
              (s) => (
                <option key={s}>{s}</option>
              ),
            )}
          </select>
          <select
            aria-label="风格筛选"
            value={style}
            onChange={(e) => setStyle(e.target.value)}
          >
            {["全部风格", ...new Set(references.map((r) => r.style))].map(
              (s) => (
                <option key={s}>{s}</option>
              ),
            )}
          </select>
          <select
            aria-label="页面类型筛选"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            {["全部页面", ...new Set(references.map((r) => r.type))].map(
              (s) => (
                <option key={s}>{s}</option>
              ),
            )}
          </select>
          <button
            className={`button secondary compact ${onlyFav ? "active" : ""}`}
            onClick={() => setOnlyFav((x) => !x)}
            aria-pressed={onlyFav}
          >
            <Icon name="star" size={16} />
            收藏 {favorites.length}
          </button>
        </div>
      </div>
      <div className="reference-target">
        <label>
          参考加入到
          <select
            aria-label="参考目标项目"
            value={targetProject}
            onChange={(e) => setTargetProject(e.target.value)}
          >
            <option value="new">待创建的新项目</option>
            {projects.map((p) => (
              <option value={p.id} key={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        {targetProject !== "new" && (
          <a
            href={"/workspace?project=" + targetProject}
            className="text-button"
          >
            继续编辑此项目
            <Icon name="arrow" size={14} />
          </a>
        )}
      </div>
      <div className="results-caption">
        <span>{results.length} 个案例</span>
        <span>预览为原创构图摘要，点击可查看真实网站。</span>
      </div>
      {results.length ? (
        <div className="reference-grid">
          {results.map((r) => (
            <article className="reference-card" key={r.id}>
              <div className={`reference-study ${r.className}`}>
                <button
                  className="reference-open"
                  onClick={() => showDetail(r)}
                  aria-label={`查看 ${r.name} 详情`}
                >
                  <ReferenceArt reference={r} />
                </button>
                <button
                  className={`favorite-button ${favorites.includes(r.id) ? "active" : ""}`}
                  onClick={() => toggleFavorite(r.id)}
                  aria-label={`${favorites.includes(r.id) ? "取消收藏" : "收藏"} ${r.name}`}
                  aria-pressed={favorites.includes(r.id)}
                >
                  <Icon name="star" />
                </button>
                <span>构图摘要</span>
              </div>
              <div className="reference-info">
                <div>
                  <h3>
                    <button className="plain" onClick={() => showDetail(r)}>
                      {r.name}
                    </button>
                  </h3>
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`访问 ${r.name} 原站`}
                  >
                    <Icon name="external" size={17} />
                  </a>
                </div>
                <p>{r.description}</p>
                <div className="tag-row">
                  <span>{r.industry}</span>
                  <span>{r.style}</span>
                  <span>{r.type}</span>
                </div>
                <button
                  className="reference-add"
                  onClick={() => addReference(r.id)}
                >
                  {(targetProject === "new"
                    ? pendingRefs
                    : projects.find((p) => p.id === targetProject)
                        ?.referenceIds || []
                  ).includes(r.id) ? (
                    <>
                      <Icon name="check" size={14} />
                      已加入参考
                    </>
                  ) : (
                    <>
                      <Icon name="plus" size={14} />
                      加入项目参考
                    </>
                  )}
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-results">
          <Icon name="search" size={36} />
          <h2>这里暂时没有匹配案例。</h2>
          <p>试试其他关键词，或重置筛选。</p>
          <button
            className="button secondary"
            onClick={() => {
              setQ("");
              setIndustry("全部行业");
              setStyle("全部风格");
              setType("全部页面");
              setOnlyFav(false);
            }}
          >
            重置筛选
          </button>
        </div>
      )}
      <WebsiteCollections />
      <div className="library-bottom">
        <Icon name="layers" />
        <p>
          参考是一种方法，不是一张模板。
          <br />
          <span>
            案例只用于设计分析与来源推荐，未复用第三方模型、字体或品牌素材。
          </span>
        </p>
        <a href="/workspace?mode=blank" className="button primary">
          带着参考开始
          <Icon name="arrow" />
        </a>
      </div>
    </main>
  );
}
function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <a href="/" className="brand">
          <span className="logo-mark">
            <i />
            <i />
            <i />
          </span>
          <b>FRAME</b>
          <span className="brand-cn">构页</span>
        </a>
        <p>
          为内容找到形状。
          <br />
          为想法留出空间。
        </p>
        <nav>
          {[["/", "首页"], ...links, ["/login", "登录"]].map(([url, text]) => (
            <a href={url} key={url}>
              {text}
            </a>
          ))}
        </nav>
      </div>
      <div className="footer-wordmark" aria-label="FRAME">
        {[..."FRAME"].map((letter, i) => (
          <span key={i} aria-hidden="true">
            {letter}
          </span>
        ))}
      </div>
      <div className="footer-bottom">
        <span>© 2026 FRAME</span>
        <span>原创工作室与轻柔氛围 · 声音由你开启</span>
      </div>
    </footer>
  );
}
function Dialog({
  title,
  close,
  children,
}: {
  title: string;
  close: () => void;
  children: React.ReactNode;
}) {
  const ref = useCallback((node: HTMLDivElement | null) => {
    node?.focus();
  }, []);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "Tab") {
        const modal = document.querySelector(".dialog");
        const els = modal?.querySelectorAll<HTMLElement>(
          "button,a[href],input,select,textarea",
        );
        if (!els?.length) return;
        const first = els[0],
          last = els[els.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", key);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", key);
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [close]);
  return (
    <div
      className="dialog-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        className="dialog"
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="dialog-header">
          <h2>{title}</h2>
          <button
            className="icon-button"
            onClick={close}
            aria-label="关闭对话框"
          >
            <Icon name="close" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function SpaceStudy({ useSample }: { useSample: () => void }) {
  const [pageId, setPageId] = useState("si-index");
  const site = spaceSite();
  return (
    <main className="page-shell space-study">
      <a href="/inspiration" className="text-button">
        返回案例库 <Icon name="arrow" size={14} />
      </a>
      <header>
        <div>
          <p className="small-label">FRAME ORIGINAL / 001 · 概念作品</p>
          <h1>SUPER INTELLIGENCE</h1>
          <p>把太空旅行的想象，做成可以继续设计的网站。</p>
        </div>
        <button className="button primary" onClick={useSample}>
          使用六页样本 <Icon name="arrow" />
        </button>
      </header>
      <div className="space-study-pages" aria-label="作品页面">
        {site.pages.map((p) => (
          <button
            key={p.id}
            aria-pressed={p.id === pageId}
            onClick={() => setPageId(p.id)}
          >
            {p.title}
          </button>
        ))}
      </div>
      <Preview site={site} pageId={pageId} />
      <div className="space-study-notes">
        <div>
          <span className="small-label">在统一工作台继续</span>
          <h2>作品，也是起点。</h2>
          <p>
            点击“使用六页样本”，即在我的项目中保存独立副本。页面树、内容编辑、全站样式、撤销、版本对比与完整代码导出都能继续使用。
          </p>
          <a className="text-button" href="/workspace">
            用自己的内容从头创建 <Icon name="arrow" size={14} />
          </a>
        </div>
        <dl>
          <dt>页面结构</dt>
          <dd>首页 / 旅行计划 / 航天器 / 关于 / 新闻 / 价格</dd>
          <dt>视觉系统</dt>
          <dd>轨道银、深空蓝、定制标志与连续的品牌导航</dd>
          <dt>场景</dt>
          <dd>NASA 地表影像、原创 ASTER 轨道舱、实时光照与鼠标视角</dd>
          <dt>作品说明</dt>
          <dd>
            FRAME 原创概念样本，非客户项目、非实时 AI 生成。
            公司、人物及旅行计划均为虚构概念。
          </dd>
        </dl>
      </div>
    </main>
  );
}
