# 构页 / FRAME

最新：首页强化高反差 **FRAME** 标识，四组标题支持靠边放大与全屏柔和散射；后续内容、电脑宣传页、3D 工作室、案例、末尾入口和页脚各有独立滚动响应。电脑宣传页复用 SUPER INTELLIGENCE 六页样本，可直接切换页面并进入作品或工作台。移动导航使用独立液态毛玻璃层。交付、实际测试及限制见 `HOME_MOTION_REPORT.md`；截图位于 `evidence/home-motion/`，专项命令 `npm run test:browser:home-motion`。

桌面鼠标经过时的水纹使用更大范围的多层椭圆折射圈，边缘平滑淡出；触控设备和减少动态效果模式自动关闭。声音、导航和输入仍保持可用。专项回归：`npm run test:browser:comfort`。

创建向导与案例库现已接入 **FRAME 原创可编辑样本**。直接访问 `/inspiration/super-intelligence` 浏览六页作品，点击「使用六页样本」会保存独立项目并进入同一个编辑工作台，不覆盖已有项目。编辑器上方的「查看原始作品」可返回样本详情。创建向导中的三个推荐网站可点击「用作参考链接」，自动填写 URL 并加入所选参考；链接随项目保存在本机，当前演示不自动抓取网站内容。

SUPER INTELLIGENCE 场景已更新为 NASA 地表与云层纹理、原创分段轨道舱和太阳能电池板；WebGL/纹理失败时使用实际渲染图回退。来源与使用指引见 `ASSETS.md`，交付与测试见 `SAMPLE_CONNECTION_REPORT.md`；最新截图位于 `evidence/sample-connections/` 和 `evidence/space/`。专项命令：`npm run test:browser:samples`、`npm run test:browser:space`。

新增 **SUPER INTELLIGENCE 六页太空旅行示例**：打开 `/product`，点击「体验完整工作台」。包含实时 WebGL 行星与轨道舱、旅行计划、航天器、虚构工程师故事、可展开新闻、概念价格和本机意向表单。六页可编辑、保存并完整导出；未编辑过的旧 MORROW 内置示例会保留项目 ID 升级，并可撤销恢复。已有用户编辑的项目保留原样。交付与实际测试见 `SPACE_DEMO_REPORT.md`，截图位于 `evidence/space/`。

独立验证产物位于 `exported-space-example/`，可在该目录执行 `python3 -m http.server 8080 --bind 127.0.0.1`。本轮主题测试命令：`npm run test:browser:space`；单元测试已包含在 `npm test` 中。

可运行的数字设计工作室：滚动驱动的实时 3D 首页、内容输入、参考选择、三种预置方向、多页网站创建、编辑、保存和静态代码导出。

最新版本将工作台统一为深绿与薄荷色液态玻璃，增加专注预览、快捷键发送和平板分区操作，交付记录见 `WORKSPACE_GLASS_REPORT.md`。首页恢复、玻璃与长按声音设置见 `GLASS_SOUND_REVISION_REPORT.md`。此前暖色修订为历史记录 `COMFORT_REVISION_REPORT.md`；邮箱登录、Aleks 介绍、价格页与网站集扩展见 `REVISION_REPORT.md`。

当前默认是明确标注的**演示模式**。未配置真实模型密钥，也未验证真实模型生成。演示生成与对话修改使用预置规则，页面内容和本地项目操作有效。

## 启动

需要 Node.js 24 或更新版本、npm。当前在 Node 26.10 / npm 11.19 / macOS 上验证。

```sh
npm ci
npm run dev
```

打开 http://127.0.0.1:4173/ 。启动命令同时运行网页、服务端 API（4175）与隔离预览服务（4174）。请保持三个端口空闲，避免混用 localhost 与 127.0.0.1 的本地存储。

构建并运行构建产物：

```sh
npm run build
npm start
```

`npm start` 用于本机验收构建结果，使用 Vite preview；公网部署还需要正式托管、HTTPS 和隔离预览域配置。

## 使用

首页顶部声音按钮：短按开启/静音；长按约 0.7 秒，进度线画完一圈后打开“声音空间”。也可点击旁边的下箭头进入。可选自然海岸、白噪音、Jazz、R&B，并调节音量；均为原创合成音景。默认海岸、26% 音量、静音启动，记住声音类型和音量，刷新仍静音。产品内导航保留播放状态；切换音景淡入淡出，后台标签暂停声音。弹窗支持键盘、Escape 退出和焦点恢复。

拖动“Make it / feel like you.”、“Change your / perspective.”、“Many pages. / One identity.”或末尾“What's your / next idea?”，靠近窗口边缘会先放大，再柔和散满视窗；可点击“复位标题”或等待约 2.6 秒自动恢复。四处标题共用交互，切换章节会清除偏移。键盘聚焦标题后可用方向键移动、Enter/空格散开、Escape 复位。手机保留自然滚动，轻水纹仅用于精细鼠标设备，减少动态效果模式关闭水纹和全屏散射并简化滚动效果。专项验证：`npm run test:browser:titles`、`npm run test:browser:home-motion`；最新记录见 `HOME_MOTION_REPORT.md`，原章节交互记录见 `CHAPTER_TITLE_REPORT.md`。

1. 首页点击“开始创建”，或在案例库选择参考。
2. 填写用途、受众和文案，也可点击“填入演示内容”。图片和链接可选。
3. 编辑站点页面，选择三个预置方向之一，点击“生成演示网站”。
4. 在工作台切换页面与设备；内容编辑修改正文，对话区提供明确标记的演示指令。
5. 选择“只改当前页面”或“更新全站共享样式”；可撤销并比较初始与当前版本。
6. 导出 ZIP。项目、收藏与参考保存在当前浏览器本地，刷新后可继续。

桌面工作台可点击“专注预览”展开画布，再次点击恢复侧栏；对话支持 Cmd / Ctrl + Enter 发送。平板及手机使用“页面与素材 / 网站预览 / 内容与对话”切换；点击具体板块直接进入当前页面内容编辑，点击“编辑全站样式”进入共享设置。

`/workspace` 创建向导的“整理内容 / 确认页面 / 选择方向”三步也使用相同的深绿液态玻璃主题；生成前显示“生成后本地保存”，生成后进入项目编辑态。

支持最多 12 页、8 张图片。每张上传 ≤2MB，处理为最长边 1400px 的 WebP；首张用于预览，所有处理后的图片均随 ZIP 导出。大批项目可能达到浏览器存储上限，界面会报告保存失败。

## 模型接入

密钥仅供 `server/index.mjs` 读取，禁止使用 `VITE_` 前缀或写入前端源码。启动前在本地终端环境设置 `OPENAI_API_KEY`；可选设置 `OPENAI_MODEL`（默认 `gpt-4.1-mini`），然后重新启动服务。运行器继承终端环境，不会自动加载 `.env`。

服务检测到密钥后，创建流程第三步显示真实模型选项。适配器调用 OpenAI Chat Completions 的 JSON 输出模式，并校验返回的页面结构。**目前该适配器只为所选预置布局生成内容，未验证实际 API 调用；对话编辑始终为演示指令。** 不支持任意代码或业务后端生成。

仅点击真实模型选项并生成时，项目用途、受众和文案会发送至模型服务；当前适配器不发送上传图片。参考链接作为记录保存，当前版本不抓取链接内容或自动分析截图。

## 导出站点独立运行

解压下载的 ZIP，进入解压目录：

```sh
python3 -m http.server 8080 --bind 127.0.0.1
```

打开 http://127.0.0.1:8080/ 。导出为 HTML、共用 CSS 和本地图片，无需 Node 或构建。内链使用 `index.html`、`about.html` 等相对地址。附带可检查的 `demo-site.zip` 和 `exported-example/`。

## 验证

浏览器脚本需要已安装 Google Chrome。先保持 `npm run dev` 或 `npm start` 运行：

```sh
npm test
npm run build
npm run test:browser
npm run test:browser:titles
npm run test:browser:home-motion
npm run test:browser:revision
npm run test:browser:comfort
npm run test:browser:glass-sound
npm run test:browser:workspace
npm run test:browser:wizard
npm run test:browser:samples
npm run test:browser:space
python3 -m http.server 8080 --bind 127.0.0.1 --directory exported-example
# 上一条单独保持运行，再在另一终端执行：
npm run test:browser:extra
npm run test:browser:assets
npm audit --audit-level=moderate
```

最新实际执行结果和限制见 `HOME_MOTION_REPORT.md`；此前结果见 `SAMPLE_CONNECTION_REPORT.md`、`SPACE_DEMO_REPORT.md`、`WORKSPACE_GLASS_REPORT.md`、`GLASS_SOUND_REVISION_REPORT.md`、`COMFORT_REVISION_REPORT.md`、`REVISION_REPORT.md`，原版流程记录见 `TEST_REPORT.md`。视觉截图见 `evidence/`；素材来源见 `ASSETS.md`。

## 文件入口

- `src/App.tsx`：产品路由、案例库与本地项目管理。
- `src/Atmosphere.tsx`、`src/DraggableTitle.tsx`、`src/comfort.css`：玻璃折射、鼠标水纹、支持页、可拖动标题与交互样式。
- `src/SoundControl.tsx`、`src/soundscape.ts`：长按声音面板、音量、偏好保存和四种原创合成音景。
- `src/KineticScene.tsx`、`src/Experience.tsx`：首页实时粒子变形与滚动章节。
- `src/Workspace.tsx`：创建流程、编辑器、隔离预览、上传与 ZIP 导出。
- `src/Studio.tsx`：原创 GLB 场景、物件反馈、镜头与降级。
- `src/core.ts`：结构化站点、验证、静态文件生成与本地保存格式。
- `server/index.mjs`：模型适配与独立端口预览。
- `scripts/build-studio.py`、`studio.blend`：可编辑的原创模型源文件。

## 邮箱登录接入

`/login` 使用邮箱魔法链接。当前未配置服务，界面会如实提示，不会发送邮件或模拟登录。

服务端设置：

- `SUPABASE_URL`：Supabase 项目 HTTPS URL。
- `SUPABASE_ANON_KEY`：项目 anon key；本实现只在服务端读取，不使用 service-role key。
- `APP_ORIGIN`：网页来源，默认 `http://127.0.0.1:4173`。

在 Supabase Auth 中启用 Email，将 `${APP_ORIGIN}/auth/callback` 加入允许的 Redirect URLs，并配置正式邮件投递服务。启动器不自动读取 `.env`，请先在终端环境中设置变量再重启。

接口：`GET /api/auth/status`、`GET /api/auth/me`、`POST /api/auth/request-link`、`POST /api/auth/session`、`POST /api/auth/logout`。登录链接返回的凭证由服务端调用认证服务验证后，换成 HttpOnly 会话 Cookie。会话保存在本机服务内存，1 小时到期或服务重启失效。生产环境需要持久化会话、正式域名/HTTPS 及部署配置。

本轮没有真实邮箱服务凭据，实际邮件发送与真实邮箱登录未验收。认证测试使用模拟服务；本地项目暂不与账号同步。

## 新页面与定价

- `/pricing`：Go $5 / 月、Plus $15 / 月、Max $39 / 月，Ultra 和一次性咨询联系报价。价格与权益为方案预览，未接入支付或用量限制。
- `/about`：Aleks / Start-up Business Designer，88 字介绍和明确标注的网络临时形象图。
- `/inspiration`：保留原案例库，新增 Awwwards、Landing Love、Recent（原 Godly）网站集入口。
- `/inspiration/byotone`：精选交互研究。
- `/examples/byotone.html`：可单独打开的静态 HTML 研究页。
- `/sponsorship`：支持与工具展示链接，明确注明尚无已确认的商业赞助关系。

执行邮箱与定价页专项验证：`npm run test:browser:revision`。当前 `npm test` 包含 6 项核心、4 项邮箱认证及 8 项太空主题测试。
