import { chromium } from "playwright";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
});
const page = await context.newPage(),
  errors = [],
  checks = [];
page.on("pageerror", (e) => errors.push(e.message));
await fs.mkdir("evidence/sample-connections", { recursive: true });
try {
  await page.goto("http://127.0.0.1:4173/workspace?mode=blank");
  await page
    .getByRole("button", { name: "用作参考链接：Léo Parpeix", exact: true })
    .click();
  await page
    .getByRole("button", {
      name: "用作参考链接：Nick Ho Motorsports",
      exact: true,
    })
    .click();
  assert.equal(
    await page.locator("input[type=url]").inputValue(),
    "https://nickho-motorsports.nl/",
  );
  assert.equal(
    await page.getByRole("checkbox", { name: /Léo Parpeix/ }).isChecked(),
    true,
  );
  assert.equal(
    await page
      .getByRole("checkbox", { name: /Nick Ho Motorsports/ })
      .isChecked(),
    true,
  );
  await page.getByRole("button", { name: "填入样本内容", exact: true }).click();
  await page.getByRole("button", { name: "下一步", exact: true }).click();
  await page.getByRole("button", { name: "下一步", exact: true }).click();
  await page.getByRole("button", { name: "生成网站", exact: true }).click();
  await page.locator(".editor").waitFor();
  await page.reload();
  const projects = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("frame-projects-v1")),
  );
  assert.ok(
    JSON.stringify(projects).includes("https://nickho-motorsports.nl/"),
  );
  checks.push(
    "recommended URLs and multiple references persist through wizard creation and reload",
  );
  await page.goto("http://127.0.0.1:4173/workspace");
  await page
    .getByRole("link", {
      name: "查看 FRAME 作品 SUPER INTELLIGENCE",
      exact: true,
    })
    .click();
  await page
    .getByRole("heading", { name: "SUPER INTELLIGENCE", exact: true })
    .waitFor();
  await page.reload();
  assert.equal(await page.locator(".space-study-pages button").count(), 6);
  await page
    .locator(".space-study-pages")
    .getByRole("button", { name: "新闻", exact: true })
    .click();
  await page.frameLocator("iframe").locator(".si-news-list").waitFor();
  await page
    .locator(".space-study-pages")
    .getByRole("button", { name: "首页", exact: true })
    .click();
  await page
    .frameLocator("iframe")
    .locator('[data-renderer="webgl"][data-earth="ready"]')
    .waitFor();
  await page.waitForTimeout(650);
  await page.screenshot({
    path: "evidence/sample-connections/detail-1440.png",
    fullPage: true,
  });
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.waitForTimeout(350);
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      "sample detail overflow " + width,
    );
    await page.screenshot({
      path: `evidence/sample-connections/detail-${width}.png`,
      fullPage: true,
    });
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.getByRole("button", { name: "使用六页样本", exact: true }).click();
  await page.locator(".editor").waitFor();
  assert.equal(await page.locator(".page-tree button").count(), 6);
  await page
    .locator(".sample-provenance")
    .getByRole("link", { name: "查看原始作品" })
    .waitFor();
  const projectUrl = page.url();
  await page
    .frameLocator("iframe")
    .locator('[data-renderer="webgl"][data-earth="ready"]')
    .waitFor();
  await page.waitForTimeout(650);
  await page.screenshot({ path: "evidence/sample-connections/workspace.png" });
  await page.goto("http://127.0.0.1:4173/inspiration/super-intelligence");
  await page.getByRole("button", { name: "使用六页样本", exact: true }).click();
  await page.locator(".editor").waitFor();
  assert.notEqual(page.url(), projectUrl);
  checks.push(
    "owned sample detail is directly accessible and creates isolated editable six-page copies",
  );
  await page.goto("http://127.0.0.1:4173/workspace");
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      "wizard overflow " + width,
    );
    await page.screenshot({
      path: `evidence/sample-connections/create-${width}.png`,
      fullPage: true,
    });
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("http://127.0.0.1:4173/inspiration");
  await page
    .getByRole("link", {
      name: "查看 FRAME 作品 SUPER INTELLIGENCE",
      exact: true,
    })
    .waitFor();
  await page
    .locator(".space-sample-card")
    .screenshot({ path: "evidence/sample-connections/library-card.png" });
  checks.push(
    "sample is linked from library and wizard; desktop/phone creation layouts do not overflow",
  );
  assert.deepEqual(errors, []);
  console.log(checks.map((x) => "PASS " + x).join("\n"));
  await fs.writeFile(
    "evidence/sample-connections/results.json",
    JSON.stringify({ checks, errors }, null, 2),
  );
} finally {
  await browser.close();
}
