import { defineConfig } from "astro/config";
import { unified } from "@astrojs/markdown-remark";
import tailwindcss from "@tailwindcss/vite";
import { remarkAlert } from "remark-github-blockquote-alert";
import { rehypeInlineCodeGap } from "./src/lib/rehype-inline-code-gap.mjs";
import { rehypeEnableTaskCheckboxes } from "./src/lib/rehype-enable-task-checkboxes.mjs";
import sereinDark from "./src/themes/serein-dark.json";
import sereinLight from "./src/themes/serein-light.json";

export default defineConfig({
  site: "https://abei.me",
  // Cloudflare Pages 对目录页强制 308 → 带尾斜杠；链接必须一致，否则 ClientRouter 会整页刷新
  trailingSlash: "always",
  // 进页即预取站内链，避免点击后再等 HTML（线上 TTFB 常近 1s）
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "load",
  },
  markdown: {
    shikiConfig: {
      // 正文 LCD 代码框固定深色；双主题便于后续切浅色框时复用
      themes: {
        light: sereinLight,
        dark: sereinDark,
      },
      defaultColor: false,
    },
    processor: unified({
      remarkPlugins: [remarkAlert],
      rehypePlugins: [rehypeInlineCodeGap, rehypeEnableTaskCheckboxes],
    }),
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
