import { chromium } from "playwright";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [],
  checks = [];
page.on("pageerror", (e) => errors.push(e.message));
const pass = (s) => {
  checks.push(s);
  console.log("PASS", s);
};
try {
  await page.goto("http://127.0.0.1:4173/");
  await page.getByText("实时 3D · 滚动改变形态", { exact: true }).waitFor();
  await page.waitForTimeout(250);
  assert.equal(
    await page.locator(".experience-scroll").getAttribute("data-phase"),
    "0",
  );
  assert.match(
    await page
      .locator(".site-header")
      .evaluate((e) => getComputedStyle(e).backdropFilter),
    /blur/,
  );
  await page.screenshot({ path: "revision-home.png" });
  await page
    .getByRole("navigation", { name: "体验章节" })
    .getByRole("button", { name: "方向", exact: true })
    .click();
  await page.waitForFunction(
    () => document.querySelector(".experience-scroll").dataset.phase === "1",
  );
  await page.waitForTimeout(700);
  await page.screenshot({ path: "revision-scroll-fold.png" });
  await page
    .getByRole("navigation", { name: "体验章节" })
    .getByRole("button", { name: "网站", exact: true })
    .click();
  await page.waitForFunction(
    () =>
      Number(
        document
          .querySelector(".experience-scroll")
          .style.getPropertyValue("--progress"),
      ) > 0.95,
  );
  await page.waitForTimeout(700);
  await page.screenshot({ path: "revision-scroll-pages.png" });
  pass(
    "real WebGL scene, scroll-driven phases, chapter controls and glass navigation",
  );
  await page.locator(".site-footer").scrollIntoViewIfNeeded();
  const home = page
    .locator(".site-footer nav")
    .getByRole("link", { name: "首页", exact: true });
  const before = await home.evaluate((e) => getComputedStyle(e).transform);
  await home.hover();
  await page.waitForTimeout(250);
  assert.notEqual(
    await home.evaluate((e) => getComputedStyle(e).transform),
    before,
  );
  await page.screenshot({ path: "revision-footer.png" });
  await home.click();
  assert.equal(new URL(page.url()).pathname, "/");
  pass("footer home navigation magnifies on hover and navigates on click");
  await page.goto("http://127.0.0.1:4173/about");
  await page.getByText("Aleks", { exact: true }).first().waitFor();
  const biographyLength = (await page.locator(".creator-bio").innerText())
    .length;
  assert.ok(biographyLength >= 50 && biographyLength <= 100);
  assert.equal(
    await page
      .locator(".creator-profile img")
      .evaluate((e) => e.complete && e.naturalWidth > 0),
    true,
  );
  await page.screenshot({ path: "revision-about.png", fullPage: true });
  pass(
    "Aleks profile, 50–100 character biography and real placeholder portrait load",
  );
  await page.goto("http://127.0.0.1:4173/pricing");
  for (const amount of ["$5", "$15", "$39"])
    assert.ok(await page.getByText(amount, { exact: true }).isVisible());
  await page.getByRole("button", { name: "了解 Ultra", exact: true }).click();
  await page.getByRole("dialog").waitFor();
  await page.keyboard.press("Escape");
  assert.equal(await page.getByRole("dialog").count(), 0);
  await page.getByRole("button", { name: "了解咨询", exact: true }).click();
  await page.getByRole("dialog").waitFor();
  await page.getByRole("button", { name: "关闭方案说明" }).click();
  await page.screenshot({ path: "revision-pricing.png", fullPage: true });
  pass(
    "Go/Plus/Max prices, Ultra and one-time consultation, accessible plan dialog",
  );
  await page.goto("http://127.0.0.1:4173/login");
  await page
    .getByRole("textbox", { name: "邮箱地址" })
    .fill("test@example.com");
  await page.getByRole("button", { name: "发送登录链接" }).click();
  await page.getByRole("alert").filter({ hasText: "尚未配置" }).waitFor();
  assert.equal(
    (
      await page.request
        .get("http://127.0.0.1:4173/api/auth/me")
        .then((r) => r.json())
    ).user,
    null,
  );
  await page.screenshot({ path: "revision-login.png", fullPage: true });
  pass(
    "unconfigured email login reports explicit error without creating a user",
  );
  await page.route("**/api/auth/session", (r) =>
    r.fulfill({ json: { user: { email: "verified@example.com" } } }),
  );
  await page.goto(
    "http://127.0.0.1:4173/auth/callback#access_token=mock-token-for-ui-test",
  );
  await page.getByText("邮箱已验证，登录成功。", { exact: true }).waitFor();
  assert.equal(new URL(page.url()).hash, "");
  assert.equal(await page.getByRole("alert").count(), 0);
  await page.unroute("**/api/auth/session");
  await page.goto("http://127.0.0.1:4173/auth/callback");
  await page.getByRole("alert").filter({ hasText: "缺少凭证" }).waitFor();
  pass(
    "mocked verified-email callback clears token from address; invalid callback gives recovery error",
  );
  await page.goto("http://127.0.0.1:4173/inspiration");
  assert.equal(await page.locator(".collection-item").count(), 3);
  await page.locator(".curated-feature").click();
  await page.getByRole("heading", { name: /Byotōne/ }).waitFor();
  assert.equal(
    await page.getByRole("link", { name: "访问实际网站" }).getAttribute("href"),
    "https://byotone.com/",
  );
  await page.goto("http://127.0.0.1:4173/examples/byotone.html");
  await page.getByRole("heading", { name: "Byotōne." }).waitFor();
  pass(
    "verified website collection entrances, curated detail and standalone HTML page",
  );
  for (const width of [1440, 768, 390]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    for (const path of [
      "/",
      "/product",
      "/inspiration",
      "/inspiration/byotone",
      "/about",
      "/pricing",
      "/login",
      "/projects",
      "/workspace",
    ]) {
      await page.goto("http://127.0.0.1:4173" + path);
      await page.reload();
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        true,
        "overflow " + width + " " + path,
      );
      assert.equal(await page.locator("h1").count(), 1);
      if (
        width === 390 &&
        ["/about", "/pricing", "/login", "/inspiration"].includes(path)
      )
        await page.screenshot({
          path: "revision-mobile-" + path.slice(1) + ".png",
          fullPage: true,
        });
    }
    if (width === 390) {
      await page.goto("http://127.0.0.1:4173/");
      await page.getByText("实时 3D · 滚动改变形态", { exact: true }).waitFor();
      await page.screenshot({ path: "revision-home-mobile.png" });
      await page
        .getByRole("navigation", { name: "体验章节" })
        .getByRole("button", { name: "网站", exact: true })
        .click();
      await page.waitForFunction(
        () =>
          Number(
            document
              .querySelector(".experience-scroll")
              .style.getPropertyValue("--progress"),
          ) > 0.95,
      );
      await page.waitForTimeout(700);
      await page.screenshot({ path: "revision-scroll-mobile.png" });
    }
  }
  pass(
    "nine routes direct/refresh at desktop, tablet and phone without horizontal overflow",
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("http://127.0.0.1:4173/");
  assert.equal(
    await page
      .locator(".folding-interface")
      .evaluate((e) => getComputedStyle(e).animationName),
    "none",
  );
  await page
    .getByRole("navigation", { name: "体验章节" })
    .getByRole("button", { name: "方向", exact: true })
    .press("Enter");
  await page.waitForFunction(
    () => document.querySelector(".experience-scroll").dataset.phase === "1",
  );
  pass(
    "reduced motion disables folding animation and preserves keyboard chapter navigation",
  );
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      if (
        type === "webgl" ||
        type === "webgl2" ||
        type === "experimental-webgl"
      )
        return null;
      return original.call(this, type, ...args);
    };
  });
  await page.goto("http://127.0.0.1:4173/");
  await page.getByText("轻量场景 · 所有功能可用", { exact: true }).waitFor();
  await page
    .locator(".chapter-intro")
    .getByRole("link", { name: "开始创建", exact: true })
    .click();
  await page.locator(".workspace-start").waitFor();
  pass(
    "WebGL unavailable fallback preserves clear content and working creation link",
  );
  assert.deepEqual(errors, []);
} finally {
  await fs.writeFile(
    "revision-browser-results.json",
    JSON.stringify({ checks, errors }, null, 2),
  );
  await browser.close();
}
