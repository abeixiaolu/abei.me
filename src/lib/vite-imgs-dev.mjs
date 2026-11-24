/**
 * astro/vite 开发态：把 /imgs/* 映射到 src/imgs，方便本地预览 Markdown 逻辑路径。
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SRC_IMGS = path.join(ROOT, "src/imgs");

const MIME = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
};

export function viteImgsDev() {
  return {
    name: "vite-imgs-dev",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split("?")[0] ?? "";
        if (!url.startsWith("/imgs/")) return next();

        const rel = decodeURIComponent(url.slice("/imgs/".length));
        if (!rel || rel.includes("..")) {
          res.statusCode = 400;
          res.end("bad path");
          return;
        }

        const file = path.join(SRC_IMGS, rel);
        if (!file.startsWith(SRC_IMGS) || !fs.existsSync(file)) {
          return next();
        }

        const ext = path.extname(file).toLowerCase();
        res.setHeader("Content-Type", MIME[ext] || "application/octet-stream");
        res.setHeader("Cache-Control", "no-store");
        fs.createReadStream(file).pipe(res);
      });
    },
  };
}
