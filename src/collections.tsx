import Icon from "./Icons";
import { appPath } from "./paths";
export const collections = [
  {
    name: "Awwwards",
    url: "https://www.awwwards.com/",
    type: "获奖网站与创意开发",
    description: "从获奖作品与提名中，发现成熟的视觉系统、交互与技术实现。",
    mark: "www.",
    className: "awwwards",
  },
  {
    name: "Landing Love",
    url: "https://www.landing.love/",
    type: "带完整录屏的网页案例",
    description:
      "通过真实网页录屏理解滚动、转场和细节。适合研究静态截图之外的体验。",
    mark: "love",
    className: "landing",
  },
  {
    name: "Recent",
    url: "https://recent.design/?ref=godly",
    type: "设计与网页精选 / 原 Godly",
    description: "原 Godly 地址现跳转至 Recent，整理网页、界面与动态设计灵感。",
    mark: "re.",
    className: "recent",
  },
];
export function WebsiteCollections() {
  return (
    <section className="website-collections" id="collections">
      <div className="collection-heading">
        <div>
          <span className="small-label">不止三个案例</span>
          <h2>去好网站出现的地方。</h2>
        </div>
        <p>
          保留原始入口，持续浏览。
          <br />
          只有值得细看的案例，才单独展开。
        </p>
      </div>
      <div className="collection-list">
        {collections.map((c) => (
          <a
            href={c.url}
            target="_blank"
            rel="noreferrer"
            key={c.name}
            className={`collection-item ${c.className}`}
          >
            <span className="collection-mark">{c.mark}</span>
            <div>
              <h3>{c.name}</h3>
              <span>{c.type}</span>
            </div>
            <p>{c.description}</p>
            <Icon name="external" />
          </a>
        ))}
      </div>
      <a className="curated-feature" href="/inspiration/byotone">
        <span className="curated-art" aria-hidden="true">
          <i />
          <i />
          <b>Byotōne</b>
        </span>
        <div>
          <span className="small-label">本轮精选 · 独立案例</span>
          <h3>滚动，不只是向下。</h3>
          <p>
            观看粒子如何改变形态、文字如何进入场景，以及动态效果如何让阅读更连贯。
          </p>
          <span className="text-button">
            查看 Byotōne 研究页
            <Icon name="arrow" />
          </span>
        </div>
      </a>
    </section>
  );
}
export function ByotoneStudy() {
  return (
    <main className="study-page page-shell">
      <a href="/inspiration" className="text-button">
        返回案例库
        <Icon name="arrow" />
      </a>
      <header>
        <span className="small-label">FRAME / 精选交互研究</span>
        <h1>
          Byotōne.
          <br />
          <em>让滚动成为叙事。</em>
        </h1>
        <p>不是把动效叠在内容上，而是让内容跟随形态变化出现。</p>
      </header>
      <div className="study-art" aria-hidden="true">
        <i />
        <i />
        <i />
        <span>
          FEEL THE
          <br />
          SHIFT.
        </span>
      </div>
      <div className="study-body">
        <aside>
          <span>来源与访问</span>
          <a
            className="button primary"
            href="https://byotone.com/"
            target="_blank"
            rel="noreferrer"
          >
            访问实际网站
            <Icon name="external" />
          </a>
          <a
            href="https://www.landing.love/sites/byotone/"
            target="_blank"
            rel="noreferrer"
          >
            Landing Love 原案例与录屏
            <Icon name="external" size={14} />
          </a>
          <a
            href={appPath("/examples/byotone.html")}
            target="_blank"
            rel="noreferrer"
          >
            打开独立 HTML 研究页
            <Icon name="external" size={14} />
          </a>
          <span className="muted">
            设计：L'Étude
            <br />
            本页为设计观察与原创构图示意，非原站复刻或截图。
          </span>
        </aside>
        <article>
          <h2>值得借鉴的三件事。</h2>
          <h3>一个连续变化的主体。</h3>
          <p>
            用粒子的密度、形态和空间关系贯穿整段浏览。用户感受到的是同一个主体在变化，而不是不断切换互不相关的动画。
          </p>
          <h3>滚动与变化有明确关系。</h3>
          <p>
            停下时可以观察，继续滚动才向下一个阶段推进。大字、形态和分段导航共同帮助理解当前的位置。
          </p>
          <h3>克制的颜色，让运动更清楚。</h3>
          <p>
            深色背景、浅绿文字与细小粒子保持统一。光线和层次服务于形态本身，避免用过多颜色分散注意力。
          </p>
          <h2>在 FRAME 中的应用。</h2>
          <p>
            首页以实时 3D
            粒子从立体云团折叠为曲面，再展开为三个页面。保留自然滚动、章节跳转和减少动效选项，玻璃导航与按钮负责提供明确入口。
          </p>
          <p className="muted">
            观察记录与可访问情况见交付说明。第三方网站可能随时更新；内容版权归原作者。
          </p>
        </article>
      </div>
    </main>
  );
}
