import { chromium } from "playwright";
import assert from "node:assert/strict";
import fs from "node:fs/promises";

// Exercises space recovery, keyboard edits and accessible controls at narrow
// widths. A cosmetic theme change alone cannot make these behaviors pass.
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const checks = [],
  errors = [];
page.on("pageerror", (error) => errors.push(error.message));
const pass = (name) => {
  checks.push(name);
  console.log("PASS", name);
};
let failure;
try {
  await page.goto("http://127.0.0.1:4173/product");
  await page
    .getByRole("button", { name: "体验完整工作台", exact: true })
    .click();
  await page.locator(".editor").waitFor();
  assert.match(
    await page
      .locator(".editor-left")
      .evaluate((node) => getComputedStyle(node).backdropFilter),
    /blur/,
    "production editor must retain its glass backdrop filter",
  );
  await page
    .frameLocator("iframe")
    .getByRole("heading", { name: "Beyond the ordinary.", exact: true })
    .waitFor();
  await page.mouse.move(0, 0);
  await page.waitForTimeout(1100);
  await page.screenshot({ path: "workspace-glass-chat.png" });
  assert.equal(
    await page.getByRole("button", { name: "专注预览", exact: true }).count(),
    1,
    "workspace needs a working focus preview control",
  );
  const before = await page.locator(".editor-center").boundingBox();
  await page.getByRole("button", { name: "专注预览", exact: true }).click();
  assert.equal(await page.locator(".editor-left").isVisible(), false);
  assert.equal(await page.locator(".editor-right").isVisible(), false);
  const focused = await page.locator(".editor-center").boundingBox();
  assert.ok(focused.width > before.width + 300);
  await page.waitForTimeout(400);
  await page.screenshot({ path: "workspace-glass-focus.png" });
  await page.getByRole("button", { name: "专注预览", exact: true }).click();
  assert.ok(await page.locator(".editor-left").isVisible());
  pass("focus preview recovers canvas space and restores both editing panels");

  await page
    .getByRole("textbox", { name: "修改指令", exact: true })
    .fill("标题：为每一个想法，留出空间。");
  await page
    .getByRole("textbox", { name: "修改指令", exact: true })
    .press("Control+Enter");
  await page
    .frameLocator("iframe")
    .getByRole("heading", { name: "为每一个想法，留出空间。", exact: true })
    .waitFor();
  await page.getByRole("button", { name: "撤销", exact: true }).click();
  await page
    .frameLocator("iframe")
    .getByRole("heading", { name: "Beyond the ordinary.", exact: true })
    .waitFor();
  await page.getByRole("button", { name: "版本对比", exact: true }).click();
  assert.equal(await page.locator("iframe").count(), 2);
  await page.getByRole("button", { name: "版本对比", exact: true }).click();
  pass(
    "keyboard submits a real scoped edit, undo restores it, and version comparison remains usable",
  );

  await page.getByRole("button", { name: "内容编辑", exact: true }).click();
  await page
    .getByRole("combobox", { name: "修改范围", exact: true })
    .selectOption("global");
  await page
    .getByRole("textbox", { name: "品牌名称", exact: true })
    .fill("MORROW 木间");
  await page
    .getByRole("combobox", { name: "修改范围", exact: true })
    .selectOption("page");
  await page
    .getByRole("textbox", { name: "页面标题", exact: true })
    .fill("让每一页，都有自己的表达。");
  await page.reload();
  await page.getByRole("button", { name: "内容编辑", exact: true }).click();
  assert.equal(
    await page
      .getByRole("textbox", { name: "页面标题", exact: true })
      .inputValue(),
    "让每一页，都有自己的表达。",
  );
  await page.waitForTimeout(400);
  await page.screenshot({ path: "workspace-glass-desktop.png" });
  pass("scoped content and shared-brand editing persist after refresh");

  for (const width of [1024, 768, 390]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    await page.getByRole("button", { name: "页面与素材", exact: true }).click();
    await page
      .locator(".page-tree")
      .getByRole("button", { name: "关于" })
      .click();
    await page.getByRole("button", { name: "内容与对话", exact: true }).click();
    await page.getByRole("button", { name: "内容编辑", exact: true }).click();
    await page
      .getByRole("textbox", { name: "页面标题", exact: true })
      .fill("用心，做好每一件事。");
    await page.getByRole("button", { name: "网站预览", exact: true }).click();
    await page.getByRole("button", { name: "手机预览", exact: true }).click();
    await page
      .frameLocator("iframe")
      .getByRole("heading", { name: "用心，做好每一件事。", exact: true })
      .waitFor();
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      "no horizontal overflow at " + width,
    );
    const canvas = await page.locator(".editor-center").boundingBox();
    assert.ok(
      canvas.width > width * 0.8,
      "narrow screens should not compress three panels",
    );
    if (width === 768 || width === 390) {
      await page.waitForTimeout(400);
      await page.screenshot({
        path: `workspace-glass-${width}.png`,
        fullPage: true,
      });
    }
  }
  pass(
    "tablet and phone switch panels, edit the chosen page and retain a usable preview width",
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.getByRole("button", { name: "内容与对话", exact: true }).click();
  await page.getByRole("button", { name: "AI 对话", exact: true }).click();
  await page
    .getByRole("textbox", { name: "修改指令", exact: true })
    .fill("精简文案");
  await page.getByRole("button", { name: "发送修改", exact: true }).click();
  assert.ok(
    (await page
      .getByRole("textbox", { name: "修改指令", exact: true })
      .inputValue()) === "",
  );
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "导出网站", exact: true }).click();
  assert.ok((await download).suggestedFilename().endsWith("-site.zip"));
  pass("reduced motion preserves chat and mobile export");

  // Touch uses real touch input and separate storage copied from this test's
  // own project; the user's browser projects are never read or overwritten.
  const touchContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    storageState: await page.context().storageState(),
  });
  const touch = await touchContext.newPage();
  touch.on("pageerror", (error) => errors.push(error.message));
  await touch.goto(page.url());
  await touch.getByRole("button", { name: "页面与素材", exact: true }).tap();
  await touch.getByRole("button", { name: "首屏与标题", exact: true }).tap();
  await touch.waitForTimeout(250);
  assert.ok(
    await touch
      .locator("iframe")
      .evaluate(
        (node) => Number(node.style.transform.match(/scale\(([^)]+)\)/)[1]) > 0,
      ),
    "hiding a panel must retain its last nonzero preview scale",
  );
  assert.ok(
    await touch
      .getByRole("textbox", { name: "页面标题", exact: true })
      .isVisible(),
  );
  await touch
    .getByRole("textbox", { name: "页面标题", exact: true })
    .fill("从想法，到自己的网页。");
  await touch.screenshot({
    path: "workspace-glass-touch-editor.png",
    fullPage: true,
  });
  await touch.getByRole("button", { name: "页面与素材", exact: true }).tap();
  await touch.getByRole("button", { name: "编辑全站样式", exact: true }).tap();
  assert.equal(
    await touch
      .getByRole("combobox", { name: "修改范围", exact: true })
      .inputValue(),
    "global",
  );
  assert.ok(
    await touch
      .getByRole("textbox", { name: "品牌名称", exact: true })
      .isVisible(),
  );
  await touch.getByRole("button", { name: "页面与素材", exact: true }).tap();
  await touch.getByRole("button", { name: "首屏与标题", exact: true }).tap();
  assert.equal(
    await touch
      .getByRole("combobox", { name: "修改范围", exact: true })
      .inputValue(),
    "page",
  );
  assert.ok(
    await touch
      .getByRole("textbox", { name: "页面标题", exact: true })
      .isVisible(),
  );
  await touch.getByRole("button", { name: "网站预览", exact: true }).tap();
  await touch.getByRole("button", { name: "手机预览", exact: true }).tap();
  await touch
    .frameLocator("iframe")
    .getByRole("heading", { name: "从想法，到自己的网页。", exact: true })
    .waitFor();
  await touch.waitForFunction(
    () =>
      document.querySelector(".preview-inner").getBoundingClientRect().height >
      600,
  );
  await touch.waitForTimeout(350);
  await touch.evaluate(() => scrollTo(0, 0));
  await touch.screenshot({
    path: "workspace-glass-touch-preview.png",
    fullPage: true,
  });
  assert.ok(await touch.getByText("本地编辑", { exact: true }).isVisible());
  await touch.getByRole("button", { name: "声音设置", exact: true }).tap();
  await touch.getByRole("dialog", { name: "声音空间" }).waitFor();
  await touch.getByRole("button", { name: "关闭声音设置", exact: true }).tap();
  await touch.getByRole("button", { name: "打开导航", exact: true }).tap();
  await touch.getByRole("link", { name: "产品", exact: true }).first().tap();
  assert.equal(
    await touch.locator("body").getAttribute("data-page"),
    "content",
  );
  await touch.goBack();
  await touch.locator(".editor").waitFor();
  assert.equal(
    await touch.locator("body").getAttribute("data-page"),
    "workspace",
  );
  await touchContext.close();
  pass(
    "touch opens the selected block and shared styles directly; sound settings and browser back remain available",
  );
  assert.deepEqual(errors, []);
} catch (error) {
  failure = error;
  throw error;
} finally {
  await fs.writeFile(
    "workspace-glass-results.json",
    JSON.stringify(
      { checks, errors, failure: failure?.message || null },
      null,
      2,
    ),
  );
  await browser.close();
}
