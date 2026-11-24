/**
 * 构建前：把 src/imgs 无损转 WebP，上传到 GitHub 图床，写 image-map.json。
 *
 * 环境变量：GITHUB_TOKEN / IMAGE_REPO / IMAGE_CDN_HOST
 * Cloudflare Pages：Settings → Environment variables → Secret GITHUB_TOKEN
 *
 * 本地：export GITHUB_TOKEN=... 或写入 .env，然后 pnpm sync:images
 */

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import {
  SRC_DIR,
  MAP_PATH,
  ROOT,
  loadMap,
  saveMap,
  ensureUploaded,
  contentHash,
  pathExists,
} from "./lib/image-cdn.mjs";

const EXTS = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"]);

async function listImages(dir) {
  const out = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch (err) {
    if (err?.code === "ENOENT") return out;
    throw err;
  }
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      out.push(...(await listImages(full)));
      continue;
    }
    if (ent.isFile() && EXTS.has(path.extname(ent.name).toLowerCase())) {
      out.push(full);
    }
  }
  return out;
}

async function main() {
  const map = await loadMap();
  const files = await listImages(SRC_DIR);
  const needUpload = [];
  let dirty = false;

  for (const file of files) {
    const rel = path.relative(SRC_DIR, file).split(path.sep).join("/");
    const logical = `/imgs/${rel}`;
    const buf = await readFile(file);
    const hash = contentHash(buf);
    const existing = map[logical];

    if (existing?.hash === hash && existing?.cdn && existing?.commit) {
      continue;
    }

    try {
      const entry = await ensureUploaded({
        buf,
        logical,
        log: (msg) => console.log(`${logical}: ${msg}`),
      });
      map[logical] = {
        hash: entry.hash,
        path: entry.path,
        commit: entry.commit,
        cdn: entry.cdn,
      };
      dirty = true;
    } catch (err) {
      if (String(err.message || err).includes("GITHUB_TOKEN")) {
        needUpload.push(logical);
        continue;
      }
      throw err;
    }
  }

  if (needUpload.length) {
    console.error(
      "以下图片尚未上传到图床，请设置 GITHUB_TOKEN 后重试：\n" +
        needUpload.map((p) => `  - ${p}`).join("\n"),
    );
    process.exit(1);
  }

  for (const file of files) {
    const rel = path.relative(SRC_DIR, file).split(path.sep).join("/");
    const logical = `/imgs/${rel}`;
    const entry = map[logical];
    if (!entry?.cdn || !entry?.commit || !entry?.hash) {
      console.error(`映射不完整: ${logical}`);
      process.exit(1);
    }
  }

  if (dirty || !(await pathExists(MAP_PATH))) {
    await saveMap(map);
    console.log(`已写入 ${path.relative(ROOT, MAP_PATH)}`);
  } else {
    console.log("image-map 已是最新");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
