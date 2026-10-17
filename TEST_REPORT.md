# 实际测试报告

日期：2026-10-15。环境：macOS、Node 26.10、npm 11.19、Playwright 1.64.1 + 已安装 Google Chrome。浏览器最终回归针对 `npm start` 启动的构建结果；导出站点独立通过 Python HTTP 服务运行。

## 已执行命令

| 命令 | 实际结果 |
| --- | --- |
| `npm test` | 6 项通过：页面内链/共用 CSS、全部素材导出与安全路径、无效数据拒绝、内容转义、修改范围、图片去重持久化 |
| `npm run build` | TypeScript 检查与 Vite 构建成功；保留 Three.js 延迟加载包体积警告 |
| `npm start` | 网页 4173、隔离预览 4174、API 4175 实际启动成功 |
| `npm run test:browser` | 8 组流程通过，页面脚本异常与 HTTP 错误为空 |
| `python3 -m http.server 8080 --bind 127.0.0.1 --directory exported-example` | 独立导出站点启动成功 |
| `npm run test:browser:extra` | 7 组检查通过，含导出链接/样式/图片、缺少密钥、错误路径、跨来源请求拒绝、3D 失败、预览失败、模拟模型失败恢复、无项目与减少动效 |
| `npm run test:browser:assets` | 4 组检查通过：两张图片压缩/刷新/ZIP、实际撤销、已有项目加入参考、WebGL 中断降级 |
| `npm audit --audit-level=moderate` | 0 vulnerabilities；仅表示当前 npm 数据库扫描结果 |

19 组浏览器检查的原始结果分别在 `browser-results.json`、`extra-browser-results.json`、`asset-browser-results.json`。

## 浏览器验证范围

- 六条产品路由：导航、直接访问、刷新、前进后退中的返回。
- 案例关键词/行业筛选、无结果状态、收藏、详情、为新项目或已有项目选择参考。
- 创建必填校验、页面添加/删除/排序、三个不同方向、生成进入工作台。
- 首页/关于/产品页面切换、局部正文编辑、全站强调色、刷新后项目保留。
- 桌面/手机预览、版本对比、撤销、ZIP 下载。
- 项目复制、重命名、删除取消与明确确认。
- 390px 手机宽度下全部产品页面、工作台及独立导出三页无横向溢出。
- 独立导出三页导航有效、共用 CSS 和强调色一致，图片实际加载。
- WebGL/GLB 失败时替代图和入口可用；预览 API 中断时显示说明及隔离静态内容。
- 模型失败为浏览器拦截的模拟 502，实际检查错误提示、保留输入与改用演示模式恢复；未调用真实模型。
- `prefers-reduced-motion` 和键盘操作场景入口。

## 截图与实际修正

实际检查 `home-hero.png`、`home-desktop.png`、`home-product-demo.png`、`home-mobile.png`、`inspiration-desktop.png`、`workspace-desktop.png`、`workspace-mobile.png`、`generated-site-desktop.png`、`generated-site-mobile.png`。

根据截图实际调整了工作室构图范围、照明与阴影、编辑区文字可读性、生成标题换行、强调按钮的字色，以及手机预览的加载提示。手机截图等待隔离页面实际加载后重新拍摄，最终截图包含实际内容。

修复过程曾出现导出函数漏保留变量导致的 `ReferenceError`，已补回并由核心测试、构建及完整浏览器流程复验。补充脚本也修正了案例名称定位和动画完成时机断言。最终上述命令均通过，没有遗留失败项。

## 尚未验证

- 没有 API Key，未执行真实 OpenAI 请求，不能宣称真实 AI 多页生成通过。
- 未执行 Safari、Firefox、实体手机或跨平台系统字体视觉检查。
- 未进行公网部署、负载测试或全面安全审计。当前服务仅绑定本机。
- Three.js 延迟加载包约 695kB（gzip 176kB），GLB 约 4.4MB；手机采用静态替代图，完整功能入口保留。
