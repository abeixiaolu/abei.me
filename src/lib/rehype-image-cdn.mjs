/**
 * 生产构建（IMAGE_CDN_STRICT=1）时，把 /imgs/ 换成 image-map.json 的 CDN。
 * 开发态不改写，配合 vite-imgs-dev 直接读 src/imgs，预览更快。
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const MAP_PATH = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../data/image-map.json",
);

function loadMap() {
  try {
    return JSON.parse(readFileSync(MAP_PATH, "utf8"));
  } catch (err) {
    if (err?.code === "ENOENT") return {};
    throw err;
  }
}

export function rehypeImageCdn() {
  const strict = process.env.IMAGE_CDN_STRICT === "1";
  if (!strict) {
    return () => {};
  }

  const map = loadMap();

  return (tree) => {
    walk(tree, (node) => {
      if (node.type !== "element" || node.tagName !== "img") return;
      const src = node.properties?.src;
      if (typeof src !== "string" || !src.startsWith("/imgs/")) return;

      const entry = map[src];
      if (entry?.cdn) {
        node.properties.src = entry.cdn;
        return;
      }

      throw new Error(
        `图片未同步到图床: ${src}（请先运行 pnpm sync:images）`,
      );
    });
  };
}

function walk(node, visit) {
  visit(node);
  const children = node?.children;
  if (!Array.isArray(children)) return;
  for (const child of children) walk(child, visit);
}
