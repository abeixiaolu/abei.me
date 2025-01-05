---
title: VitePress 自动生成侧边栏
description: vitepress | auto generate sidebar | 自动生成侧边栏
date: 2025-01-03
---

在开发 [Gupo-Admin](https://demo.group-ds.com/dev-business-kits-docs/components/) 的组件侧边栏的时候，有一个简化组件库开发过程的需求，就是希望可以自动生成组件区块下的侧边栏，并读取组件文档的 `frontmatter` 中的信息，提供给 `Sidebar` 组件使用。

## 大致思路

1. 所有组件相关的文件都存放在 `components` 目录下，所以可以直接使用 [fast-glob](https://github.com/mrmlnc/fast-glob) 库读取 `components` 目录下的所有文件路径。

> [!TIP]
> 也可以使用 `NodeJS v22.12.0` 最新的实用性功能： [fs.globSync](https://nodejs.org/docs/v22.12.0/api/fs.html#fsglobsyncpattern-options)。

2. 读取到路径后，需要读取文件中的 `frontmatter` 信息，并提取出目标信息。

3. 组装信息，并提供给 `.vitepress/config.ts` 文件使用。

## 实现过程

提取 `frontmatter` 信息为对象：

```ts
export function extractFrontmatter(
  content: string,
): Record<string, any> | null {
  const frontmatterMatch = content.match(/---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) {
    return null;
  }

  const frontmatterString = frontmatterMatch[1];
  const frontmatterLines = frontmatterString
    .split("\n")
    .filter((line) => line.trim() !== "");
  const frontmatter: Record<string, any> = {};

  frontmatterLines.forEach((line) => {
    const [key, value] = line.split(":").map((part) => part.trim());
    if (key && value) {
      frontmatter[key] = value;
    }
  });

  return frontmatter;
}
```

输出侧边栏配置信息：

```ts
import fg from "fast-glob";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export function getComponentList() {
  const components: string[] = fg
    .sync(resolve(__dirname, "../../components/**/*.md"))
    .filter((path) => path !== resolve(__dirname, "../../components/index.md"));
  return components.map((comp) => {
    const fileContent = readFileSync(comp, "utf-8");
    const frontmatter = extractFrontmatter(fileContent);
    const name = comp.split("/").pop()!.split(".")[0];
    return {
      text: frontmatter?.nameCN,
      desc: frontmatter?.name,
      group: frontmatter?.group,
      link: name,
    };
  });
}
```

在 `.vitepress/config.ts` 文件中使用后，就可以在 `Sidebar` 组件中使用这些信息了，此处采用了 [Naive UI](https://www.naiveui.com/zh-CN/os-theme/components/menu) 的 `Menu` 组件，所以格式化为目标数据格式。

```ts
const { sidebarGroups, hasSidebar } = useSidebar();

const options = computed(() => {
  const groupedOptions: any = {};

  sidebarGroups.value[0].items?.forEach((item: any) => {
    const groupKey = item.group || "default";
    if (!groupedOptions[groupKey]) {
      groupedOptions[groupKey] = {
        label: groupKey,
        key: groupKey,
        type: "group",
        children: [],
      };
    }
    groupedOptions[groupKey].children.push({
      label: () =>
        h(
          VPLink,
          { href: item.link as any, target: item.target, rel: item.rel },
          () => item.text,
        ),
      key: item.link,
      extra: () => item.desc,
    });
  });

  return Object.values(groupedOptions).map((item: any) => ({
    ...item,
    label: `${item.label}(${item.children.length})`,
  }));
});
```

## 大功告成

通过以上步骤，就可以实现自动生成侧边栏，并读取组件文档的 `frontmatter` 信息，提供给 `Sidebar` 组件使用。不过读取采用的 `readFileSync` 是同步的，应该可以优化，没想好怎么优化这里。
