import { chromium } from "playwright";
import assert from "node:assert/strict";

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
try {
  await page.goto("http://127.0.0.1:4173/workspace");
  await page
    .getByRole("button", { name: "创建 SUPER INTELLIGENCE 副本" })
    .click();
  await page.locator(".editor").waitFor();
  const projectId = new URL(page.url()).searchParams.get("project");
  assert.ok(projectId);

  await page.goto("http://127.0.0.1:4173/workspace");
  const resume = page.getByRole("link", { name: /继续编辑最近项目/ });
  await resume.waitFor();
  await resume.click();
  await page.waitForURL(`**/workspace?project=${projectId}`);
  await page.locator(".editor").waitFor();
  await page
    .getByRole("heading", { name: "SUPER INTELLIGENCE · 太空旅行样本" })
    .waitFor();
  assert.deepEqual(errors, []);
  console.log(
    "PASS /workspace separates creation modes and resumes the saved standalone editor",
  );
} finally {
  await browser.close();
}
