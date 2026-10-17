import Icon from "./Icons";
import { appPath } from "./paths";
export default function SpaceSampleCard({
  useSample,
  entryMode = false,
  buttonLabel = "使用六页样本",
}: {
  useSample?: () => void;
  entryMode?: boolean;
  buttonLabel?: string;
}) {
  return (
    <section
      className={`space-sample-card${entryMode ? " workspace-entry-card workspace-entry-template" : ""}`}
      aria-label="FRAME 出品样本"
    >
      <a
        className="space-sample-art"
        href={appPath("/inspiration/super-intelligence")}
        aria-label="查看 FRAME 作品 SUPER INTELLIGENCE"
      >
        <img
          src={appPath("/assets/frame-orbit.jpg")}
          alt="SUPER INTELLIGENCE 原创轨道舱与地球场景"
        />
        <span>FRAME ORIGINAL / 001</span>
      </a>
      <div className="space-sample-copy">
        <span className="small-label">
          {entryMode
            ? "02 / START WITH A TEMPLATE"
            : "FRAME 出品 · 可编辑概念样本"}
        </span>
        <h2>
          {entryMode ? "使用 SUPER INTELLIGENCE 模板" : "SUPER INTELLIGENCE"}
        </h2>
        <p>
          从一份完整作品开始。六个相连页面、实时
          3D、共享品牌与可修改的内容，在同一个工作台继续设计。
        </p>
        <div className="space-sample-tags">
          <span>太空旅行</span>
          <span>6 页</span>
          <span>可编辑 / 可导出</span>
        </div>
        <div className="space-sample-actions">
          {useSample && (
            <button className="button primary compact" onClick={useSample}>
              {buttonLabel} <Icon name="arrow" size={15} />
            </button>
          )}
          <a
            className="text-button"
            href={appPath("/inspiration/super-intelligence")}
          >
            查看作品 <Icon name="external" size={14} />
          </a>
        </div>
        <small>使用概念作品创建独立副本，内容可编辑。</small>
      </div>
    </section>
  );
}
