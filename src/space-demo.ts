import type { Brief, Site, SitePage, Project } from "./core";

export const spaceBrief: Brief = {
  name: "SUPER INTELLIGENCE",
  purpose:
    "SUPER INTELLIGENCE 太空旅行概念品牌：用六个独立页面介绍旅行计划、航天器、工程团队、概念新闻与价格。",
  audience: "对太空、航空工程和探索体验感兴趣的未来旅行者。",
  content:
    "Beyond the ordinary.\n从地球出发，换一个角度理解我们的世界。以工程、想象力与更从容的旅行体验，构想下一段旅程。\n这是虚构品牌样本，航程、人物、新闻与价格均为概念内容，不接受真实预订。",
  pages: [
    { title: "首页", slug: "index" },
    { title: "旅行计划", slug: "journeys" },
    { title: "航天器", slug: "spacecraft" },
    { title: "关于", slug: "about" },
    { title: "新闻", slug: "news" },
    { title: "价格", slug: "pricing" },
  ],
  assets: [],
  referenceIds: ["leo", "nick"],
};
const page = (
  slug: string,
  title: string,
  eyebrow: string,
  headline: string,
  description: string,
  sections: [string, string][],
): SitePage => ({
  id: `si-${slug}`,
  slug,
  title,
  eyebrow,
  headline,
  description,
  sections: sections.map(([title, body], i) => ({
    id: `si-${slug}-${i}`,
    title,
    body,
  })),
});

export function spaceSite(): Site {
  return {
    name: spaceBrief.name,
    direction: "precision",
    accent: "#a7dcf5",
    assets: [],
    pages: [
      page(
        "index",
        "首页",
        "A new perspective awaits",
        "Beyond\nthe ordinary.",
        "地球，值得从另一个角度看。\n为心怀好奇的人，构想一次更从容的太空旅行。",
        [
          [
            "A small step.\nAn entirely new world.",
            "离开熟悉的地平线，并不是为了远离地球。\n而是为了重新看见它。每一段旅程，从理解、准备和一次认真的对话开始。",
          ],
          [
            "Your next horizon.",
            "从近地观景到轨道驻留，探索三种不同的旅行构想。真实航程取决于未来技术验证、许可与运营条件。",
          ],
          [
            "Built with intention.",
            "宽幅观景舷窗、分区座舱与全程准备计划。让复杂的工程，成为更平静的体验。",
          ],
        ],
      ),
      page(
        "journeys",
        "旅行计划",
        "Choose your perspective",
        "Some journeys\nchange everything.",
        "从一次越过地平线的相遇，到一段与地球同频的驻留。\n选择你想带回来的视角。",
        [
          [
            "Horizon / 地平线",
            "亚轨道观景构想。以地球曲线与失重体验为核心，包含地面介绍、适应训练及飞行后回顾。",
          ],
          [
            "Orbit / 轨道",
            "近地轨道驻留构想。为愿意慢下来的人设计，把日出、海岸与夜晚的灯光留在窗外。",
          ],
          [
            "Lunar / 远月",
            "月球飞越远期构想。尚未开放；需要进一步的系统开发、任务验证与运营许可。",
          ],
          [
            "Prepare. Depart. Remember.",
            "从身体适应、座舱熟悉，到任务讲解与纪念记录。每一个阶段，都应该有足够的时间提问。",
          ],
        ],
      ),
      page(
        "spacecraft",
        "航天器",
        "Meet Aster — a vehicle concept",
        "Engineering\na sense of wonder.",
        "ASTER 载人舱概念。\n为窗外那个令人屏息的世界，留出更安静的空间。",
        [
          [
            "Designed around the view.",
            "环形观景区、独立座席与柔和的间接照明，把清楚的视线和直觉式操作放在设计中心。",
          ],
          [
            "A system of considered details.",
            "分区环境监控、清晰的状态反馈与冗余设计思路。这些是概念设计方向，不代表通过适航认证。",
          ],
          [
            "Every seam has a reason.",
            "观察热防护分区、模块接缝与轨道对接界面。所有三维造型与示意均为原创概念模型。",
          ],
        ],
      ),
      page(
        "about",
        "关于",
        "People behind the perspective",
        "Brilliant minds.\nA shared horizon.",
        "从飞行控制到乘客体验，\n我们相信，真正出色的工程让复杂安静下来。",
        [
          [
            "Dr. Lyra Voss",
            "首席航空工程师 · 虚构人物。她擅长把飞行控制、结构与人因工程放在同一张图纸上思考。在这个概念故事中，她主导 ASTER 的系统架构：让冗余路径更清楚，让座舱反馈更直觉，让每一次异常都先在模拟器中被认真对待。",
          ],
          [
            "When the stars went quiet.",
            "在一次主导航失效的极端模拟中，Lyra 将星敏感器、惯性测量与视觉地平线重组为独立的交叉校验回路，让 ASTER 原型重新获得姿态判断。随后，她把这次突破拆成可复核的测试与故障树，带领控制、结构和座舱团队完成闭环验证。她的才华，是让不可能的问题变成可以一起解决的工程。这一经历为原创虚构情节。",
          ],
          [
            "Curiosity, with discipline.",
            "SUPER INTELLIGENCE 是由 FRAME 创建的虚构太空旅行品牌。人物经历、任务进展与新闻均为概念叙事，不对应真实公司、工程师或商业航天承诺。",
          ],
        ],
      ),
      page(
        "news",
        "新闻",
        "Field notes from tomorrow",
        "The next chapter\nis taking shape.",
        "设计笔记、工程构想与旅程想象。\n记录一个概念品牌，如何一步步变得清楚。",
        [
          [
            "Introducing ASTER.",
            "2026.10.15 / 设计笔记\n首次公开 ASTER 轨道舱的原创视觉研究。环形结构与宽幅舷窗，来自“让地球成为主角”的设计出发点。本条为虚构品牌概念记录。",
          ],
          [
            "A view worth designing for.",
            "2026.10.10 / 体验研究\n旅程不仅发生在窗外。从地面准备到座舱安置，我们重新组织信息，让每一次选择都有清楚的上下文。本条为概念研究记录。",
          ],
          [
            "The shape of a quieter cabin.",
            "2026.10.02 / 工程构想\n从间接光源、环形通道到座席间距，探索一个适合停留的太空空间。这是设计研究，不是已验证的飞行能力或任务成果。",
          ],
        ],
      ),
      page(
        "pricing",
        "价格",
        "A journey, considered",
        "A new horizon.\nOn your terms.",
        "先了解一段旅程包含什么，\n再决定它是否属于你。以下均为概念报价。",
        [
          [
            "Horizon / 地平线",
            "概念报价 $125,000 / 人\n包含：地面介绍、适应准备、亚轨道观景构想及旅程记录。\n不含：交通、住宿、保险与第三方服务。",
          ],
          [
            "Orbit / 轨道",
            "概念报价 $450,000 起 / 人\n包含：进阶准备、任务规划与轨道驻留构想。\n最终范围取决于未来技术、许可与运营条件。",
          ],
          [
            "Lunar / 远月",
            "联系了解远期构想\n尚未开放。当前不公布时间表，不接受付款、押金或真实预订。",
          ],
          [
            "Begin with a conversation.",
            "在本机填写体验意向，查看一份摘要。信息不会发送给任何旅行运营商；刷新后可重新填写。",
          ],
        ],
      ),
    ],
  };
}
export function isSpaceSite(site: Site): boolean {
  return site.pages.some((p) => p.id === "si-index");
}
export function spaceProject(id: string = crypto.randomUUID()): Project {
  const site = spaceSite();
  return {
    id,
    name: "SUPER INTELLIGENCE · 太空旅行样本",
    brief: structuredClone(spaceBrief),
    site,
    initial: structuredClone(site),
    history: [],
    referenceIds: ["leo", "nick"],
    updated: new Date().toISOString(),
    messages: [
      {
        role: "assistant",
        text: "这是 SUPER INTELLIGENCE 六页太空旅行样本：原创 WebGL 3D、旅行计划、航天器、关于、新闻与价格。内容可编辑并完整导出；公司、人物、航程和报价均为虚构概念。对话修改使用本地规则，未调用模型。",
      },
    ],
  };
}
// Upgrade only the untouched built-in demo. Preserve its original site in Undo;
// projects with user edits or history are never silently replaced.
export function upgradeSpaceDemo(projects: Project[]): Project[] {
  return projects.map((p) => {
    if (
      p.name !== "MORROW 木间 · 演示项目" ||
      p.history.length ||
      JSON.stringify(p.site) !== JSON.stringify(p.initial)
    )
      return p;
    const next = spaceProject(p.id);
    return {
      ...next,
      referenceIds: [...new Set([...p.referenceIds, ...next.referenceIds])],
      history: [structuredClone(p.site)],
    };
  });
}
