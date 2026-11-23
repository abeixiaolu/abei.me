import { defineConfig } from "astro/config";
import { unified } from "@astrojs/markdown-remark";
import tailwindcss from "@tailwindcss/vite";
import { remarkAlert } from "remark-github-blockquote-alert";
import { rehypeInlineCodeGap } from "./src/lib/rehype-inline-code-gap.mjs";
import sereinDark from "./src/themes/serein-dark.json";
import sereinLight from "./src/themes/serein-light.json";

export default defineConfig({
  site: "https://abei.me",
  // Cloudflare Pages 对目录页强制 308 → 带尾斜杠；链接必须一致，否则 ClientRouter 会整页刷新
  trailingSlash: "always",
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
      rehypePlugins: [rehypeInlineCodeGap],
    }),
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
