import http from "node:http";
import { createAuth } from "./auth.mjs";
const auth = createAuth();
import { randomUUID } from "node:crypto";
import { demoSite, validateSite, siteFiles } from "../src/core.ts";
import { isSpaceSite } from "../src/space-demo.ts";
import { spaceSceneHash } from "../src/space-scene.ts";
const apiPort = 4175,
  previewPort = 4174;
const previews = new Map();
const mime = {
  html: "text/html; charset=utf-8",
  css: "text/css; charset=utf-8",
  svg: "image/svg+xml",
  png: "image/png",
  jpeg: "image/jpeg",
  webp: "image/webp",
};
const json = (res, status, value, headers = {}) => {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
    ...headers,
  });
  res.end(JSON.stringify(value));
};
async function body(req) {
  let raw = "";
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 24000000) throw Error("请求超过大小限制");
  }
  return JSON.parse(raw || "{}");
}
http
  .createServer(async (req, res) => {
    try {
      if (req.method === "GET" && req.url === "/api/status")
        return json(res, 200, {
          liveAvailable: !!process.env.OPENAI_API_KEY,
          mode: process.env.OPENAI_API_KEY ? "connected" : "demo",
        });
      if (req.url.startsWith("/api/auth/")) {
        const origin = req.headers.origin;
        if (
          req.method === "POST" &&
          origin &&
          ![
            "http://127.0.0.1:4173",
            "http://localhost:4173",
            process.env.APP_ORIGIN,
          ]
            .filter(Boolean)
            .includes(origin)
        )
          return json(res, 403, { error: "来源不允许" });
        const result = await auth.handle({
          method: req.method,
          url: req.url,
          headers: req.headers,
          body: req.method === "POST" ? await body(req) : {},
        });
        return json(res, result.status, result.data, result.headers);
      }
      if (req.method !== "POST") return json(res, 404, { error: "接口不存在" });
      const origin = req.headers.origin;
      if (
        origin &&
        !["http://127.0.0.1:4173", "http://localhost:4173"].includes(origin)
      )
        return json(res, 403, { error: "来源不允许" });
      const b = await body(req);
      if (req.url === "/api/preview") {
        const files = siteFiles(b.site);
        const id = randomUUID();
        previews.set(id, {
          files,
          space: isSpaceSite(b.site),
          time: Date.now(),
        });
        while (previews.size > 40)
          previews.delete(previews.keys().next().value);
        return json(res, 200, {
          url: `http://127.0.0.1:${previewPort}/${id}/`,
        });
      }
      if (req.url === "/api/generate") {
        if (!b.brief || !Array.isArray(b.brief.pages))
          throw Error("创建内容无效");
        if (b.mode !== "live") {
          return json(res, 200, {
            mode: "demo",
            site: validateSite(demoSite(b.brief, b.direction)),
          });
        }
        if (!process.env.OPENAI_API_KEY)
          return json(res, 503, {
            error:
              "API 未配置。请使用本地预置布局，或按 README 配置服务端 API Key 后重启服务。",
          });
        const preset = demoSite(b.brief, b.direction);
        const response = await fetch(
          "https://api.openai.com/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
              model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
              response_format: { type: "json_object" },
              messages: [
                {
                  role: "system",
                  content:
                    "Generate a static website content JSON. Return exactly the supplied Site schema and preserve page ids, slugs, direction, accent and assets. Never add scripts, backend, links, claims or invented customers. Improve headlines/descriptions/sections based on user brief. Chinese language unless user asks otherwise. Output only JSON.",
                },
                {
                  role: "user",
                  content: JSON.stringify({
                    brief: { ...b.brief, assets: [] },
                    schema: { ...preset, assets: [] },
                  }),
                },
              ],
              temperature: 0.6,
              max_completion_tokens: 6000,
            }),
            signal: AbortSignal.timeout(60000),
          },
        );
        if (!response.ok)
          throw Error(
            `模型请求失败（HTTP ${response.status}），请检查服务端配置。`,
          );
        const payload = await response.json();
        const site = JSON.parse(
          payload.choices?.[0]?.message?.content || "null",
        );
        site.assets = b.brief.assets;
        validateSite(site);
        if (
          site.pages.length !== preset.pages.length ||
          site.pages.some(
            (p, i) =>
              p.slug !== preset.pages[i].slug || p.id !== preset.pages[i].id,
          ) ||
          site.direction !== preset.direction
        )
          throw Error("模型返回的页面结构与请求不一致");
        return json(res, 200, { mode: "live", site });
      }
      return json(res, 404, { error: "接口不存在" });
    } catch (e) {
      console.error(e.message);
      json(res, 400, {
        error: e.message?.includes("API")
          ? e.message
          : e.message || "请求失败，请重试",
      });
    }
  })
  .listen(apiPort, "127.0.0.1", () =>
    console.log(
      `FRAME API http://127.0.0.1:${apiPort} · ${process.env.OPENAI_API_KEY ? "model configured" : "DEMO MODE"}`,
    ),
  );
http
  .createServer((req, res) => {
    const [, id, file = "index.html"] = req.url.split("/");
    const item = previews.get(id);
    if (!item || Date.now() - item.time > 3600000) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      return res.end("预览已过期，请返回 FRAME 刷新预览。");
    }
    let path = req.url.split("/").slice(2).join("/") || "index.html";
    path = path.split("?")[0].split("#")[0];
    const value = item.files[path];
    if (!value) {
      res.writeHead(404);
      return res.end("Page not found");
    }
    let content = value;
    if (value.startsWith("data:image/"))
      content = Buffer.from(value.split(",")[1], "base64");
    res.writeHead(200, {
      "Content-Type": mime[path.split(".").pop()] || "text/plain",
      "Content-Security-Policy": `default-src 'none'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; script-src ${item.space ? "'sha256-" + spaceSceneHash + "'" : "'none'"}; connect-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors http://127.0.0.1:4173 http://localhost:4173`,
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    });
    res.end(content);
  })
  .listen(previewPort, "127.0.0.1", () =>
    console.log(`FRAME isolated preview http://127.0.0.1:${previewPort}`),
  );
