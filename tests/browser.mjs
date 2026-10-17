import { chromium } from "playwright";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { unzipSync } from "fflate";
const b = await chromium.launch({ channel: "chrome", headless: true });
const context = await b.newContext({
  viewport: { width: 1440, height: 1000 },
  acceptDownloads: true,
});
const p = await context.newPage();
const checks = [];
const errors = [];
p.on("pageerror", (e) => errors.push(e.message));
p.on("response", (r) => {
  if (r.status() >= 400) errors.push(r.status() + " " + r.url());
});
function pass(s) {
  checks.push(s);
  console.log("PASS", s);
}
await p.goto("http://127.0.0.1:4173/inspiration");
await p.getByRole("textbox", { name: "搜索案例" }).fill("Nick");
assert.equal(await p.locator(".reference-card").count(), 1);
await p.getByRole("textbox", { name: "搜索案例" }).fill("unknownxxxxx");
await p.getByRole("heading", { name: "这里暂时没有匹配案例。" }).waitFor();
await p.getByRole("button", { name: "重置筛选" }).click();
await p.getByRole("combobox", { name: "行业筛选" }).selectOption("创意设计");
assert.equal(await p.locator(".reference-card").count(), 1);
await p.getByRole("combobox", { name: "行业筛选" }).selectOption("全部行业");
await p.getByRole("button", { name: "收藏 Léo Parpeix", exact: true }).click();
await p.getByRole("button", { name: "查看 Léo Parpeix 详情" }).click();
await p.getByRole("dialog").waitFor();
await p
  .getByRole("button", { name: "加入项目参考", exact: true })
  .last()
  .click();
await p.getByRole("button", { name: "关闭对话框" }).click();
pass(
  "search, industry filter, empty result, favorite, case details and reference selection",
);
await p.getByRole("link", { name: "带着参考开始" }).click();
await p.getByRole("button", { name: "下一步" }).click();
await p.getByRole("alert").waitFor();
await p.getByRole("button", { name: "填入样本内容" }).click();
await p.getByRole("button", { name: "下一步" }).click();
assert.equal(await p.locator(".page-draft").count(), 3);
await p.getByRole("button", { name: "添加页面", exact: true }).click();
await p.getByRole("button", { name: "删除页面 联系" }).click();
await p.getByRole("button", { name: "上移 产品" }).click();
await p.getByRole("button", { name: "下移 产品" }).click();
await p.getByRole("button", { name: "下一步" }).click();
assert.equal(await p.locator(".direction-option").count(), 3);
await p.getByRole("button", { name: "生成网站" }).click();
await p.locator(".editor").waitFor();
await p.waitForTimeout(700);
pass(
  "required content checks, editable page structure, three directions, generation and editor",
);
let iframe = p.frameLocator("iframe");
await iframe
  .getByRole("heading", { name: "让日常，值得停留", exact: true })
  .waitFor();
await p.locator(".page-tree").getByRole("button", { name: "关于" }).click();
await iframe
  .getByRole("heading", { name: "好的设计，从理解生活开始。" })
  .waitFor();
await p.locator(".page-tree").getByRole("button", { name: "首页" }).click();
await p
  .locator(".panel-tabs")
  .getByRole("button", { name: "内容编辑" })
  .click();
await p
  .getByRole("textbox", { name: "页面标题", exact: true })
  .fill("日常，值得认真对待。");
await iframe.getByRole("heading", { name: "日常，值得认真对待。" }).waitFor();
await p.getByRole("button", { name: "AI 对话", exact: true }).click();
await p.getByRole("combobox", { name: "修改范围" }).selectOption("global");
await p.getByRole("textbox", { name: "修改指令" }).fill("改成蓝色");
await p.getByRole("button", { name: "发送修改" }).click();
await p
  .getByText("已将全站共享强调色更新为蓝色，所有页面共用相同样式。", {
    exact: true,
  })
  .waitFor();
await p.reload();
await p.locator(".editor").waitFor();
await p
  .locator(".panel-tabs")
  .getByRole("button", { name: "内容编辑" })
  .click();
assert.equal(
  await p.getByRole("textbox", { name: "页面标题", exact: true }).inputValue(),
  "日常，值得认真对待。",
);
pass(
  "page switching, content edits, scoped global color edit and persistence after refresh",
);
await p.getByRole("button", { name: "手机预览", exact: true }).click();
await p.waitForTimeout(500);
await p.screenshot({ path: "workspace-mobile-preview.png" });
await p.getByRole("button", { name: "桌面预览", exact: true }).click();
await p.waitForTimeout(500);
await p.screenshot({ path: "workspace-desktop.png" });
await p.getByRole("button", { name: "版本对比" }).click();
assert.equal(await p.locator("iframe").count(), 2);
await p.getByRole("button", { name: "版本对比" }).click();
pass("responsive preview and version comparison");
const downloadPromise = p.waitForEvent("download");
await p.getByRole("button", { name: "导出网站" }).click();
const download = await downloadPromise;
await download.saveAs("demo-site.zip");
const zip = unzipSync(new Uint8Array(await fs.readFile("demo-site.zip")));
await fs.mkdir("exported-example", { recursive: true });
for (const [path, content] of Object.entries(zip)) {
  await fs.mkdir("exported-example/" + path.split("/").slice(0, -1).join("/"), {
    recursive: true,
  });
  await fs.writeFile("exported-example/" + path, content);
}
assert.ok(
  zip["index.html"] &&
    zip["about.html"] &&
    zip["product.html"] &&
    zip["styles.css"],
);
pass("ZIP download contains three pages, stylesheet and assets");
await p.getByRole("link", { name: "我的项目", exact: true }).first().click();
assert.equal(await p.locator(".project-card").count(), 1);
await p.getByRole("button", { name: /复制 MORROW/ }).click();
assert.equal(await p.locator(".project-card").count(), 2);
await p.getByRole("button", { name: /重命名.*副本/ }).click();
await p.getByRole("textbox", { name: "项目名称" }).fill("删除测试项目");
await p.getByRole("button", { name: "保存名称" }).click();
await p.getByRole("button", { name: "删除 删除测试项目", exact: true }).click();
await p.getByRole("button", { name: "保留项目" }).click();
assert.equal(await p.locator(".project-card").count(), 2);
await p.getByRole("button", { name: "删除 删除测试项目", exact: true }).click();
await p.getByRole("button", { name: "确认删除", exact: true }).click();
assert.equal(await p.locator(".project-card").count(), 1);
pass("project duplicate, rename, delete confirmation and cancel");
for (const path of [
  "/",
  "/product",
  "/inspiration",
  "/about",
  "/projects",
  "/workspace",
]) {
  await p.goto("http://127.0.0.1:4173" + path);
  await p.reload();
  assert.equal(await p.locator("h1").count(), 1);
  assert.equal(
    await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    true,
  );
}
await p.goto("http://127.0.0.1:4173/product");
await p.getByRole("link", { name: "案例库", exact: true }).first().click();
await p.goBack();
assert.equal(new URL(p.url()).pathname, "/product");
pass("all six routes direct visit and refresh; browser back navigation");
await p.setViewportSize({ width: 390, height: 844 });
for (const path of [
  "/",
  "/product",
  "/inspiration",
  "/about",
  "/projects",
  "/workspace",
]) {
  await p.goto("http://127.0.0.1:4173" + path);
  assert.equal(
    await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    true,
    "overflow " + path,
  );
}
await p.goto("http://127.0.0.1:4173/projects");
await p.locator(".project-cover").first().click();
await p.getByRole("button", { name: "页面与素材", exact: true }).click();
await p.locator(".page-tree").getByRole("button", { name: "产品" }).click();
await p.getByRole("button", { name: "内容与对话", exact: true }).click();
await p.getByRole("button", { name: "内容编辑", exact: true }).click();
await p
  .getByRole("textbox", { name: "页面标题", exact: true })
  .fill("每一件，都用心。");
await p.getByRole("button", { name: "网站预览", exact: true }).click();
await p.getByRole("button", { name: "手机预览", exact: true }).click();
await p.waitForTimeout(800);
await p
  .frameLocator("iframe")
  .getByRole("heading", { name: "每一件，都用心。" })
  .waitFor();
await p.waitForFunction(() =>
  document.querySelector("iframe")?.src.includes(":4174/"),
);
await p.waitForFunction(() => !document.querySelector(".preview-loading"));
await p
  .frameLocator("iframe")
  .getByRole("heading", { name: "每一件，都用心。", exact: true })
  .waitFor();
await p.waitForTimeout(300);
await p.screenshot({ path: "workspace-mobile.png", fullPage: true });
assert.equal(
  await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
  true,
);
pass(
  "all mobile routes and mobile editor page switch/edit/preview without overflow",
);
await fs.writeFile(
  "browser-results.json",
  JSON.stringify({ checks, errors }, null, 2),
);
console.log("ERRORS", errors);
assert.deepEqual(errors, []);
await b.close();
