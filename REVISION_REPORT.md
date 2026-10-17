# FRAME 视觉与页面扩展交付

任务：本轮用户直接提出的动态首页、邮箱登录、About、Price 与网站集扩展；未另行分配任务编号。

状态：可运行的本地演示版已交付；真实模型、真实邮箱投递和付费服务待接入验收。

## 完成内容

- 可行性已由实现验证：使用现有 Three.js 实现真实 WebGL 粒子与页面模型，随自然滚动由立体云团变成折叠曲面，再展开为三个页面。没有改用录像冒充交互。
- 采用 Byotōne 的深色、浅绿、连续主体与章节导航方法；玻璃导航、阶段颜色交融、界面折叠、按钮与页脚悬停/点击反馈均已实现。支持键盘、减少动效、移动端粒子减量及 WebGL 失败降级。
- 旧工作室模型保留在首页下方的工作室区域；原有多页创建、编辑、项目保存与导出继续可用。
- `/about`：Aleks / Start-up Business Designer，88 字中文介绍，已注明 Pexels 网络照片为临时形象图、非本人照片。
- `/pricing`：Go $5 / 月、Plus $15 / 月、Max $39 / 月；Ultra（无限量、公平使用范围、私人咨询）与一次性咨询联系报价。按钮提供方案详情及演示入口；支付与预约服务尚未开放。
- `/login` 与 `/auth/callback`：邮箱链接登录界面、状态提示、回调校验、退出；服务端新增认证适配、请求节流、验证后 HttpOnly 会话与到期处理。
- 案例库新增 Awwwards、Landing Love、Recent 网站集入口。Byotōne 有独立研究页 `/inspiration/byotone` 和实际独立静态页 `/examples/byotone.html`。

## 主要文件变更

| 文件 | 用途 |
| --- | --- |
| `src/Experience.tsx`、`src/KineticScene.tsx`、`src/experience.css` | 滚动体验、GLSL 变形、响应式、玻璃导航与页脚反馈 |
| `src/AccountPages.tsx`、`src/account-pages.css` | 邮箱登录、价格与 Aleks 介绍 |
| `src/collections.tsx`、`public/examples/byotone.html` | 网站集、精选研究与独立 HTML |
| `src/App.tsx`、`src/main.tsx` | 路由与统一导航接入 |
| `server/auth.mjs`、`server/index.mjs` | 新认证接口，原生成与预览接口保留 |
| `tests/auth.test.mjs`、`tests/revision-browser.mjs` | 认证验证与本轮浏览器验收 |
| `tests/browser-assets.mjs`、`package.json` | 多场景画布定位与测试命令 |
| `public/images/aleks-placeholder.jpg`、`ASSETS.md` | 临时人物图片及来源记录 |
| `README.md`、本报告、`evidence/references/`、`revision-*.png` | 接入与交付证据 |

未初始化 Git 仓库，未改动原有 B-000 交接目录。

## 实际参考访问

- 用户消息中的 Markdown 目标将两个 URL 错接在一起；实际访问了显示文本指定的 `awwwards.com` 与 `landing.love/sites/byotone/`。
- Landing Love：实际查看 Byotōne 详情及录屏入口，再通过 Visit Site 进入 `byotone.com`，点击 Enter Quietly，滚动观察场景与正文。证据 `evidence/references/byotone-entered.png` 和 `byotone-experience-*.png`。
- Awwwards：实际观察首页、获奖与提名列表并滚动。
- Godly：实际跳转至 Recent，按真实目标保留链接。
- Apple：实际访问 iOS 页面并滚动，观察玻璃导航处理方式。本项目为网页中的近似视觉实现，未宣称复刻系统专有渲染。
- Minimal Gallery 超时，未加入已核实列表。人物源详情页遇到 Cloudflare，图片 CDN 可用且已检查；详情见 `ASSETS.md`。

## 测试记录

- `npm test`：原 6 项核心测试 + 新增 4 项邮箱认证测试通过。认证覆盖未配置、邮箱格式、回调地址、节流、验证失败、HttpOnly/到期/退出及服务错误；使用模拟认证服务，没有发送真实邮件。
- `npm run build`：TypeScript 和构建成功。Three.js 延迟加载包约 695kB 的警告仍存在。
- `npm run test:browser`：8 组原产品流程回归通过，已在 `npm start` 运行的构建产物复验，覆盖三页创建、编辑、刷新保存及 ZIP 导出。
- `npm run test:browser:assets`：4 组上传、撤销、参考与工作室 WebGL 故障测试通过。
- `npm run test:browser:extra`：7 组独立导出、API 与模型/预览/GLB 失败、键盘及减少动效检查通过。
- `npm run test:browser:revision`：新增 10 组浏览器检查通过；覆盖 9 个路由在 1440/768/390px 下直接访问和刷新、滚动阶段、页脚鼠标反馈、价格弹窗、邮箱回调（模拟）、独立 HTML 与 WebGL 不可用降级。最终复验针对 `npm start` 运行的构建产物。
- `npm audit --audit-level=moderate`：0 vulnerabilities。

截图实际检查后修正了展开页面与标题遮挡、手机展开页位置、章节选中与鼠标悬停时的文字对比，以及手机 About 标题不自然的断行。生产复验还发现 CSS 压缩器因前缀属性顺序丢弃标准 `backdrop-filter` 声明；已调整声明顺序，构建后的玻璃导航样式断言通过。原始结果为 `revision-browser-results.json` 及原测试结果 JSON。

## 接口与未完成项

新增 `GET /api/auth/status`、`GET /api/auth/me`、`POST /api/auth/request-link`、`POST /api/auth/session`、`POST /api/auth/logout`。接入所需服务端环境变量与认证服务重定向设置见 README。

当前未配置 Supabase 邮箱认证服务，真实邮件投递和真实邮箱登录没有验收。会话为本机内存、1 小时有效；账号暂不与本地项目同步。支付、订阅权益执行、咨询预约与真实模型调用仍未接入或验证，价格为预览方案。

WebGL 和玻璃效果已在本机 Chrome 验证；未在实体 iPhone、Safari 或 macOS 原生 UI 环境验收。下一步可先验收视觉，再配置真实认证与模型服务；正式商用前确认邮件域、咨询联系方式、额度与收费规则。
