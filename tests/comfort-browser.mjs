import { chromium } from "playwright";
import assert from "node:assert/strict";
import fs from "node:fs/promises";

// Catches lost mute state, broken title drag/recovery, blocked pointers and
// inaccessible new navigation. Exercises real browser audio, not an audio mock.
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.addInitScript(() => {
  window.__audioContexts = [];
  window.__waterMaxRadius = 0;
  window.__captureWater = false;
  const originalEllipse = CanvasRenderingContext2D.prototype.ellipse;
  CanvasRenderingContext2D.prototype.ellipse = function (x, y, rx, ry, ...rest) {
    if (
      this.canvas?.classList.contains("pointer-water") &&
      window.__captureWater
    ) {
      window.__waterMaxRadius = Math.max(window.__waterMaxRadius, rx);
    }
    return originalEllipse.call(this, x, y, rx, ry, ...rest);
  };
  const Original = window.AudioContext;
  if (Original)
    window.AudioContext = new Proxy(Original, {
      construct(Target, args) {
        const context = new Target(...args);
        window.__audioContexts.push(context);
        return context;
      },
    });
});
const checks = [],
  errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const pass = (name) => {
  checks.push(name);
  console.log("PASS", name);
};
let failure;
try {
  await page.goto("http://127.0.0.1:4173/");
  await page.locator(".experience-scroll").waitFor();
  assert.equal(
    await page.getByRole("button", { name: "开启背景声音" }).count(),
    1,
    "Ambient sound must have an explicit, initially muted control",
  );
  await page.getByRole("button", { name: "开启背景声音" }).click();
  await page.getByRole("button", { name: "静音背景声音" }).waitFor();
  await page.waitForFunction(() =>
    window.__audioContexts.some((c) => c.state === "running"),
  );
  await page.getByRole("link", { name: "产品", exact: true }).first().click();
  assert.equal(
    await page.getByRole("button", { name: "静音背景声音" }).count(),
    1,
  );
  await page.getByRole("button", { name: "静音背景声音" }).click();
  await page.getByRole("button", { name: "开启背景声音" }).waitFor();
  await page.waitForFunction(() =>
    window.__audioContexts.every((c) => c.state === "suspended"),
  );
  pass(
    "real browser sound can start and mute, preserving state across product navigation",
  );

  await page.goto("http://127.0.0.1:4173/");
  const title = page.getByRole("button", { name: "拖动首页标题" });
  const box = await title.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    box.x + box.width / 2 + 100,
    box.y + box.height / 2 + 40,
    { steps: 8 },
  );
  const moved = await title.boundingBox();
  assert.ok(moved.x > box.x + 70, "drag must move the visible title");
  await page.mouse.move(8, 450, { steps: 14 });
  await page.mouse.up();
  await page.getByRole("status").filter({ hasText: "标题已散开" }).waitFor();
  await page.getByRole("button", { name: "复位标题" }).click();
  await page.waitForTimeout(700);
  const restored = await title.boundingBox();
  assert.ok(Math.abs(restored.x - box.x) < 2);
  pass(
    "title moves with drag, bursts at the viewport edge, and can be restored",
  );

  await page.mouse.move(900, 500);
  await page.waitForTimeout(100);
  const first = await page.locator(".pointer-hint").boundingBox();
  await page.mouse.move(1050, 600, { steps: 5 });
  await page.waitForTimeout(120);
  const second = await page.locator(".pointer-hint").boundingBox();
  assert.ok(second.x > first.x + 90 && second.y > first.y + 50);
  assert.equal(
    await page
      .locator(".pointer-water")
      .evaluate((e) => getComputedStyle(e).pointerEvents),
    "none",
  );
  await page
    .getByRole("link", { name: "浏览案例", exact: true })
    .first()
    .click();
  await page.getByRole("textbox", { name: "搜索案例" }).fill("Nick");
  assert.equal(await page.locator(".reference-card").count(), 1);
  pass(
    "pointer hint follows the mouse and water overlay leaves navigation and typing usable",
  );

  await page.goto("http://127.0.0.1:4173/");
  await page.waitForTimeout(1400);
  await page.evaluate(() => {
    window.__waterMaxRadius = 0;
    window.__captureWater = true;
  });
  await page.mouse.move(280, 700, { steps: 12 });
  await page.waitForTimeout(650);
  const moveRadius = await page.evaluate(() => window.__waterMaxRadius);
  assert.ok(moveRadius > 35 && moveRadius <= 92, `move radius ${moveRadius}px`);
  await page.evaluate(() => {
    window.__waterMaxRadius = 0;
    window.__captureWater = false;
  });
  await page.waitForTimeout(1400);
  await page.evaluate(() => {
    window.__waterMaxRadius = 0;
    window.__captureWater = true;
  });
  await page.mouse.click(360, 700);
  await page.waitForTimeout(800);
  const pressRadius = await page.evaluate(() => window.__waterMaxRadius);
  assert.ok(pressRadius > 55 && pressRadius <= 115, `press radius ${pressRadius}px`);
  await page.evaluate(() => {
    window.__captureWater = false;
  });
  pass("cursor waves stay within the restrained movement and press radii");

  await page.goto("http://127.0.0.1:4173/sponsorship");
  await page
    .getByRole("heading", { name: "Sponsorship", exact: true })
    .waitFor();
  assert.equal(
    await page.getByRole("link", { name: /访问 ChatGPT/ }).getAttribute("href"),
    "https://chatgpt.com/",
  );
  assert.equal(
    await page
      .getByRole("link", { name: /访问 Aleks.com/ })
      .getAttribute("href"),
    "https://aleks.com/",
  );
  await page.getByText("尚无已确认的商业赞助关系。", { exact: true }).waitFor();
  await page.reload();
  assert.equal(await page.locator("h1").count(), 1);
  pass(
    "sponsorship route refreshes, links correctly, and discloses unconfirmed relationships",
  );

  for (const width of [1440, 768, 390]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    for (const route of [
      "/",
      "/product",
      "/inspiration",
      "/about",
      "/pricing",
      "/login",
      "/projects",
      "/workspace",
      "/sponsorship",
    ]) {
      await page.goto("http://127.0.0.1:4173" + route);
      await page.locator("h1").waitFor();
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        true,
        width + route,
      );
      if (
        [
          "/",
          "/product",
          "/about",
          "/pricing",
          "/sponsorship",
          "/inspiration",
        ].includes(route) &&
        width !== 768
      ) {
        await page.evaluate(() => document.fonts.ready);
        if (route === "/") {
          await page
            .getByText("实时 3D · 滚动改变形态", { exact: true })
            .waitFor();
        } else {
          for (
            let y = 0;
            y <
            (await page.evaluate(() => document.documentElement.scrollHeight));
            y += 650
          ) {
            await page.evaluate(
              (top) => scrollTo({ top, behavior: "instant" }),
              y,
            );
            await page.waitForTimeout(50);
          }
          await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
        }
        await page.waitForTimeout(1100);
        await page.screenshot({
          path: `comfort-${route.slice(1) || "home"}-${width}.png`,
          fullPage: route !== "/",
        });
      }
    }
  }
  pass(
    "product pages keep functional glass controls without overflow on desktop, tablet and phone",
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("http://127.0.0.1:4173/");
  assert.equal(
    await page
      .locator(".pointer-water")
      .evaluate((e) => getComputedStyle(e).display),
    "none",
  );
  await page.getByRole("button", { name: "拖动首页标题" }).focus();
  await page.keyboard.press("Enter");
  await page.getByRole("status").filter({ hasText: "标题已散开" }).waitFor();
  await page.keyboard.press("Escape");
  pass(
    "reduced motion removes cursor water while preserving keyboard title controls",
  );
  assert.deepEqual(errors, []);
} catch (e) {
  failure = e;
  throw e;
} finally {
  await fs.writeFile(
    "comfort-browser-results.json",
    JSON.stringify(
      { checks, errors, failure: failure?.message || null },
      null,
      2,
    ),
  );
  await browser.close();
}
