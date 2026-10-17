import assert from "node:assert/strict";
import {
  demoSite,
  validateSite,
  siteFiles,
  applyDemoEdit,
} from "../src/core.ts";
const brief = {
  name: "木间",
  purpose: "设计家具品牌官网",
  audience: "热爱设计的家庭",
  content: "用天然木材制造长久陪伴的家具。",
  pages: [
    { title: "首页", slug: "index" },
    { title: "关于", slug: "about" },
    { title: "产品", slug: "product" },
  ],
  assets: [],
  referenceIds: [],
};
let passed = 0;
function test(name, fn) {
  fn();
  passed++;
  console.log("PASS", name);
}
test("export three linked pages and one shared stylesheet", () => {
  const site = demoSite(brief, "editorial");
  const files = siteFiles(site);
  assert.equal(site.pages.length, 3);
  for (const page of site.pages) {
    assert.ok(files[page.slug + ".html"]);
    for (const other of site.pages)
      assert.ok(
        files[page.slug + ".html"].includes('href="' + other.slug + '.html"'),
      );
    assert.ok(files[page.slug + ".html"].includes("styles.css"));
  }
  assert.ok(files["assets/still-life.svg"]);
});
test("export preserves every uploaded asset using safe generated paths", () => {
  const assets = [
    { name: "../a.webp", data: "data:image/webp;base64,YWJj" },
    { name: "b.png", data: "data:image/png;base64,ZGVm" },
  ];
  const files = siteFiles(demoSite({ ...brief, assets }, "editorial"));
  assert.equal(files["assets/upload.webp"], assets[0].data);
  assert.equal(files["assets/upload-2.png"], assets[1].data);
  assert.ok(files["index.html"].includes("assets/upload.webp"));
  assert.ok(Object.keys(files).every((path) => !path.includes("..")));
});
test("reject traversal, duplicate paths, empty pages and malicious assets", () => {
  const s = demoSite(brief, "studio");
  for (const slug of [
    "../secret",
    "a/b",
    "javascript:1",
    "styles",
    "index.html",
  ]) {
    assert.throws(() =>
      validateSite({ ...s, pages: [{ ...s.pages[0], slug }] }),
    );
  }
  assert.throws(() => validateSite({ ...s, pages: [s.pages[0], s.pages[0]] }));
  assert.throws(() => validateSite({ ...s, pages: [] }));
  assert.throws(() =>
    validateSite({
      ...s,
      assets: [{ name: "bad.svg", data: "data:image/svg+xml;base64,xxx" }],
    }),
  );
});
test("user content cannot inject markup, CSS or script", () => {
  const s = demoSite(
    {
      ...brief,
      name: "<script>alert(1)</script>",
      content: "<img src=x onerror=alert(1)>",
    },
    "precision",
  );
  const html = siteFiles(s)["index.html"];
  assert.ok(!html.includes("<script>"));
  assert.ok(html.includes("&lt;script&gt;"));
  assert.throws(() => validateSite({ ...s, accent: "red; background:url(x)" }));
});
test("page edits are scoped and global edits preserve common tokens", () => {
  const s = demoSite(brief, "editorial");
  const r = applyDemoEdit(s, s.pages[0].id, "page", "标题：新的首页");
  assert.equal(r.site.pages[0].headline, "新的首页");
  assert.equal(r.site.pages[1].headline, s.pages[1].headline);
  const global = applyDemoEdit(r.site, s.pages[0].id, "global", "改成蓝色");
  assert.equal(global.site.accent, "#345b76");
  assert.deepEqual(global.site.pages, r.site.pages);
  const unknown = applyDemoEdit(s, s.pages[0].id, "page", "帮我连接支付");
  assert.equal(unknown.changed, false);
});

const { packProjects, unpackProjects } = await import("../src/core.ts");
test("image storage deduplicates undo snapshots and projects without losing assets", () => {
  const asset = { name: "x.webp", data: "data:image/webp;base64,YWJj" };
  const site = demoSite({ ...brief, assets: [asset] }, "editorial");
  const project = {
    id: "1",
    name: "x",
    brief: { ...brief, assets: [asset] },
    site,
    initial: site,
    history: [site, site],
    referenceIds: [],
    messages: [],
    updated: "2026-10-15",
  };
  const packed = packProjects([project, { ...project, id: "2" }]);
  assert.equal(packed.split(asset.data).length - 1, 1);
  assert.deepEqual(unpackProjects(packed), [project, { ...project, id: "2" }]);
  assert.throws(() => unpackProjects('{"version":3}'));
});

console.log(`${passed} tests passed`);
