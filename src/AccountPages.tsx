import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import Icon from "./Icons";
export function Login({ callback = false }: { callback?: boolean }) {
  const processed = useRef(false);
  const [email, setEmail] = useState(""),
    [status, setStatus] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [configured, setConfigured] = useState<boolean | null>(null),
    [user, setUser] = useState<{ email: string } | null>(null);
  useEffect(() => {
    fetch("/api/auth/status")
      .then((r) => r.json())
      .then((d) => setConfigured(d.configured))
      .catch(() => setConfigured(false));
    if (!callback)
      fetch("/api/auth/me")
        .then((r) => r.json())
        .then((d) => setUser(d.user))
        .catch(() => {});
  }, []);
  useEffect(() => {
    if (!callback || processed.current) return;
    processed.current = true;
    const hash = new URLSearchParams(location.hash.slice(1)),
      accessToken = hash.get("access_token");
    history.replaceState(null, "", "/auth/callback");
    if (!accessToken) {
      setError("登录链接缺少凭证或已过期，请重新申请。");
      return;
    }
    setBusy(true);
    fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessToken }),
    })
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw Error(d.error);
        setUser(d.user);
        setError("");
        setStatus("邮箱已验证，登录成功。");
      })
      .catch((e) => setError(e.message || "登录未完成，请重试"))
      .finally(() => setBusy(false));
  }, [callback]);
  async function send(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setStatus("");
    setBusy(true);
    try {
      const r = await fetch("/api/auth/request-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const d = await r.json();
      if (!r.ok) throw Error(d.error);
      setStatus(d.message);
    } catch (e) {
      setError((e as Error).message || "邮件请求失败，请重试");
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="account-page">
      <div className="account-art" aria-hidden="true">
        <div className="glass-orbit orbit-one" />
        <div className="glass-orbit orbit-two" />
        <span>
          Good ideas
          <br />
          deserve a place.
        </span>
        <small>FRAME / YOUR NEXT CHAPTER</small>
      </div>
      <section className="account-form glass-surface">
        <a href="/" className="small-label">
          FRAME / 构页
        </a>
        <h1>{user ? "欢迎回来。" : "从邮箱，回到工作室。"}</h1>
        <p>
          保存你的身份，继续你的想法。
          <br />
          使用邮箱链接登录，无需记住密码。
        </p>
        {configured === false && !user && (
          <p className="account-notice">
            邮箱登录待接入。当前项目仍保存在本机，创建与导出可以正常使用。
          </p>
        )}
        {user ? (
          <div className="account-success">
            <span className="status-dot" />
            已登录：{user.email}
            <a className="button primary" href="/projects">
              进入我的项目
              <Icon name="arrow" />
            </a>
            <button
              className="text-button"
              onClick={async () => {
                const r = await fetch("/api/auth/logout", { method: "POST" });
                if (r.ok) {
                  setUser(null);
                  setStatus("已退出登录");
                } else setError("退出失败，请重试");
              }}
            >
              退出登录
            </button>
            <p className="muted">身份登录已连接；本地项目暂不跨设备同步。</p>
          </div>
        ) : (
          <form onSubmit={send}>
            <label>
              邮箱地址
              <input
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                maxLength={254}
              />
            </label>
            <button className="button primary" disabled={busy}>
              {busy ? "正在处理…" : "发送登录链接"}
              <Icon name="arrow" />
            </button>
            <p className="account-fine">
              发送后，请在邮件中打开登录链接。
              <br />
              未配置服务时不会发送邮件或创建虚假登录状态。
            </p>
          </form>
        )}
        {error && (
          <p role="alert" className="account-error">
            {error}
          </p>
        )}
        {status && (
          <p role="status" className="account-status">
            {status}
          </p>
        )}
        <a className="text-button" href="/workspace">
          先体验本地工作台
          <Icon name="arrow" />
        </a>
      </section>
    </main>
  );
}
const plans = [
  {
    name: "Go",
    price: "5",
    tag: "把第一个想法做出来",
    body: "适合个人、小项目和第一次建站。把已有内容变成清楚、完整的基础网站。",
    features: [
      "基础多页网站生成",
      "三种设计方向与响应式预览",
      "内容编辑与静态代码导出",
      "个人项目管理",
    ],
    className: "go",
  },
  {
    name: "Plus",
    price: "15",
    tag: "让风格更像你",
    body: "适合独立创作者与小型品牌。留出更多尝试空间，细化视觉方向和页面表达。",
    features: [
      "包含 Go 的全部能力",
      "更多设计方向与迭代额度",
      "品牌字体、配色与共享组件",
      "更完整的页面与版本管理",
    ],
    className: "plus",
  },
  {
    name: "Max",
    price: "39",
    tag: "为持续做产品的人",
    body: "适合创业者和高频创作。让多项目、复杂内容与反复打磨成为日常工作。",
    features: [
      "包含 Plus 的全部能力",
      "更高生成与修改额度",
      "高级多页结构与素材管理",
      "优先处理与产品反馈通道",
    ],
    className: "max",
  },
  {
    name: "Ultra",
    price: null,
    tag: "从生成，到有人一起做",
    body: "适合希望长期打磨品牌与网站的人。无限量使用，配合 Aleks 的私人咨询与方向把关。",
    features: [
      "包含 Max 的全部能力",
      "无限量使用（公平使用政策）",
      "私人设计与创业产品咨询",
      "专属方向评审与优先支持",
    ],
    className: "ultra",
  },
];
export function Pricing() {
  const [selected, setSelected] = useState<string | null>(null);
  const [paymentStep, setPaymentStep] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState("");
  const dialog = useRef<HTMLDivElement>(null);
  const selectedPlan =
    plans.find((plan) => plan.name === selected) ??
    (selected === "一次性咨询"
      ? {
          name: "一次性咨询",
          price: null,
          tag: "先把方向，聊清楚。",
          body: "与 Aleks 一起梳理产品定位、网站结构和设计方向，适合准备启动项目或需要一次集中建议的人。",
          features: [
            "产品定位与目标用户梳理",
            "网站页面结构与内容建议",
            "设计方向评审与下一步行动建议",
          ],
          className: "consultation",
        }
      : undefined);
  const openPlan = (name: string) => {
    setPaymentStep(false);
    setPaymentMethod(null);
    setPaymentStatus("");
    setSelected(name);
  };
  useEffect(() => {
    if (!selected) return;
    const previous = document.activeElement as HTMLElement;
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.current?.focus({ preventScroll: true });
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected(null);
      if (event.key === "Tab") {
        const nodes =
          dialog.current?.querySelectorAll<HTMLElement>("a[href],button");
        if (!nodes?.length) return;
        const first = nodes[0],
          last = nodes[nodes.length - 1];
        if (
          event.shiftKey &&
          (document.activeElement === first ||
            document.activeElement === dialog.current)
        ) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", key);
    return () => {
      window.removeEventListener("keydown", key);
      document.body.style.overflow = overflow;
      previous?.focus({ preventScroll: true });
      window.scrollTo(scrollX, scrollY);
    };
  }, [selected]);
  return (
    <>
      <main className="pricing-page page-shell">
        <header className="pricing-heading">
          <p className="small-label">一份想法，找到合适的投入。</p>
          <h1>
            从开始，
            <br />
            到认真做下去。
          </h1>
          <div>
            <p>
              选择你的节奏。
              <br />
              工具负责执行，你保留判断。
            </p>
            <span className="pricing-period glass-surface">按月订阅 · USD</span>
          </div>
        </header>
        <p className="pricing-disclosure">
          AI 生成 API 未配置；支付接口未接入，选择付款方式不会扣款。
        </p>
        <div className="pricing-grid">
          {plans.map((plan) => (
            <article key={plan.name} className={`price-plan ${plan.className}`}>
              <div className="plan-top">
                <h2>{plan.name}</h2>
                {plan.name === "Plus" && <span>创作者之选</span>}
              </div>
              <div className="plan-price">
                {plan.price ? (
                  <>
                    <b>${plan.price}</b>
                    <span>/ 月</span>
                  </>
                ) : (
                  <b className="quote-price">联系报价</b>
                )}
              </div>
              <h3>{plan.tag}</h3>
              <p>{plan.body}</p>
              <button
                className="button primary"
                onClick={() => openPlan(plan.name)}
              >
                {plan.price ? "了解 " + plan.name : "了解 Ultra"}
                <Icon name="arrow" />
              </button>
              <ul>
                {plan.features.map((x) => (
                  <li key={x}>
                    <Icon name="check" size={14} />
                    {x}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <section className="consultation-band">
          <div>
            <span className="small-label">一次性咨询</span>
            <h2>先把方向，聊清楚。</h2>
            <p>
              与 Aleks 一起梳理产品定位、网站结构和设计方向。
              <br />
              适合准备启动项目、希望获得一次集中建议的人。
            </p>
          </div>
          <div>
            <b>按项目联系报价</b>
            <p>需求梳理 · 页面与内容建议 · 设计方向评审</p>
            <button
              className="button secondary"
              onClick={() => openPlan("一次性咨询")}
            >
              了解咨询
              <Icon name="arrow" />
            </button>
          </div>
        </section>
        <section className="price-faq">
          <h2>开始之前。</h2>
          <details>
            <summary>“无限量使用”具体指什么？</summary>
            <p>
              Ultra
              拟提供个人正常使用范围内的无限量生成和修改。自动化滥用、转售接口及异常资源消耗不包含在内，正式开放前会公布公平使用政策。
            </p>
          </details>
          <details>
            <summary>现在能订阅或付款吗？</summary>
            <p>
              套餐详情可查看并选择常用支付方式。支付接口接通前不会创建订单或扣款。
            </p>
          </details>
          <details>
            <summary>网站可以带走吗？</summary>
            <p>
              当前工作台支持导出完整静态 HTML、CSS
              与图片素材，使用任意静态服务器独立运行。
            </p>
          </details>
        </section>
      </main>
      {selected &&
        createPortal(
          <div
            className="plan-backdrop"
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelected(null);
            }}
          >
            <div
              ref={dialog}
              tabIndex={-1}
              className="plan-info glass-surface"
              role="dialog"
              aria-modal="true"
              aria-label={selected + " 方案说明"}
            >
              <button
                className="icon-button"
                aria-label="关闭方案说明"
                onClick={() => setSelected(null)}
              >
                <Icon name="close" />
              </button>
              {selectedPlan && (
                <>
                  <p className="small-label">
                    {selectedPlan.name} /{" "}
                    {paymentStep ? "选择支付方式" : "方案详情"}
                  </p>
                  <h2>{selectedPlan.name}</h2>
                  <p className="plan-info-tag">{selectedPlan.tag}</p>
                  <p className="plan-info-copy">{selectedPlan.body}</p>
                  <ul className="plan-info-features">
                    {selectedPlan.features.map((feature) => (
                      <li key={feature}>
                        <Icon name="check" size={15} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  {!paymentStep ? (
                    <>
                      <div className="plan-info-price">
                        {selectedPlan.price ? (
                          <>
                            <b>${selectedPlan.price}</b>
                            <span>/ 月，按月订阅</span>
                          </>
                        ) : (
                          <b className="plan-info-quote">联系报价</b>
                        )}
                      </div>
                      {selectedPlan.price ? (
                        <button
                          className="button primary"
                          onClick={() => setPaymentStep(true)}
                        >
                          选择支付方式 <Icon name="arrow" />
                        </button>
                      ) : (
                        <a className="button primary" href="/about">
                          联系 Aleks 了解咨询 <Icon name="arrow" />
                        </a>
                      )}
                      <p className="payment-disclosure">
                        支付接口未配置。现在不会创建订单或扣款。
                      </p>
                    </>
                  ) : (
                    <>
                      <div
                        className="payment-methods"
                        role="group"
                        aria-label="支付方式"
                      >
                        {["微信支付", "支付宝", "银联云闪付"].map((method) => (
                          <button
                            key={method}
                            type="button"
                            className={
                              paymentMethod === method ? "selected" : ""
                            }
                            aria-pressed={paymentMethod === method}
                            onClick={() => {
                              setPaymentMethod(method);
                              setPaymentStatus("");
                            }}
                          >
                            <span
                              className="payment-method-mark"
                              aria-hidden="true"
                            >
                              {method === "微信支付"
                                ? "微"
                                : method === "支付宝"
                                  ? "支"
                                  : "银"}
                            </span>
                            {method}
                          </button>
                        ))}
                      </div>
                      <button
                        className="button primary"
                        disabled={!paymentMethod}
                        onClick={() =>
                          setPaymentStatus(
                            "支付接口未配置，暂不能收款。没有创建订单，也不会扣款。",
                          )
                        }
                      >
                        确认支付 · ${selectedPlan.price} / 月{" "}
                        <Icon name="arrow" />
                      </button>
                      {paymentStatus && (
                        <p className="payment-status" role="status">
                          {paymentStatus}
                        </p>
                      )}
                      <button
                        className="text-button"
                        onClick={() => {
                          setPaymentStep(false);
                          setPaymentMethod(null);
                          setPaymentStatus("");
                        }}
                      >
                        返回套餐详情
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
export function CreatorAbout() {
  return (
    <main className="creator-page page-shell">
      <header className="creator-heading">
        <p className="small-label">关于构页，也关于创造它的人。</p>
        <h1>
          把想法，
          <br />
          做成值得使用的东西。
        </h1>
      </header>
      <section className="creator-profile">
        <figure>
          <img
            src="/images/aleks-placeholder.jpg"
            alt="Aleks 的临时形象图，来自 Pexels，非本人照片"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              e.currentTarget.parentElement?.classList.add("portrait-fallback");
            }}
          />
          <figcaption>
            临时形象图，非本人照片 ·{" "}
            <a
              href="https://www.pexels.com/photo/man-wearing-blue-crew-neck-t-shirt-2379004/"
              target="_blank"
              rel="noreferrer"
            >
              Pexels / 来源与摄影
            </a>
          </figcaption>
        </figure>
        <article>
          <p className="creator-name">Aleks</p>
          <h2>
            Start-up
            <br />
            Business Designer.
          </h2>
          <p className="creator-bio">
            关注创业中的真实问题，也着迷于编程与设计的交汇。我习惯从模糊的想法出发，梳理产品逻辑，再用代码与视觉让它成为可体验的作品。构页是这份探索的延伸：让好的表达，不必止步于技术门槛。
          </p>
          <div className="creator-tags">
            <span>产品思考</span>
            <span>设计表达</span>
            <span>用代码验证</span>
          </div>
        </article>
      </section>
      <section className="creator-belief">
        <span>为什么做 FRAME</span>
        <h2>
          让工具更有能力，
          <br />
          让创作者更有主见。
        </h2>
        <p>
          先理解内容，再选择表达。构页把参考、页面、设计规则与可运行的网站放在同一个工作空间里，让你看得见结果，也始终能够修改它。
        </p>
        <a href="/workspace" className="button primary">
          进入工作室
          <Icon name="arrow" />
        </a>
      </section>
    </main>
  );
}
