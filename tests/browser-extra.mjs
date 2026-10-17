import { chromium } from "playwright";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
const b = await chromium.launch({ channel: "chrome", headless: true });
const p = await b.newPage({ viewport: { width: 1440, height: 1000 } });
let checks = [];
const pass = (s) => {
  checks.push(s);
  console.log("PASS", s);
};
const errors = [];
p.on("pageerror", (e) => errors.push(e.message));
await p.goto("http://127.0.0.1:8080/");
await p.getByRole("heading", { name: "日常，值得认真对待。" }).waitFor();
const bg = await p
  .locator(".cta")
  .evaluate((e) => getComputedStyle(e).backgroundColor);
assert.equal(bg, "rgb(52, 91, 118)");
await p.screenshot({ path: "generated-site-desktop.png", fullPage: true });
for (const title of ["关于", "产品", "首页"]) {
  await p
    .locator("header")
    .getByRole("link", { name: title, exact: true })
    .click();
  assert.equal(await p.locator("header .brand").innerText(), "MORROW 木间");
  assert.equal(
    await p
      .locator(".cta")
      .evaluate((e) => getComputedStyle(e).backgroundColor),
    bg,
  );
  assert.equal(
    await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    true,
  );
}
await p.setViewportSize({ width: 390, height: 844 });
for (const path of ["index.html", "about.html", "product.html"]) {
  await p.goto("http://127.0.0.1:8080/" + path);
  assert.equal(
    await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    true,
  );
  assert.equal(
    await p
      .locator("img")
      .evaluateAll((xs) => xs.every((i) => i.complete && i.naturalWidth > 0)),
    true,
  );
}
await p.screenshot({ path: "generated-site-mobile.png", fullPage: true });
pass(
  "independently served export: home/about/product navigation, shared CSS, assets and mobile overflow",
);
const response = await p.request.post("http://127.0.0.1:4173/api/generate", {
  data: { mode: "live", brief: { pages: [] } },
});
assert.equal(response.status(), 503);
assert.match((await response.json()).error, /API Key/);
const bad = await p.request.post("http://127.0.0.1:4173/api/preview", {
  data: {
    site: {
      name: "bad",
      direction: "editorial",
      accent: "#ffffff",
      pages: [{ slug: "../escape" }],
      assets: [],
    },
  },
});
assert.equal(bad.status(), 400);
const foreign = await p.request.post("http://127.0.0.1:4175/api/preview", {
  headers: { Origin: "https://foreign.example" },
  data: {},
});
assert.equal(foreign.status(), 403);
pass(
  "missing model key, invalid generated paths and foreign origin produce explicit errors",
);
await p.setViewportSize({ width: 1440, height: 1000 });
await p.route("**/studio/studio.glb", (r) => r.abort("failed"));
await p.goto("http://127.0.0.1:4173/");
await p.getByText("静态工作室 · 全部入口可用", { exact: true }).waitFor();
assert.equal(
  await p.locator(".studio-still").evaluate((e) => getComputedStyle(e).opacity),
  "1",
);
await p.locator(".hotspot-create").click();
await p.locator(".workspace-start").waitFor();
await p.unroute("**/studio/studio.glb");
pass("failed 3D model falls back to static scene with working create entry");
await p.route("**/api/preview", (r) => r.abort("failed"));
await p.goto("http://127.0.0.1:4173/");
await p.locator(".demo-ui").scrollIntoViewIfNeeded();
await p.locator(".preview-error").waitFor();
await p
  .frameLocator("iframe")
  .getByRole("heading", { name: "Beyond the ordinary.", exact: true })
  .waitFor();
await p.unroute("**/api/preview");
pass("preview API failure shows explanation and sandboxed fallback content");
await p.goto("http://127.0.0.1:4173/workspace?project=missing");
await p.getByRole("heading", { name: "找不到这个项目。" }).waitFor();
pass("missing project has a recovery route");
await p.route("**/api/status", (r) =>
  r.fulfill({ json: { liveAvailable: true } }),
);
await p.route("**/api/generate", (r) =>
  r.fulfill({ status: 502, json: { error: "模型服务暂不可用，请重试" } }),
);
await p.goto("http://127.0.0.1:4173/workspace?mode=blank");
await p.getByRole("button", { name: "填入样本内容" }).click();
await p.getByRole("button", { name: "下一步" }).click();
await p.getByRole("button", { name: "下一步" }).click();
await p.getByRole("checkbox", { name: "使用已配置的真实模型" }).check();
await p.getByRole("button", { name: "调用模型并生成" }).click();
await p.getByRole("alert").getByText("模型服务暂不可用，请重试").waitFor();
await p.getByRole("checkbox", { name: "使用已配置的真实模型" }).uncheck();
await p.unroute("**/api/generate");
await p.unroute("**/api/status");
await p.getByRole("button", { name: "生成网站" }).click();
await p.locator(".editor").waitFor();
pass(
  "simulated provider failure keeps the brief and allows recovery through demo generation",
);
await p.emulateMedia({ reducedMotion: "reduce" });
await p.goto("http://127.0.0.1:4173/");
assert.ok(
  parseFloat(
    await p
      .locator(".button")
      .first()
      .evaluate((e) => getComputedStyle(e).transitionDuration),
  ) <= 0.00001,
  "reduced motion should reduce transitions to a near-zero duration",
);
await p.getByText("原创 3D 工作室 · 点击物件探索", { exact: true }).waitFor();
await p.locator(".hotspot-create").focus();
await p.locator(".hotspot-create").press("Enter");
await p.locator(".workspace-start").waitFor();
pass("reduced motion style and keyboard-accessible scene entry");
await fs.writeFile(
  "extra-browser-results.json",
  JSON.stringify({ checks, errors }, null, 2),
);
assert.deepEqual(errors, []);
await b.close();
