/**
 * Typora 自定义上传：无损 WebP → 图床 → stdout 返回 CDN URL。
 * 同时写入 src/data/image-meta.json（尺寸 + LQIP）。
 * 日志走 stderr。
 */

import { readFile } from "node:fs/promises";
import { ensureUploaded } from "./lib/image-cdn.mjs";

function log(...args) {
  console.error(...args);
}

async function uploadOne(filePath) {
  const buf = await readFile(filePath);
  const entry = await ensureUploaded({
    buf,
    log: (msg) => log(`${filePath}: ${msg}`),
  });
  return entry.cdn;
}

async function main() {
  const paths = process.argv.slice(2);
  if (!paths.length) {
    log("用法: node scripts/typora-upload.mjs <image> [image...]");
    process.exit(1);
  }

  const urls = [];
  for (const p of paths) {
    urls.push(await uploadOne(p));
  }

  console.log("Upload Success:");
  for (const url of urls) console.log(url);
}

main().catch((err) => {
  log(err?.stack || err);
  process.exit(1);
});
