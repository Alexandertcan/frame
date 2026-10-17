import { useState, useEffect, useRef } from "react";
import {
  directions,
  emptyBrief,
  sampleBrief,
  validateSite,
  demoSite,
  previewDocument,
  siteFiles,
  applyDemoEdit,
  type Brief,
  type Project,
  type Site,
  type Direction,
  type Asset,
} from "./core";
import Icon from "./Icons";
import SpaceSampleCard from "./SpaceSampleCard";
import { isSpaceSite, spaceProject } from "./space-demo";
import { references } from "./data";
export function Preview({
  site,
  pageId,
  width = 1200,
  onError,
}: {
  site: Site;
  pageId: string;
  width?: number;
  onError?: (err: string) => void;
}) {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState("");
  const [ready, setReady] = useState(false);
  const [reload, setReload] = useState(0);
  const container = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const node = container.current!;
    const o = new ResizeObserver(() => {
      // A hidden mobile panel measures zero. Keep its last valid scale so
      // returning to the preview never starts with a collapsed iframe.
      if (node.clientWidth > 0) setScale(Math.min(1, node.clientWidth / width));
    });
    o.observe(node);
    return () => o.disconnect();
  }, [width]);
  useEffect(() => {
    let stopped = false;
    setReady(false);
    setStatus("");
    setUrl("");
    fetch("/api/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ site }),
    })
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw Error(d.error || "预览服务不可用");
        if (!stopped) {
          setReady(false);
          setUrl(d.url);
        }
      })
      .catch(() => {
        if (!stopped) {
          setStatus(
            "预览服务未连接，显示隔离静态预览。请启动 npm run dev 后刷新。",
          );
          onError?.("预览服务未连接");
        }
      });
    return () => {
      stopped = true;
    };
  }, [site, reload]);
  useEffect(() => setReady(false), [pageId]);
  const page = site.pages.find((x) => x.id === pageId) || site.pages[0];
  return (
    <div className="preview-wrap" ref={container}>
      <div className="preview-address">
        <span className="preview-dots">
          <i />
          <i />
          <i />
        </span>
        <span>
          {site.name.toLowerCase().split(" ")[0]}.site /{" "}
          {page.slug === "index" ? "" : page.slug}
        </span>
        <button
          onClick={() => setReload((x) => x + 1)}
          title="刷新预览"
          className="plain"
        >
          ↻
        </button>
      </div>
      {status && <p className="preview-error">{status}</p>}
      {!ready && url && <span className="preview-loading">正在渲染页面…</span>}
      <div
        className="preview-inner"
        style={{ height: Math.round(820 * scale) }}
      >
        <iframe
          title={`${site.name} · ${page.title}预览`}
          sandbox={isSpaceSite(site) ? "allow-scripts" : ""}
          key={url + page.slug}
          src={url ? url + page.slug + ".html" : undefined}
          srcDoc={url ? undefined : previewDocument(site, pageId)}
          onLoad={() => setReady(true)}
          onError={() => setStatus("预览加载失败，请刷新预览。")}
          style={{
            width,
            height: 820,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        />
      </div>
    </div>
  );
}
async function filesToAssets(files: FileList | null): Promise<Asset[]> {
  if (!files) return [];
  if (files.length > 8) throw Error("最多上传 8 张图片");
  return Promise.all(
    [...files].map(async (file) => {
      if (
        !["image/png", "image/jpeg", "image/webp"].includes(file.type) ||
        file.size > 2 * 1024 * 1024
      )
        throw Error("请使用 2MB 内的 PNG、JPEG 或 WebP 图片");
      const bitmap = await createImageBitmap(file).catch(() => {
        throw Error("图片无法读取，请重新选择有效图片");
      });
      const factor = Math.min(1, 1400 / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(bitmap.width * factor));
      canvas.height = Math.max(1, Math.round(bitmap.height * factor));
      const ctx = canvas.getContext("2d");
      if (!ctx) throw Error("图片处理不可用");
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      bitmap.close();
      let quality = 0.82;
      let data = canvas.toDataURL("image/webp", quality);
      while (data.length > 230000 && quality > 0.24) {
        quality -= 0.1;
        data = canvas.toDataURL("image/webp", quality);
      }
      if (data.length > 250000) throw Error("图片细节过多，请压缩后重新选择");
      return { name: file.name, data };
    }),
  );
}
export default function Workspace({
  projects,
  saveProject,
  navigate,
  pendingRefs,
  notify,
}: {
  projects: Project[];
  saveProject: (p: Project) => boolean;
  navigate: (p: string) => void;
  pendingRefs: string[];
  notify: (s: string) => void;
}) {
  const params = new URLSearchParams(location.search);
  const id = params.get("project");
  const blankMode = params.get("mode") === "blank";
  const existing = projects.find((p) => p.id === id);
  return id && !existing ? (
    <main className="page-shell empty-projects">
      <h1>找不到这个项目。</h1>
      <p>项目可能已删除，或保存在另一个浏览器中。</p>
      <button className="button primary" onClick={() => navigate("/projects")}>
        返回我的项目
      </button>
    </main>
  ) : existing ? (
    <Editor
      key={existing.id}
      project={existing}
      saveProject={saveProject}
      notify={notify}
    />
  ) : blankMode ? (
    <Wizard
      key={id || "new"}
      referencesSelected={pendingRefs}
      create={(p) => {
        if (saveProject(p)) navigate("/workspace?project=" + p.id);
      }}
    />
  ) : (
    <WorkspaceStart
      recentProject={projects[0]}
      pendingReferenceCount={pendingRefs.length}
      createTemplate={() => {
        const project = spaceProject();
        if (saveProject(project)) navigate("/workspace?project=" + project.id);
      }}
    />
  );
}

function WorkspaceStart({
  recentProject,
  pendingReferenceCount,
  createTemplate,
}: {
  recentProject?: Project;
  pendingReferenceCount: number;
  createTemplate: () => void;
}) {
  return (
    <main className="workspace-start page-shell">
      <header className="workspace-start-heading">
        <p className="small-label">FRAME / WORKSPACE</p>
        <h1>选择一种开始方式</h1>
        <p>
          从你的内容建立新网站，或从一份完整的 SUPER INTELLIGENCE 作品继续编辑。
        </p>
      </header>
      <div className="workspace-entry-grid">
        <section className="workspace-entry-card workspace-entry-blank">
          <div className="entry-index">
            01 <span>NEW PROJECT</span>
          </div>
          <div className="entry-blank-art" aria-hidden="true">
            <div className="entry-sheet entry-sheet-back" />
            <div className="entry-sheet entry-sheet-front">
              <span>YOUR CONTENT</span>
              <i />
              <i />
              <i />
            </div>
            <span className="entry-plus">+</span>
          </div>
          <div className="entry-card-copy">
            <h2>从 0 开始</h2>
            <p>
              输入网站用途、受众和内容，再决定页面结构与设计方向。品牌素材和参考链接都可以稍后补充。
            </p>
            <ul>
              <li>整理内容与页面</li>
              <li>选择设计方向</li>
              <li>生成后进入编辑工作台</li>
            </ul>
            <a
              className="button primary"
              href="/workspace?mode=blank"
              aria-label="从 0 开始创建"
            >
              从 0 开始创建 <Icon name="arrow" size={16} />
            </a>
          </div>
        </section>
        <SpaceSampleCard
          entryMode
          useSample={createTemplate}
          buttonLabel="创建 SUPER INTELLIGENCE 副本"
        />
      </div>
      {pendingReferenceCount > 0 && (
        <p className="workspace-pending-refs" role="status">
          案例库中已选 {pendingReferenceCount} 个参考；从 0 开始时会带入向导。
        </p>
      )}
      {recentProject && (
        <div className="workspace-resume glass-surface">
          <div>
            <span className="small-label">最近打开</span>
            <strong>{recentProject.name}</strong>
            <p>{recentProject.site.pages.length} 个页面 · 已保存到本机</p>
          </div>
          <a
            className="button secondary compact"
            href={`/workspace?project=${recentProject.id}`}
            aria-label={`继续编辑最近项目 ${recentProject.name}`}
          >
            继续编辑最近项目
            <Icon name="arrow" size={14} />
          </a>
        </div>
      )}
    </main>
  );
}

function Wizard({
  referencesSelected,
  create,
}: {
  referencesSelected: string[];
  create: (p: Project) => void;
}) {
  const [brief, setBrief] = useState<Brief>({
    ...structuredClone(emptyBrief),
    referenceIds: referencesSelected,
  });
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState<Direction>("editorial");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState("");
  const [live, setLive] = useState(false);
  const [canLive, setCanLive] = useState(false);
  const [apiStatus, setApiStatus] = useState("正在检查 API…");
  const [refs, setRefs] = useState(referencesSelected);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/status", { signal: controller.signal })
      .then(async (r) => {
        if (!r.ok) throw Error("API 状态不可用");
        const status = await r.json();
        if (typeof status.liveAvailable !== "boolean")
          throw Error("API 状态无效");
        return status;
      })
      .then((r) => {
        setCanLive(r.liveAvailable);
        setApiStatus(r.liveAvailable ? "API 已配置" : "API 未配置");
      })
      .catch(() => {
        if (!controller.signal.aborted) setApiStatus("API 状态暂不可用");
      });
    return () => controller.abort();
  }, []);
  const update = (key: keyof Brief, value: Brief[keyof Brief]) =>
    setBrief((b) => ({ ...b, [key]: value }));
  function next() {
    setError("");
    if (!brief.name.trim() || !brief.purpose.trim() || !brief.content.trim()) {
      setError("请填写项目名称、网站用途和主要内容，再继续。");
      return;
    }
    try {
      if (brief.referenceUrl && !/^https?:\/\//.test(brief.referenceUrl))
        throw Error("参考链接请以 https:// 或 http:// 开头");
      validateSite(demoSite(brief, dir));
      setStep((x) => x + 1);
    } catch (e) {
      setError((e as Error).message);
    }
  }
  async function generate() {
    setError("");
    setBusy(true);
    setStage(live ? "正在请求模型，整理多页内容…" : "正在应用所选方向…");
    try {
      validateSite(demoSite(brief, dir));
      const r = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brief: { ...brief, referenceIds: refs },
          direction: dir,
          mode: live ? "live" : "demo",
        }),
      });
      const data = await r.json();
      if (!r.ok) throw Error(data.error || "生成失败");
      setStage("正在校验页面路径与全站样式…");
      const site = validateSite(data.site);
      const p: Project = {
        id: crypto.randomUUID(),
        name: brief.name,
        updated: new Date().toISOString(),
        brief: { ...brief, referenceIds: refs },
        site,
        initial: structuredClone(site),
        history: [],
        referenceIds: refs,
        messages: [
          {
            role: "assistant",
            text:
              data.mode === "demo"
                ? "已将你的内容填入预置布局，未调用模型。可以直接编辑内容，或尝试“标题：…”和全站颜色修改。"
                : "已通过服务端模型生成并校验页面结构。可以直接编辑内容；本轮对话修改支持明确的文案和样式指令。",
          },
        ],
      };
      await new Promise((r) => setTimeout(r, 350));
      create(p);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="wizard page-shell">
      <div className="wizard-heading">
        <div>
          <p className="small-label">从内容开始</p>
          <h1>你的下一座网站。</h1>
          <p className="muted">先说明你要表达什么，设计从这里发生。</p>
        </div>
        <div className="wizard-heading-actions">
          <span className="demo-badge">{apiStatus}</span>
          <a
            className="text-button"
            href="/workspace"
            aria-label="返回创建方式"
          >
            <Icon name="arrow" size={14} /> 返回创建方式
          </a>
        </div>
      </div>
      <ol className="steps">
        {["整理内容", "确认页面", "选择方向"].map((s, i) => (
          <li
            className={i === step ? "active" : i < step ? "done" : ""}
            aria-current={i === step ? "step" : undefined}
            key={s}
          >
            <span>{i < step ? <Icon name="check" size={13} /> : i + 1}</span>
            {s}
          </li>
        ))}
      </ol>
      {error && (
        <div className="error-box" role="alert">
          {error}
        </div>
      )}
      {step === 0 && (
        <div className="brief-grid">
          <div className="brief-form">
            <div className="form-top">
              <h2>把想法放到桌面上。</h2>
              <button
                className="text-button"
                onClick={() => {
                  setBrief({
                    ...structuredClone(sampleBrief),
                    referenceIds: refs,
                    referenceUrl: brief.referenceUrl,
                  });
                  setError("");
                }}
              >
                填入样本内容
              </button>
            </div>
            <label>
              项目名称
              <input
                placeholder="例如：木间，一个日常器物品牌"
                value={brief.name}
                onChange={(e) => update("name", e.target.value)}
              />
            </label>
            <label>
              网站用途
              <textarea
                rows={2}
                placeholder="网站要介绍什么？希望访客完成什么？"
                value={brief.purpose}
                onChange={(e) => update("purpose", e.target.value)}
              />
            </label>
            <label>
              目标受众
              <input
                placeholder="谁会来到这个网站？"
                value={brief.audience}
                onChange={(e) => update("audience", e.target.value)}
              />
            </label>
            <label>
              主要内容
              <textarea
                rows={6}
                placeholder="放入品牌介绍、产品内容、已有文案或需要展示的信息。"
                value={brief.content}
                onChange={(e) => update("content", e.target.value)}
              />
            </label>
          </div>
          <aside className="brief-aside">
            <h3>有素材，就一起带来。</h3>
            <p className="muted">素材和参考都是可选项。不需要先准备截图。</p>
            <label className="upload-box">
              <Icon name="image" size={28} />
              <b>上传品牌图片</b>
              <span>PNG / JPEG / WebP · 每张 ≤ 2MB</span>
              <span>上传后压缩为 WebP，适合本地保存</span>
              <input
                type="file"
                multiple
                accept="image/png,image/jpeg,image/webp"
                onChange={async (e) => {
                  try {
                    const assets = await filesToAssets(e.target.files);
                    update("assets", assets);
                    setError("");
                  } catch (e) {
                    setError((e as Error).message);
                  }
                }}
              />
            </label>
            <div className="asset-list">
              {brief.assets.map((a, i) => (
                <div key={i}>
                  <img src={a.data} alt={a.name} />
                  <span>{a.name}</span>
                  <button
                    className="icon-button"
                    aria-label={`删除素材 ${a.name}`}
                    onClick={() =>
                      update(
                        "assets",
                        brief.assets.filter((_, j) => i !== j),
                      )
                    }
                  >
                    <Icon name="close" size={14} />
                  </button>
                </div>
              ))}
            </div>
            <label className="optional-url">
              参考网站链接（可选）
              <input
                type="url"
                placeholder="https://example.com"
                value={brief.referenceUrl || ""}
                onChange={(e) => update("referenceUrl", e.target.value)}
              />
              <span className="fine-print">
                作为参考记录保存，不自动抓取外站。
              </span>
            </label>
            <h3>
              参考选择 <span className="muted">{refs.length}</span>
            </h3>
            <p className="fine-print">
              直接选用已核验的网站链接，也可勾选多个案例。当前只保存参考，不抓取或复制原站。
            </p>
            <div className="recommended-links">
              {references.map((r) => (
                <div className="recommended-link" key={r.id}>
                  <label className="reference-check">
                    <input
                      type="checkbox"
                      checked={refs.includes(r.id)}
                      onChange={() =>
                        setRefs((x) =>
                          x.includes(r.id)
                            ? x.filter((a) => a !== r.id)
                            : [...x, r.id],
                        )
                      }
                    />
                    <span>
                      {r.name}
                      <small>{r.style}</small>
                    </span>
                  </label>
                  <a
                    className="recommended-domain"
                    href={r.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {new URL(r.url).hostname.replace(/^www\./, "")}{" "}
                    <Icon name="external" size={12} />
                  </a>
                  <button
                    className="text-button"
                    aria-label={`用作参考链接：${r.name}`}
                    aria-pressed={brief.referenceUrl === r.url}
                    onClick={() => {
                      update("referenceUrl", r.url);
                      setRefs((x) => (x.includes(r.id) ? x : [...x, r.id]));
                    }}
                  >
                    <Icon
                      name={brief.referenceUrl === r.url ? "check" : "plus"}
                      size={13}
                    />
                    {brief.referenceUrl === r.url
                      ? "已用作参考链接"
                      : "用作参考链接"}
                  </button>
                </div>
              ))}
            </div>
          </aside>
        </div>
      )}
      {step === 1 && (
        <div className="structure-panel">
          <div>
            <h2>页面各有任务，品牌始终一致。</h2>
            <p className="muted">
              调整页面名称与顺序。首页路径固定，其余使用英文短名。
            </p>
          </div>
          <div className="page-drafts">
            {brief.pages.map((p, i) => (
              <div key={i} className="page-draft">
                <span className="draft-number">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <Icon name="file" />
                <label>
                  页面名称
                  <input
                    aria-label={`页面 ${i + 1} 名称`}
                    value={p.title}
                    onChange={(e) =>
                      update(
                        "pages",
                        brief.pages.map((a, j) =>
                          j === i ? { ...a, title: e.target.value } : a,
                        ),
                      )
                    }
                  />
                </label>
                <label>
                  路径
                  <input
                    aria-label={`页面 ${i + 1} 路径`}
                    value={p.slug}
                    disabled={p.slug === "index"}
                    onChange={(e) =>
                      update(
                        "pages",
                        brief.pages.map((a, j) =>
                          j === i ? { ...a, slug: e.target.value } : a,
                        ),
                      )
                    }
                  />
                </label>
                <button
                  className="icon-button"
                  disabled={i === 0}
                  aria-label={`上移 ${p.title}`}
                  onClick={() => {
                    const ps = [...brief.pages];
                    [ps[i - 1], ps[i]] = [ps[i], ps[i - 1]];
                    update("pages", ps);
                  }}
                >
                  ↑
                </button>
                <button
                  className="icon-button"
                  disabled={i === brief.pages.length - 1}
                  aria-label={`下移 ${p.title}`}
                  onClick={() => {
                    const ps = [...brief.pages];
                    [ps[i + 1], ps[i]] = [ps[i], ps[i + 1]];
                    update("pages", ps);
                  }}
                >
                  ↓
                </button>
                <button
                  className="icon-button"
                  disabled={p.slug === "index"}
                  aria-label={`删除页面 ${p.title}`}
                  onClick={() =>
                    update(
                      "pages",
                      brief.pages.filter((_, j) => i !== j),
                    )
                  }
                >
                  <Icon name="trash" />
                </button>
              </div>
            ))}
          </div>
          <button
            className="text-button"
            disabled={brief.pages.length >= 12}
            onClick={() => {
              const n = brief.pages.length;
              update("pages", [
                ...brief.pages,
                {
                  title: n === 3 ? "联系" : "新页面",
                  slug: n === 3 ? "contact" : "page-" + n,
                },
              ]);
            }}
          >
            <Icon name="plus" /> 添加页面
          </button>
          <div className="shared-note">
            <Icon name="layers" />
            <div>
              <b>全站共享</b>
              <p>
                品牌、字体、配色、导航与页脚。每个页面保留独立标题和内容板块。
              </p>
            </div>
          </div>
        </div>
      )}
      {step === 2 && (
        <div className="directions">
          <div className="directions-heading">
            <h2>三种方向，同一个你。</h2>
            <p className="muted">
              布局、字形与阅读节奏各有区别。以下是可交互的预置设计方向。
            </p>
          </div>
          <div className="direction-grid">
            {directions.map((d) => (
              <button
                className={`direction-option ${dir === d.id ? "selected" : ""}`}
                aria-pressed={dir === d.id}
                key={d.id}
                onClick={() => setDir(d.id)}
              >
                <div className={`direction-art ${d.id}`}>
                  <div className="direction-mini-nav">
                    {brief.name || "YOUR BRAND"}
                    <span>About &nbsp; Objects</span>
                  </div>
                  <div className="direction-mini-layout">
                    <div>
                      <small>{d.en}</small>
                      <b>
                        {d.id === "precision"
                          ? "MAKE\nIT MATTER."
                          : "让日常，\n值得停留。"}
                      </b>
                    </div>
                    <div className="mini-still">
                      <div className="mini-vase" />
                    </div>
                  </div>
                  <div className="mini-lines">
                    <i />
                    <i />
                    <i />
                  </div>
                </div>
                <div className="direction-info">
                  <h3>
                    {d.name}
                    {dir === d.id && <Icon name="check" />}
                  </h3>
                  <p>{d.reason}</p>
                  <dl>
                    <dt>布局</dt>
                    <dd>{d.layout}</dd>
                    <dt>字体</dt>
                    <dd>{d.font}</dd>
                    <dt>参考</dt>
                    <dd>{d.reference}</dd>
                  </dl>
                  <div className="swatches">
                    {d.colors.map((c) => (
                      <i key={c} style={{ background: c }} />
                    ))}
                  </div>
                </div>
              </button>
            ))}
          </div>
          <div className="generation-mode">
            <span className="demo-badge">
              {live ? "真实模型生成" : "本地预置布局"}
            </span>
            <p>
              {live
                ? "通过服务端模型生成多页内容。"
                : "将你的内容填入预置布局，不调用模型。"}
            </p>
            {canLive && (
              <label>
                <input
                  type="checkbox"
                  checked={live}
                  onChange={(e) => setLive(e.target.checked)}
                />{" "}
                使用已配置的真实模型
              </label>
            )}
          </div>
        </div>
      )}
      <div className="wizard-actions">
        <button
          className="button secondary"
          onClick={() => setStep((x) => Math.max(0, x - 1))}
          disabled={step === 0 || busy}
        >
          上一步
        </button>
        <span className="muted">
          {busy ? stage : `${brief.pages.length} 个页面 · 生成后本地保存`}
        </span>
        <button
          className="button primary"
          disabled={busy}
          onClick={step === 2 ? generate : next}
        >
          {busy
            ? "正在生成…"
            : step === 2
              ? live
                ? "调用模型并生成"
                : "生成网站"
              : "下一步"}
          <Icon name="arrow" />
        </button>
      </div>
    </main>
  );
}
function Editor({
  project,
  saveProject,
  notify,
}: {
  project: Project;
  saveProject: (p: Project) => boolean;
  notify: (s: string) => void;
}) {
  const [p, setP] = useState(project);
  const [pageId, setPage] = useState(p.site.pages[0].id);
  const [selection, setSelection] = useState("hero");
  const [device, setDevice] = useState<"desktop" | "tablet" | "phone">(
    "desktop",
  );
  const [scope, setScope] = useState<"page" | "global">("page");
  const [chat, setChat] = useState("");
  const [tab, setTab] = useState<"edit" | "chat">("chat");
  const [compare, setCompare] = useState(false);
  const [focusPreview, setFocusPreview] = useState(false);
  const [save, setSave] = useState("已保存到本机");
  const [leftTab, setLeftTab] = useState<"pages" | "assets">("pages");
  const [mobilePanel, setMobilePanel] = useState<"preview" | "pages" | "edit">(
    "preview",
  );
  const page = p.site.pages.find((a) => a.id === pageId) || p.site.pages[0];
  const section = page.sections.find((a) => a.id === selection);
  useEffect(() => {
    if (saveProject(p)) setSave("已保存到本机");
    else setSave("保存失败 · 本机空间不足");
  }, [p, saveProject]);
  function change(site: Site) {
    try {
      validateSite(site);
      setSave("正在保存…");
      setP((x) => ({
        ...x,
        site,
        history: [...x.history.slice(-9), structuredClone(x.site)],
        updated: new Date().toISOString(),
      }));
    } catch (e) {
      notify((e as Error).message);
    }
  }
  function editPage(
    key: "headline" | "description" | "eyebrow",
    value: string,
  ) {
    change({
      ...p.site,
      pages: p.site.pages.map((a) =>
        a.id === page.id ? { ...a, [key]: value } : a,
      ),
    });
  }
  function editSection(key: "title" | "body", value: string) {
    change({
      ...p.site,
      pages: p.site.pages.map((a) =>
        a.id === page.id
          ? {
              ...a,
              sections: a.sections.map((s) =>
                s.id === selection ? { ...s, [key]: value } : s,
              ),
            }
          : a,
      ),
    });
  }
  function undo() {
    if (!p.history.length) return;
    setP((x) => ({
      ...x,
      site: x.history[x.history.length - 1],
      history: x.history.slice(0, -1),
      updated: new Date().toISOString(),
    }));
    notify("已撤销上一次修改");
  }
  function send() {
    if (!chat.trim()) return;
    const r = applyDemoEdit(p.site, pageId, scope, chat);
    setP((x) => ({
      ...x,
      site: r.site,
      history: r.changed
        ? [...x.history.slice(-9), structuredClone(x.site)]
        : x.history,
      updated: new Date().toISOString(),
      messages: [
        ...x.messages,
        {
          role: "user",
          text: `[${scope === "page" ? "当前页面" : "全站共享样式"}] ${chat}`,
        },
        { role: "assistant", text: r.message },
      ],
    }));
    setChat("");
  }
  async function exportSite() {
    try {
      const { zipSync, strToU8 } = await import("fflate");
      const files = siteFiles(p.site);
      const zip: Record<string, Uint8Array> = {};
      for (const [name, content] of Object.entries(files)) {
        zip[name] = content.startsWith("data:image/")
          ? Uint8Array.from(atob(content.split(",")[1]), (c) => c.charCodeAt(0))
          : strToU8(content);
      }
      const bytes = zipSync(zip);
      const url = URL.createObjectURL(
        new Blob([new Uint8Array(bytes)], { type: "application/zip" }),
      );
      const a = document.createElement("a");
      a.href = url;
      a.download =
        p.name.replace(/[^a-z0-9\u4e00-\u9fff-]/gi, "-") + "-site.zip";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      notify("已导出完整静态网站，启动说明在 README.txt 中");
    } catch (e) {
      notify("导出失败：" + (e as Error).message);
    }
  }
  return (
    <main className={`editor${focusPreview ? " is-focused" : ""}`}>
      <div className="editor-toolbar">
        <div className="editor-project">
          <Icon name="folder" />
          <div className="project-identity">
            <span>设计工作台</span>
            <h1>{p.name}</h1>
          </div>
          <span className="save-state" role="status">
            <span className="status-dot" />
            {save}
          </span>
        </div>
        <div className="toolbar-actions">
          <span className="demo-badge">本地编辑</span>
          <button
            className="button compact secondary focus-preview"
            aria-label="专注预览"
            aria-pressed={focusPreview}
            onClick={() => setFocusPreview((x) => !x)}
          >
            <Icon name={focusPreview ? "grid" : "desktop"} />
            {focusPreview ? "退出专注" : "专注预览"}
          </button>
          <button
            className="button compact secondary"
            disabled={!p.history.length}
            onClick={undo}
          >
            <Icon name="undo" />
            撤销
          </button>
          <button
            className={`button compact secondary ${compare ? "active" : ""}`}
            aria-pressed={compare}
            onClick={() => setCompare((x) => !x)}
          >
            <Icon name="compare" />
            版本对比
          </button>
          <button className="button compact primary" onClick={exportSite}>
            <Icon name="download" />
            导出网站
          </button>
        </div>
      </div>
      {isSpaceSite(p.site) && (
        <div className="sample-provenance">
          <span>
            <b>FRAME 出品 / 001</b> SUPER INTELLIGENCE · 可编辑概念样本
          </span>
          <a href="/inspiration/super-intelligence">
            查看原始作品 <Icon name="external" size={12} />
          </a>
        </div>
      )}
      <div className="mobile-editor-tabs">
        {(["pages", "preview", "edit"] as const).map((t) => (
          <button
            className={mobilePanel === t ? "active" : ""}
            aria-pressed={mobilePanel === t}
            onClick={() => setMobilePanel(t)}
            key={t}
          >
            <Icon
              name={
                t === "pages" ? "layers" : t === "preview" ? "desktop" : "edit"
              }
              size={16}
            />
            {t === "pages"
              ? "页面与素材"
              : t === "preview"
                ? "网站预览"
                : "内容与对话"}
          </button>
        ))}
      </div>
      <div className={`editor-grid show-${mobilePanel}`}>
        <aside className="editor-left">
          <div className="panel-tabs">
            <button
              className={leftTab === "pages" ? "active" : ""}
              onClick={() => setLeftTab("pages")}
            >
              页面
            </button>
            <button
              className={leftTab === "assets" ? "active" : ""}
              onClick={() => setLeftTab("assets")}
            >
              素材与参考
            </button>
          </div>
          {leftTab === "pages" ? (
            <>
              <p className="panel-label">
                站点结构 <span>{p.site.pages.length} 页</span>
              </p>
              <div className="page-tree">
                {p.site.pages.map((a) => (
                  <button
                    className={pageId === a.id ? "active" : ""}
                    key={a.id}
                    onClick={() => {
                      setPage(a.id);
                      setSelection("hero");
                    }}
                  >
                    <Icon name="file" />
                    <span>{a.title}</span>
                    <small>/{a.slug === "index" ? "" : a.slug}</small>
                  </button>
                ))}
              </div>
              <div className="panel-divider" />
              <p className="panel-label">{page.title} · 内容板块</p>
              <div className="section-tree">
                <button
                  className={selection === "hero" ? "active" : ""}
                  onClick={() => {
                    setSelection("hero");
                    setScope("page");
                    setTab("edit");
                    setMobilePanel("edit");
                  }}
                >
                  <Icon name="layers" />
                  首屏与标题
                </button>
                {page.sections.map((s) => (
                  <button
                    key={s.id}
                    className={selection === s.id ? "active" : ""}
                    onClick={() => {
                      setSelection(s.id);
                      setScope("page");
                      setTab("edit");
                      setMobilePanel("edit");
                    }}
                  >
                    <Icon name="layers" />
                    {s.title}
                  </button>
                ))}
              </div>
              <button
                className="text-button add-section"
                onClick={() => {
                  const id = crypto.randomUUID();
                  change({
                    ...p.site,
                    pages: p.site.pages.map((a) =>
                      a.id === page.id
                        ? {
                            ...a,
                            sections: [
                              ...a.sections,
                              {
                                id,
                                title: "新板块",
                                body: "在这里写入你的内容。",
                              },
                            ],
                          }
                        : a,
                    ),
                  });
                  setSelection(id);
                  setScope("page");
                  setTab("edit");
                  setMobilePanel("edit");
                }}
              >
                <Icon name="plus" size={14} />
                添加板块
              </button>
              <div className="editor-shared">
                <Icon name="layers" />
                <b>共享设计规则</b>
                <p>
                  {directions.find((d) => d.id === p.site.direction)?.name} ·
                  字体、导航、页脚一致
                </p>
                <div className="swatches">
                  <i style={{ background: p.site.accent }} />
                  <i style={{ background: "#252923" }} />
                  <i style={{ background: "#eeebe3" }} />
                </div>
                <button
                  className="text-button"
                  onClick={() => {
                    setScope("global");
                    setTab("edit");
                    setMobilePanel("edit");
                  }}
                >
                  编辑全站样式
                </button>
              </div>
            </>
          ) : (
            <div className="editor-assets">
              <h3>品牌素材</h3>
              {p.site.assets.length ? (
                p.site.assets.map((a) => (
                  <figure key={a.name}>
                    <img src={a.data} alt={a.name} />
                    <figcaption>{a.name}</figcaption>
                  </figure>
                ))
              ) : (
                <p className="muted">
                  暂未上传素材。当前预览使用 FRAME 原创概念插画。
                </p>
              )}
              <label className="button secondary compact">
                上传图片
                <input
                  className="sr-only"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={async (e) => {
                    try {
                      const assets = await filesToAssets(e.target.files);
                      change({ ...p.site, assets });
                    } catch (e) {
                      notify((e as Error).message);
                    }
                  }}
                />
              </label>
              <h3>设计参考</h3>
              {p.brief.referenceUrl && (
                <a href={p.brief.referenceUrl} target="_blank" rel="noreferrer">
                  用户提供的参考链接
                  <Icon name="external" size={14} />
                </a>
              )}
              {p.referenceIds.length ? (
                p.referenceIds.map((id) => {
                  const r = references.find((r) => r.id === id);
                  return r ? (
                    <a key={id} href={r.url} target="_blank" rel="noreferrer">
                      {r.name}
                      <Icon name="external" size={14} />
                    </a>
                  ) : null;
                })
              ) : (
                <p className="muted">尚未添加参考。可从案例库加入。</p>
              )}
            </div>
          )}
        </aside>
        <section className="editor-center">
          <div className="preview-toolbar">
            <div>
              <b>{page.title}</b>
              <span className="muted">
                {" "}
                / {page.slug === "index" ? "index" : page.slug}.html
              </span>
            </div>
            <div className="device-switch">
              {(["desktop", "tablet", "phone"] as const).map((d) => (
                <button
                  aria-label={
                    d === "desktop"
                      ? "桌面预览"
                      : d === "tablet"
                        ? "平板预览"
                        : "手机预览"
                  }
                  className={device === d ? "active" : ""}
                  aria-pressed={device === d}
                  onClick={() => setDevice(d)}
                  key={d}
                >
                  <Icon name={d} />
                </button>
              ))}
            </div>
            <span className="preview-size">
              {device === "desktop"
                ? "1200"
                : device === "tablet"
                  ? "768"
                  : "390"}{" "}
              px
            </span>
          </div>
          {compare ? (
            <div className="compare-grid">
              <div>
                <p>初始版本</p>
                <Preview
                  site={p.initial}
                  pageId={pageId}
                  width={device === "phone" ? 390 : 1200}
                />
              </div>
              <div>
                <p>当前版本</p>
                <Preview
                  site={p.site}
                  pageId={pageId}
                  width={device === "phone" ? 390 : 1200}
                />
              </div>
            </div>
          ) : (
            <div className={`canvas-area device-${device}`}>
              <Preview
                site={p.site}
                pageId={pageId}
                width={
                  device === "desktop" ? 1200 : device === "tablet" ? 768 : 390
                }
              />
            </div>
          )}
          <div className="preview-footer">
            <span>
              <Icon name="check" size={13} />
              可运行 HTML · 共享 CSS · 独立页面
            </span>
            <span>隔离预览</span>
          </div>
        </section>
        <aside className="editor-right">
          <div className="panel-tabs">
            <button
              className={tab === "chat" ? "active" : ""}
              onClick={() => setTab("chat")}
            >
              AI 对话
            </button>
            <button
              className={tab === "edit" ? "active" : ""}
              onClick={() => setTab("edit")}
            >
              内容编辑
            </button>
          </div>
          <div className="scope-picker">
            <span>修改范围</span>
            <select
              aria-label="修改范围"
              value={scope}
              onChange={(e) => setScope(e.target.value as typeof scope)}
            >
              <option value="page">只改当前页面</option>
              <option value="global">更新全站共享样式</option>
            </select>
            <p className="scope-help">
              {scope === "page"
                ? `修改仅应用到「${page.title}」`
                : "品牌、字体与配色同步到所有页面"}
            </p>
          </div>
          {tab === "chat" ? (
            <div className="chat-panel">
              <div className="chat-messages">
                <div className="chat-welcome">
                  <span className="frame-symbol">F</span>
                  <h3>一起，把想法做清楚。</h3>
                  <p>对话 API 尚未接入。当前支持本地文案和颜色指令。</p>
                </div>
                {p.messages.map((m, i) => (
                  <div className={`message ${m.role}`} key={i}>
                    {m.role === "assistant" && (
                      <b>
                        FRAME <span>本地</span>
                      </b>
                    )}
                    <p>{m.text}</p>
                  </div>
                ))}
              </div>
              <div className="chat-suggestions">
                <button
                  onClick={() => {
                    setScope("page");
                    setChat("精简文案");
                  }}
                >
                  精简当前页文案
                </button>
                <button
                  onClick={() => {
                    setScope("global");
                    setChat("改成蓝色");
                  }}
                >
                  全站强调色改为蓝色
                </button>
              </div>
              <form
                className="chat-input"
                onSubmit={(e) => {
                  e.preventDefault();
                  send();
                }}
              >
                <textarea
                  rows={3}
                  aria-label="修改指令"
                  placeholder={
                    scope === "page"
                      ? "例如：标题：让日常，值得停留。"
                      : "例如：全站改成蓝色"
                  }
                  value={chat}
                  onChange={(e) => setChat(e.target.value)}
                  onKeyDown={(e) => {
                    if (
                      (e.metaKey || e.ctrlKey) &&
                      e.key === "Enter" &&
                      !e.nativeEvent.isComposing
                    ) {
                      e.preventDefault();
                      send();
                    }
                  }}
                />
                <div>
                  <span>
                    {scope === "page"
                      ? "⌘ / Ctrl + Enter 发送"
                      : "全站样式 · ⌘ / Ctrl + Enter"}
                  </span>
                  <button
                    className="send-button"
                    aria-label="发送修改"
                    disabled={!chat.trim()}
                  >
                    <Icon name="arrow" />
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="content-editor">
              {scope === "global" ? (
                <>
                  <h3>全站共享样式</h3>
                  <p className="muted">这里的修改会应用到每一个页面。</p>
                  <label>
                    品牌名称
                    <input
                      value={p.site.name}
                      onChange={(e) =>
                        change({ ...p.site, name: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    强调色
                    <div className="color-field">
                      <input
                        type="color"
                        value={p.site.accent}
                        onChange={(e) =>
                          change({ ...p.site, accent: e.target.value })
                        }
                      />
                      <span>{p.site.accent}</span>
                    </div>
                  </label>
                  <label>
                    设计方向
                    <select
                      value={p.site.direction}
                      onChange={(e) =>
                        change({
                          ...p.site,
                          direction: e.target.value as Direction,
                        })
                      }
                    >
                      {directions.map((d) => (
                        <option value={d.id} key={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="shared-note small">
                    <Icon name="check" />
                    <p>导航、页脚和字体共用一套规则。</p>
                  </div>
                </>
              ) : (
                <>
                  <h3>{section ? "板块内容" : "首屏与标题"}</h3>
                  <p className="muted">当前页面：{page.title}</p>
                  {section ? (
                    <>
                      <label>
                        板块标题
                        <input
                          value={section.title}
                          onChange={(e) => editSection("title", e.target.value)}
                        />
                      </label>
                      <label>
                        板块正文
                        <textarea
                          rows={8}
                          value={section.body}
                          onChange={(e) => editSection("body", e.target.value)}
                        />
                      </label>
                      <button
                        className="text-button danger"
                        onClick={() => {
                          change({
                            ...p.site,
                            pages: p.site.pages.map((a) =>
                              a.id === page.id
                                ? {
                                    ...a,
                                    sections: a.sections.filter(
                                      (s) => s.id !== selection,
                                    ),
                                  }
                                : a,
                            ),
                          });
                          setSelection("hero");
                        }}
                      >
                        删除当前板块
                      </button>
                    </>
                  ) : (
                    <>
                      <label>
                        引导文字
                        <input
                          value={page.eyebrow}
                          onChange={(e) => editPage("eyebrow", e.target.value)}
                        />
                      </label>
                      <label>
                        页面标题
                        <textarea
                          rows={3}
                          aria-label="页面标题"
                          value={page.headline}
                          onChange={(e) => editPage("headline", e.target.value)}
                        />
                      </label>
                      <label>
                        页面描述
                        <textarea
                          rows={6}
                          aria-label="页面描述"
                          value={page.description}
                          onChange={(e) =>
                            editPage("description", e.target.value)
                          }
                        />
                      </label>
                    </>
                  )}
                  <p className="fine-print">
                    修改即时保存。选择左侧板块继续编辑。
                  </p>
                </>
              )}
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}
