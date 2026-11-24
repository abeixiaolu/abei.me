/**
 * GFM 任务列表会给 checkbox 加 disabled；本站允许页内勾选交互，去掉该属性。
 */
export function rehypeEnableTaskCheckboxes() {
  return (tree) => walk(tree);
}

function walk(node) {
  if (
    node?.type === "element" &&
    node.tagName === "input" &&
    node.properties?.type === "checkbox"
  ) {
    delete node.properties.disabled;
  }

  const children = node?.children;
  if (!Array.isArray(children)) return;
  for (const child of children) walk(child);
}
