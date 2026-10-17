# 推荐参考、样本工作台连接与太空视觉修订

日期：2026-10-15

## 任务信息

任务标识：本轮两条浏览器批注（用户未另行指定任务 ID）。目标：推荐网站可直接选用为参考链接；把 SUPER INTELLIGENCE 作为 FRAME 出品作品接入同一编辑工作台，并改善地球和轨道舱。状态：已实现，实际验证如下。

运行地址：http://127.0.0.1:4173/workspace 。作品详情：http://127.0.0.1:4173/inspiration/super-intelligence 。启动：在本目录运行 `npm run build`，然后 `npm start`。

## 实现内容

- 创建页的 Felix、Léo、Nick Ho 推荐项分别提供真实来源外链、勾选框和「用作参考链接」按钮。点击按钮填写参考 URL、加入案例选择并显示选中状态；可同时选择多个案例。填入演示内容时保留已选 URL，生成与刷新后参考记录仍在。
- 创建页和案例库共用 FRAME 原创作品卡。作品详情支持六页切换和实际隔离预览；「使用六页样本」保存独立副本，直接进入已有工作台。编辑器显示「FRAME 出品 / 001」及返回原始作品的入口，继续使用页树、内容编辑、共享样式、保存、撤销、对比和导出。
- 每次使用样本生成新的项目 ID，不覆盖已有编辑。该入口使用预置作品，不伪称实时 AI 生成，也不将虚构品牌称为真实客户。
- 地球改为 NASA / GSFC 地表与云层纹理，调整经度方向避免大陆镜像，加入漂移云层、大气边缘、昼夜与海面高光。
- ASTER 细化为分段环形舱、八条支撑臂、中心压力舱、观察窗、对接环、太阳能电池格与框架、推进器和通信结构。使用原创 WebGL / GLSL 几何和材质，保留鼠标视角与暂停。
- 使用最终场景的实际渲染图作为静态回退和入口缩略图。纹理失败或 WebGL 不可用时可继续浏览。图片内置于导出页面，来源与规范随 ZIP 提供。
- 实际截图检查后修正作品详情页浅色背景上的低对比文字及页面切换按钮；样本卡采用独立深绿底，避免在浅色案例库中失去对比。手机截图等待预览缩放动画结束后再取证。

## 文件变更

| 文件 | 变更与用途 |
| --- | --- |
| `src/SpaceSampleCard.tsx` | 新增可复用的第一方样本卡 |
| `src/App.tsx` | 案例库入口、作品详情路由、六页预览和创建副本 |
| `src/Workspace.tsx` | 推荐链接按钮、样本创建入口、作品来源栏 |
| `src/workspace-wizard-glass.css` | 卡片、链接、来源栏、详情页及手机样式 |
| `src/space-scene.ts` | 纹理、原创轨道舱细节、光照、纹理失败处理及更新脚本摘要 |
| `src/space-earth.ts`、`src/space-poster.ts` | 新增内嵌地表、云层与静态渲染图数据 |
| `src/space-files.ts`、`src/space-style.ts` | 静态回退、图像标记、署名、导出素材说明和图片样式 |
| `assets/source/nasa-blue-marble.jpg`、`nasa-clouds.jpg`、`aster-scene-poster.jpg` | 新增转换后的纹理源图与场景渲染图 |
| `public/assets/frame-orbit.jpg` | 新增样本入口缩略图 |
| `tests/sample-connections-browser.mjs` | 新增参考保存、作品入口、副本隔离、页面切换、直接访问和响应式测试 |
| `tests/space-site.test.mjs`、`tests/space-browser.mjs` | 新增素材内置/许可检查和纹理失败回退；截图等待纹理就绪 |
| `package.json` | 新增 `test:browser:samples` 命令，无新依赖 |
| `README.md`、`ASSETS.md`、`SPACE_DEMO_REPORT.md`、本报告 | 更新使用、来源、许可与交付记录 |

更新的验证产物：`space-demo-site.zip`、`exported-space-example/`、`evidence/space/`、`evidence/sample-connections/` 及浏览器结果 JSON。没有初始化 Git，也没有删除用户原有文件。

## 测试报告

实际使用本机 headless Google Chrome 运行，使用独立浏览器存储：

| 实际命令 | 结果 |
| --- | --- |
| `npm test` | 18 项通过：核心 6、认证 4、太空主题 8 |
| `npm run build` | TypeScript 与 Vite 构建通过；存在大分块提示，详见限制 |
| `npm run test:browser:samples` | 3 组通过：参考 URL 保存；详情/六页副本/来源返回入口；案例库与创建页连接、桌面及手机无横向溢出。详情页另测六页选项、新闻切换、1440/390/320px 与刷新 |
| `npm run test:browser:space` | 7 组通过：真实 WebGL、六页内链、编辑/保存/撤销/对比、独立 ZIP、新闻/意向表单、失败回退及旧示例兼容 |
| `npm run test:browser:wizard` | 1440/1024/768/390/320px 五种宽度通过，含验证、页面操作、生成、持久化与返回 |
| `npm run test:browser` | 8 组通用产品回归通过，运行异常记录为空 |

导出验证实际下载并解压 ZIP，启动独立 HTTP 服务，对六页执行直接访问、刷新、内部导航及 1440/768/390/320px 布局检查。回退检查实际模拟纹理错误、WebGL 不可用、预览 API 失败与减少动态效果。未配置或验证真实模型 API。

已人工查看截图：`evidence/sample-connections/workspace.png`、`create-390.png`、`detail-1440.png`、`detail-390.png`，以及 `evidence/space/index-1440.png`、`index-390.png`。自动化通过与视觉检查分别进行；不以页面能显示作为视觉验收依据。

## 接口影响

公共 API、`Site` / `Project` 数据结构、存储键和现有文件生成合同不变。参考按钮复用已有 `referenceUrl` 与案例 ID；新建副本复用已有保存与导航流程。没有引入新依赖。

预览维持仅 `allow-scripts` 的不透明来源隔离，不开放 `allow-same-origin`。脚本 CSP 仍只允许可信内置运行时的精确 SHA-256 摘要；导出保留网络连接与表单提交限制。编辑文本继续转义。

## 风险与未解决问题

- 参考链接当前作为记录保存，不抓取、理解或复制外站。六页样本和对话规则仍是明确标注的本地演示；真实 AI 生成未验证。
- NASA 内容遵守实际来源的媒体使用指引，不作官方背书。第三方影像来源与条款记录于 `ASSETS.md` 及 ZIP 内 `ASSET-LICENSES.txt`。
- 内嵌离线纹理和回退图增大主代码包：本机构建约 1,197KB，gzip 719KB；原有 Three.js 分块约 695KB。后续可独立延迟加载样本素材以改善首次加载。本轮未做网络或实机性能认证。
- 本轮在桌面 Chrome 测试不同视口，未完成真实 iPhone/Safari、Firefox、低端 Android 的兼容性与帧率验收。
- ASTER 为视觉概念模型；品牌、人物、新闻、航程与价格均为虚构。样本编辑使用固定专用布局，不能据此宣称任意输入均可生成同等定制效果。

## 下一步

可直接从作品详情创建副本验收。后续真实模型接入需要确认服务、密钥与生成合同；跨浏览器及低端设备性能验证可在视觉确认后继续。
