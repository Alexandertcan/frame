import { isSpaceSite } from "./space-demo.ts";
import { spaceFiles } from "./space-files.ts";
export type Direction = "editorial" | "studio" | "precision";
export type Asset = { name: string; data: string };
export type PageDraft = { title: string; slug: string };
export type Brief = {
  name: string;
  purpose: string;
  audience: string;
  content: string;
  pages: PageDraft[];
  assets: Asset[];
  referenceIds: string[];
  referenceUrl?: string;
};
export type Section = { id: string; title: string; body: string };
export type SitePage = {
  id: string;
  title: string;
  slug: string;
  eyebrow: string;
  headline: string;
  description: string;
  sections: Section[];
};
export type Site = {
  name: string;
  direction: Direction;
  accent: string;
  pages: SitePage[];
  assets: Asset[];
};
export type Project = {
  id: string;
  name: string;
  updated: string;
  brief: Brief;
  site: Site;
  initial: Site;
  history: Site[];
  referenceIds: string[];
  messages: { role: "user" | "assistant"; text: string }[];
};
export const directions: {
  id: Direction;
  name: string;
  en: string;
  reason: string;
  layout: string;
  font: string;
  colors: string[];
  reference: string;
}[] = [
  {
    id: "editorial",
    name: "静物叙事",
    en: "Quiet editorial",
    reason: "让材质与内容成为主角，适合品牌故事、生活方式和独立设计。",
    layout: "非对称分栏 · 大幅静物 · 留白长文",
    font: "Georgia 展示字 / 系统中文正文",
    colors: ["#eeebe3", "#252923", "#b5aa80"],
    reference: "Léo Parpeix",
  },
  {
    id: "precision",
    name: "鲜明秩序",
    en: "Bold precision",
    reason: "先表达观点，再展示细节，适合产品发布、科技与创意服务。",
    layout: "强对比大字 · 模块网格 · 紧凑导航",
    font: "Arial Black 展示字 / 系统中文正文",
    colors: ["#191b1a", "#f3f2ea", "#f1d745"],
    reference: "Nick Ho",
  },
  {
    id: "studio",
    name: "温暖工作室",
    en: "Human studio",
    reason: "用清楚的内容和亲切的视觉建立信任，适合团队、服务和小型商家。",
    layout: "居中标题 · 双列介绍 · 明确行动入口",
    font: "系统无衬线 / 舒展的阅读行距",
    colors: ["#f2eee5", "#254a40", "#cad4bc"],
    reference: "Felix Rieseberg",
  },
];
export const emptyBrief: Brief = {
  name: "",
  purpose: "",
  audience: "",
  content: "",
  pages: [
    { title: "首页", slug: "index" },
    { title: "关于", slug: "about" },
    { title: "产品", slug: "product" },
  ],
  assets: [],
  referenceIds: [],
};
export const sampleBrief: Brief = {
  ...emptyBrief,
  name: "MORROW 木间",
  purpose: "为一个关注日常生活的家具与器物品牌，创建品牌官网。",
  audience: "喜欢自然材质与安静设计的年轻家庭、独立设计爱好者。",
  content:
    "让日常，值得停留。我们用天然材质与克制的设计，制作可以长久陪伴的家具与器物。\n每一处细节，从真实的生活开始。\n产品包括原木座椅、陶瓷花器与阅读灯。",
};
export function demoSite(b: Brief, d: Direction): Site {
  const dir = directions.find((x) => x.id === d)!;
  const intro = b.content
    .trim()
    .split(/[\n。]/)
    .filter(Boolean);
  const name = b.name.trim() || "我的网站";
  return {
    name,
    direction: d,
    accent: dir.colors[2],
    assets: b.assets,
    pages: b.pages.map((p, i) => ({
      id: `page-${i}`,
      title: p.title,
      slug: p.slug,
      eyebrow: i === 0 ? "Thoughtful by design" : p.title,
      headline:
        i === 0
          ? intro[0] || `为${b.audience || "每一个人"}，创造新的可能`
          : p.title.includes("关于")
            ? "好的设计，从理解生活开始。"
            : p.title.includes("联系")
              ? "让我们，一起开始。"
              : p.title.includes("产品")
                ? "为日常，认真设计。"
                : p.title,
      description:
        i === 0
          ? intro[1] || b.purpose || "让想法成为可以体验的网站。"
          : p.title.includes("关于")
            ? b.purpose || "我们相信清晰、实用与长久的价值。"
            : p.title.includes("联系")
              ? "有想法，或想进一步了解？欢迎通过 hello@example.com 联系我们。"
              : intro[2] || b.content || "探索我们的产品、服务与设计细节。",
      sections: [
        {
          id: `s-${i}-0`,
          title: /product|产品/.test(p.slug + p.title)
            ? "第一件作品"
            : i === 0
              ? "从日常出发"
              : i === 1
                ? "我们的方式"
                : "关注每一处细节",
          body:
            b.content ||
            "从真实的需求出发，选择合适的材料，反复打磨每一个细节。",
        },
        {
          id: `s-${i}-1`,
          title: /product|产品/.test(p.slug + p.title)
            ? "另一个日常选择"
            : i === 0
              ? "少一点喧闹，多一点感受"
              : i === 1
                ? "让想法落地"
                : "属于你的日常",
          body: `为${(b.audience || "重视品质的人").replace(/[。！.!]+$/, "")}而设计。${b.purpose || "通过有温度的设计，让日常变得更好。"}`,
        },
      ],
    })),
  };
}
export function validateSite(s: Site): Site {
  if (
    !s ||
    typeof s.name !== "string" ||
    s.name.length > 160 ||
    !directions.some((x) => x.id === s.direction) ||
    !/^#[0-9a-f]{6}$/i.test(s.accent)
  )
    throw Error("站点品牌或设计规则无效");
  if (!Array.isArray(s.pages) || s.pages.length < 1 || s.pages.length > 12)
    throw Error("网站需要 1–12 个页面");
  const paths = new Set<string>();
  for (const p of s.pages) {
    if (
      !/^(index|[a-z][a-z0-9-]{0,35})$/.test(p.slug) ||
      ["styles", "assets", "readme"].includes(p.slug) ||
      paths.has(p.slug)
    )
      throw Error("页面路径无效或重复");
    paths.add(p.slug);
    for (const key of [
      "id",
      "title",
      "eyebrow",
      "headline",
      "description",
    ] as const)
      if (typeof p[key] !== "string" || p[key].length > 12000)
        throw Error("页面内容无效");
    if (!Array.isArray(p.sections) || p.sections.length > 20)
      throw Error("页面板块无效");
    for (const sec of p.sections)
      if (
        typeof sec.id !== "string" ||
        typeof sec.title !== "string" ||
        typeof sec.body !== "string" ||
        sec.body.length > 20000
      )
        throw Error("板块内容无效");
  }
  if (!paths.has("index")) throw Error("网站需要首页 index");
  if (!Array.isArray(s.assets) || s.assets.length > 8)
    throw Error("素材数量无效");
  if (
    s.assets.reduce(
      (n, a) => n + (typeof a.data === "string" ? a.data.length : 0),
      0,
    ) > 2000000
  )
    throw Error("素材总量过大，请减少图片数量");
  for (const a of s.assets) {
    if (
      typeof a.name !== "string" ||
      typeof a.data !== "string" ||
      !/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(a.data) ||
      a.data.length > 2800000
    )
      throw Error("素材仅支持 2MB 内的 PNG、JPEG、WebP");
  }
  return s;
}
export const escapeHtml = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
export const stillLife = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 1000"><defs><linearGradient id="bg" x2="1" y2="1"><stop stop-color="#d1cbbc"/><stop offset="1" stop-color="#a8ad9c"/></linearGradient><linearGradient id="v"><stop stop-color="#f6f2e8"/><stop offset=".5" stop-color="#c8c5b7"/><stop offset="1" stop-color="#e6e2d4"/></linearGradient><radialGradient id="sh"><stop stop-color="#343d2c" stop-opacity=".3"/><stop offset="1" stop-color="#343d2c" stop-opacity="0"/></radialGradient><filter id="blur"><feGaussianBlur stdDeviation="20"/></filter></defs><path fill="url(#bg)" d="M0 0h900v1000H0z"/><path fill="#f4efe2" opacity=".23" d="m0 0 580 0L0 750z"/><ellipse cx="490" cy="825" rx="310" ry="74" fill="url(#sh)" filter="url(#blur)"/><path fill="#a69d86" d="M130 690h640v20H130z"/><path fill="#c3b8a0" d="M130 710h640v290H130z"/><path fill="#b4a990" d="M155 710h70v290h-70zM675 710h70v290h-70z"/><path d="M370 345q-40 30-27 85l-55 160q-30 110 142 110t142-110l-55-160q13-55-27-85z" fill="url(#v)"/><ellipse cx="430" cy="345" rx="60" ry="17" fill="#a09d8f"/><ellipse cx="430" cy="345" rx="49" ry="11" fill="#696d60"/><path d="M430 348q-25-148 40-261M437 282q-110-55-115-129M442 227q94-28 114-111" fill="none" stroke="#696f4d" stroke-width="6"/><path d="M470 90q-86 25-35 107 66-57 35-107M322 154q-58 79 71 111-5-85-71-111M556 117q-95-22-104 91 95-1 104-91" fill="#626e4c"/><path d="M215 650h130v30H215z" fill="#ebdfbb"/><path d="M226 626h125v23H226z" fill="#717c68"/></svg>`;
export function siteFiles(site: Site): Record<string, string> {
  const s = validateSite(site);
  if (isSpaceSite(s)) return spaceFiles(s, escapeHtml);
  const e = escapeHtml;
  const dir = s.direction;
  const rgb = s.accent
    .slice(1)
    .match(/../g)!
    .map((v) => {
      const c = parseInt(v, 16) / 255;
      return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
  const onAccent =
    rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722 > 0.179
      ? "#1b211c"
      : "#fffdf4";
  const files: Record<string, string> = { "assets/still-life.svg": stillLife };
  const first = s.assets[0];
  let img = "assets/still-life.svg";
  s.assets.forEach((asset, index) => {
    const ext = asset.data.split(";")[0].split("/")[1];
    const path = `assets/upload${index ? `-${index + 1}` : ""}.${ext}`;
    files[path] = asset.data;
    if (index === 0) img = path;
  });
  const nav = s.pages
    .map((p) => `<a href="${p.slug}.html">${e(p.title)}</a>`)
    .join("");
  files["styles.css"] =
    `*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:${dir === "precision" ? "#191b1a" : dir === "studio" ? "#f2eee5" : "#eeebe3"};color:${dir === "precision" ? "#f3f2ea" : "#252923"};font-family:Arial,"PingFang SC","Microsoft YaHei",sans-serif}a{color:inherit;text-decoration:none}a:focus-visible,button:focus-visible{outline:3px solid ${s.accent};outline-offset:5px}header,footer{display:flex;justify-content:space-between;align-items:center;padding:26px 5%;gap:25px}header{border-bottom:1px solid #8885}.brand{font-size:23px;font-weight:700;letter-spacing:-1px}nav{display:flex;gap:26px;font-size:13px;flex-wrap:wrap}.hero{display:grid;grid-template-columns:1fr 1fr;min-height:700px;align-items:center;gap:5%;padding:50px 5% 75px}.hero-copy{max-width:630px}.eyebrow{font-size:12px;letter-spacing:1px;margin-bottom:45px}h1{font-family:${dir === "editorial" ? 'Georgia,"Songti SC",serif' : dir === "precision" ? "Arial Black,Arial,sans-serif" : 'Arial,"PingFang SC",sans-serif'};font-size:clamp(40px,5.3vw,83px);font-weight:${dir === "editorial" ? "400" : "700"};letter-spacing:-.05em;line-height:1.12;text-wrap:balance;overflow-wrap:anywhere;margin:0 0 30px}p{font-size:16px;line-height:1.9;white-space:pre-line;max-width:620px}.hero img{width:100%;height:570px;object-fit:cover;display:block}.cta{display:inline-block;background:${s.accent};color:${onAccent};padding:16px 24px;margin-top:28px;font-size:13px;border-radius:${dir === "studio" ? "30px" : "0"}}.caption{font-size:10px;letter-spacing:1px;margin:15px 0}.section{padding:75px 5%;border-top:1px solid #8885;display:grid;grid-template-columns:1fr 1fr;gap:7%}h2{font-weight:400;font-size:clamp(27px,3vw,45px);letter-spacing:-.04em;margin:0}.section p{margin:0}footer{border-top:1px solid #8885;font-size:12px}.studio .hero{display:flex;flex-direction:column;text-align:center;padding-top:70px}.studio .hero-copy{max-width:850px}.studio .hero-copy p{margin:auto}.studio .hero img{height:500px;max-width:1100px}.studio .eyebrow{margin-bottom:25px}.precision .hero{gap:0}.precision h1{font-size:clamp(45px,6.5vw,100px);text-transform:uppercase}.precision .hero img{filter:grayscale(1)}@media(max-width:700px){header{align-items:flex-start}.brand{font-size:19px}nav{gap:14px;font-size:12px}.hero{grid-template-columns:1fr;padding-top:45px;min-height:0;gap:40px}.hero img{height:400px}.section{grid-template-columns:1fr;gap:25px;padding-top:45px;padding-bottom:45px}footer{align-items:flex-start;flex-direction:column}.eyebrow{margin-bottom:25px}.studio .hero img{height:350px}}@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}}`;
  files["styles.css"] +=
    ` .page-about .hero{grid-template-columns:1.25fr .75fr;min-height:540px}.page-about .hero img{height:390px}.page-about .section{grid-template-columns:.7fr 1.3fr}.page-product .hero{min-height:400px;padding-top:60px;padding-bottom:60px}.page-product .hero img{height:330px}.product-grid{display:grid;grid-template-columns:1fr 1fr;gap:50px;padding:70px 5%;border-top:1px solid #8885}.product-item img{width:100%;height:340px;object-fit:cover}.product-index{font-size:12px;margin:25px 0 15px;opacity:.6}.product-item h2{font-size:30px}.product-item p{font-size:14px}.page-contact .hero{min-height:450px}.page-contact .hero img{height:330px}.contact-strip{padding:70px 5%;background:${s.accent};color:${onAccent}}.contact-strip a{font-size:clamp(20px,3vw,45px);display:inline-block;border-bottom:1px solid;margin-top:25px}.contact-strip p{font-size:12px}.studio.page-about .hero,.studio.page-product .hero{display:grid;text-align:left}.page-about .hero-copy h1{font-size:clamp(40px,5vw,70px)}@media(max-width:700px){.page-about .hero,.studio.page-about .hero,.studio.page-product .hero{display:grid;grid-template-columns:1fr}.page-about .hero img{height:340px}.page-about .section{grid-template-columns:1fr}.product-grid{grid-template-columns:1fr;padding-top:40px;padding-bottom:40px;gap:40px}.product-item img{height:350px}.page-product .hero img{height:310px}.page-contact .hero img{height:300px}}`;
  for (const [i, p] of s.pages.entries()) {
    const kind =
      p.slug === "index"
        ? "home"
        : /about|关于|我们/.test(p.slug + p.title)
          ? "about"
          : /product|产品|服务/.test(p.slug + p.title)
            ? "product"
            : /contact|联系/.test(p.slug + p.title)
              ? "contact"
              : "content";
    const sections =
      kind === "product"
        ? `<div class="product-grid">${p.sections.map((sec, j) => `<article class="product-item"><img src="${img}" alt="${e(sec.title)} · 概念插画" style="object-position:${j % 2 ? "left" : "right"} center"><div class="product-index">${String(j + 1).padStart(2, "0")}</div><h2>${e(sec.title)}</h2><p>${e(sec.body)}</p></article>`).join("")}</div>`
        : p.sections
            .map(
              (sec) =>
                `<section class="section"><h2>${e(sec.title)}</h2><p>${e(sec.body)}</p></section>`,
            )
            .join("");
    files[p.slug + ".html"] =
      `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; font-src 'self'; base-uri 'none'; form-action 'none'"><title>${e(p.title)} — ${e(s.name)}</title><link rel="stylesheet" href="styles.css"></head><body class="${dir} page-${kind}"><header><a class="brand" href="index.html">${e(s.name)}</a><nav aria-label="主导航">${nav}</nav></header><main><section class="hero"><div class="hero-copy"><div class="eyebrow">${e(p.eyebrow)}</div><h1>${e(p.headline)}</h1><p>${e(p.description)}</p><a class="cta" href="${s.pages[(i + 1) % s.pages.length].slug}.html">${i === 0 ? "探索更多" : "继续浏览"} ↗</a></div><figure style="margin:0"><img src="${img}" alt="${first ? e(first.name) : "概念静物插画：器物、木桌与枝叶"}"><figcaption class="caption">${first ? "品牌素材" : "FRAME 原创概念插画"} / ${String(i + 1).padStart(2, "0")}</figcaption></figure></section>${sections}${kind === "contact" ? '<section class="contact-strip"><h2>期待听到你的想法。</h2><a href="mailto:hello@example.com">hello@example.com ↗</a><p>联系邮箱为占位地址，请替换为真实地址。</p></section>' : ""}</main><footer><a class="brand" href="index.html">${e(s.name)}</a><nav>${nav}</nav><span>Designed with FRAME</span></footer></body></html>`;
  }
  files["README.txt"] =
    "FRAME 静态多页网站\n在当前目录运行：python3 -m http.server 8080\n打开 http://localhost:8080\n无需 Node.js 或构建。上传素材已包含，页面共用 styles.css。\n本文件由 FRAME 静态导出流程生成；请在发布前审核文案与素材权利。\n";
  return files;
}
export function previewDocument(s: Site, pageId: string): string {
  const files = siteFiles(s);
  const page = s.pages.find((p) => p.id === pageId) || s.pages[0];
  let html = files[page.slug + ".html"]
    .replace(
      '<link rel="stylesheet" href="styles.css">',
      `<style>${files["styles.css"]}</style>`,
    )
    .replace("img-src 'self' data:", "img-src data:");
  for (const p of s.pages)
    html = html.replaceAll(
      `href="${p.slug}.html"`,
      `href="#frame-page-${p.id}"`,
    );
  const source =
    s.assets[0]?.data ||
    "data:image/svg+xml;charset=utf-8," + encodeURIComponent(stillLife);
  html = html.replace(/src="assets\/[^"]+"/g, `src="${source}"`);
  return html;
}
export function applyDemoEdit(
  site: Site,
  pageId: string,
  scope: "page" | "global",
  instruction: string,
): { site: Site; message: string; changed: boolean } {
  const s = structuredClone(site);
  if (scope === "global") {
    if (/蓝/.test(instruction)) {
      s.accent = "#345b76";
      return {
        site: s,
        message: "已将全站共享强调色更新为蓝色，所有页面共用相同样式。",
        changed: true,
      };
    }
    if (/黄/.test(instruction)) {
      s.accent = "#f1d745";
      return {
        site: s,
        message: "已将全站共享强调色更新为信号黄。",
        changed: true,
      };
    }
    if (/绿/.test(instruction)) {
      s.accent = "#a8bd9b";
      return {
        site: s,
        message: "已将全站共享强调色更新为柔和绿。",
        changed: true,
      };
    }
  } else {
    const p = s.pages.find((p) => p.id === pageId)!;
    const title = instruction.match(/标题[：:]\s*(.+)/);
    const desc = instruction.match(/描述[：:]\s*(.+)/);
    if (title || desc) {
      if (title) p.headline = title[1].trim();
      if (desc) p.description = desc[1].trim();
      return {
        site: s,
        message: "已更新当前页面，其他页面保持一致的共享设计。",
        changed: true,
      };
    }
    if (/简洁|精简/.test(instruction)) {
      p.description = p.description.split(/[。！\n]/)[0] + "。";
      return {
        site: s,
        message: "已精简当前页面描述。你可以在内容编辑中继续调整。",
        changed: true,
      };
    }
  }
  return {
    site,
    message:
      "本地指令支持“标题：…”、“描述：…”、“精简文案”，以及全站“改成蓝色 / 黄色 / 绿色”。其他自然语言修改需接入真实模型。",
    changed: false,
  };
}
// Store each image once, including across undo history and duplicated projects.
export function packProjects(projects: Project[]): string {
  const blobs: Record<string, string> = {};
  const seen = new Map<string, string>();
  const data = JSON.parse(
    JSON.stringify(projects, (key, value) => {
      if (
        key === "data" &&
        typeof value === "string" &&
        value.startsWith("data:image/")
      ) {
        let id = seen.get(value);
        if (!id) {
          id = "image-" + seen.size;
          seen.set(value, id);
          blobs[id] = value;
        }
        return { $image: id };
      }
      return value;
    }),
  );
  return JSON.stringify({ version: 2, projects: data, blobs });
}
export function unpackProjects(raw: string | null): Project[] {
  if (!raw) return [];
  const bundle = JSON.parse(raw);
  const projects = Array.isArray(bundle)
    ? bundle
    : bundle.version === 2
      ? JSON.parse(JSON.stringify(bundle.projects), (key, value) =>
          key === "data" && value?.$image ? bundle.blobs[value.$image] : value,
        )
      : null;
  if (!Array.isArray(projects)) throw Error("项目存储格式无效");
  for (const p of projects) {
    if (
      typeof p.id !== "string" ||
      typeof p.name !== "string" ||
      !p.brief ||
      !Array.isArray(p.referenceIds) ||
      !Array.isArray(p.messages) ||
      !Array.isArray(p.history)
    )
      throw Error("项目数据不完整");
    validateSite(p.site);
    validateSite(p.initial);
    p.history.forEach(validateSite);
  }
  return projects;
}
