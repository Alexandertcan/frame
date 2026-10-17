import { chromium } from "playwright";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { unzipSync } from "fflate";
import {
  demoSite,
  sampleBrief,
  packProjects,
  unpackProjects,
} from "../src/core.ts";
import { spaceProject } from "../src/space-demo.ts";

const checks = [],
  errors = [],
  shots = "evidence/space";
await fs.mkdir(shots, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  acceptDownloads: true,
});
const page = await context.newPage();
page.on("pageerror", (e) => errors.push(e.message));
const pass = (name) => {
  checks.push(name);
  console.log("PASS", name);
};
const frame = () => page.frameLocator("iframe");
// Chrome's automation bounds omit the CSS transform on an embedded frame.
// Use actual mouse coordinates, scaled from the frame's local client rect.
async function clickInPreview(locator) {
  await locator.evaluate(
    () =>
      new Promise((resolve) => {
        if (document.readyState === "complete") resolve();
        else addEventListener("load", resolve, { once: true });
      }),
  );
  await locator.evaluate((el) =>
    el.scrollIntoView({ block: "center", behavior: "instant" }),
  );
  await locator.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
  const rect = await locator.evaluate((el) => {
    const r = el.getBoundingClientRect();
    return { x: r.x, y: r.y, width: r.width, height: r.height };
  });
  const iframe = page.locator("iframe"),
    box = await iframe.boundingBox();
  const scale = box.width / (await iframe.evaluate((el) => el.clientWidth));
  await page.mouse.click(
    box.x + (rect.x + rect.width / 2) * scale,
    box.y + (rect.y + rect.height / 2) * scale,
  );
}
let server, failure;
try {
  await page.goto("http://127.0.0.1:4173/product");
  await page
    .getByRole("button", { name: "体验完整工作台", exact: true })
    .click();
  await page.locator(".editor").waitFor();
  assert.equal(await page.locator(".page-tree button").count(), 6);
  await frame().locator('[data-renderer="webgl"][data-earth="ready"][data-cloud="ready"]').waitFor();
  const scene = frame().locator("[data-space-scene]");
  const start = Number(await scene.getAttribute("data-frames"));
  await page.waitForTimeout(600);
  assert.ok(Number(await scene.getAttribute("data-frames")) > start + 2);
  assert.equal(
    await page.locator("iframe").getAttribute("sandbox"),
    "allow-scripts",
  );
  assert.ok(
    !(await page.locator("iframe").getAttribute("sandbox")).includes(
      "allow-same-origin",
    ),
  );
  await clickInPreview(frame().getByRole("button", { name: "暂停 3D 动画" }));
  await frame().locator('[data-space-scene][data-paused="true"]').waitFor();
  const paused = await scene.getAttribute("data-frames");
  await page.waitForTimeout(250);
  assert.equal(await scene.getAttribute("data-frames"), paused);
  await clickInPreview(frame().getByRole("button", { name: "播放 3D 动画" }));
  await page.waitForTimeout(250);
  assert.ok(Number(await scene.getAttribute("data-frames")) > Number(paused));
  await frame()
    .locator("html")
    .evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await page.screenshot({ path: shots + "/workspace.png" });
  await page.getByRole("button", { name: "专注预览", exact: true }).click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: shots + "/workspace-focus.png" });
  await page.getByRole("button", { name: "专注预览", exact: true }).click();
  await page.waitForTimeout(400);
  pass(
    "six-page built-in demo runs real WebGL; pause/resume and opaque-origin sandbox work",
  );

  for (const [slug, title] of [
    ["journeys", "旅行计划"],
    ["spacecraft", "航天器"],
    ["about", "关于"],
    ["news", "新闻"],
    ["pricing", "价格"],
    ["index", "首页"],
  ]) {
    await clickInPreview(
      frame()
        .getByRole("navigation", { name: "主导航", exact: true })
        .getByRole("link", { name: title, exact: true }),
    );
    await frame()
      .locator("body.si-page-" + slug)
      .waitFor();
  }
  pass("all six internal navigation links work inside the simulated computer");
  await page.getByRole("button", { name: "内容编辑", exact: true }).click();
  await page
    .getByRole("combobox", { name: "修改范围", exact: true })
    .selectOption("global");
  await page
    .getByRole("textbox", { name: "品牌名称", exact: true })
    .fill("SUPER INTELLIGENCE");
  await page.locator('.content-editor input[type="color"]').fill("#b3e2fa");
  await page.reload();
  await frame().locator('[data-renderer="webgl"][data-earth="ready"][data-cloud="ready"]').waitFor();
  assert.equal(await page.locator(".page-tree button").count(), 6);
  await page.getByRole("button", { name: "内容编辑", exact: true }).click();
  await page
    .getByRole("textbox", { name: "页面标题", exact: true })
    .fill("Beyond your expectations.");
  await frame()
    .getByRole("heading", { name: "Beyond your expectations.", exact: true })
    .waitFor();
  await page.getByRole("button", { name: "撤销", exact: true }).click();
  await frame()
    .getByRole("heading", { name: "Beyond the ordinary.", exact: true })
    .waitFor();
  await page.getByRole("button", { name: "版本对比", exact: true }).click();
  assert.equal(await page.locator("iframe").count(), 2);
  await page.getByRole("button", { name: "版本对比", exact: true }).click();
  pass(
    "page text, shared accent, reload persistence, undo and version comparison retain the space theme",
  );

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "导出网站", exact: true }).click();
  const download = await downloadPromise;
  await download.saveAs("space-demo-site.zip");
  const files = unzipSync(await fs.readFile("space-demo-site.zip"));
  assert.equal(Object.keys(files).filter((k) => k.endsWith(".html")).length, 6);
  const exportDir = path.resolve("exported-space-example");
  await fs.mkdir(exportDir, { recursive: true });
  for (const [name, data] of Object.entries(files)) {
    assert.ok(!name.includes("..") && !path.isAbsolute(name));
    await fs.mkdir(path.dirname(path.join(exportDir, name)), {
      recursive: true,
    });
    await fs.writeFile(path.join(exportDir, name), data);
  }
  server = http.createServer((req, res) => {
    const pathname = new URL(req.url, "http://local").pathname;
    const key = pathname === "/" ? "index.html" : pathname.slice(1);
    if (!files[key]) {
      res.writeHead(404);
      res.end();
      return;
    }
    res.setHeader(
      "Content-Type",
      key.endsWith(".html")
        ? "text/html; charset=utf-8"
        : key.endsWith(".css")
          ? "text/css"
          : key.endsWith(".svg")
            ? "image/svg+xml"
            : "text/plain",
    );
    res.end(files[key]);
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const base = "http://127.0.0.1:" + server.address().port;
  const standalone = await context.newPage();
  standalone.on("pageerror", (e) => errors.push(e.message));
  const csp = [];
  standalone.on("console", (m) => {
    if (
      m.type() === "error" &&
      /Content Security Policy|Executing inline script/.test(m.text())
    )
      csp.push(m.text());
  });
  const slugs = ["index", "journeys", "spacecraft", "about", "news", "pricing"];
  for (const width of [1440, 768, 390, 320]) {
    await standalone.setViewportSize({
      width,
      height: width < 700 ? 900 : 1050,
    });
    for (const slug of slugs) {
      assert.equal(
        (await standalone.goto(base + "/" + slug + ".html")).status(),
        200,
      );
      await standalone.locator("h1").waitFor();
      assert.ok(
        await standalone.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        "overflow " + slug + " " + width,
      );
      assert.equal(
        await standalone
          .getByRole("navigation", { name: "主导航", exact: true })
          .getByRole("link")
          .count(),
        6,
      );
      if (slug === "index" || slug === "spacecraft")
        await standalone.locator('[data-renderer="webgl"][data-earth="ready"][data-cloud="ready"]').waitFor();
      if (width === 1440 || width === 390) {
        await standalone.waitForTimeout(600);
        await standalone.screenshot({
          path: shots + "/" + slug + "-" + width + ".png",
          fullPage: true,
        });
      }
    }
  }
  await standalone.setViewportSize({ width: 1440, height: 1050 });
  await standalone.goto(base + "/index.html");
  for (const [slug, title] of [
    ["journeys", "旅行计划"],
    ["spacecraft", "航天器"],
    ["about", "关于"],
    ["news", "新闻"],
    ["pricing", "价格"],
    ["index", "首页"],
  ]) {
    await standalone
      .getByRole("navigation", { name: "主导航", exact: true })
      .getByRole("link", { name: title, exact: true })
      .click();
    assert.ok(standalone.url().endsWith("/" + slug + ".html"));
    await standalone.reload();
    await standalone.locator("h1").waitFor();
  }
  await standalone.goBack();
  await standalone.locator("h1").waitFor();
  pass(
    "ZIP export independently serves six linked pages; direct navigation, refresh and responsive layouts pass at 1440/768/390/320px",
  );
  await standalone.goto(base + "/news.html");
  await standalone.locator(".si-news summary").first().click();
  assert.equal(await standalone.locator(".si-news[open]").count(), 1);
  await standalone.screenshot({
    path: shots + "/news-expanded.png",
    fullPage: true,
  });
  await standalone.goto(base + "/pricing.html");
  await standalone.locator('[data-plan="Orbit"]').click();
  assert.equal(
    await standalone.getByLabel("感兴趣的旅程", { exact: true }).inputValue(),
    "Orbit",
  );
  let submittedRequests = 0;
  standalone.on("request", (req) => {
    if (req.method() === "POST") submittedRequests++;
  });
  await standalone.getByLabel("称呼", { exact: true }).fill("测试旅客");
  await standalone
    .getByLabel("邮箱", { exact: true })
    .fill("traveler@example.com");
  await standalone.getByRole("button", { name: "生成本机意向摘要" }).click();
  await standalone
    .getByRole("status")
    .filter({ hasText: "没有提交、付款或预订" })
    .waitFor();
  assert.equal(submittedRequests, 0);
  assert.deepEqual(csp, []);
  pass(
    "news expands and pricing form validates and creates a local summary without sending data",
  );

  const reduced = await browser.newContext({
    reducedMotion: "reduce",
    viewport: { width: 390, height: 900 },
  });
  const rp = await reduced.newPage();
  await rp.goto(base + "/index.html");
  await rp.locator('[data-renderer="webgl"][data-paused="true"][data-earth="ready"][data-cloud="ready"]').waitFor();
  const f0 = await rp.locator("[data-space-scene]").getAttribute("data-frames");
  await rp.waitForTimeout(300);
  assert.equal(
    await rp.locator("[data-space-scene]").getAttribute("data-frames"),
    f0,
  );
  await rp.locator('[data-earth-texture]').evaluate(el => el.dispatchEvent(new Event('error')));
  await rp.locator('[data-renderer="fallback"]').waitFor();
  assert.ok(await rp.locator('.si-scene-fallback img').evaluate(el => el.complete && el.naturalWidth > 0));
  assert.equal(await rp.locator('[data-scene-toggle]').isVisible(), false);
  await reduced.close();
  const fallback = await browser.newContext();
  await fallback.addInitScript(() => {
    const get = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (kind, ...args) {
      return /webgl/.test(kind) ? null : get.call(this, kind, ...args);
    };
  });
  const fp = await fallback.newPage();
  await fp.goto(base + "/index.html");
  await fp.locator('[data-renderer="fallback"]').waitFor();
  assert.ok(await fp.locator(".si-scene-fallback").isVisible());
  await fp.screenshot({ path: shots + "/webgl-fallback.png" });
  await fallback.close();
  await page.route("**/api/preview", (r) => r.abort());
  await page.reload();
  await frame().locator("[data-space-scene]").waitFor();
  await page
    .getByText(
      "预览服务未连接，显示隔离静态预览。请启动 npm run dev 后刷新。",
      { exact: true },
    )
    .waitFor();
  await frame().locator('[data-renderer="webgl"][data-earth="ready"][data-cloud="ready"]').waitFor();
  await page.unroute("**/api/preview");
  pass(
    "reduced-motion starts paused, texture failure retains a loaded poster, WebGL failure retains a rendered image, and preview API failure keeps the local fallback usable",
  );

  const legacy = spaceProject("legacy-space-migration");
  legacy.name = "MORROW 木间 · 演示项目";
  legacy.site = demoSite(sampleBrief, "editorial");
  legacy.initial = structuredClone(legacy.site);
  const edited = structuredClone(legacy);
  edited.id = "edited-furniture";
  edited.site.pages[0].headline = "My original work";
  const migration = await browser.newContext();
  await migration.addInitScript(
    (raw) => {
      if (!localStorage.getItem("frame-projects-v1"))
        localStorage.setItem("frame-projects-v1", raw);
    },
    packProjects([legacy, edited]),
  );
  const mp = await migration.newPage();
  await mp.goto(
    "http://127.0.0.1:4173/workspace?project=legacy-space-migration",
  );
  await mp.frameLocator("iframe").locator("[data-space-scene]").waitFor();
  const saved = unpackProjects(
    await mp.evaluate(() => localStorage.getItem("frame-projects-v1")),
  );
  assert.equal(saved[0].site.pages.length, 6);
  assert.equal(saved[0].history[0].name, "MORROW 木间");
  assert.equal(saved[1].site.pages[0].headline, "My original work");
  await mp.getByRole("button", { name: "撤销", exact: true }).click();
  await mp
    .frameLocator("iframe")
    .getByRole("heading", { name: "让日常，值得停留", exact: true })
    .waitFor();
  await migration.close();
  pass(
    "untouched legacy demo upgrades at its existing project URL and can be undone; edited projects stay intact",
  );
  assert.deepEqual(errors, []);
} catch (error) {
  failure = error;
  await page.screenshot({ path: shots + "/failure.png" }).catch(() => {});
  throw error;
} finally {
  await fs.writeFile(
    "space-browser-results.json",
    JSON.stringify(
      { checks, errors, failure: failure?.stack || null },
      null,
      2,
    ),
  );
  await browser.close();
  if (server) await new Promise((resolve) => server.close(resolve));
}
