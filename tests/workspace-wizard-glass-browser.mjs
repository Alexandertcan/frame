import { chromium } from "playwright";
import assert from "node:assert/strict";
import fs from "node:fs/promises";

const browser = await chromium.launch({ channel: "chrome", headless: true });
const checks = [],
  errors = [];
const pass = (name) => {
  checks.push(name);
  console.log("PASS", name);
};
let failure;
try {
  for (const width of [1440, 1024, 768, 390, 320]) {
    const context = await browser.newContext({
      viewport: { width, height: width <= 390 ? 844 : 1000 },
      ...(width <= 390 ? { isMobile: true, hasTouch: true } : {}),
    });
    const page = await context.newPage();
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("http://127.0.0.1:4173/workspace?mode=blank");
    await page.locator(".wizard").waitFor();
    assert.equal(
      await page.locator("body").getAttribute("data-page"),
      "workspace",
    );
    const theme = await page.locator(".brief-form").evaluate((node) => ({
      filter: getComputedStyle(node).backdropFilter,
      radius: parseFloat(getComputedStyle(node).borderTopLeftRadius),
      inputBackground: getComputedStyle(node.querySelector("input"))
        .backgroundColor,
    }));
    assert.match(theme.filter, /blur/);
    assert.ok(theme.radius >= 20);
    const heading = await page
      .getByRole("heading", { name: "你的下一座网站。", exact: true })
      .boundingBox();
    const header = await page.locator(".site-header").boundingBox();
    assert.ok(
      heading.y >= header.y + header.height,
      "header must not cover the heading",
    );
    if (width === 1440) {
      await page.waitForTimeout(800);
      await page.screenshot({
        path: "workspace-wizard-empty.png",
        fullPage: true,
      });
    }
    await page.getByRole("button", { name: "下一步", exact: true }).click();
    await page
      .getByRole("alert")
      .getByText("请填写项目名称、网站用途和主要内容，再继续。", {
        exact: true,
      })
      .waitFor();
    await page
      .getByRole("button", { name: "填入样本内容", exact: true })
      .click();
    await page.getByRole("checkbox").first().check();
    assert.ok(await page.getByRole("checkbox").first().isChecked());
    for (let step = 0; step < 3; step++) {
      if (step === 1 && width <= 390) {
        const name = await page
          .getByRole("textbox", { name: "页面 1 名称", exact: true })
          .boundingBox();
        const path = await page
          .getByRole("textbox", { name: "页面 1 路径", exact: true })
          .boundingBox();
        assert.ok(name.y < path.y, "page name must stay above its path");
        assert.ok(
          (
            await page
              .getByRole("button", { name: "上移 首页", exact: true })
              .boundingBox()
          ).width <= 40,
          "reorder buttons must remain compact",
        );
      }
      assert.equal(
        await page
          .locator('.steps [aria-current="step"]')
          .innerText()
          .then((text) => text.replace(/\s/g, "").slice(-4)),
        ["整理内容", "确认页面", "选择方向"][step],
      );
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `no overflow at ${width}px step ${step + 1}`,
      );
      if (width === 1440 || width === 390) {
        await page.mouse.move(0, 0);
        await page.waitForTimeout(1100);
        await page.evaluate(() => scrollTo(0, 0));
        await page.screenshot({
          path: `workspace-wizard-${width}-step-${step + 1}.png`,
          fullPage: true,
        });
      }
      if (step === 0) {
        await page.getByRole("button", { name: "下一步", exact: true }).click();
      } else if (step === 1) {
        await page
          .getByRole("button", { name: "添加页面", exact: true })
          .click();
        assert.equal(await page.locator(".page-draft").count(), 4);
        await page
          .getByRole("textbox", { name: "页面 4 名称", exact: true })
          .fill("联系咨询");
        await page
          .getByRole("button", { name: "上移 联系咨询", exact: true })
          .click();
        assert.equal(
          await page
            .getByRole("textbox", { name: "页面 3 名称", exact: true })
            .inputValue(),
          "联系咨询",
        );
        await page
          .getByRole("button", { name: "删除页面 联系咨询", exact: true })
          .click();
        await page.getByRole("button", { name: "下一步", exact: true }).click();
      } else {
        assert.equal(await page.locator(".direction-option").count(), 3);
        await page.locator(".direction-option").nth(1).click();
        assert.equal(
          await page.locator('.direction-option[aria-pressed="true"]').count(),
          1,
        );
        assert.ok(
          (await page
            .locator(".direction-option")
            .nth(1)
            .getAttribute("aria-pressed")) === "true",
        );
      }
    }
    await page.getByRole("button", { name: "上一步", exact: true }).click();
    assert.equal(
      await page
        .getByRole("textbox", { name: "页面 1 名称", exact: true })
        .inputValue(),
      "首页",
    );
    await page.getByRole("button", { name: "下一步", exact: true }).click();
    if (width === 1440 || width === 390) {
      if (width === 390) await page.emulateMedia({ reducedMotion: "reduce" });
      if (width === 1440) {
        await page.route("**/api/generate", (route) =>
          route.fulfill({
            status: 503,
            contentType: "application/json",
            body: JSON.stringify({ error: "生成服务暂时不可用，请重试。" }),
          }),
        );
        await page
          .getByRole("button", { name: "生成网站", exact: true })
          .click();
        await page
          .getByRole("alert")
          .getByText("生成服务暂时不可用，请重试。", { exact: true })
          .waitFor();
        assert.ok(
          await page
            .getByRole("button", { name: "生成网站", exact: true })
            .isEnabled(),
        );
        await page.unroute("**/api/generate");
      }
      await page.getByRole("button", { name: "生成网站", exact: true }).click();
      await page.locator(".editor").waitFor();
      await page
        .frameLocator("iframe")
        .getByRole("heading", { name: "让日常，值得停留", exact: true })
        .waitFor();
      assert.equal(
        await page.locator("body").getAttribute("data-page"),
        "workspace",
      );
      const projectUrl = page.url();
      await page.reload();
      await page.locator(".editor").waitFor();
      assert.equal(page.url(), projectUrl);
      await page.goto("http://127.0.0.1:4173/workspace");
      await page.locator(".workspace-start").waitFor();
      assert.equal(
        await page.locator("body").getAttribute("data-page"),
        "workspace",
      );
      await page
        .getByRole("link", { name: "构页 FRAME 首页", exact: true })
        .click();
      await page.locator(".experience-scroll").waitFor();
      assert.equal(
        await page.locator("body").getAttribute("data-page"),
        "home",
      );
      await page.goBack();
      await page.locator(".workspace-start").waitFor();
      assert.equal(
        await page.locator("body").getAttribute("data-page"),
        "workspace",
      );
    }
    pass(
      `${width}px: three glass steps, validation, references, page actions, selection and no overflow${width === 1440 || width === 390 ? "; generation, persistence and back navigation" : ""}`,
    );
    await context.close();
  }
  assert.deepEqual(errors, []);
} catch (error) {
  failure = error;
  throw error;
} finally {
  await fs.writeFile(
    "workspace-wizard-results.json",
    JSON.stringify(
      { checks, errors, failure: failure?.message || null },
      null,
      2,
    ),
  );
  await browser.close();
}
