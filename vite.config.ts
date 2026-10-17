import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_ACTIONS ? "/frame/" : "/",
  server: {
    port: 4173,
    host: "127.0.0.1",
    strictPort: true,
    allowedHosts: [".loca.lt"],
    proxy: { "/api": "http://127.0.0.1:4175" },
  },
  preview: {
    port: 4173,
    allowedHosts: [".loca.lt"],
    proxy: { "/api": "http://127.0.0.1:4175" },
  },
});
