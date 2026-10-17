import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  siteFiles,
  validateSite,
  previewDocument,
  applyDemoEdit,
  demoSite,
  sampleBrief,
} from "../src/core.ts";
import * as space from "../src/space-demo.ts";
import { spaceSceneScript, spaceSceneHash } from "../src/space-scene.ts";
let passed = 0;
function test(name, fn) {
  fn();
  passed++;
  console.log("PASS", name);
}
test("space demo contains six distinct editable pages", () => {
  assert.equal(typeof space.spaceSite, "function");
  const site = validateSite(space.spaceSite());
  assert.equal(site.pages.length, 6);
  assert.deepEqual(
    site.pages.map((p) => p.slug),
    ["index", "journeys", "spacecraft", "about", "news", "pricing"],
  );
  assert.equal(new Set(site.pages.map((p) => p.headline)).size, 6);
});
test("six standalone documents share brand and local code with valid internal links", () => {
  const site = space.spaceSite(),
    files = siteFiles(site);
  for (const p of site.pages) {
    const html = files[p.slug + ".html"];
    assert.ok(html.includes("SUPER INTELLIGENCE"));
    assert.ok(html.includes("styles.css"));
    for (const q of site.pages)
      assert.ok(html.includes(`href="${q.slug}.html"`));
    for (const m of html.matchAll(/href="([a-z][a-z-]*\.html)(?:#[^"]*)?"/g))
      assert.ok(files[m[1]], m[1]);
  }
  assert.ok(files["index.html"].includes("data-space-scene"));
  assert.ok(files["about.html"].includes("虚构人物"));
  assert.ok(files["pricing.html"].includes("概念报价"));
  assert.ok(files["news.html"].includes("<details"));
  assert.ok(files["README.txt"].includes("python3 -m http.server"));
});
test("only the exact trusted inline animation is allowed by the content security policy", () => {
  assert.equal(
    spaceSceneHash,
    createHash("sha256").update(spaceSceneScript).digest("base64"),
  );
  const html = siteFiles(space.spaceSite())["index.html"];
  assert.ok(html.includes(`script-src 'sha256-${spaceSceneHash}'`));
  assert.ok(!html.includes("script-src 'unsafe-inline'"));
  assert.ok(html.includes("<script>" + spaceSceneScript + "</script>"));
});
test("space rendering escapes editable content and retains theme after brand editing", () => {
  const site = space.spaceSite();
  site.name = "NEW ORBIT <img src=x onerror=alert(1)>";
  site.pages[0].headline = "<script>alert(1)</script>";
  site.pages[0].sections[0].body = "</p><script>bad()</script>";
  const files = siteFiles(site),
    html = files["index.html"];
  assert.ok(html.includes("&lt;script&gt;alert(1)&lt;/script&gt;"));
  assert.ok(!html.includes("<script>bad()"));
  assert.ok(html.includes("data-space-scene"));
  const edit = applyDemoEdit(
    site,
    site.pages[0].id,
    "page",
    "标题：Hello orbit",
  );
  assert.ok(siteFiles(edit.site)["index.html"].includes("Hello orbit"));
  assert.equal(edit.site.pages[1].headline, site.pages[1].headline);
  assert.ok(
    previewDocument(site, site.pages[0].id).includes("data-space-scene"),
  );
});
test("only pristine built-in furniture demos migrate, retaining their ID and undo backup", () => {
  const old = space.spaceProject("existing-project");
  old.name = "MORROW 木间 · 演示项目";
  old.site = demoSite(sampleBrief, "editorial");
  old.initial = structuredClone(old.site);
  const edited = structuredClone(old);
  edited.site.pages[0].headline = "My own content";
  const undo = structuredClone(old);
  undo.history = [structuredClone(old.site)];
  const custom = structuredClone(old);
  custom.name = "My furniture brand";
  const result = space.upgradeSpaceDemo([old, edited, undo, custom]);
  assert.equal(result[0].id, old.id);
  assert.equal(result[0].site.pages.length, 6);
  assert.deepEqual(result[0].history[0], old.site);
  assert.deepEqual(old.site.pages.length, 3);
  assert.equal(result[1], edited);
  assert.equal(result[2], undo);
  assert.equal(result[3], custom);
  assert.equal(space.upgradeSpaceDemo(result)[0], result[0]);
});
test("removed optional pages and added content keep valid links and render without losing sections", () => {
  const site = space.spaceSite();
  site.pages[0].sections.push({
    id: "additional",
    title: "Beyond the atmosphere",
    body: "A newly added editable section.",
  });
  site.pages = site.pages.filter((p) => p.slug !== "pricing");
  site.pages.push({
    ...structuredClone(site.pages[0]),
    id: "extra",
    slug: "contact",
    title: "联系",
    sections: [],
  });
  const files = siteFiles(site);
  for (const html of Object.values(files).filter((s) =>
    s.startsWith("<!doctype"),
  ))
    for (const m of html.matchAll(/href="([a-z][a-z-]*\.html)(?:#[^"]*)?"/g))
      assert.ok(files[m[1]], m[1]);
  assert.ok(files["contact.html"]);
  assert.ok(files["index.html"].includes("A newly added editable section."));
});
test("pricing display follows editable concept prices instead of a second hardcoded amount", () => {
  const site = space.spaceSite();
  const pricing = site.pages.find((p) => p.slug === "pricing");
  pricing.sections[0].body = "概念报价 $135,000 / 人\n一次新的旅程。";
  const html = siteFiles(site)["pricing.html"];
  assert.ok(html.includes('<p class="si-price">$135,000'));
  assert.ok(!html.includes("$125,000"));
});
test("Earth imagery and cloud assets are embedded, credited and available offline", () => {
  const files = siteFiles(space.spaceSite());
  assert.ok(files["ASSET-LICENSES.txt"].includes("NASA"));
  assert.ok(files["ASSET-LICENSES.txt"].includes("cloud_combined_2048.jpg"));
  assert.ok(
    files["assets/orbital-poster.jpg"].startsWith("data:image/jpeg;base64,"),
  );
  const html = files["index.html"];
  assert.equal(
    [
      ...html.matchAll(
        /data-(?:earth|cloud)-texture src="data:image\/jpeg;base64,/g,
      ),
    ].length,
    2,
  );
  assert.ok(!html.includes('<img src="https://'));
  assert.ok(html.includes("NASA / GSFC"));
});
console.log(`${passed} space tests passed`);
