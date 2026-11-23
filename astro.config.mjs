import { defineConfig } from "astro/config";
import { unified } from "@astrojs/markdown-remark";
import tailwindcss from "@tailwindcss/vite";
import { remarkAlert } from "remark-github-blockquote-alert";
import { rehypeInlineCodeGap } from "./src/lib/rehype-inline-code-gap.mjs";

export default defineConfig({
  site: "https://abei.me",
  markdown: {
    processor: unified({
      remarkPlugins: [remarkAlert],
      rehypePlugins: [rehypeInlineCodeGap],
    }),
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
