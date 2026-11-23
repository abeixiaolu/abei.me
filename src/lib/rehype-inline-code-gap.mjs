/**
 * 行内 code：仅在与相邻正文之间「没有空白 / 不该断开的标点」时标记 data-gap。
 * 源码已有空格，或后面紧跟 。： 等收尾标点时不加。
 */

/** 左侧开标点：紧贴 code 前时不补空隙 */
const OPEN_PUNCT = /[《「『【（〈([{“‘]$/u;
/** 右侧收标点：紧贴 code 后时不补空隙 */
const CLOSE_PUNCT = /^[。，、；：？！…—》」』】）〉\]\)\},.!?;:”’]/u;

export function rehypeInlineCodeGap() {
  return (tree) => walk(tree);
}

function walk(node) {
  const children = node?.children;
  if (!Array.isArray(children)) return;

  if (node.type === "element" && node.tagName !== "pre") {
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (child?.type !== "element" || child.tagName !== "code") continue;

      const gaps = [];
      if (needsGap(children[i - 1], "before")) gaps.push("before");
      if (needsGap(children[i + 1], "after")) gaps.push("after");

      if (gaps.length) {
        child.properties ??= {};
        child.properties.dataGap = gaps.join(" ");
      }
    }
  }

  for (const child of children) walk(child);
}

function needsGap(sibling, side) {
  if (sibling == null) return false;
  if (sibling.type === "text") {
    const value = sibling.value ?? "";
    if (side === "before") {
      if (/\s$/u.test(value) || OPEN_PUNCT.test(value)) return false;
      return true;
    }
    if (/^\s/u.test(value) || CLOSE_PUNCT.test(value)) return false;
    return true;
  }
  // 相邻是元素（如 em / a）时补空隙
  return true;
}
