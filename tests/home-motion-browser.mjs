import { chromium } from "playwright";
import assert from "node:assert/strict";
import fs from "node:fs/promises";

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1088, height: 1199 } });
const errors = [],
  checks = [];
page.on("pageerror", (e) => errors.push(e.message));
await fs.mkdir("evidence/home-motion", { recursive: true });
const pass = (name) => {
  checks.push(name);
  console.log("PASS", name);
};
async function position(selector, top) {
  await page.locator(selector).evaluate(
    (node, top) =>
      scrollTo({
        top: scrollY + node.getBoundingClientRect().top - top,
        behavior: "instant",
      }),
    top,
  );
  await page.waitForTimeout(200);
}
async function phase(index) {
  await page.locator(".experience-scroll").evaluate(
    (node, index) =>
      scrollTo({
        top: (node.offsetHeight - innerHeight) * [0, 0.47, 0.98][index],
        behavior: "instant",
      }),
    index,
  );
  await page.waitForFunction(
    (index) =>
      document.querySelector(".experience-scroll").dataset.phase ===
      String(index),
    index,
  );
  await page.waitForTimeout(400);
}
let failure;
try {
  await page.goto("http://127.0.0.1:4173/");
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(900);
  const contrast = await page
    .locator(".site-header .brand b")
    .evaluate((node) => {
      const s = getComputedStyle(node);
      const luma = (color) => {
        const rgb = color
          .match(/[\d.]+/g)
          .slice(0, 3)
          .map(Number)
          .map((v) => v / 255)
          .map((v) =>
            v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4,
          );
        return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
      };
      return (
        (Math.max(luma(s.color), luma(s.backgroundColor)) + 0.05) /
        (Math.min(luma(s.color), luma(s.backgroundColor)) + 0.05)
      );
    });
  assert.ok(contrast >= 12, `FRAME contrast ${contrast}`);
  await page.screenshot({ path: "evidence/home-motion/home-1088.png" });
  pass(`FRAME opaque wordmark contrast ${contrast.toFixed(2)}:1`);

  for (const [index, label] of [
    "拖动首页标题",
    "拖动方向标题",
    "拖动网站标题",
    "拖动灵感标题",
  ].entries()) {
    if (index < 3) await phase(index);
    else await position(".experience-cta", 180);
    const title = page.getByRole("button", { name: label, exact: true });
    const box = await title.boundingBox();
    const point = { x: box.x + box.width * 0.4, y: box.y + box.height * 0.45 };
    await page.mouse.move(point.x, point.y);
    await page.mouse.down();
    await page.mouse.move(65, point.y, { steps: 8 });
    const scale = await title.evaluate(
      (n) =>
        new DOMMatrixReadOnly(getComputedStyle(n.closest("h1,h2")).transform).a,
    );
    assert.ok(scale > 1.4, `${label} must grow near the edge: ${scale}`);
    assert.equal(await page.locator(".title-atmosphere").count(), 0);
    await page.mouse.move(10, point.y, { steps: 4 });
    await page.mouse.up();
    const portal = page.locator("body > .title-atmosphere");
    await portal.waitFor();
    assert.equal(await portal.locator(".burst-fragment").count(), 84);
    const overlay = await portal.boundingBox();
    assert.deepEqual(overlay, { x: 0, y: 0, width: 1088, height: 1199 });
    assert.equal(
      await portal.evaluate((n) => getComputedStyle(n).pointerEvents),
      "none",
    );
    await page.waitForTimeout(1100);
    const bounds = await portal
      .locator(".burst-fragment")
      .evaluateAll((nodes) => {
        const rects = nodes.map((n) => n.getBoundingClientRect());
        return {
          left: Math.min(...rects.map((r) => r.left)),
          right: Math.max(...rects.map((r) => r.right)),
          top: Math.min(...rects.map((r) => r.top)),
          bottom: Math.max(...rects.map((r) => r.bottom)),
        };
      });
    assert.ok(
      bounds.right > 900 &&
        bounds.bottom > 950 &&
        bounds.left < 140 &&
        bounds.top < 180,
      `${label} distributes across the viewport: ${JSON.stringify(bounds)}`,
    );
    if (index === 0 || index === 3)
      await page.screenshot({
        path: `evidence/home-motion/burst-${index}.png`,
      });
    await title.press("Escape");
    assert.equal(await portal.count(), 0);
  }
  pass(
    "all four titles grow before the edge and scatter gently across the full viewport; Escape cleans the portal",
  );
  const closingTitle = page.getByRole("button", {
    name: "拖动灵感标题",
    exact: true,
  });
  await closingTitle.press("Enter");
  await page.waitForTimeout(2800);
  assert.equal(await page.locator(".title-atmosphere").count(), 0);
  await closingTitle.press("Enter");
  await page.locator(".experience-cta > .text-button").click();
  await page.waitForURL("**/pricing");
  assert.equal(await page.locator(".title-atmosphere").count(), 0);
  assert.equal(
    await page.locator(".site-header").getAttribute("data-surface"),
    null,
  );
  await page.goBack();
  await page.waitForURL("http://127.0.0.1:4173/");
  pass(
    "fourth title restores automatically; navigating during a burst clears the overlay and homepage header state",
  );
  await page.evaluate(() => document.activeElement?.blur());

  const scenarios = [
    ["ink", ".experience-intro", ".ink-line", "backgroundImage"],
    ["unfold", ".experience-workbench", ".folding-interface", "transform"],
    ["studio", ".experience-studio", ".experience-room", "transform"],
    ["showcase", ".experience-case", ".promo-computer", "transform"],
    ["aperture", ".experience-cta", ".cta-aperture i", "transform"],
  ];
  for (const [name, section, subject, property] of scenarios) {
    await position(section, 1000);
    const before = await page
      .locator(subject)
      .first()
      .evaluate((n, p) => getComputedStyle(n)[p], property);
    await position(section, 120);
    const after = await page
      .locator(subject)
      .first()
      .evaluate((n, p) => getComputedStyle(n)[p], property);
    assert.notEqual(before, after, `${name} responds continuously to scroll`);
    await page.screenshot({ path: `evidence/home-motion/${name}-1088.png` });
    await position(section, 1000);
    const reversed = await page
      .locator(subject)
      .first()
      .evaluate((n, p) => getComputedStyle(n)[p], property);
    assert.equal(before, reversed, `${name} reverses with scrolling`);
  }
  pass(
    "five subsequent sections have distinct scroll responses and reverse without a one-shot reveal",
  );
  await position(".experience-case", 0);
  assert.equal(
    await page.locator(".site-header").getAttribute("data-surface"),
    "light",
  );
  const headerLinkColor = await page
    .locator(".header-login")
    .evaluate((n) => getComputedStyle(n).color);
  assert.equal(headerLinkColor, "rgb(32, 59, 44)");
  await position(".experience-studio", 500);
  await page.waitForFunction(
    () =>
      document.querySelector(".studio-canvas")?.dataset.cameraOrbit !==
      undefined,
  );
  const orbit = await page
    .locator(".studio-canvas")
    .getAttribute("data-camera-orbit");
  await position(".experience-studio", 100);
  await page.waitForTimeout(300);
  assert.notEqual(
    await page.locator(".studio-canvas").getAttribute("data-camera-orbit"),
    orbit,
  );
  pass("real 3D studio camera responds to scrolling");

  await position(".experience-workbench", 120);
  // The preview is still interactive after the unfold transform.
  const tab = page.locator(".demo-ui aside button").filter({ hasText: "关于" });
  await tab.click();
  const frame = page.locator(".demo-ui iframe");
  await frame.contentFrame().locator("body.si-page-about").waitFor();
  pass("unfolded live multi-page preview remains interactive");
  await position(".experience-case", 120);
  assert.equal(await page.locator(".computer-page-switcher button").count(), 6);
  await page
    .locator(".computer-page-switcher button")
    .filter({ hasText: "关于" })
    .click();
  await page
    .locator(".computer-screen iframe")
    .contentFrame()
    .locator("body.si-page-about")
    .waitFor();
  pass(
    "FRAME promotional computer reuses the six-page SUPER INTELLIGENCE sample and switches pages",
  );

  await page.emulateMedia({ reducedMotion: "reduce" });
  await position(".experience-workbench", 700);
  assert.equal(
    await page
      .locator(".folding-interface")
      .evaluate((n) => getComputedStyle(n).transform),
    "none",
  );
  await phase(0);
  const title = page.getByRole("button", { name: "拖动首页标题", exact: true });
  await title.press("Enter");
  assert.equal(await page.locator(".title-atmosphere").count(), 0);
  await title.press("Escape");
  pass(
    "reduced-motion preference keeps content visible and disables viewport burst and scroll transforms",
  );

  for (const width of [390, 320]) {
    const touch = await browser.newPage({
      viewport: { width, height: 844 },
      isMobile: true,
      hasTouch: true,
    });
    await touch.goto("http://127.0.0.1:4173/");
    await touch.evaluate(() => document.fonts.ready);
    await touch.waitForTimeout(400);
    const headerBox = await touch.locator(".site-header").boundingBox();
    const menuBox = await touch.locator(".mobile-menu").boundingBox();
    assert.ok(
      menuBox.x + menuBox.width <= headerBox.x + headerBox.width - 5,
      `menu fits inside glass header at ${width}`,
    );
    await touch.screenshot({ path: `evidence/home-motion/home-${width}.png` });
    for (const selector of [
      ".experience-intro",
      ".experience-workbench",
      ".experience-studio",
      ".experience-case",
      ".experience-cta",
      ".site-footer",
    ]) {
      await touch.locator(selector).scrollIntoViewIfNeeded();
      assert.ok(
        await touch.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${selector} has no horizontal overflow at ${width}`,
      );
    }
    await touch.locator(".experience-cta").evaluate((node) =>
      scrollTo({
        top: scrollY + node.getBoundingClientRect().top - 100,
        behavior: "instant",
      }),
    );
    await touch.waitForTimeout(200);
    const cta = touch.getByRole("button", {
      name: "拖动灵感标题",
      exact: true,
    });
    const rect = await cta.boundingBox();
    assert.ok(rect.x >= 0 && rect.x + rect.width <= width);
    assert.equal(
      await cta.evaluate((n) => getComputedStyle(n).touchAction),
      "pan-y",
    );
    await touch.getByRole("button", { name: "打开导航" }).tap();
    const menuText = await touch
      .locator(".site-header nav.is-open a")
      .first()
      .evaluate((n) => getComputedStyle(n).color);
    assert.ok(
      menuText === "rgb(230, 245, 233)" || menuText === "rgb(24, 56, 39)",
      `menu text remains readable at ${width}: ${menuText}`,
    );
    await touch.getByRole("button", { name: "关闭导航" }).tap();
    await touch.screenshot({ path: `evidence/home-motion/cta-${width}.png` });
    await touch.locator(".experience-case").scrollIntoViewIfNeeded();
    await touch.screenshot({ path: `evidence/home-motion/case-${width}.png` });
    await touch.close();
  }
  pass(
    "390/320px touch layouts fit all sections and the fourth draggable title preserves vertical scrolling",
  );
  assert.deepEqual(errors, []);
} catch (error) {
  failure = error;
  throw error;
} finally {
  await fs.writeFile(
    "home-motion-results.json",
    JSON.stringify(
      { checks, errors, failure: failure?.stack || null },
      null,
      2,
    ),
  );
  await browser.close();
}
