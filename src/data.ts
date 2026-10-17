export type Reference = {
  id: string;
  name: string;
  url: string;
  industry: string;
  style: string;
  type: string;
  description: string;
  fit: string;
  verified: string;
  className: string;
};
export const references: Reference[] = [
  {
    id: "felix",
    name: "Felix Rieseberg",
    url: "https://felixrieseberg.com/",
    industry: "个人品牌",
    style: "空间交互",
    type: "首页",
    description:
      "可信的桌面生活场景。电脑、电视和导航具有各自功能，进入电脑时镜头帮助建立空间关系。",
    fit: "适合功能不多、需要鲜明个性与探索感的网站。工作室入口借鉴物件与用途的对应关系。",
    verified: "已实际浏览首页、滚动并通过 C 键进入电脑。",
    className: "ref-felix",
  },
  {
    id: "nick",
    name: "Nick Ho Motorsports",
    url: "https://nickho-motorsports.nl/",
    industry: "运动",
    style: "强对比",
    type: "品牌页",
    description:
      "黑白大画面、跨栏大字与小字号信息构成清楚的层级。网格将人物、赛事和联系方式联系起来。",
    fit: "适合有强视觉素材的产品、运动与创意品牌。重点参考字级与信息密度。",
    verified: "已实际浏览首页、滚动及导航入口。",
    className: "ref-nick",
  },
];
references.splice(1, 0, {
  id: "leo",
  name: "Léo Parpeix",
  url: "https://www.leoparpeix.com/",
  industry: "创意设计",
  style: "空间交互",
  type: "作品页",
  description:
    "以实体花形雕塑为视觉主体。暖色光、拱形建筑和明确的材质关系，连接沉浸场景与常规内容。",
  fit: "适合需要独特视觉主体的设计、文化与产品品牌。参考构图和光线，不复用其花形角色。",
  verified:
    "初次停留加载页；再次等待后看到完整首屏，并滚动查看内容区、操作进入入口。",
  className: "ref-leo",
});
