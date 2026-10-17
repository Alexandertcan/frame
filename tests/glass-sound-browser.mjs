import { chromium } from "playwright";
import assert from "node:assert/strict";
import fs from "node:fs/promises";

// Catches a long hold accidentally toggling playback, silent presets, volume
// controls that do not affect sound, and a modal leaking keyboard focus.
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.addInitScript(() => {
  window.__audioContexts = [];
  const Original = window.AudioContext;
  const connect = AudioNode.prototype.connect;
  AudioNode.prototype.connect = function (destination, ...args) {
    if (destination === this.context.destination && this.context.__meter)
      connect.call(this, this.context.__meter);
    return connect.call(this, destination, ...args);
  };
  window.AudioContext = new Proxy(Original, {
    construct(Target, args) {
      const context = new Target(...args);
      context.__meter = context.createAnalyser();
      context.__meter.fftSize = 2048;
      window.__audioContexts.push(context);
      return context;
    },
  });
});
const checks = [],
  errors = [];
const signals = {};
page.on("pageerror", (e) => errors.push(e.message));
const pass = (s) => {
  checks.push(s);
  console.log("PASS", s);
};
async function holdSound() {
  const button = page.locator(".sound-toggle");
  await button.hover();
  await page.mouse.down();
  await page.waitForTimeout(300);
  assert.ok(
    await page.locator(".sound-hold-ring").isVisible(),
    "holding should show a visible progress ring",
  );
  await page.waitForTimeout(500);
  await page.mouse.up();
  await page.getByRole("dialog", { name: "声音空间" }).waitFor();
  await page.waitForTimeout(450);
}
async function measure() {
  return page.evaluate(async () => {
    const meter = window.__audioContexts.at(-1).__meter;
    const samples = new Float32Array(meter.fftSize);
    let energy = 0,
      peak = 0;
    for (let n = 0; n < 12; n++) {
      meter.getFloatTimeDomainData(samples);
      for (const value of samples) {
        energy += value * value;
        peak = Math.max(peak, Math.abs(value));
      }
      await new Promise((r) => setTimeout(r, 60));
    }
    return { rms: Math.sqrt(energy / (12 * samples.length)), peak };
  });
}
let failure;
try {
  await page.goto("http://127.0.0.1:4173/");
  await page.locator(".experience-scroll").waitFor();
  await holdSound();
  assert.equal(
    await page
      .getByRole("button", { name: "开启背景声音", exact: true })
      .count(),
    1,
    "long hold opens settings without enabling playback",
  );
  await page.keyboard.press("Escape");
  assert.equal(await page.getByRole("dialog").count(), 0);
  assert.ok(
    await page
      .locator(".sound-toggle")
      .evaluate((e) => e === document.activeElement),
  );
  pass(
    "long hold draws a progress ring, opens settings without toggling audio, and Escape restores focus",
  );

  await page.getByRole("button", { name: "声音设置", exact: true }).click();
  for (const name of ["自然海岸", "白噪音", "Jazz", "R&B"]) {
    await page.getByRole("radio", { name, exact: true }).check();
    assert.ok(await page.getByRole("radio", { name, exact: true }).isChecked());
  }
  await page.getByRole("button", { name: "开始聆听", exact: true }).click();
  await page.waitForFunction(
    () => window.__audioContexts.at(-1)?.state === "running",
  );
  for (const name of ["自然海岸", "白噪音", "Jazz", "R&B"]) {
    await page.getByRole("radio", { name, exact: true }).check();
    await page.waitForTimeout(1800);
    const signal = await measure();
    signals[name] = signal;
    assert.ok(
      signal.rms > 0.00015,
      name + " must produce a real audio signal: " + JSON.stringify(signal),
    );
    assert.ok(
      signal.peak < 0.2,
      name + " must stay below the configured output ceiling",
    );
  }
  const slider = page.getByRole("slider", { name: "音量", exact: true });
  await slider.focus();
  await slider.press("End");
  await page.waitForTimeout(600);
  const loud = await measure();
  await slider.press("Home");
  await page.waitForTimeout(900);
  const quiet = await measure();
  signals.volume = { loud, quiet };
  assert.ok(
    quiet.rms < loud.rms * 0.05,
    "zero volume must silence actual output",
  );
  await slider.press("ArrowRight");
  await page.keyboard.press("Escape");
  await page.getByRole("link", { name: "产品", exact: true }).first().click();
  assert.equal(
    await page
      .getByRole("button", { name: "静音背景声音", exact: true })
      .count(),
    1,
  );
  await page.getByRole("button", { name: "静音背景声音", exact: true }).click();
  await page.waitForFunction(() =>
    window.__audioContexts.every((c) => c.state === "suspended"),
  );
  await page.reload();
  await page.getByRole("button", { name: "声音设置", exact: true }).click();
  assert.ok(
    await page.getByRole("radio", { name: "R&B", exact: true }).isChecked(),
  );
  assert.equal(
    await page.getByRole("button", { name: "开始聆听", exact: true }).count(),
    1,
  );
  pass(
    "four real audio presets produce bounded output, volume changes the waveform, selection persists and navigation preserves playback",
  );

  for (let i = 0; i < 15; i++) await page.keyboard.press("Tab");
  assert.ok(
    await page
      .getByRole("dialog")
      .evaluate((e) => e.contains(document.activeElement)),
    "keyboard focus stays in the sound dialog",
  );
  await page.keyboard.press("Escape");
  await page.goto("http://127.0.0.1:4173/");
  await page.getByText("实时 3D · 滚动改变形态", { exact: true }).waitFor();
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(600);
  await page.screenshot({ path: "glass-restored-home.png" });
  await holdSound();
  await page.screenshot({ path: "glass-sound-panel.png" });
  await page.keyboard.press("Escape");
  pass(
    "sound panel traps focus and supports both long hold and a keyboard-accessible settings button",
  );

  for (const width of [768, 390]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    for (const path of [
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
      await page.goto("http://127.0.0.1:4173" + path);
      await page.locator("h1").waitFor();
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        width + path + " overflow",
      );
    }
    await page.goto("http://127.0.0.1:4173/");
    await page.getByText("实时 3D · 滚动改变形态", { exact: true }).waitFor();
    await page.getByRole("button", { name: "声音设置", exact: true }).click();
    await page.waitForTimeout(450);
    const panel = await page.getByRole("dialog").boundingBox();
    assert.ok(panel.x >= 0 && panel.x + panel.width <= width);
    assert.ok(
      panel.y >= 0 && panel.y + panel.height <= (width === 390 ? 844 : 1000),
    );
    if (width === 390)
      await page.screenshot({ path: "glass-sound-mobile.png" });
    await page.keyboard.press("Escape");
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.getByRole("button", { name: "声音设置", exact: true }).click();
  await page.keyboard.press("Escape");
  pass(
    "nine routes and the sound panel fit tablet and phone; reduced motion keeps settings usable",
  );
  const mobile = await browser.newPage({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  mobile.on("pageerror", (e) => errors.push(e.message));
  await mobile.goto("http://127.0.0.1:4173/");
  await mobile.getByText("实时 3D · 滚动改变形态", { exact: true }).waitFor();
  const touch = await mobile.context().newCDPSession(mobile);
  const target = await mobile.locator(".sound-toggle").boundingBox();
  await touch.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [
      {
        x: target.x + target.width / 2,
        y: target.y + target.height / 2,
        id: 0,
      },
    ],
  });
  await mobile.waitForTimeout(300);
  assert.ok(await mobile.locator(".sound-hold-ring").isVisible());
  await mobile.waitForTimeout(500);
  await touch.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await mobile.getByRole("dialog", { name: "声音空间" }).waitFor();
  await mobile.getByText("白噪音", { exact: true }).tap();
  assert.ok(
    await mobile
      .getByRole("radio", { name: "白噪音", exact: true })
      .isChecked(),
  );
  await mobile.getByRole("button", { name: "开始聆听", exact: true }).tap();
  await mobile.getByRole("button", { name: "暂停声音", exact: true }).tap();
  await mobile.waitForTimeout(450);
  await mobile.screenshot({ path: "glass-sound-mobile.png" });
  await mobile.getByRole("button", { name: "关闭声音设置", exact: true }).tap();
  await mobile.waitForTimeout(450);
  await mobile.screenshot({ path: "glass-restored-home-mobile.png" });
  await mobile.close();
  pass(
    "touch long press opens settings, and touch selection, playback, pause and dismissal work",
  );
  assert.deepEqual(errors, []);
} catch (e) {
  failure = e;
  throw e;
} finally {
  await fs.writeFile(
    "glass-sound-browser-results.json",
    JSON.stringify(
      { checks, signals, errors, failure: failure?.message || null },
      null,
      2,
    ),
  );
  await browser.close();
}
