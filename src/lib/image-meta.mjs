/**
 * 图床图片本地元数据：尺寸 + 主色 + LQIP（上传时写入，构建时零网络查表）。
 * 对齐常见实现（含 Twitter 主色占位 + LQIP blur-up）。
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const IMAGE_META_PATH = path.join(ROOT, 'data/image-meta.json');

/** CDN 路径 …/w/ab/abcdefghijklmnop.webp → hash */
const HASH_IN_URL = /\/w\/[0-9a-f]{2}\/([0-9a-f]{16})\.webp(?:[?#]|$)/i;

/**
 * @typedef {{ w: number, h: number, color?: string, lqip?: string }} ImageMetaEntry
 */

/** @type {Record<string, ImageMetaEntry> | null} */
let cache = null;

export function hashFromCdnUrl(url) {
  if (typeof url !== 'string') return null;
  const m = url.match(HASH_IN_URL);
  return m?.[1]?.toLowerCase() ?? null;
}

/** 强制从磁盘重读（dev 下 backfill / 外部写入后避免内存脏缓存） */
export function clearImageMetaCache() {
  cache = null;
}

export async function loadImageMeta({ fresh = false } = {}) {
  if (fresh) cache = null;
  if (cache) return cache;
  try {
    const text = await fs.readFile(IMAGE_META_PATH, 'utf8');
    cache = JSON.parse(text);
  } catch {
    cache = {};
  }
  return cache;
}

export async function lookupImageMeta(url) {
  const hash = hashFromCdnUrl(url);
  if (!hash) return null;
  const all = await loadImageMeta();
  return all[hash] ?? null;
}

function toHex([r, g, b]) {
  return `#${[r, g, b].map((n) => n.toString(16).padStart(2, '0')).join('')}`;
}

/**
 * @param {Buffer} buf
 * @returns {Promise<{ w: number, h: number, color: string, lqip: string, webp: Buffer }>}
 */
export async function buildImageAssets(buf) {
  const meta = await sharp(buf, { failOn: 'none' }).metadata();
  if (!meta.width || !meta.height) {
    throw new Error('无法读取图片尺寸');
  }

  const [webp, lqipBuf, thumb] = await Promise.all([
    sharp(buf, { failOn: 'none' }).webp({ lossless: true }).toBuffer(),
    sharp(buf, { failOn: 'none' })
      .resize({ width: 32, withoutEnlargement: true })
      .webp({ quality: 20, effort: 4 })
      .toBuffer(),
    sharp(buf, { failOn: 'none' })
      .resize(1, 1, { fit: 'cover' })
      .raw()
      .toBuffer({ resolveWithObject: true }),
  ]);

  const color = toHex([thumb.data[0], thumb.data[1], thumb.data[2]]);

  return {
    w: meta.width,
    h: meta.height,
    color,
    lqip: `data:image/webp;base64,${lqipBuf.toString('base64')}`,
    webp,
  };
}

/**
 * @param {string} hash
 * @param {ImageMetaEntry} entry
 */
export async function upsertImageMeta(hash, entry) {
  const all = await loadImageMeta();
  const key = hash.toLowerCase();
  const next = {
    w: entry.w,
    h: entry.h,
    ...(entry.color ? { color: entry.color } : {}),
    ...(entry.lqip ? { lqip: entry.lqip } : {}),
  };
  const prev = all[key];
  if (
    prev &&
    prev.w === next.w &&
    prev.h === next.h &&
    prev.color === next.color &&
    prev.lqip === next.lqip
  ) {
    return { changed: false, entry: prev };
  }
  all[key] = next;
  const sorted = Object.fromEntries(
    Object.entries(all).sort(([a], [b]) => a.localeCompare(b)),
  );
  cache = sorted;
  await fs.mkdir(path.dirname(IMAGE_META_PATH), { recursive: true });
  await fs.writeFile(IMAGE_META_PATH, `${JSON.stringify(sorted, null, 2)}\n`, 'utf8');
  return { changed: true, entry: sorted[key] };
}
