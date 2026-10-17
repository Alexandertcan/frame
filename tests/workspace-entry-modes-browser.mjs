import { chromium } from "playwright";
import assert from "node:assert/strict";

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));

try {
  await page.goto("http://127.0.0.1:4173/workspace");
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await page.getByRole("heading", { name: "选择一种开始方式" }).waitFor();
  await page.getByRole("heading", { name: "从 0 开始" }).waitFor();
  await page
    .getByRole("heading", { name: "使用 SUPER INTELLIGENCE 模板" })
    .waitFor();
  assert.equal(await page.locator(".workspace-entry-card").count(), 2);
  await page.screenshot({
    path: "workspace-entry-desktop.png",
    fullPage: true,
  });

  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `workspace entry overflows at ${width}px`,
    );
    if (width === 390)
      await page.screenshot({
        path: "workspace-entry-mobile.png",
        fullPage: true,
      });
  }

  await page.getByRole("link", { name: "从 0 开始创建", exact: true }).click();
  await page.waitForURL("**/workspace?mode=blank");
  await page.locator(".wizard").waitFor();
  assert.equal(await page.locator(".space-sample-card").count(), 0);
  await page.getByRole("link", { name: "返回创建方式", exact: true }).click();
  await page.waitForURL("**/workspace");

  await page
    .getByRole("button", { name: "创建 SUPER INTELLIGENCE 副本", exact: true })
    .click();
  await page.locator(".editor").waitFor();
  await page.waitForURL(/\/workspace\?project=/);
  assert.equal(await page.locator(".page-tree button").count(), 6);
  const firstProject = new URL(page.url()).searchParams.get("project");

  await page.goto("http://127.0.0.1:4173/workspace");
  await page.getByRole("link", { name: /继续编辑最近项目/ }).waitFor();
  await page
    .getByRole("button", { name: "创建 SUPER INTELLIGENCE 副本", exact: true })
    .click();
  await page.locator(".editor").waitFor();
  const secondProject = new URL(page.url()).searchParams.get("project");
  assert.notEqual(firstProject, secondProject);
  assert.deepEqual(errors, []);
  console.log(
    "PASS workspace has separate blank/template starts, responsive layout, recent-project resume, and isolated template copies",
  );
} finally {
  await browser.close();
}
