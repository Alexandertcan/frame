import { chromium } from "playwright";
import assert from "node:assert/strict";
import fs from "node:fs/promises";

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1615, height: 1199 } });
const checks = [],
  errors = [];
const names = ["想法", "方向", "网站"];
const labels = ["拖动首页标题", "拖动方向标题", "拖动网站标题"];
const sections = [".chapter-intro", ".chapter-fold", ".chapter-pages"];
await fs.mkdir("evidence/chapter-titles", { recursive: true });
page.on("pageerror", (e) => errors.push(e.message));
const pass = (name) => {
  checks.push(name);
  console.log("PASS", name);
};
async function chapter(index) {
  await page
    .getByRole("navigation", { name: "体验章节" })
    .getByRole("button", { name: names[index], exact: true })
    .click();
  await page.waitForFunction(
    ({ index, fraction }) => {
      const root = document.querySelector(".experience-scroll");
      return (
        root.dataset.phase === String(index) &&
        Math.abs(Number(root.style.getPropertyValue("--progress")) - fraction) <
          0.005
      );
    },
    { index, fraction: [0, 0.47, 0.98][index] },
  );
}
let failure;
try {
  await page.goto("http://127.0.0.1:4173/");
  await page.evaluate(() => document.fonts.ready);
  for (let index = 0; index < 3; index++) {
    await chapter(index);
    assert.equal(
      await page
        .getByRole("button", { name: labels[index], exact: true })
        .count(),
      1,
      "each chapter must provide the main-title interaction",
    );
    const ids = await page
      .locator(".experience-scroll .draggable-title")
      .evaluateAll((nodes) =>
        nodes.map((n) => n.getAttribute("aria-describedby")),
      );
    assert.equal(
      new Set(ids).size,
      3,
      "title instructions must use distinct IDs",
    );
    assert.equal(
      await page
        .locator('.experience-scroll .draggable-title:not([tabindex="-1"])')
        .count(),
      1,
      "only the active chapter is in keyboard order",
    );
  }
  pass(
    "all three chapters have the same title control with unique instructions and only the active control in tab order",
  );
  for (const index of [0, 1, 2]) {
    await chapter(index);
    const title = page.getByRole("button", {
      name: labels[index],
      exact: true,
    });
    const section = page.locator(sections[index]);
    assert.equal(
      await title.evaluate((n) => n.closest("h1, h2") !== null),
      true,
    );
    const start = await title.boundingBox();
    await page.mouse.move(
      start.x + start.width * 0.4,
      start.y + start.height * 0.45,
    );
    await page.mouse.down();
    await page.mouse.move(
      start.x + start.width * 0.4 + 95,
      start.y + start.height * 0.45 + 25,
      { steps: 8 },
    );
    const moved = await title.boundingBox();
    assert.ok(
      moved.x > start.x + 80,
      "visible h2 must follow the pointer without easing lag",
    );
    await page.mouse.up();
    await section
      .getByRole("button", { name: "复位标题", exact: true })
      .click();
    await page.waitForTimeout(650);
    assert.ok(Math.abs((await title.boundingBox()).x - start.x) < 2);
    const box = await title.boundingBox();
    await page.mouse.move(box.x + box.width * 0.4, box.y + box.height * 0.45);
    await page.mouse.down();
    await page.mouse.move(10, box.y + box.height * 0.45, { steps: 12 });
    await page.mouse.up();
    assert.ok(await section.locator(".title-playground.is-burst").isVisible());
    await section
      .getByRole("status")
      .filter({ hasText: "标题已散开" })
      .waitFor();
    await section
      .getByRole("button", { name: "复位标题", exact: true })
      .click();
    await page.waitForTimeout(1000);
    await page.mouse.move(1500, 1100);
    await page.screenshot({
      path: `evidence/chapter-titles/${names[index]}-desktop.png`,
    });
    await title.focus();
    await title.press("ArrowRight");
    await page.waitForTimeout(600);
    assert.ok((await title.boundingBox()).x > start.x + 20);
    await title.press("Enter");
    assert.equal(await section.locator(".is-burst").count(), 1);
    await title.press("Escape");
    assert.equal(await section.locator(".is-burst").count(), 0);
  }
  pass(
    "both h2 titles drag, scatter at the viewport edge, reset, and support arrow/Enter/Escape controls",
  );
  await chapter(1);
  const direction = page.getByRole("button", { name: labels[1], exact: true });
  await direction.focus();
  await direction.press("Enter");
  await page.waitForTimeout(2800);
  assert.equal(
    await page.locator(".chapter-fold .is-burst").count(),
    0,
    "scatter restores automatically",
  );
  await direction.press("ArrowRight");
  await chapter(2);
  await chapter(1);
  assert.equal(
    await page.locator(".chapter-fold .title-reset").count(),
    0,
    "leaving a chapter clears its old offset and timers",
  );
  pass("automatic restoration and chapter changes clear interaction state");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await direction.focus();
  await direction.press("Enter");
  await direction.press("Escape");
  assert.ok(
    parseFloat(
      await direction
        .locator(".title-letter")
        .first()
        .evaluate((n) => getComputedStyle(n).transitionDuration),
    ) <= 0.001,
  );
  const touchContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    reducedMotion: "reduce",
  });
  const touch = await touchContext.newPage();
  await touch.goto("http://127.0.0.1:4173/");
  for (const width of [390, 320]) {
    await touch.setViewportSize({ width, height: 844 });
    for (const [index, name] of [
      [1, "方向"],
      [2, "网站"],
    ]) {
      await touch
        .getByRole("navigation", { name: "体验章节" })
        .getByRole("button", { name, exact: true })
        .tap();
      const control = touch.getByRole("button", {
        name: labels[index],
        exact: true,
      });
      await control.waitFor();
      const rect = await control.boundingBox();
      assert.ok(
        rect.x >= 0 && rect.x + rect.width <= width + 1,
        "mobile title fits viewport",
      );
      assert.equal(
        await control.evaluate((n) => getComputedStyle(n).touchAction),
        "pan-y",
      );
      assert.ok(
        await touch.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      );
      await touch.screenshot({
        path: `evidence/chapter-titles/${name}-${width}.png`,
      });
    }
  }
  await touchContext.close();
  pass(
    "reduced motion preserves controls and 390/320px touch layouts retain scrolling without overflow",
  );
  assert.deepEqual(errors, []);
} catch (error) {
  failure = error;
  throw error;
} finally {
  await fs.writeFile(
    "chapter-titles-results.json",
    JSON.stringify(
      { checks, errors, failure: failure?.stack || null },
      null,
      2,
    ),
  );
  await browser.close();
}
