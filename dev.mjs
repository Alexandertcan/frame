import { spawn } from "node:child_process";
const api = spawn(process.execPath, ["--watch", "server/index.mjs"], {
  stdio: "inherit",
});
const web = spawn(
  process.execPath,
  [
    "node_modules/vite/bin/vite.js",
    ...(process.argv.includes("--production") ? ["preview"] : []),
    "--host",
    "127.0.0.1",
  ],
  { stdio: "inherit" },
);
for (const sig of ["SIGINT", "SIGTERM"])
  process.on(sig, () => {
    api.kill();
    web.kill();
    process.exit();
  });
