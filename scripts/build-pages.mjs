import { spawnSync } from "node:child_process";
import { copyFile, mkdir } from "node:fs/promises";

const result = spawnSync("npm", ["run", "build"], {
  stdio: "inherit",
  env: { ...process.env, GITHUB_ACTIONS: "true" },
});
if (result.status !== 0) process.exit(result.status ?? 1);

await copyFile("dist/index.html", "dist/404.html");

// GitHub Pages serves a route reliably when it has its own index document.
// Keep the SPA fallback for unknown paths, while making every product route
// directly addressable with a normal 200 response.
const routes = [
  "product",
  "pricing",
  "workspace",
  "projects",
  "inspiration",
  "inspiration/byotone",
  "inspiration/super-intelligence",
  "about",
  "sponsorship",
  "login",
  "auth/callback",
];
for (const route of routes) {
  const directory = `dist/${route}`;
  await mkdir(directory, { recursive: true });
  await copyFile("dist/index.html", `${directory}/index.html`);
}
