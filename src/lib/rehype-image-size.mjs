/**
 * Markdown 图片：固定宽高比容器 + 主色/LQIP 垫底 + 高清图淡入。
 * 结构对齐常见防 CLS 写法（容器 aspect-ratio，img 绝对定位，不参与文档流高度）。
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  hashFromCdnUrl,
  loadImageMeta,
  upsertImageMeta,
} from './image-meta.mjs';

const FALLBACK_CACHE = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../.cache/image-dims.json',
);

/** @type {Map<string, { width: number; height: number } | null>} */
const probeMemory = new Map();

/**
 * @param {Buffer} buf
 * @returns {{ width: number; height: number } | null}
 */
function dimsFromHeader(buf) {
  if (buf.length < 24) return null;

  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  }

  const gif = buf.toString('ascii', 0, 6);
  if (gif === 'GIF87a' || gif === 'GIF89a') {
    return { width: buf.readUInt16LE(6), height: buf.readUInt16LE(8) };
  }

  if (
    buf.toString('ascii', 0, 4) === 'RIFF' &&
    buf.toString('ascii', 8, 12) === 'WEBP'
  ) {
    let i = 12;
    while (i + 8 <= buf.length) {
      const tag = buf.toString('ascii', i, i + 4);
      const size = buf.readUInt32LE(i + 4);
      const data = i + 8;
      if (tag === 'VP8X' && data + 10 <= buf.length) {
        return {
          width: 1 + buf.readUIntLE(data + 4, 3),
          height: 1 + buf.readUIntLE(data + 7, 3),
        };
      }
      if (tag === 'VP8 ' && data + 10 <= buf.length) {
        return {
          width: buf.readUInt16LE(data + 6) & 0x3fff,
          height: buf.readUInt16LE(data + 8) & 0x3fff,
        };
      }
      if (tag === 'VP8L' && data + 5 <= buf.length) {
        const b0 = buf[data + 1];
        const b1 = buf[data + 2];
        const b2 = buf[data + 3];
        const b3 = buf[data + 4];
        return {
          width: 1 + (((b1 & 0x3f) << 8) | b0),
          height: 1 + (((b3 & 0xf) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6)),
        };
      }
      i = data + size + (size & 1);
    }
    return null;
  }

  if (buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2;
    while (i + 9 < buf.length) {
      if (buf[i] !== 0xff) break;
      const marker = buf[i + 1];
      if (marker === 0xd9 || marker === 0xda) break;
      const len = buf.readUInt16BE(i + 2);
      if (
        (marker >= 0xc0 && marker <= 0xc3) ||
        (marker >= 0xc5 && marker <= 0xc7) ||
        (marker >= 0xc9 && marker <= 0xcb) ||
        (marker >= 0xcd && marker <= 0xcf)
      ) {
        return {
          height: buf.readUInt16BE(i + 5),
          width: buf.readUInt16BE(i + 7),
        };
      }
      i += 2 + len;
    }
  }

  return null;
}

/** @param {string} src */
async function probeHeader(src) {
  if (probeMemory.has(src)) return probeMemory.get(src) ?? null;
  try {
    const res = await fetch(src, {
      headers: { accept: 'image/*,*/*;q=0.8', range: 'bytes=0-16383' },
      signal: AbortSignal.timeout(8_000),
    });
    if (!(res.ok || res.status === 206)) {
      probeMemory.set(src, null);
      return null;
    }
    const size = dimsFromHeader(Buffer.from(await res.arrayBuffer()));
    probeMemory.set(src, size);
    return size;
  } catch {
    probeMemory.set(src, null);
    return null;
  }
}

/**
 * @param {import('hast').Parent} parent
 * @param {import('hast').Element[]} imgs
 */
function collect(parent, imgs) {
  const children = parent.children;
  if (!Array.isArray(children)) return;
  for (const child of children) {
    if (!child || typeof child !== 'object') continue;
    if (child.type === 'element' && child.tagName === 'img') {
      imgs.push(/** @type {import('hast').Element} */ (child));
    }
    if ('children' in child) collect(/** @type {import('hast').Parent} */ (child), imgs);
  }
}

/**
 * @param {import('hast').Parent} parent
 * @param {Map<import('hast').Element, { w?: number, h?: number, color?: string, lqip?: string }>} metaByImg
 */
function wrapImages(parent, metaByImg) {
  const children = parent.children;
  if (!Array.isArray(children)) return;

  const parentEl =
    parent.type === 'element' ? /** @type {import('hast').Element} */ (parent) : null;
  const parentIsFrame =
    parentEl?.tagName === 'span' &&
    Array.isArray(parentEl.properties?.className) &&
    parentEl.properties.className.includes('hw-img-frame');

  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (!child || typeof child !== 'object') continue;

    if (child.type === 'element' && child.tagName === 'img') {
      if (parentIsFrame) continue;
      const info = metaByImg.get(/** @type {import('hast').Element} */ (child));
      const sized = Boolean(info?.w && info?.h);
      /** @type {Record<string, unknown>} */
      const properties = {
        className: sized ? ['hw-img-frame', 'hw-img-frame--sized'] : ['hw-img-frame'],
      };
      const styles = [];
      if (sized) {
        styles.push(`aspect-ratio:${info.w}/${info.h}`);
      }
      if (info?.color) {
        styles.push(`--ph-color:${info.color}`);
      }
      if (info?.lqip) {
        properties.dataLqip = '';
        // 不加引号：hast 序列化时引号会被写成 &quot;，破坏 url()
        styles.push(`--lqip:url(${info.lqip})`);
      }
      if (styles.length) properties.style = styles.join(';');

      children[i] = {
        type: 'element',
        tagName: 'span',
        properties,
        children: [child],
      };
      continue;
    }

    if ('children' in child) {
      wrapImages(/** @type {import('hast').Parent} */ (child), metaByImg);
    }
  }
}

export function rehypeImageSize() {
  return async (tree) => {
    // 每次编译都读最新 meta，避免 dev 进程里内存缓存落后于 backfill
    const allMeta = await loadImageMeta({ fresh: true });

    /** @type {import('hast').Element[]} */
    const imgs = [];
    collect(tree, imgs);
    /** @type {Map<import('hast').Element, { w?: number, h?: number, color?: string, lqip?: string }>} */
    const metaByImg = new Map();

    await Promise.all(
      imgs.map(async (img) => {
        img.properties ??= {};
        const props = img.properties;
        const src = typeof props.src === 'string' ? props.src : '';

        if (props.loading == null) props.loading = 'lazy';
        if (props.decoding == null) props.decoding = 'async';

        const hash = hashFromCdnUrl(src);
        const local = hash ? allMeta[hash] : null;

        let w = local?.w;
        let h = local?.h;
        const color = local?.color;
        const lqip = local?.lqip;

        if (w == null || h == null) {
          const probed = await probeHeader(src);
          if (probed) {
            w = probed.width;
            h = probed.height;
            if (hash) {
              await upsertImageMeta(hash, {
                w,
                h,
                ...(color ? { color } : {}),
                ...(lqip ? { lqip } : {}),
              });
            } else {
              try {
                const disk = JSON.parse(
                  await fs.readFile(FALLBACK_CACHE, 'utf8').catch(() => '{}'),
                );
                disk[src] = { width: w, height: h };
                await fs.mkdir(path.dirname(FALLBACK_CACHE), { recursive: true });
                await fs.writeFile(
                  FALLBACK_CACHE,
                  `${JSON.stringify(disk, null, 2)}\n`,
                  'utf8',
                );
              } catch {
                /* ignore */
              }
            }
          }
        }

        // 始终写入，保证首帧就有 intrinsic 比例提示
        if (w != null) props.width = w;
        if (h != null) props.height = h;

        metaByImg.set(img, {
          ...(w != null ? { w } : {}),
          ...(h != null ? { h } : {}),
          ...(color ? { color } : {}),
          ...(lqip ? { lqip } : {}),
        });
      }),
    );

    wrapImages(tree, metaByImg);
  };
}
