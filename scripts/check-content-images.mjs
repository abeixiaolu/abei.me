/**
 * 检查 Markdown 正文图片是否均为图床 CDN 链接。
 * 允许：https://fastly.jsdelivr.net/gh/abeixiaolu/imgs@...
 * 供 pre-commit / pnpm check:images 使用。
 */

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { ROOT, CDN_URL_PREFIX, isAllowedCdnUrl } from "./lib/image-cdn.mjs";

const CONTENT_ROOTS = [
  path.join(ROOT, "src/content"),
];

const MD_IMAGE = /!\[[^\]]*]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
const HTML_IMAGE = /<img\b[^>]*\bsrc=["']([^"']+)["']/gi;

async function listMarkdown(dir) {
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
      out.push(...(await listMarkdown(full)));
      continue;
    }
    if (ent.isFile() && /\.mdx?$/i.test(ent.name)) out.push(full);
  }
  return out;
}

function stripCodeFences(text) {
  return text.replace(/```[\s\S]*?```/g, "").replace(/`[^`\n]+`/g, "");
}

function collectUrls(text) {
  const body = stripCodeFences(text);
  const urls = [];
  for (const re of [MD_IMAGE, HTML_IMAGE]) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(body))) urls.push(m[1]);
  }
  return urls;
}

async function main() {
  const files = (
    await Promise.all(CONTENT_ROOTS.map((d) => listMarkdown(d)))
  ).flat();

  const bad = [];
  for (const file of files) {
    const text = await readFile(file, "utf8");
    for (const url of collectUrls(text)) {
      if (isAllowedCdnUrl(url)) continue;
      bad.push({ file: path.relative(ROOT, file), url });
    }
  }

  if (!bad.length) {
    console.log(`图片链接检查通过（须以 ${CDN_URL_PREFIX} 开头）`);
    return;
  }

  console.error("发现非图床图片链接，请用 Typora 上传后再提交：\n");
  for (const { file, url } of bad) {
    console.error(`  ${file}`);
    console.error(`    ${url}\n`);
  }
  console.error(`允许前缀：${CDN_URL_PREFIX}`);
  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
