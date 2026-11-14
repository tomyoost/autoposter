import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import fs from "fs";
import path from "path";

// Public path the site is served from. Default "/" (local dev, custom domain).
// For the GitHub Pages project site build with BASE_PATH=/autoposter/ (see npm run build:pages).
const normalizeBase = (value: string | undefined) => {
  const trimmed = (value ?? "").trim();
  if (!trimmed || trimmed === "/") return "/";
  return `/${trimmed.replace(/^\/+|\/+$/g, "")}/`;
};

// GitHub Pages has no SPA rewrites. Copy index.html so /privacy loads directly with HTTP 200,
// and to 404.html so any other path still boots the app (which then shows its own 404 page).
const staticRouteCopies = (routes: string[]): Plugin => {
  let outDir = "dist";
  return {
    name: "static-route-copies",
    apply: "build",
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir);
    },
    closeBundle() {
      const indexFile = path.join(outDir, "index.html");
      if (!fs.existsSync(indexFile)) return;
      for (const target of [...routes.map((route) => path.join(route, "index.html")), "404.html"]) {
        const dest = path.join(outDir, target);
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.copyFileSync(indexFile, dest);
      }
    },
  };
};

// https://vitejs.dev/config/
export default defineConfig(() => ({
  base: normalizeBase(process.env.BASE_PATH),
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), staticRouteCopies(["privacy"])],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
