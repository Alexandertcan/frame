import { chromium } from "playwright";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { unzipSync } from "fflate";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  acceptDownloads: true,
});
const checks = [];
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const pass = (s) => {
  checks.push(s);
  console.log("PASS", s);
};
try {
  await page.goto("http://127.0.0.1:4173/workspace?mode=blank");
  const image = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1000;
    canvas.height = 800;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#445749";
    ctx.fillRect(0, 0, 1000, 800);
    ctx.fillStyle = "#f1d745";
    ctx.fillRect(250, 200, 500, 400);
    return canvas.toDataURL("image/png").split(",")[1];
  });
  await page.getByRole("button", { name: "填入样本内容" }).click();
  await page.locator(".upload-box input").setInputFiles([
    {
      name: "brand.png",
      mimeType: "image/png",
      buffer: Buffer.from(image, "base64"),
    },
    {
      name: "secondary.png",
      mimeType: "image/png",
      buffer: Buffer.from(image, "base64"),
    },
  ]);
  await page.locator(".asset-list img").nth(1).waitFor();
  await page.getByRole("button", { name: "下一步" }).click();
  await page.getByRole("button", { name: "下一步" }).click();
  await page.getByRole("button", { name: "生成网站" }).click();
  await page.locator(".editor").waitFor();
  await page.frameLocator("iframe").locator(".hero img").waitFor();
  await page.waitForFunction(() =>
    document.querySelector("iframe").src.includes(":4174/"),
  );
  await page.reload();
  await page.locator(".editor").waitFor();
  await page.getByRole("button", { name: "素材与参考", exact: true }).click();
  assert.equal(await page.locator(".editor-assets figure").count(), 2);
  assert.match(
    await page.locator(".editor-assets img").first().getAttribute("src"),
    /^data:image\/webp/,
  );
  const downloadReady = page.waitForEvent("download");
  await page.getByRole("button", { name: "导出网站" }).click();
  const download = await downloadReady;
  const zip = unzipSync(
    new Uint8Array(await fs.readFile(await download.path())),
  );
  assert.ok(zip["assets/upload.webp"]?.length > 0);
  assert.ok(zip["assets/upload-2.webp"]?.length > 0);
  pass(
    "two uploaded images compress to WebP, survive refresh and are included in exported ZIP",
  );

  await page.getByRole("button", { name: "内容编辑", exact: true }).click();
  const title = page.getByRole("textbox", { name: "页面标题", exact: true });
  const original = await title.inputValue();
  await title.fill("测试撤销后的标题");
  await page
    .frameLocator("iframe")
    .getByRole("heading", { name: "测试撤销后的标题", exact: true })
    .waitFor();
  await page.getByRole("button", { name: "撤销", exact: true }).click();
  assert.equal(await title.inputValue(), original);
  pass("undo restores actual editable content and preview state");

  const projectId = new URL(page.url()).searchParams.get("project");
  await page.goto("http://127.0.0.1:4173/inspiration");
  await page
    .getByRole("combobox", { name: "参考目标项目" })
    .selectOption(projectId);
  const card = page.locator(".reference-card").filter({
    has: page.getByRole("button", { name: "Nick Ho Motorsports", exact: true }),
  });
  await card.getByRole("button", { name: "加入项目参考", exact: true }).click();
  await card.getByRole("button", { name: "已加入参考", exact: true }).waitFor();
  await page.getByRole("link", { name: "继续编辑此项目" }).click();
  await page.getByRole("button", { name: "素材与参考", exact: true }).click();
  await page
    .locator(".editor-assets")
    .getByRole("link", { name: "Nick Ho" })
    .waitFor();
  pass(
    "reference can be attached to an existing project with persisted selected feedback",
  );

  await page.goto("http://127.0.0.1:4173/");
  await page
    .getByText("原创 3D 工作室 · 点击物件探索", { exact: true })
    .waitFor();
  await page
    .locator(".studio-canvas canvas")
    .evaluate((canvas) =>
      canvas.dispatchEvent(new Event("webglcontextlost", { cancelable: true })),
    );
  await page
    .getByText("3D 显示已中断 · 静态入口继续可用", { exact: true })
    .waitFor();
  await page.waitForFunction(
    () =>
      getComputedStyle(document.querySelector(".studio-still")).opacity === "1",
  );
  assert.equal(
    await page
      .locator(".studio-still")
      .evaluate((el) => getComputedStyle(el).opacity),
    "1",
  );
  await page.locator(".hotspot-projects").click();
  await page.locator(".projects-page").waitFor();
  pass(
    "WebGL context loss reveals static scene and keeps project navigation usable",
  );
  assert.deepEqual(errors, []);
} finally {
  await fs.writeFile(
    "asset-browser-results.json",
    JSON.stringify({ checks, errors }, null, 2),
  );
  await browser.close();
}
