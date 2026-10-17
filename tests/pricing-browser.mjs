import { chromium } from "playwright";
import assert from "node:assert/strict";

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
try {
  await page.goto("http://127.0.0.1:4173/pricing");
  await page.getByRole("heading", { name: /从开始/ }).waitFor();
  const visibleText = await page.locator("body").innerText();
  assert.equal(visibleText.includes("演示模式"), false);
  assert.equal(visibleText.includes("尚未开放购买"), false);

  await page.getByRole("button", { name: "了解 Go", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Go 方案说明" });
  await dialog.waitFor();
  await page.waitForTimeout(350);
  const bounds = await dialog.boundingBox();
  assert.ok(bounds.width >= 640, "plan details should have room to breathe");
  assert.ok(
    Math.abs(bounds.x + bounds.width / 2 - 720) < 2,
    "plan details must be centered horizontally",
  );
  assert.ok(
    Math.abs(bounds.y + bounds.height / 2 - 500) < 2,
    "plan details must be centered vertically",
  );
  await dialog.getByRole("heading", { name: "Go" }).waitFor();
  await dialog.getByText("基础多页网站生成", { exact: true }).waitFor();
  const detailType = await dialog.evaluate((node) => ({
    copy: parseFloat(
      getComputedStyle(node.querySelector(".plan-info-copy")).fontSize,
    ),
    feature: parseFloat(
      getComputedStyle(node.querySelector(".plan-info-features li")).fontSize,
    ),
    price: parseFloat(
      getComputedStyle(node.querySelector(".plan-info-price b")).fontSize,
    ),
  }));
  assert.ok(detailType.copy >= 15, "plan description should be easy to read");
  assert.ok(detailType.feature >= 14, "plan features should be easy to scan");
  assert.ok(
    detailType.price >= 40,
    "the selected plan price should stay legible",
  );
  await dialog.getByRole("button", { name: "选择支付方式" }).click();
  const methods = dialog.getByRole("group", { name: "支付方式" });
  await methods.waitFor();
  const methodStyle = await methods
    .locator("button")
    .first()
    .evaluate((node) => ({
      height: node.getBoundingClientRect().height,
      fontSize: parseFloat(getComputedStyle(node).fontSize),
    }));
  assert.ok(
    methodStyle.height >= 56,
    "payment methods need a clear touch target",
  );
  assert.ok(
    methodStyle.fontSize >= 14,
    "payment method labels should be prominent",
  );
  await dialog.getByRole("button", { name: "微信支付" }).click();
  assert.equal(
    await dialog
      .getByRole("button", { name: "微信支付" })
      .getAttribute("aria-pressed"),
    "true",
  );
  await dialog.getByRole("button", { name: "确认支付" }).click();
  await dialog
    .getByRole("status")
    .filter({ hasText: "支付接口未配置" })
    .waitFor();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("http://127.0.0.1:4173/pricing");
  await page.getByRole("button", { name: "了解 Go", exact: true }).click();
  const mobileDialog = page.getByRole("dialog", { name: "Go 方案说明" });
  await mobileDialog.waitFor();
  const mobileBounds = await mobileDialog.boundingBox();
  assert.ok(mobileBounds.width <= 358, "mobile dialog must fit its viewport");
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    "pricing modal must not cause horizontal overflow",
  );
  await page.screenshot({ path: "pricing-dialog-mobile.png", fullPage: true });
  assert.deepEqual(errors, []);
  console.log(
    "PASS pricing details, payment method selection, and safe unconfigured status",
  );
} finally {
  await browser.close();
}
