import { spacePoster } from "./space-poster.ts";
import { earthTexture, cloudTexture } from "./space-earth.ts";
import type { Site, SitePage } from "./core";
import { spaceSceneScript, spaceSceneHash } from "./space-scene.ts";
import { spaceStyles } from "./space-style.ts";
const mark = `<svg class="si-mark" viewBox="0 0 48 48" aria-hidden="true"><path d="M33 9H18L9 24l10 15h14l6-10H24l-6-10h15" fill="none" stroke="currentColor" stroke-width="3"/><ellipse cx="24" cy="24" rx="23" ry="9" transform="rotate(-38 24 24)" fill="none" stroke="currentColor" stroke-width="1"/></svg>`;
const globe = `<img src="${spacePoster}" alt="地球与 ASTER 轨道舱的静态视图">`;
const orbitDrawing = `<svg viewBox="0 0 600 460" aria-hidden="true" class="orbit-drawing"><defs><linearGradient id="metal"><stop stop-color="#d2e1ea"/><stop offset=".33" stop-color="#394f62"/><stop offset=".55" stop-color="#b4c9d7"/><stop offset="1" stop-color="#233747"/></linearGradient></defs><g fill="none" stroke="#91bed0" opacity=".18"><path d="M40 60h520M40 150h520M40 240h520M40 330h520M40 420h520M80 30v400M190 30v400M300 30v400M410 30v400M520 30v400"/><circle cx="300" cy="230" r="180" stroke-dasharray="3 6"/></g><g transform="translate(300 235) rotate(-24)"><ellipse rx="192" ry="90" fill="#07121e" stroke="url(#metal)" stroke-width="28"/><ellipse cy="-8" rx="192" ry="90" stroke="#c2d6e1" stroke-width="2"/><ellipse cy="8" rx="192" ry="90" stroke="#172733" stroke-width="5"/><path d="M-183 0h366M0-88v176" stroke="url(#metal)" stroke-width="12"/><path d="M-167-17h32M-105-62h36M-18-77h36M69-62h36M137-15h28M104 61h31M-18 77h36M-134 61h31" stroke="#85b9d2" stroke-width="6"/><rect x="-36" y="-77" width="72" height="154" rx="31" fill="url(#metal)" stroke="#aac7d9" stroke-width="2"/><rect x="-22" y="-51" width="44" height="46" rx="14" fill="#132c3d" stroke="#9fc5d6"/><path d="M-19 48h38" stroke="#dce6eb" stroke-width="3"/></g><g fill="#9ab7c9" font-size="10" font-family="monospace"><text x="30" y="45">ASTER / SYSTEM STUDY</text><text x="405" y="425">CONCEPT GEOMETRY</text></g><g stroke="#91bed0" fill="none" opacity=".6"><path d="M410 130h115v-30M185 300H75v48"/><circle cx="410" cy="130" r="3"/><circle cx="185" cy="300" r="3"/></g></svg>`;
export function spaceFiles(
  site: Site,
  e: (value: string) => string,
): Record<string, string> {
  const files: Record<string, string> = {
    "assets/orbital-poster.jpg": spacePoster,
    "styles.css": `:root{--accent:${site.accent};}\n${spaceStyles}`,
  };
  site.assets.forEach((a, i) => {
    files[`assets/upload-${i + 1}.${a.data.split(";")[0].split("/")[1]}`] =
      a.data;
  });
  const has = (slug: string) => site.pages.some((p) => p.slug === slug);
  const href = (slug: string, anchor = "") =>
    (has(slug) ? slug : "index") + ".html" + anchor;
  const brand = `<a class="si-brand" href="index.html" aria-label="${e(site.name)} 首页">${mark}<span>${e(site.name).replace("SUPER INTELLIGENCE", "SUPER<br>INTELLIGENCE")}</span></a>`;
  const nav = (active: string) =>
    site.pages
      .map(
        (p) =>
          `<a href="${p.slug}.html"${p.slug === active ? ' aria-current="page"' : ""}>${e(p.title)}</a>`,
      )
      .join("");
  const subhead = (p: SitePage) =>
    `<section class="si-page-heading"><p class="si-kicker"><i></i>${e(p.eyebrow)}</p><h1>${e(p.headline)}</h1><p class="si-intro">${e(p.description)}</p></section>`;
  const story = (p: SitePage) =>
    p.sections
      .map(
        (s, i) =>
          `<section class="si-story" id="section-${i}"><span class="si-section-index">${String(i + 1).padStart(2, "0")} / ${e(p.title)}</span><h2>${e(s.title)}</h2><p>${e(s.body)}</p></section>`,
      )
      .join("");
  const scene = (p: SitePage) =>
    `<section class="si-hero ${p.slug === "spacecraft" ? "si-hero-craft" : ""}" data-space-scene data-renderer="loading"><div class="si-scene-fallback">${globe}</div><img hidden data-earth-texture src="${earthTexture}" alt=""><img hidden data-cloud-texture src="${cloudTexture}" alt=""><canvas aria-label="NASA 地表影像与原创 ASTER 三维轨道舱"></canvas><div class="si-hero-shade"></div><div class="si-hero-copy"><p class="si-kicker"><i></i>${e(p.eyebrow)}</p><h1>${e(p.headline)}</h1><p>${e(p.description)}</p><div class="si-hero-actions"><a class="si-button" href="${href("journeys")}">探索旅程 <span>↗</span></a><a class="si-text-link" href="${href("spacecraft")}">认识 ASTER <span>↗</span></a></div></div><div class="si-scene-caption"><span data-scene-status role="status">正在准备 3D · 静态视图已就绪</span><button data-scene-toggle aria-pressed="false">暂停 3D 动画</button></div><div class="si-scene-coordinate" aria-hidden="true">EARTH / A NEW PERSPECTIVE<br><span>NASA EARTH / ORIGINAL ASTER MODEL</span></div><div class="si-hero-foot"><span>从地球出发。带着新的视角回来。</span><span>向下探索 <b>↓</b></span></div></section>`;
  const plans = (p: SitePage, prices = false) =>
    `<div class="si-plan-grid">${p.sections
      .slice(0, 3)
      .map(
        (s, i) =>
          `<article class="si-plan ${i === 1 ? "si-plan-featured" : ""}" id="${["horizon", "orbit", "lunar"][i]}"><div class="si-plan-visual si-plan-visual-${i}"><span>${["01 / THE EDGE", "02 / THE ORBIT", "03 / THE DISTANCE"][i]}</span><i class="si-mini-planet"></i><i class="si-mini-orbit"></i></div><div class="si-plan-content"><p class="si-section-index">${["A DIFFERENT ALTITUDE", "STAY A LITTLE LONGER", "A FUTURE CHAPTER"][i]}</p><h2>${e(s.title)}</h2>${prices ? `<p class="si-price">${e(s.body.match(/\$[\d,]+/)?.[0] || "Let’s talk.")} <small>${i < 2 ? "概念报价 / 人" + (i === 1 ? " · 起" : "") : "远期构想 · 未开放"}</small></p>` : ""}<p>${e(s.body)}</p><a class="${prices ? "si-button" : "si-text-link"}" href="${prices ? "#reserve" : href("pricing", "#reserve")}" data-plan="${["Horizon", "Orbit", "Lunar"][i]}">${prices ? "查看体验意向" : "了解旅行构想"} <span>↗</span></a></div></article>`,
      )
      .join("")}</div>`;
  for (const p of site.pages) {
    let main = "";
    if (p.slug === "index")
      main =
        scene(p) +
        `<div class="si-trust-strip"><span>${mark} IMAGINATION, ENGINEERED.</span><span>原创 3D / 六页可编辑站点</span><span class="si-concept-tag">虚构品牌样本</span></div><section class="si-home-intro"><p class="si-section-index">THE REASON WE GO</p><h2>${e(p.sections[0]?.title || "A different perspective.")}</h2><p>${e(p.sections[0]?.body || p.description)}</p><a class="si-text-link" href="${href("about")}">认识我们的理念 ↗</a></section><section class="si-home-journeys"><div class="si-section-heading"><div><p class="si-kicker">CHOOSE YOUR HORIZON</p><h2>${e(p.sections[1]?.title || "Your next horizon.")}</h2></div><p>${e(p.sections[1]?.body || "探索旅行构想。")}</p></div>${plans(site.pages.find((a) => a.slug === "journeys") || p)}</section><section class="si-engineering">${orbitDrawing}<div><p class="si-kicker">ASTER / VEHICLE CONCEPT</p><h2>${e(p.sections[2]?.title || "Built with intention.")}</h2><p>${e(p.sections[2]?.body || p.description)}</p><a class="si-button" href="${href("spacecraft")}">走近航天器 <span>↗</span></a></div></section>`;
    else if (p.slug === "journeys")
      main =
        subhead(p) +
        plans(p) +
        `<section class="si-sequence"><div><p class="si-kicker">BEFORE YOU DEPART</p><h2>${e(p.sections[3]?.title || "Your journey starts here.")}</h2><p>${e(p.sections[3]?.body || p.description)}</p></div><ol><li><b>01</b><span>理解旅程<small>介绍、问答与个性化意向</small></span></li><li><b>02</b><span>从容准备<small>地面熟悉与身体适应构想</small></span></li><li><b>03</b><span>换一个视角<small>把窗外的世界，带回日常</small></span></li></ol></section>`;
    else if (p.slug === "spacecraft")
      main =
        scene(p) +
        `<div class="si-spec-strip"><div><small>VEHICLE</small><b>ASTER</b></div><div><small>CONFIGURATION</small><b>Orbital habitat</b></div><div><small>DESIGN STATUS</small><b>Concept study</b></div><div><small>MODEL</small><b>Original geometry</b></div></div><section class="si-engineering">${orbitDrawing}<div><p class="si-kicker">THE VIEW IS THE POINT</p><h2>${e(p.sections[0]?.title || "Designed around the view.")}</h2><p>${e(p.sections[0]?.body || p.description)}</p></div></section>${story({ ...p, sections: p.sections.slice(1) })}`;
    else if (p.slug === "about")
      main =
        subhead(p) +
        `<section class="si-profile"><div class="si-profile-art">${orbitDrawing}<div class="si-profile-caption"><span>LV / SYSTEM ARCHITECTURE</span><b>Human curiosity.<br>Engineering discipline.</b><small>原创工程示意 / 虚构人物档案</small></div></div><div class="si-profile-copy"><p class="si-kicker">MEET THE MIND BEHIND ASTER</p><h2>${e(p.sections[0]?.title || "Dr. Lyra Voss")}</h2><span class="si-concept-tag">首席航空工程师 · 虚构人物</span><p>${e(p.sections[0]?.body || p.description)}</p><blockquote>“The most brilliant engineering<br>leaves room for wonder.”</blockquote><small>概念人物的原创叙事文案</small></div></section>${story({ ...p, sections: p.sections.slice(1) })}`;
    else if (p.slug === "news")
      main =
        subhead(p) +
        `<section class="si-news-list" aria-label="概念品牌新闻">${p.sections.map((s, i) => `<details class="si-news"><summary><span class="si-news-thumb">${i === 0 ? orbitDrawing : `<i class="si-mini-planet"></i><i class="si-mini-orbit"></i>`}</span><span class="si-news-summary"><small>${["2026.10.15 / DESIGN NOTES", "2026.10.10 / EXPERIENCE", "2026.10.02 / ENGINEERING"][i] || "CONCEPT NOTES"} · 概念记录</small><h2>${e(s.title)}</h2><span>阅读概念记录</span></span><b class="si-news-toggle">+</b></summary><div class="si-news-body"><p>${e(s.body)}</p><small>虚构品牌研究内容，不代表真实任务进展。</small></div></details>`).join("")}</section>`;
    else if (p.slug === "pricing")
      main =
        subhead(p) +
        `<p class="si-price-notice">概念报价。未开放真实预订，不接受付款或押金。</p>` +
        plans(p, true) +
        `<section class="si-reserve" id="reserve"><div><p class="si-kicker">YOUR NEXT CHAPTER</p><h2>${e(p.sections[3]?.title || "Begin with a conversation.")}</h2><p>${e(p.sections[3]?.body || p.description)}</p><span class="si-concept-tag">本机摘要 · 不发送个人信息</span></div><form data-interest-form><label>称呼<input name="name" autocomplete="name" required maxlength="80" placeholder="希望如何称呼你？"></label><label>邮箱<input name="email" type="email" autocomplete="email" required placeholder="you@example.com"></label><label>感兴趣的旅程<select name="journey" aria-label="感兴趣的旅程"><option>Horizon</option><option>Orbit</option><option>Lunar</option></select></label><button class="si-button" type="submit">生成本机意向摘要 <span>↗</span></button><p role="status" tabindex="-1"></p><small>没有账户、支付或真实航程预订。</small></form></section>`;
    else main = subhead(p) + story(p);
    const renderedSections =
      p.slug === "index"
        ? 3
        : ["journeys", "pricing"].includes(p.slug)
          ? 4
          : null;
    if (renderedSections !== null && p.sections.length > renderedSections)
      main += story({ ...p, sections: p.sections.slice(renderedSections) });
    const uploaded = site.assets
      .map(
        (a, i) =>
          `<figure><img loading="lazy" src="assets/upload-${i + 1}.${a.data.split(";")[0].split("/")[1]}" alt="${e(a.name)}"><figcaption>${e(a.name)}</figcaption></figure>`,
      )
      .join("");
    files[p.slug + ".html"] =
      `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#080f19"><meta name="description" content="${e(p.description)}"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'sha256-${spaceSceneHash}'; connect-src 'none'; base-uri 'none'; form-action 'none'"><title>${e(p.title)} — ${e(site.name)}</title><link rel="stylesheet" href="styles.css"></head><body class="si-site si-page-${p.slug}"><a class="si-skip" href="#main">跳转正文</a><header class="si-header">${brand}<nav aria-label="主导航">${nav(p.slug)}</nav><a class="si-header-cta" href="${href("pricing", "#reserve")}">规划旅程 <span>↗</span></a></header><main id="main">${main}${uploaded ? `<section class="si-uploaded">${uploaded}</section>` : ""}</main><footer class="si-footer"><div class="si-footer-top">${brand}<p>See the world.<br>Differently.</p><a class="si-text-link" href="${href("pricing", "#reserve")}">从一次对话开始 ↗</a></div><nav aria-label="页脚导航">${nav(p.slug)}</nav><div class="si-footer-bottom"><span>SUPER INTELLIGENCE / FRAME 原创概念品牌</span><span>虚构品牌、人物、新闻与价格 · 地表影像 NASA / GSFC</span></div></footer><script>${spaceSceneScript}</script></body></html>`;
  }
  files["ASSET-LICENSES.txt"] =
    "Earth surface: NASA / Goddard Space Flight Center, Blue Marble.\nSource: https://eoimages.gsfc.nasa.gov/images/imagerecords/57000/57730/land_ocean_ice_2048.png\nCloud map: https://eoimages.gsfc.nasa.gov/images/imagerecords/57000/57747/cloud_combined_2048.jpg\nUsage guidelines: https://www.nasa.gov/nasa-brand-center/images-and-media/\nNASA content generally is not subject to copyright in the United States; use is subject to its Media Usage Guidelines. NASA is acknowledged as source; no affiliation or endorsement is implied. No NASA logo is used. Converted to JPEG for this concept website.\nASTER geometry, scene code and interface: original FRAME concept work.\n";
  files["README.txt"] =
    "SUPER INTELLIGENCE / FRAME 原创六页太空旅行样本\n\n运行：python3 -m http.server 8080 --bind 127.0.0.1\n打开：http://127.0.0.1:8080/\n\n无需 Node.js、构建或外部 CDN。各页共用 styles.css；地表影像与原创 WebGL 轨道舱代码已内置于页面中。第三方素材来源与使用条款见 ASSET-LICENSES.txt。支持鼠标视角、暂停、减少动态效果及无 WebGL 静态回退。\n品牌、人物、航程、新闻与价格均为虚构概念。意向表单仅在当前页面生成摘要，不发送或存储个人信息，不接受真实预订或付款。上线前请替换概念文案并完成实际运营审核。\n";
  return files;
}
