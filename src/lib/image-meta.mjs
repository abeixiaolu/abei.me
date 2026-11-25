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

/** 图床长边上限；原片（如 X100VI 40MP）超出则缩小，避免撑爆 GitHub Contents API */
const WEB_MAX_EDGE = 2560;
/** 像素太多时跳过无损候选（编码极慢且几乎必负于有损） */
const LOSSLESS_MAX_PIXELS = 2560 * 2560;

/**
 * 智能压缩：无损与高质有损都编码，取更小者。
 * 「画质无损」优先，但若无损体积更大（常见于 JPEG 源）则改用有损，避免越压越大。
 *
 * @param {Buffer} buf
 * @returns {Promise<{ w: number, h: number, color: string, lqip: string, webp: Buffer, encoding: 'lossless' | 'lossy' }>}
 */
export async function buildImageAssets(buf) {
  const meta = await sharp(buf, { failOn: 'none' }).rotate().metadata();
  if (!meta.width || !meta.height) {
    throw new Error('无法读取图片尺寸');
  }

  const longEdge = Math.max(meta.width, meta.height);
  const pipeline = sharp(buf, { failOn: 'none' }).rotate();
  if (longEdge > WEB_MAX_EDGE) {
    pipeline.resize({
      width: meta.width >= meta.height ? WEB_MAX_EDGE : undefined,
      height: meta.height > meta.width ? WEB_MAX_EDGE : undefined,
      withoutEnlargement: true,
    });
  }

  const outW = longEdge > WEB_MAX_EDGE
    ? meta.width >= meta.height
      ? WEB_MAX_EDGE
      : Math.round((meta.width / meta.height) * WEB_MAX_EDGE)
    : meta.width;
  const outH = longEdge > WEB_MAX_EDGE
    ? meta.height > meta.width
      ? WEB_MAX_EDGE
      : Math.round((meta.height / meta.width) * WEB_MAX_EDGE)
    : meta.height;
  const tryLossless = outW * outH <= LOSSLESS_MAX_PIXELS;

  const lossyPromise = pipeline
    .clone()
    .webp({ quality: 90, effort: 4 })
    .toBuffer({ resolveWithObject: true });

  const losslessPromise = tryLossless
    ? pipeline
        .clone()
        .webp({ lossless: true })
        .toBuffer({ resolveWithObject: true })
    : null;

  const [lossyOut, losslessOut, lqipBuf, thumb] = await Promise.all([
    lossyPromise,
    losslessPromise,
    pipeline
      .clone()
      .resize({ width: 32, withoutEnlargement: true })
      .webp({ quality: 20, effort: 4 })
      .toBuffer(),
    pipeline
      .clone()
      .resize(1, 1, { fit: 'cover' })
      .raw()
      .toBuffer({ resolveWithObject: true }),
  ]);

  /** @type {{ data: Buffer, info: { width?: number, height?: number }, encoding: 'lossless' | 'lossy' }} */
  let chosen = { ...lossyOut, encoding: 'lossy' };
  if (losslessOut && losslessOut.data.length <= lossyOut.data.length) {
    chosen = { ...losslessOut, encoding: 'lossless' };
  }

  const color = toHex([thumb.data[0], thumb.data[1], thumb.data[2]]);

  return {
    w: chosen.info.width || outW,
    h: chosen.info.height || outH,
    color,
    lqip: `data:image/webp;base64,${lqipBuf.toString('base64')}`,
    webp: chosen.data,
    encoding: chosen.encoding,
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
