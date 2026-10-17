import { spawnSync } from "node:child_process";
import { copyFile } from "node:fs/promises";

const result = spawnSync("npm", ["run", "build"], {
  stdio: "inherit",
  env: { ...process.env, GITHUB_ACTIONS: "true" },
});
if (result.status !== 0) process.exit(result.status ?? 1);

await copyFile("dist/index.html", "dist/404.html");
