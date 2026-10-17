# 素材与许可记录

## SUPER INTELLIGENCE 太空示例：当前版本（2026-10-15）

- `src/space-scene.ts` 的实时光照、大气、云层漂移、金属舱体与动画为本项目原创 WebGL / GLSL 实现。ASTER 包含分段环形舱、支撑臂、中心压力舱、对接环、太阳能电池板及推进器；未复制第三方模型或网站源码。
- 地表纹理来自 NASA / GSFC Blue Marble： https://eoimages.gsfc.nasa.gov/images/imagerecords/57000/57730/land_ocean_ice_2048.png 。实际取得官方图片，转换为 2048×1024 JPEG，保存于 `assets/source/nasa-blue-marble.jpg`。
- 云层纹理来自 NASA / GSFC： https://eoimages.gsfc.nasa.gov/images/imagerecords/57000/57747/cloud_combined_2048.jpg 。实际取得官方图片，转换为 1024×512 灰度 JPEG，保存于 `assets/source/nasa-clouds.jpg`。
- 已阅读 NASA 媒体使用规范： https://www.nasa.gov/nasa-brand-center/images-and-media/ 。规范说明 NASA 内容在美国通常不受版权保护，但使用须符合其媒体指引；不将全部 NASA 素材笼统标为无条件公有领域。本项目标注 NASA / GSFC 来源，不使用 NASA 标志，不表示官方合作或背书。
- `src/space-earth.ts` 将两张纹理嵌入页面，离线导出不请求图片 CDN。导出包带 `ASSET-LICENSES.txt` 及来源链接，页脚保留影像署名。
- `assets/source/aster-scene-poster.jpg` 是本项目最终 WebGL 场景的实际渲染截图。`src/space-poster.ts` 嵌入该图用于加载中、纹理失败和 WebGL 不可用时的静态回退；`public/assets/frame-orbit.jpg` 是样本入口使用的裁切版本。截图中的地表与云层仍沿用上述 NASA 来源及指引。
- `src/space-files.ts` 的 SI 轨道标识及工程图为原创 SVG。旧版本的程序地表和 SVG 首屏回退已由上述贴图与渲染图替换。
- 新主题只使用设备上的 Arial、苹方或微软雅黑等系统字体，没有新增字体文件、GLB 或依赖。独立导出包含原创场景代码，不嵌入 React 或 Three.js。
- SUPER INTELLIGENCE、ASTER、Dr. Lyra Voss 及其故事为概念演示，不代表真实客户、人物履历或航天运营能力。新闻、报价和表单也明确标注用途。

## 最新原样式恢复与声音修订（2026-10-15）

- 按用户提供的截图恢复本项目原有深绿粒子场景、Georgia 系统衬线字体和 Archivo 品牌字。纸质雕塑不再作为首页主体；粒子、变形与页面绘制沿用本项目原创代码。
- `src/soundscape.ts` 提供原创合成海浪、滤波白噪音、Jazz 风格电钢琴/摇摆节奏与 R&B 风格和弦/慢节拍。没有下载自然录音、商业音乐或第三方曲目，没有新增素材许可依赖。界面明确标注合成音景。
- `src/SoundControl.tsx` 长按进度线和声音面板、`src/Atmosphere.tsx` 的 SVG 背景位移滤镜、`src/comfort.css` 的多层玻璃高光为原创实现。
- 已有 Manrope/Archivo 许可继续保留；没有从用户参考站提取字体、音频、源码或模型。

## 前次暖色与交互修订（历史，2026-10-15）

- `src/KineticScene.tsx` 的暖色带状雕塑、折叠变形与页面纹理为本项目原创程序几何与绘制代码；没有新增第三方模型或贴图。此前粒子效果保留为转场辅助，首页视觉主体已更新为暖色纸质雕塑。
- `src/Atmosphere.tsx` 的背景声音由 Web Audio 正弦声部、缓慢调制和滤波实时合成，未使用第三方录音或曲目。默认静音，需主动开启。
- 同文件中的鼠标轻水纹为原创 Canvas 椭圆涟漪；玻璃为网页 CSS 近似效果，不是参考站的流体源码或 Apple 原生渲染器。
- `src/DraggableTitle.tsx` 字形拖动与散开动画为原创实现。展示文字改用已有的 Manrope 字体，沿用下方 OFL 许可记录。
- 支持页的 Aleks.com、ChatGPT 为外部展示链接，没有导入其标识、素材或声明商业赞助关系。

## 本次原创内容

- `studio.blend`、`scripts/build-studio.py`、`public/studio/studio.glb`、`public/studio/studio.png`：本次使用 Blender 建模、渲染和导出，218 个物件；没有引入第三方 GLB 或纹理。含桌面、显示器、单独按键、灯、纸张、杯、样本架、档案抽屉、材质转轮、建筑拱与磨砂玻璃标识。
- `src/core.ts` 中的 SVG 静物、`src/Icons.tsx` 图标、案例构图摘要及品牌图形：本次原创代码绘制。
- 用户上传图片保留其原有权利归属；导出的图片经过 WebP 压缩。
- 产品与生成站点中的 MORROW 木间为明确标注的演示案例，无真实客户或使用数据声明。

## 实际观察的参考

2026-10-15 使用真实 Chrome 访问。仅借鉴设计方法，未复制原站模型、图片、字体、标识或源码。

| 来源 | 实际操作与观察 | 本项目采用的方法 |
| --- | --- | --- |
| https://felixrieseberg.com/ | 观察房间首屏、滚动、导航，通过 C 键进入电脑并观察镜头 | 物件对应实际用途；镜头解释进入工作区域 |
| https://www.leoparpeix.com/ | 初次停在加载页，后续等待后看到完整花形雕塑场景；操作进入、滚动至内容列表 | 单一立体主体、暖光与材质、空间到普通内容的衔接 |
| https://nickho-motorsports.nl/ | 观察黑白大字首屏，打开菜单并进入 About，继续滚动 | 大字与小信息的比例、网格和阅读节奏 |

浏览证据位于候选工作区 `work/references/`。案例库展示的是原创构图摘要，明确标记为“构图摘要”，并提供真实来源链接。

## 字体

- Archivo Variable 5.3.0：Archivo Project Authors，SIL OFL 1.1，https://github.com/Omnibus-Type/Archivo 。许可 `public/licenses/Archivo-OFL.txt`。
- Manrope Variable 5.3.0：Manrope Project Authors，SIL OFL 1.1，https://github.com/sharanda/manrope 。许可 `public/licenses/Manrope-OFL.txt`。
- 中文及导出网站使用设备系统字体；未从参考网站提取专有字体。

## 直接依赖

从实际安装的包元数据和许可文件核对。精确版本锁定于 `package-lock.json`。

| 依赖 | 版本 | 许可 | 用途 |
| --- | --- | --- | --- |
| React / React DOM | 19.3.0 | MIT | 页面和编辑器 |
| Three.js | 0.180.0 | MIT | GLB 场景 |
| fflate | 0.8.3 | MIT | ZIP 导出 |
| Vite | 8.3.4 | MIT | 本地开发与构建 |
| TypeScript | 5.9.3 | Apache-2.0 | 类型检查 |
| Playwright | 1.64.1 | Apache-2.0 | 浏览器验证 |
| Prettier | 3.9.10 | MIT | 源码格式化 |

运行时 MIT 声明已复制到 `public/licenses/` 并随产品构建保留；开发工具及其间接依赖的完整许可在各安装包目录中。静态导出站点不嵌入 React、Three.js 或本地打包字体。

## 本轮视觉更新（2026-10-15）

- `src/KineticScene.tsx`：本轮原创 GLSL 粒子变形与页面绘制代码。44000 个桌面粒子、17000 个手机粒子，未复制第三方网页脚本、模型或视频。
- `src/Experience.tsx` 和玻璃样式：参考 Byotōne 的深色空间、浅绿字级、连续形态和章节导航，以及 Apple OS 页面的玻璃导航处理方式；采用本项目自己的界面与内容。
- Byotōne 已从 Landing Love 的 Visit Site 实际进入，点击 Enter Quietly 并滚动观察。访问证据和实际 DOM 位于 `evidence/references/`。
- Awwwards 与 Landing Love 可访问；Godly 实际重定向到 `recent.design`。Minimal Gallery 本轮访问超时，未列为精选入口。
- `public/images/aleks-placeholder.jpg`：Pexels 照片 ID 2379004。图片 CDN 实际返回成功并经视觉检查，来源 https://www.pexels.com/photo/man-wearing-blue-crew-neck-t-shirt-2379004/ ，标准许可 https://www.pexels.com/license/ 。原照片详情页触发 Cloudflare 验证，未声称核实摄影师身份。界面明确标为临时形象图、非 Aleks 本人照片；未用于身份背书或虚构经历。
- 外部网站集仅提供原始链接；独立 HTML 是本项目的原创研究内容，不提供第三方网站源码下载。
