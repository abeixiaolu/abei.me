/**
 * Film 专辑：从 Markdown 正文抽取图片元数据（供首页画廊 / 封面）。
 * 专辑详情页直接渲染完整 Markdown，图文顺序与源文一致。
 * 可选 title：胶片模拟名，如 `![alt](url "Classic Chrome")`
 */
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import { lookupImageMeta } from './image-meta.mjs';

/**
 * @param {unknown} node
 * @param {(node: any, index: number | null, parent: any | null) => void | number} fn
 * @param {any | null} [parent]
 * @param {number | null} [index]
 */
function walk(node, fn, parent = null, index = null) {
  if (!node || typeof node !== 'object') return;
  const next = fn(node, index, parent);
  if (typeof next === 'number') return next;
  const children = /** @type {{ children?: unknown[] }} */ (node).children;
  if (!Array.isArray(children)) return;
  for (let i = 0; i < children.length; ) {
    const stepped = walk(children[i], fn, node, i);
    i = typeof stepped === 'number' ? stepped : i + 1;
  }
}

/**
 * @param {string} markdown
 * @returns {Promise<Array<{ src: string, alt: string, film?: string, w?: number, h?: number, color?: string, lqip?: string }>>}
 */
export async function extractFilmPhotos(markdown) {
  const tree = unified().use(remarkParse).use(remarkGfm).parse(markdown);

  /** @type {Array<{ src: string, alt: string, title?: string }>} */
  const raw = [];
  walk(tree, (node) => {
    if (node.type !== 'image' || !node.url) return;
    raw.push({
      src: node.url,
      alt: typeof node.alt === 'string' ? node.alt : '',
      title: typeof node.title === 'string' ? node.title : undefined,
    });
  });

  const photos = [];
  for (const item of raw) {
    const film = item.title?.trim() || undefined;
    const dims = await lookupImageMeta(item.src);
    photos.push({
      src: item.src,
      alt: item.alt,
      ...(film ? { film } : {}),
      ...(dims?.w && dims?.h ? { w: dims.w, h: dims.h } : {}),
      ...(dims?.color ? { color: dims.color } : {}),
      ...(dims?.lqip ? { lqip: dims.lqip } : {}),
    });
  }
  return photos;
}
