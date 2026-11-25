/**
 * 扫描正文 CDN 图，回填 src/data/image-meta.json（尺寸 + LQIP）。
 * 用法：pnpm images:meta
 */
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import {
  CDN_URL_PREFIX,
  ROOT,
  isAllowedCdnUrl,
} from './lib/image-cdn.mjs';
import {
  buildImageAssets,
  hashFromCdnUrl,
  loadImageMeta,
  upsertImageMeta,
} from '../src/lib/image-meta.mjs';

const CONTENT_ROOTS = [path.join(ROOT, 'src/content')];
const MD_IMAGE = /!\[[^\]]*]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
const HTML_IMAGE = /<img\b[^>]*\bsrc=["']([^"']+)["']/gi;

async function listMarkdown(dir) {
  const out = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch (err) {
    if (err?.code === 'ENOENT') return out;
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

function collectUrls(text) {
  const body = text.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]+`/g, '');
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

  const urls = new Set();
  for (const file of files) {
    const text = await readFile(file, 'utf8');
    for (const url of collectUrls(text)) {
      if (isAllowedCdnUrl(url)) urls.add(url);
    }
  }

  const meta = await loadImageMeta();
  let added = 0;
  let skipped = 0;
  let failed = 0;

  console.log(`扫描到 ${urls.size} 张图床图片（前缀 ${CDN_URL_PREFIX}）`);

  for (const url of urls) {
    const hash = hashFromCdnUrl(url);
    if (!hash) {
      console.error(`跳过（无法解析 hash）: ${url}`);
      failed += 1;
      continue;
    }
    const prev = meta[hash];
    if (prev?.w && prev?.h && prev?.lqip && prev?.color) {
      skipped += 1;
      continue;
    }

    try {
      const res = await fetch(url, {
        headers: { accept: 'image/*,*/*;q=0.8' },
        signal: AbortSignal.timeout(30_000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      const assets = await buildImageAssets(buf);
      await upsertImageMeta(hash, {
        w: assets.w,
        h: assets.h,
        color: assets.color,
        lqip: assets.lqip,
      });
      added += 1;
      console.log(`+ ${hash} ${assets.w}×${assets.h} ${assets.color}`);
    } catch (err) {
      failed += 1;
      console.error(`× ${hash || url}: ${err?.message || err}`);
    }
  }

  console.log(`完成：新增/更新 ${added}，已齐全跳过 ${skipped}，失败 ${failed}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
