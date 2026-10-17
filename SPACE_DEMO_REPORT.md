# SUPER INTELLIGENCE 六页演示交付

日期：2026-10-15

本文件为首轮太空主题交付记录。后续样本入口、NASA 纹理、轨道舱细化、图片回退与新增测试，以 `SAMPLE_CONNECTION_REPORT.md` 和当前 `ASSETS.md` 为准。

## 任务信息

本轮任务：将 FRAME 模拟电脑中的家具示例替换为 SUPER INTELLIGENCE 太空旅行品牌网站。状态：已实现，已完成本报告列出的构建与真实 Chrome 验证。

运行地址：`http://127.0.0.1:4173/product`，点击「体验完整工作台」。启动：在本目录执行 `npm run build`、`npm start`。

## 实现内容

- 六个独立页面：首页、旅行计划、航天器、关于、新闻、价格。共享 SI 轨道标识、深空蓝与银白配色、导航、页脚、CSS 和强调色。
- 首页与航天器页包含原创 WebGL 场景：程序化行星地表、云层、昼夜光照、城市灯光、大气边缘，以及带金属分段、支撑臂和中心舱的三维轨道设施。可随鼠标改变视角、暂停和继续；不是一张背景截图。
- 旅行计划包含 Horizon、Orbit、Lunar 三种概念方向；价格是可编辑的概念内容。新闻使用可展开正文。价格意向表单有浏览器原生必填/邮箱检查，只在当前页输出摘要。
- About 以虚构工程师 Dr. Lyra Voss 为主线，讲述她在极端模拟中重组导航校验回路、解决姿态判断问题的原创故事。公司、人物、新闻、航程和报价均在站内标注为虚构/概念。
- 可在原工作台编辑文字、添加内容板块、更新共享品牌和强调色、撤销、比较版本、保存并导出 ZIP。首屏及产品演示区也使用这套新示例。
- 未编辑过的内置 MORROW 示例在原项目 ID 下升级，旧网站进入撤销历史；已有编辑、历史或自定义项目名称的项目保留原内容。
- 支持手机布局、减少动态效果、离屏暂停、WebGL 不可用时的 SVG 回退，以及预览 API 不可用时的本地隔离预览。

## 文件变更

| 文件 | 用途 |
| --- | --- |
| `src/space-demo.ts` | 六页结构化内容、示例项目与有条件升级 |
| `src/space-scene.ts` | 原创独立 WebGL、暂停/降级和本机意向表单逻辑；脚本摘要 |
| `src/space-files.ts` | 六页布局、品牌 SVG、静态文件和运行说明 |
| `src/space-style.ts` | 深空品牌样式、交互动画、响应式与减少动态效果 |
| `src/core.ts` | 将该内置主题接入已有文件生成与导出流程 |
| `src/App.tsx`、`src/Experience.tsx` | 新的产品示例入口、展示与旧示例升级 |
| `src/Workspace.tsx` | 仅为该可信内置主题开放隔离 iframe 脚本权限 |
| `server/index.mjs` | 只放行与内置运行时代码摘要完全匹配的脚本 |
| `tsconfig.json` | 支持服务端与前端共用显式 TS 模块路径 |
| `package.json` | 增加太空主题单元测试和浏览器测试命令 |
| `tests/space-site.test.mjs` | 结构、链接、转义、CSP、迁移、内容板块与价格编辑测试 |
| `tests/space-browser.mjs` | 真实 Chrome 场景、六页、响应式、编辑、导出与回退验证 |
| `tests/workspace-glass-browser.mjs` | 将内置示例的标题断言更新为新主题 |
| `README.md`、`ASSETS.md` | 使用说明与原创素材记录 |

生成的验证产物：`space-demo-site.zip`、`exported-space-example/`、`evidence/space/`、`space-browser-results.json`。没有新增运行时依赖、初始化 Git 或删除原有源码。

## 测试报告

以下命令在本机实际执行，浏览器为 headless Google Chrome：

| 命令 | 结果 |
| --- | --- |
| `npm test` | 6 项核心、4 项邮箱适配、7 项太空主题测试通过 |
| `npm run build` | TypeScript 检查与 Vite 构建通过；仍有原有 Three.js 大分块提示 |
| `npm run test:browser:space` | 7 组检查通过；页面运行异常记录为空 |
| `npm run test:browser` | 8 组原有产品流程检查通过 |
| `npm run test:browser:workspace` | 6 组工作台检查通过 |
| `npm run test:browser:wizard` | 1440、1024、768、390、320px 五种宽度检查通过 |

太空主题浏览器验证覆盖：真实 WebGL 帧数增长、暂停/继续、六页内链、编辑/撤销/共享颜色/刷新保存、版本对比、ZIP 下载和解压、通过独立静态 HTTP 服务访问导出结果、六页逐页访问与刷新、1440/768/390/320px 无横向溢出、新闻展开、意向摘要无 POST 请求、减少动态效果初始暂停、禁用 WebGL 的静态回退、预览服务失败回退、旧示例升级和撤销恢复。测试使用独立浏览器存储。

检查截图后实际修正了手机端轨道舱裁切、价格主显示与编辑内容不同步，以及旅程选择控件的可访问名称。自动化还修正了变换缩放 iframe 的鼠标坐标换算和页面样式加载等待。

截图：`evidence/space/workspace.png`、`workspace-focus.png`；六页分别有 `*-1440.png` 与 `*-390.png`；另有 `news-expanded.png`、`webgl-fallback.png`。

## 接口影响

现有 `Site`、`SitePage`、`Project` 数据结构、存储键、API 请求响应格式不变。内置主题通过稳定页面 ID 识别；普通项目仍使用原有渲染器。导出仍是 HTML、CSS 和本地资源，不依赖 FRAME 或外部 CDN。

仅该内置主题的 iframe 使用 `allow-scripts`；没有 `allow-same-origin`。服务端和导出文档的 CSP 只允许固定运行时的 SHA-256 摘要，保留 `connect-src 'none'`、`form-action 'none'`，不接受用户任意脚本。内容继续经过现有结构校验和 HTML 转义。

## 风险与未解决问题

- 这是可编辑、可导出的预置概念网站，未新增或验证真实 AI 生成能力。任意输入生成同等定制视觉仍属于后续模型接入工作。
- 不提供真实航天预订、支付、邮件提交或经过验证的工程能力；表单摘要刷新后清空，不冒充远端提交成功。
- 当前空间主题使用固定的专用布局。品牌、文字、强调色和内容板块可编辑；通用「设计方向」选择不会把它改造成另一套布局。预览内导航用于浏览，修改页面应在左侧页树选定。
- 已在本机 Chrome 验证，未在真实 iPhone、Safari、Firefox 或低端 Android 上做实机性能认证。WebGL 性能较弱时可暂停或使用回退视图。
- 同一产品仍含原有较大的 Three.js 代码分块；本轮新增场景使用原生 WebGL，没有额外加载 Three.js。

## 下一步

可基于现有静态主题接入结构化模型内容和版本修订；需要先确认模型服务、费用与生成合同。真实航程或商业发布需要提供可验证的公司、人物、价格和运营资料后替换概念文案。
