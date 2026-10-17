以下是一份可直接复制给产品架构负责人或另一位 AI 的完整规划 Prompt。
资料快照日期：2026-10-15，Asia/Shanghai。
用途：制定构页 / FRAME 的真实 API 接入计划。不是要求立即实施。

—— Prompt 开始 ——

你是本项目的产品架构负责人兼 API 集成架构师。请基于以下完整背景，为“构页 / FRAME”制定一份能交给实现工程师执行的 API 接入计划。

本次先做计划与接口设计，不写业务代码，不购买服务，不部署，不发送真实邮件，不进行付费模型调用。不要把演示版当作已经具备真实 AI 能力的产品，也不要另起一个与现有产品无关的新项目。

请先阅读全部信息。能根据现状采用合理默认值的事项，请说明假设后继续；真正阻塞的产品、供应商、预算或数据决策，集中列出少量关键问题。输出用中文，清晰标记【既有事实】【已确认需求】【建议】【待确认】【未验证】。

1. 项目定位与当前阶段

【已确认需求】品牌暂定“构页 / FRAME”。唯一产品主线是 Design Intelligence Agent，即帮助用户设计、生成和修改网站的产品，不是个人作品集，也不是只有动画的科幻展示页。

目标流程：
用户输入网站用途、受众、文案及可选素材 → 系统理解与整理内容 → 推荐参考案例 → 提供三个有实质区别的设计方向 → 用户选择方向 → 生成多个页面 → 在统一工作台预览、修改、保存和导出。

用户不需要预先准备参考截图。参考网站链接、截图、品牌图片都只是可选输入。

第一阶段生成结果为完整可运行的静态多页网站；首页、关于、产品、联系等页面共享品牌、导航、页脚和设计规则，同时有各自适合内容的布局。不要承诺生成任意业务后端。

【既有事实】现在已有可运行的本地产品演示版。用户已经可以完成多页创建、内容编辑、本地保存和 ZIP 导出；主页也有真实浏览器运行的动态 3D。下一阶段的核心缺口是真实模型能力与相关 API 闭环。

【历史背景】早期 B-000 面向“参考截图 → 设计规则 → 静态单页 → 浏览器截图 → 一次修订 → 前后对比”的 MVP，产出过架构准备报告。后来用户明确扩展为以上内容优先、多页生成的产品。不要把“必须上传截图”或“只生成单页”恢复为当前需求。

自动渲染、截图检查和一次视觉修订仍是有价值的能力，但当前没有产品内自动视觉审查闭环。请将其作为需要评估和分阶段安排的功能，不能写成已经实现。

2. 协作职责与实施边界

Model A：产品和架构负责人，负责统一需求、公共接口、任务依赖和验收。
Model B：主要实现工程师，按明确任务 ID、允许修改的文件、已确认接口和验收标准实施。
Model C：开源项目与技术研究，提供 README、源码、许可证、依赖和集成依据。

计划需要形成可执行任务单，而不是直接要求 B 重写整个产品。公共接口有修改时，列出变更原因、兼容方式、影响范围和迁移方案，由 A 审核。不要覆盖其他模型尚未集成的文件。

早期工作区不是正式 Git 仓库；现有 FRAME 演示也没有初始化 Git。不要把不存在的分支、提交、PR 或 CI 流水线写成事实。后续代码管理方式需要确认。

每个后续实施任务应交付：任务 ID、目标、状态、实现内容、文件变更、实际测试命令与结果、接口影响、风险与未解决问题、下一步及其前置条件。

3. 用户已经确认的页面和交互

首页 /：
- 首屏让人理解“输入内容，生成有自己风格的网站”。
- 明确提供“开始创建”和“浏览案例”。
- 有动态 3D 主体、自然滚动驱动的形态变化，下面展示实际产品界面、内容到网站的过程与演示案例。
- 演示案例明确标注，不虚构客户、评价或使用量。

产品页 /product：
- 解释内容整理、参考推荐、多页生成、对话修改、响应式预览、导出。
- 用不同类型的实际界面和内容演示，避免整页相同功能卡片。

案例库 /inspiration：
- 关键词搜索，行业、风格、页面类型筛选，详情、收藏、加入项目参考。
- 案例有真实来源、设计特点和适用内容。
- 首批少量核验过的案例即可，不等待大规模收录。
- 保留优秀网站集入口；特别优秀的单个案例才做独立研究页和 HTML 链接。

关于 /about：
- 当前已经按用户最新要求改为 Aleks 的个人介绍，同时解释产品理念。
- 不能虚构人物履历、公司、客户或团队。

我的项目 /projects：
- 查看、创建、重命名、复制、删除、继续编辑。
- 刷新后保留本地项目；删除需要明确确认，有空状态。

创建与编辑 /workspace：
创建步骤：输入用途/受众/内容/素材/期望页面 → 整理页面结构（增删、重命名、排序） → 展示三个设计方向 → 选择方向 → 生成多页网站 → 编辑。
每个设计方向应该含参考、适合原因、布局、字体、配色和预览。
工作台左侧为页面树、板块、素材和参考；中间为当前页面预览，可切换桌面、平板、手机；右侧为对话与内容编辑；顶部为保存状态、撤销、版本对比、导出。
修改范围必须明确：“只改当前页面”或“更新全站共享样式”。全站修改后保持导航、字体、组件一致。
生成内容必须能编辑，不能整页变成图片。导出的资源、内部链接应完整有效。

登录 /login、回调 /auth/callback：
- 邮箱链接登录界面和服务端认证适配已存在，真实服务未配置。
- 不默认增加密码登录、社交登录、团队、组织、SSO 等系统。

价格 /pricing：详见后文，已有方案展示，没有支付。

4. 设计方向、参考和视觉约束

用户要求先实际访问参考，学习其设计方法，不机械拼贴或复制专有素材；后来明确偏好“接近优秀 example 的动态效果，不要过度创新”。

三处原始参考及职责：
- https://felixrieseberg.com/ ：把功能融入可信空间，场景物件有用途、生活细节和合理镜头移动。
- https://www.leoparpeix.com/ ：立体主体的构图、材质、光线、阴影，以及空间和普通内容的衔接。
- https://nickho-motorsports.nl/ ：大字体、小信息、网格、黑白对比和页面节奏。

用户补充的入口：
- https://www.awwwards.com/
- https://www.landing.love/
- https://www.landing.love/sites/byotone/
- Byotōne 实际网站：https://byotone.com/
- 补充集合 Recent：https://recent.design/?ref=godly （实际访问 Godly 后跳转到这里）。

以上 Awwwards 和 Landing Love 均已有实际访问记录；Byotōne 经 Landing Love 进入，实际点击 Enter Quietly 并滚动体验。此前访问超时的是 Minimal Gallery；Pexels 人物照片详情页触发 Cloudflare，但 CDN 图片可用。不要再次误称 Awwwards 或 Landing Love 打不开。

Apple 参考：用户提到 iOS/macOS 26、27 的 Liquid Glass。既有实现参考 Apple OS 页面的玻璃导航，属于网页近似效果，未证明完全复刻系统渲染。

原始统一概念是“可以进入、浏览、工作的数字设计工作室”：工作台和显示器对应创建，样本架对应案例库，项目档案对应我的项目。普通文字导航始终可用，不强迫寻找隐藏入口。

原始品牌基调为暖白、石墨黑、金属灰，少量信号黄；最新首页采用深石墨、浅薄荷绿、柔紫变化和玻璃导航。后续 API 接入应保留当前已实现视觉，不借机重新做整站美术。

当前动态首页事实：
- Three.js / GLSL 实时粒子和页面模型，桌面约 44,000 粒子，手机约 17,000。
- 自然滚动把立体云团变为折叠曲面，再展开为三个页面；章节按钮可跳转阶段。
- 鼠标反馈、色彩交融、界面折叠、页脚悬停和点击反馈已实现。
- 原创工作室 GLB 在首页下方，模型由 Blender 生成；手机对该工作室场景采用静态替代。
- WebGL 不可用或中断时保留静态内容及功能入口，支持 prefers-reduced-motion，声音关闭。

动效要求：物件反馈约 120–200ms，面板切换约 200–350ms，镜头约 700–1000ms且可中断；以 transform/opacity 为主，保留自然滚动、键盘、前进后退。移动端减轻渲染负担。

视觉验收必须检查构图、材质、文字比例、层级、布局、间距、图像、交互、响应式。不能把“用了 Tailwind”“HTML 能显示”或“没有脚本错误”等同视觉质量通过。不要靠发光球、粒子、渐变、毛玻璃或统一卡片代替产品内容和精细设计。

5. 已确认人物资料与定价

名称：Aleks。
身份：Start-up Business Designer。
用户要求 50–100 字中文介绍，当前为以下 88 字：
“关注创业中的真实问题，也着迷于编程与设计的交汇。我习惯从模糊的想法出发，梳理产品逻辑，再用代码与视觉让它成为可体验的作品。构页是这份探索的延伸：让好的表达，不必止步于技术门槛。”

临时人物图片：public/images/aleks-placeholder.jpg。
来源：https://www.pexels.com/photo/man-wearing-blue-crew-neck-t-shirt-2379004/
许可入口：https://www.pexels.com/license/
界面已注明“临时形象图，非本人照片”；不能将图片当作 Aleks 真实身份或经历证明。

订阅价格已由用户确认，周期暂按每月：
- Go：$5/月。“把第一个想法做出来”。适合个人、小项目、第一次建站。基础多页生成、三种方向、响应式预览、内容编辑、静态导出、个人项目管理。
- Plus：$15/月。“让风格更像你”。面向独立创作者和小品牌。展示文案包含 Go 能力、更多方向与迭代额度、品牌字体/配色/共享组件、更完整页面与版本管理。
- Max：$39/月。“为持续做产品的人”。面向创业者和高频创作。展示文案包含 Plus 能力、更高额度、高级多页结构/素材管理、优先处理/反馈通道。
- Ultra：联系报价。“从生成，到有人一起做”。展示文案包含 Max 能力、无限量使用（拟受公平使用政策约束）、私人设计与创业产品咨询、方向评审与优先支持。
- 一次性咨询：联系报价。与 Aleks 梳理产品定位、网站结构、内容和设计方向。

【重要现状】这些是价格与权益的方案展示，不代表权益已经实现或可购买。没有支付、订阅扣费、额度计量、咨询预约或已确认联系地址。不要虚构 Plus/Max 的精确调用次数，不能把 Ultra 宣传当成无成本、无限并发、无限 Token 的技术承诺。计划应给出 API 成本与套餐可持续性的分析，再提交用户决定。

6. 当前工程与运行方式

候选工作区：
/Users/wangdan/Documents/Codex/2026-10-14/role-b-implementation-engineer-model-a

实际产品目录：
/Users/wangdan/Documents/Codex/2026-10-14/role-b-implementation-engineer-model-a/outputs/frame

不要把上层候选工作区误当已经初始化的代码仓库。

现有技术：
- React / React DOM 19.3.0。
- TypeScript 5.9.3。
- Vite 8.3.4，@vitejs/plugin-react 6.1.2。
- Three.js 0.180.0；当前直接使用 Three.js，没有引入 React Three Fiber。
- fflate 0.8.3 负责 ZIP。
- Playwright 1.64.1 配合已安装 Google Chrome 做测试。
- Archivo Variable / Manrope Variable 5.3.0；中文系统字体，部分英文展示使用 Georgia。
- Node 原生 http 服务负责 API 和预览，目前没有 Express/Fastify、数据库、队列、模型 SDK、Supabase SDK 或支付 SDK。
- 本机验证环境 macOS、Node 26.10、npm 11.19；当前工程要求 Node >=24，服务端直接导入 src/core.ts，其他部署运行时需验证该方式。

开发启动：在产品目录 npm ci，然后 npm run dev。
构建启动：npm run build，然后 npm start。
前端：http://127.0.0.1:4173/
API：http://127.0.0.1:4175/
隔离预览：http://127.0.0.1:4174/
dev.mjs 同时拉起 API 和 Vite；npm start 使用 Vite preview，只是本机验收方式，不是正式公网部署方案。
所有服务当前绑定 127.0.0.1。Vite 将 /api 代理到 4175。
运行器继承终端环境，不自动读取 .env。不要只创建 .env 就宣称已经接入。

当前页面路由：/、/product、/inspiration、/inspiration/byotone、/about、/pricing、/login、/auth/callback、/projects、/workspace。
已有项目使用 /workspace?project=<project-id>。
独立静态研究页：/examples/byotone.html。

主要代码入口：
- src/App.tsx：路由、案例选择、项目操作、本地保存、统一导航和页脚。
- src/Workspace.tsx：创建、内容编辑、预览、上传处理、演示对话、撤销、比较、导出。
- src/core.ts：数据类型、三种预置方向、生成/校验/静态文件编译/演示编辑/持久化。
- src/data.ts：三处原始参考的静态案例元数据。
- src/Experience.tsx、src/KineticScene.tsx、src/experience.css：最新动态首页。
- src/Studio.tsx、public/studio/、studio.blend、scripts/build-studio.py：原创工作室模型与浏览器交互。
- src/AccountPages.tsx、src/account-pages.css：邮箱、价格、Aleks。
- src/collections.tsx、public/examples/byotone.html：网站集和研究页。
- server/index.mjs：生成 API、预览 API、独立预览服务。
- server/auth.mjs：邮箱认证适配与内存会话。
- vite.config.ts、dev.mjs、package.json、package-lock.json：本地运行与依赖锁定。

当前 FRAME 目录下没有作为本轮已冻结主规格的 SPEC.md、ARCHITECTURE.md、CONTRACTS.md、TASKS.md、STATUS.md。早期 B-000 引用了 A 的旧规划草案，不能直接当作本轮多页产品的现行批准契约。请在计划中建议补齐最小必要规格，而不是反复生成长篇报告。

7. 当前完成度：哪些是真的，哪些是演示

已经可用：
- 产品页面路由和常规导航。
- 当前首页真实 3D 与滚动交互。
- 三处核验参考的人工整理数据、搜索/筛选/收藏/详情/选择。
- 页面结构增删、重命名、排序，输入校验。
- 三种不同预置设计方向及对应静态页面样式。
- 生成可编辑多页 HTML，首页/关于/产品有不同内容结构，共享导航、页脚、CSS。
- 直接编辑文案、页面切换、设备预览。
- 演示规则实现局部修改或全站强调色修改。
- 项目 CRUD、本地刷新恢复、最近 10 次撤销、初始/当前比较。
- 图片压缩、保存、ZIP 资源导出。
- 独立端口预览、空 sandbox iframe、失败后的静态 srcDoc 降级。
- 邮箱登录前端、回调前端、服务端认证适配代码及模拟服务测试。

尚未完成或未验证：
- 没有实际执行并验收真实模型调用。
- 当前所谓“真实生成适配”只打算为固定布局生成结构化内容，不是模型自由生成网站代码。
- 对话编辑始终是预设正则/规则，没有真实对话 API。
- 三种方向和参考适合原因是人工/预置，不是按 Brief 动态研究与推荐。
- 网站链接只保存，不抓网页；参考截图没有自动分析。
- 上传图片没有发给模型，没有逐页图片映射。
- 没有产品内自动浏览器截图、视觉问题分析、自动修订一次再比较的服务链。
- 没有真实邮件投递和真实邮箱登录验收。
- 没有账号项目云同步、持久化服务端项目数据库或生产会话存储。
- 没有付费、配额、消费计量、后台运营系统。
- 没有完整命名版本历史，只比较初始与当前，并支持最近 10 次撤销。
- 未公网部署、未压力测试、未全面安全审计，未实测 Safari/Firefox/实体 iPhone。

8. 当前数据结构：原样记录，尚不是最终 API 合同

以下是 src/core.ts 的实际类型。计划中的新增字段和修改须单列为建议，不能声称当前已有。

```ts
type Direction = "editorial" | "studio" | "precision";
type Asset = { name: string; data: string };
type PageDraft = { title: string; slug: string };

type Brief = {
  name: string;
  purpose: string;
  audience: string;
  content: string;
  pages: PageDraft[];
  assets: Asset[];
  referenceIds: string[];
  referenceUrl?: string;
};

type Section = { id: string; title: string; body: string };

type SitePage = {
  id: string;
  title: string;
  slug: string;
  eyebrow: string;
  headline: string;
  description: string;
  sections: Section[];
};

type Site = {
  name: string;
  direction: Direction;
  accent: string;
  pages: SitePage[];
  assets: Asset[];
};

type Project = {
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

type Reference = {
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
```

当前 Asset.data 为 data URL，不是对象存储地址。Site 只有 direction/accent 等有限设计字段，尚无完整 Design Tokens、布局树、组件 AST、截图结果、视觉报告或生成任务结构。
Site/Project 没有独立的 schemaVersion、生成模式/来源、provider/model、prompt 版本、token 用量、成本、taskId 或全套版本元数据。不要假设这些已存在。

三个预置方向：
- editorial / 静物叙事：Georgia + 系统中文，非对称分栏、大幅静物、留白长文；色板 #eeebe3 / #252923 / #b5aa80；人工参考 Léo。
- precision / 鲜明秩序：Arial Black + 系统中文，强对比大字、模块网格、紧凑导航；#191b1a / #f3f2ea / #f1d745；人工参考 Nick。
- studio / 温暖工作室：系统无衬线，居中标题、双列介绍、明确行动入口；#f2eee5 / #254a40 / #cad4bc；人工参考 Felix。

当前校验与容量：
- 网站 1–12 页，必须存在 slug=index。
- slug 正则为 ^(index|[a-z][a-z0-9-]{0,35})$，不允许重复，排除 styles/assets/readme。
- 品牌 name 为字符串且最长 160；accent 为 6 位十六进制颜色；direction 来自固定枚举。
- 页面的 id/title/eyebrow/headline/description 为字符串，单项长度上限 12,000；每页最多 20 个 section，section.body 上限 20,000。
- 最多 8 张素材；输入界面限制每张 2MB，转换为最长边 1400px 的 WebP。
- validateSite 还限制全部 data URL 字符数合计不超过 2,000,000；因此不能理解成“8 张各 2MB 都一定能保存”。后续应统一输入/压缩/存储/传输配额。
- 后端 JSON 请求体原始字符串超过 24,000,000 时拒绝；这不是精确字节计量和完整生产上传方案。
- 现有运行时校验是手写函数，没有严格 JSON Schema 校验器；不可宣称已经完全约束所有跨字段关系。

9. 当前 API：模型状态和生成

GET /api/status
成功示例：
```json
{ "liveAvailable": false, "mode": "demo" }
```
只要进程环境存在 OPENAI_API_KEY，就返回 liveAvailable=true、mode="connected"。它没有探测密钥有效性、模型权限、网络、余额或服务健康；“connected”不是连通性验收结果。

POST /api/generate
Content-Type: application/json。
请求：
```ts
{
  brief: Brief;
  direction: Direction;
  mode: "demo" | "live";
}
```
成功：
```ts
{ mode: "demo" | "live"; site: Site }
```
mode 非 live 时当前走 demoSite，然后 validateSite；没有真实模型参与。
live 缺少密钥时返回 HTTP 503 和 { error: string }。

live 适配的实际实现：
- fetch 固定调用 https://api.openai.com/v1/chat/completions。
- 服务端读取 OPENAI_API_KEY；OPENAI_MODEL 默认 gpt-4.1-mini。
- 当前默认值是既有代码事实，不是对 2026-10-15 最优模型、最新能力或价格的推荐。
- 未配置自定义 API base URL，也没有通用供应商适配接口。
- response_format={type:"json_object"}，不是已经采用严格 json_schema 的 Structured Outputs。
- temperature=0.6，max_completion_tokens=6000，超时 60 秒。
- 系统提示要求保留结构/页面 id/slug/方向，不添加脚本、业务后端、无依据声明等，默认中文。
- 用户消息包含 Brief 和由 demoSite 生成的 Site 样本；两者 assets 字段均置空，图片不传给模型。referenceIds/referenceUrl 可作为 Brief 中的文字字段出现，但没有抓取其目标内容。
- 解析 choices[0].message.content 的 JSON，将用户素材重新装回 site.assets，执行 validateSite。
- 额外检查页数、页面顺序/id/slug 和 direction 与预置结果一致。
- 返回结构化 Site，由本地固定编译器输出 HTML/CSS。

现状限制：
- 没有真实调用验收；不能因适配代码存在就宣称可用。
- 没有 SSE/流式生成、任务查询、取消、幂等、分步恢复、重试预算或调用成本记录。
- 许多生成异常统一落为 HTTP 400 + {error:string}；上游超时、拒绝、额度、429 等尚未规范映射。
- 没有专门 /api/edit、/api/analyze、/api/references/recommend 或视觉审查端点。
- /api/generate 与 /api/preview 目前没有基于邮箱会话的登录授权或套餐配额控制，只具有本机访问和部分 Origin 检查。

10. 当前 API：预览、文件生成与导出

POST /api/preview
请求：{ site: Site }。
成功：{ url: "http://127.0.0.1:4174/<random-uuid>/" }。
先通过 siteFiles 校验并编译站点，再把文件存在服务端内存 Map；最多保留 40 份，单份按 1 小时过期判断，服务重启丢失。

预览服务不是 JSON API，而是 GET http://127.0.0.1:4174/<id>/<file>。
不存在或过期返回 404；不提供长期发布或账号访问控制。
文件源来自结构化站点编译，路径受限。iframe sandbox=""，不允许脚本/同源权限等；服务端 CSP 包含 script-src 'none'、form-action 'none'、base-uri 'none'，可嵌入来源目前写死为本机前端。
页面切换、站点内容变更会触发预览流程；后端不可用时前端退回隔离 srcDoc。
当前代码支持静态网页预览，不支持任意 JS 应用。若下一阶段要生成 JS/动效代码，必须重新评估 sandbox/CSP 与独立预览来源，不能直接放开权限。
不同端口构成不同 origin，但 Cookie 不是按端口隔离；正式方案还需评估预览主机与认证 Cookie 边界，不能只换端口就认定权限完全隔离。

静态输出 siteFiles(site): Record<string,string>：
- index.html、about.html、product.html 等。
- 共用 styles.css。
- assets/still-life.svg 原创默认插画及 assets/upload[-n].webp 等上传素材。
- README.txt，当前文案固定提醒演示流程；真实接入后需要区分产物来源，避免继续把 live 产物写成 demo 或反过来。
- 页面导航与页脚用相对 HTML 链接，内容经过转义。
- 当前首张素材用于页面主图，其余素材随 ZIP 保留；没有逐页/逐板块素材选择与 alt 映射。
- 浏览器端使用 fflate 导出 ZIP，当前没有服务端导出任务 API。

独立运行：解压 ZIP 后 python3 -m http.server 8080 --bind 127.0.0.1，访问 http://127.0.0.1:8080/；无需 Node 或重新构建。
已有 demo-site.zip 和 exported-example/ 可用于回归测试。
隔离页面里的导航与编辑器页面树当前各自工作，未实现点击预览内链后反向同步页面树。

11. 当前 API：邮箱认证

现有采用 Supabase Auth REST，不依赖其前端 SDK；供应商仍可在计划中评估，但不能未经审核就删除当前适配。

服务端环境变量：
- SUPABASE_URL：HTTPS 项目地址。
- SUPABASE_ANON_KEY：当前仅服务端读取；不是 service-role key。
- APP_ORIGIN：默认 http://127.0.0.1:4173。

GET /api/auth/status
返回 { configured: boolean, method: "email-link" }；configured 只检查配置字段是否存在，不是实际邮件验收。

GET /api/auth/me
未登录：{ user: null }。
有有效会话：{ user: { id: string, email: string } }。

POST /api/auth/request-link
请求：{ email: string }。
验证邮箱格式和长度，将邮箱去空白并转小写；同一邮箱在进程内每 60 秒限一次。
调用 <SUPABASE_URL>/auth/v1/otp?redirect_to=<APP_ORIGIN/auth/callback>，JSON 为 {email,create_user:true}，15 秒超时。
成功返回 { ok:true, message:string }；未配置 503；格式错误 400；频繁请求 429；上游错误或不可用 502。
限流记录最多 2000 条，保存在内存，不是分布式限流。

回调前端：从 /auth/callback 的 URL hash 提取 access_token，立即清除地址栏凭证，再 POST 到会话接口。当前不是已经实现 PKCE/code 回调和完整 token 刷新机制，正式认证方式需要验证/决定。

POST /api/auth/session
请求：{ accessToken: string }。
验证长度 20–8192，调用 <SUPABASE_URL>/auth/v1/user，由服务端校验 token，并要求用户 id、email、email_confirmed_at 存在。
成功返回 {user:{id,email}} 并设置随机不透明 frame_session Cookie。
Cookie：HttpOnly; SameSite=Lax; Path=/; Max-Age=3600，APP_ORIGIN 为 HTTPS 时增加 Secure。
失败包括 400、401、503、502。

POST /api/auth/logout
删除内存会话并清 Cookie，返回 {ok:true}。

会话最多 2000 条、1 小时、进程内 Map；服务重启失效。没有跨实例持久化、刷新会话、云项目授权和账号同步。
正式接入需在认证服务启用 Email、配置允许的回调 URL、邮件投递服务和正式域名。当前没有真实认证凭据，未发邮件，未验收真实账号。
现有认证错误一般为 {error:string}；没有统一稳定 error.code/requestId/retryable 字段。

12. 本地持久化、素材和版本现状

普通项目保存在当前浏览器 localStorage：
- frame-projects-v1：key 保留 v1 名称，但实际新包装结构 version=2，包含 projects 和去重的 blobs；也兼容旧的直接数组。
- frame-favorites：收藏。
- frame-references：待加入项目的参考。

图片在项目、复制项目与撤销历史之间去重；存储满会报告失败。
本地数据依赖浏览器和来源，localhost 与 127.0.0.1 的数据不能视为同一个存储。
现有账号并不拥有这些本地项目。以后若接云同步，需要考虑首次绑定、用户确认、冲突、退出账号后的本地可见性、版本兼容、备份及删除。
撤销最多最近 10 次；initial 与 site 用于版本比较，不是完整版本数据库。

13. 开源、素材与依赖复用边界

当前实际安装/使用范围以 package-lock.json 和 ASSETS.md 为准：
- React/React DOM、Three.js、fflate、Vite：MIT。
- TypeScript、Playwright：Apache-2.0。
- Archivo、Manrope：SIL OFL 1.1。
- 运行时和字体许可保留在 public/licenses/。
- 工作室 GLB/Blender 源、图标、默认 SVG 静物、案例构图摘要和新 GLSL 代码是本次原创；没有复制参考站模型、字体、视频或源码。
- Pexels 临时照片保留来源与许可记录；用户上传素材保留原权利归属。
- 独立 Byotōne HTML 是原创观察页，不是第三方源码下载。

早期 B-000 曾研究 Playwright、screenshot-to-code、GrapesJS，以及 Fastify/Zod/sharp 等候选，不等于已经安装或已批准接入。现有产品没有整体 fork 这些编辑器，也没有其业务后端。
不要因“项目名称很合适”就引入新依赖；如果计划复用，必须核对具体版本/固定提交、真实源码能力、许可证、兼容性、维护状态、体积和集成成本。
不要为接 API 同时引入多个重复模型 SDK、前端框架、动效库或大规模编辑器。

14. 已有测试证据与未验证范围

以下为此前实际执行的结果记录；本次文字整理没有重新执行测试或调用 API。不要把它们扩大为真实模型/邮件验收。

命令与记录：
- npm test：6 项核心测试 + 4 项邮箱认证测试通过。认证使用模拟服务。
- npm run build：TypeScript 与 Vite 构建通过。
- npm run test:browser：8 组流程通过，最近在 npm start 的构建产物复验。
- npm run test:browser:assets：4 组素材、撤销、参考和工作室 WebGL 中断检查通过。
- npm run test:browser:extra：7 组独立导出、错误路径、缺密钥、跨来源拒绝、模型/GLB/预览故障恢复、键盘与减少动效等检查通过；模型失败是模拟响应。
- npm run test:browser:revision：10 组新增交互/账号/价格/参考/响应式检查通过，最近针对构建产物。
- 合计 29 组浏览器检查有记录，其中最新构建产物复验覆盖原 8 组和新增 10 组。
- npm audit --audit-level=moderate：记录为 0 vulnerabilities；仅表示当时依赖漏洞数据库结果，不是全面安全证明。

真实浏览器覆盖：三页创建、内链/共享样式、搜索筛选收藏与参考、内容编辑与作用范围、刷新保存、项目复制重命名删除确认、撤销比较、ZIP、独立导出运行、桌面/平板/手机布局、无横向溢出、直接访问刷新返回、错误恢复。
新增测试覆盖九个常规路由在 1440/768/390px 下直接访问和刷新，以及认证回调的模拟分支；不是所有路由都执行了真实用户认证。
实际检查过首页、案例库、编辑器、导出站点、About/Price/Login 手机与桌面截图，并修正遮挡、对比、换行等问题。
生产构建曾因 CSS 前缀声明顺序导致 backdrop-filter 被压缩器丢弃，已修复且浏览器样式断言通过。

未验证：真实 OpenAI 请求、真实邮件投递/账号、付费、云同步、公网服务、负载、跨浏览器/实体手机、全面安全。
已知体积：Three.js 延迟加载包约 695kB（gzip 176kB）、工作室 GLB 约 4.4MB。不是构建失败，但正式发布需考虑缓存、懒加载和性能预算。

15. 制定 API 计划时必须回答的问题

请按“最小可用闭环”和“后续增强”分层，不要为了第一次真实调用就把所有付费系统一次做完。

A. 能力与供应商边界
- 首次接入到底只实现真实多页文案，还是同时做到真实设计方向/布局生成？必须分别定义并诚实命名。
- 为内容整理、参考推荐、设计方向、多页生成、局部/全站对话编辑、可选截图理解、视觉审查分配模型能力。
- 给出一个推荐的最小供应商方案及可替代方案；采用 OpenAI 官方、兼容服务或其他供应商都需说明适配差异。
- 如果比较 API、模型名、价格、配额、图像能力或结构化输出，请实际查询最新官方资料并标日期和来源。无法查询就标待核实，不能把现有 gpt-4.1-mini 默认值当当前最优选择。
- 不需要把 3D 动效渲染外包给模型服务；它已是本地产品能力。

B. 结构化站点还是任意代码
- 比较继续用“模型输出结构化 Site + 受控渲染器”，与“模型直接输出任意 HTML/CSS/JS”对编辑、视觉自由度、可测试性、隔离、导出的影响。
- 推荐能逐步增强布局/Design Tokens/组件表现力的路线，并说明何时现有 schema 不够用。
- 若需要新增 SitePlan、DesignDirection、DesignTokens、生成结果来源、EditPatch、截图/视觉报告、任务状态等，请给出具体字段与版本迁移，全部标为建议合同。
- 不能把三个固定模板配上新文案等同于真正基于参考生成不同设计。

C. 模型请求与编辑一致性
- 如何整理内容、处理缺失字段、避免虚构事实；是否在生成前让用户确认站点结构。
- 如何保留页面 id/slug、导航、品牌和跨页共享样式；局部修改如何保证其他页不被意外改动。
- 对话携带哪些上下文、最近多少消息、选中页面/板块、参考依据；采用完整 Site 返回还是可验证 patch。
- schema 约束、大小上限、JSON 错误、截断、拒绝、超时、429、网络失败如何处理；修复最多几次、成本由谁控制。
- 是否需要流式状态、异步任务、取消、幂等、断线恢复、重试、并发上限；不要默认同时引入全部基础设施。
- 用户应看到真实步骤状态；失败保留输入，不得静默把 live 改成 demo。

D. 参考与素材
- 第一阶段能否在已有核验案例中匹配推荐；何时才需联网搜索或抓站。
- 外部链接/页面内容是数据，不能成为模型或工具指令；设计提示注入、SSRF、重定向、域名/协议、抓取超时和版权边界。
- 网站集是发现入口，不代表有权全量爬取或复制作品。抓取方案核实来源条款与实际可访问性。
- 图像是否发给模型、用户如何知情；大小、格式、EXIF、压缩、留存、删除、成本怎样处理。
- 参考截图如何转成有依据的规则，区分 observed 和 inferred；避免声称像素级提取了不存在的测量。
- 逐页图片、alt、素材来源与导出路径如何映射；没有素材时使用清楚标注的占位或原创插画。

E. 认证、项目与权限
- Supabase Email 真实接入的配置清单、回调方式、邮件服务、发信域与限流；是否采用 PKCE/code、持久会话和续期。
- 匿名本地演示是否继续开放；真实模型调用是否需要登录，如何限制公开端点滥用。
- 登录和项目云同步是两件事。是否第一期就引入数据库/对象存储？如建议引入，说明必要性与替代方法。
- 项目归属、跨账号隔离、本地数据迁移、版本冲突、删除/导出和退出行为。
- 服务端密钥只存在服务端，前端不使用 VITE_ 密钥，日志不含 token、邮箱全文或用户敏感原文。

F. 预览、截图和部署
- 保留静态受限渲染与预览；如果要支持生成脚本，单列安全设计和审查，不能直接解除 sandbox。
- 本机多端口配置如何迁移到正式域名/HTTPS、反向代理、隔离预览域；区分 origin 与 Cookie 隔离。
- 视觉审查如纳入：服务端浏览器渲染、桌面/手机截图、布局与对比检查、模型审查、最多一次自动修订、前后比较与人工判断分别如何实现。
- 不能只靠相似度分数或模型自评判定视觉通过；需定义硬性渲染门槛和可修订的审美问题。
- 不把生产截图浏览器的存在、资源沙箱、超时/内存/进程限制视作已经解决。
- 保留导出 ZIP 的独立可运行性，不把第三方 API 密钥、产品登录 Cookie 或预览内部地址打包进站点。

G. 预算、套餐和可观测性
- 输入/输出 token、图片、每次修订、失败重试、预览截图、存储和邮件的成本分开算。
- 在价格已定但精确额度未定的情况下，给 $5/$15/$39 的可持续额度建议与估算假设。
- Ultra 无限量需给公平使用、并发/速率/异常使用和人工咨询成本建议，再由用户确认。
- 区分预算估算与实际账单；缓存、限额、成本熔断、requestId、耗时、provider/model/prompt 版本、错误码和消费记录怎么落地。
- 不默认在首期加支付。若建议分期接支付，说明订单/订阅状态/签名 webhook/幂等/退款等后续依赖。

16. 请交付的具体计划

请输出以下内容，给出明确推荐，不只罗列选项：

1）一页决策摘要：第一期真实接入承诺什么、保留什么、后续什么；理由、阻塞项和验收出口。
2）产品能力矩阵：每个环节的现状、目标、是否需要 API、输入/输出、供应商/模块、优先级和可见状态。
3）推荐架构与数据流：前端、应用 API、模型适配、认证、持久化、任务编排、渲染/截图/导出边界；可并行模块及依赖。
4）API 合同草案：逐接口给 method/path、认证、请求/成功/错误示例、schema 版本、幂等/并发/取消/超时、现有接口兼容和迁移。新的路径必须标建议。
5）数据与模型协议：可验证的 schema/patch、设计规则、引用与来源、模型调用记录；至少给一个三页站点的完整示例和一个局部修改示例。
6）配置和服务开通清单：真实需要用户提供哪些账号/密钥/域名/预算，哪些不是前置；只用变量名和占位符，不索要在聊天里粘贴秘密。
7）分阶段任务单：建议按 P0/P1/P2 或等价阶段，给每项任务 ID、负责人角色、目标、允许修改文件、新增依赖、前置任务、接口影响、验收标准、测试命令和工作量范围。
8）测试和灰度上线计划：单元、合同、真实 API、集成、浏览器、视觉、错误处理、权限/隐私、费用上限、回滚与数据迁移。模拟通过与真实通过分别记录。
9）成本和工作量：有依据的价格来源、计算公式、使用假设、套餐额度建议、开发人日范围和主要风险。
10）待用户/Model A 决策清单：集中列出真正影响执行的事项，并给推荐默认值；不要重新询问已确认的姓名、定位或价格。

17. 第一个真实端到端闭环的验收底线

- 从用户 Brief 开始，至少生成首页、关于、产品三个页面，能够证明调用了实际已选模型，并记录真实调用而不泄露密钥。
- 明确区分“模型生成内容”和“模型生成布局/设计”，不能扩大宣传；若第一期只接内容，验收与界面名称相应收窄。
- 页面 id、路径、导航、页脚、品牌样式一致，内部链接有效，页面布局和内容适合各自用途。
- 至少一次真实自然语言局部修改和一次全站样式修改；若分阶段实现，对未纳入第一期的项明确标注，不能继续称其真实 AI 已完成。
- 可预览、编辑、保存、刷新恢复、撤销、导出，既有演示和本地项目不回归。
- 导出代码和素材能在独立静态服务运行，不依赖工作台会话或密钥。
- 未配置、无效密钥、无权限/额度、429、超时、坏 JSON、模型拒绝和中断有可理解的处理；不丢用户输入、不假报成功、不无限重试。
- 真实邮箱登录若列入第一期，实际验证发信、链接、回调、会话、退出、过期和重启/部署行为；否则清楚保留为未接入。
- 桌面和手机真实浏览器检查、首页/案例库/工作台/生成站点截图与实际修复；静态可显示不等于视觉验收。
- 若包含自动视觉审查，必须真实截图、真实分析与一次修订，并可查看前后结果；测试脚本截图本身不等于产品已有该能力。
- 不将模型自述“我完成了”、一次成功响应或模拟数据作为整个系统可用的唯一证据。

18. 可追溯资料与适用范围

有本地文件访问能力时，先核对以下资料；没有访问能力时可依据本 Prompt 规划，但将无法复核的部分标为提供的项目背景，不声称亲自读过文件或访问过网站。

产品根目录：
/Users/wangdan/Documents/Codex/2026-10-14/role-b-implementation-engineer-model-a/outputs/frame

当前说明：README.md、REVISION_REPORT.md、DELIVERY.md、TEST_REPORT.md、ASSETS.md。
实际协议：src/core.ts、src/Workspace.tsx、server/index.mjs、server/auth.mjs、src/AccountPages.tsx。
测试：tests/core.test.mjs、tests/auth.test.mjs、tests/browser.mjs、tests/browser-assets.mjs、tests/browser-extra.mjs、tests/revision-browser.mjs。
原始浏览器记录：browser-results.json、asset-browser-results.json、extra-browser-results.json、revision-browser-results.json。
视觉证据：revision-home.png、revision-scroll-fold.png、revision-scroll-pages.png、revision-home-mobile.png、revision-scroll-mobile.png、revision-inspiration.png、workspace-desktop.png、generated-site-desktop.png，以及 revision-mobile-*.png。
参考访问：产品目录 evidence/references/，上层工作区 work/references/。
历史准备：上层 outputs/handoffs/model-b/B-000.md 及附件。它是旧方案的历史研究，不能覆盖最新需求。
最新修订报告优先于旧交付文档里关于路由数、单元测试数和首页样式的描述。

本 Prompt 不包含 API Key、邮箱密码、真实用户私密数据或第三方网站源码。原始规格与代码若随后更新，请以最新核对结果修订计划，保留事实/建议/未验证的区别。

请现在开始制定可执行的 API 接入计划，不要开始实施代码。

—— Prompt 结束 ——
