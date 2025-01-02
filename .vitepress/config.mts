import { defineConfig } from "vitepress";
import Components from "unplugin-vue-components/vite";
import AutoImport from "unplugin-auto-import/vite";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import MarkdownItGithubAlerts from "markdown-it-github-alerts";
import { joinURL, withoutTrailingSlash } from "ufo";

const currentDir = dirname(fileURLToPath(import.meta.url));
const componentsDir = join(currentDir, "theme/components");
const pagesDir = join(currentDir, "theme/pages");
const composablesDir = join(currentDir, "theme/composables");
const utilsDir = join(currentDir, "theme/utils");

export default defineConfig({
  cleanUrls: true,
  lang: "zh-CN",
  title: "Artsmp's Blog",
  description: "A blog about study and life",
  sitemap: { hostname: "https://example.com" },
  head: [
    ["meta", { name: "twitter:site", content: "@abei557832" }],
    ["meta", { name: "twitter:card", content: "summary_large_image" }],
    ["meta", { property: "og:image:width", content: "1200" }],
    ["meta", { property: "og:image:height", content: "630" }],
    ["meta", { property: "og:image:type", content: "image/png" }],
    ["meta", { property: "og:site_name", content: "Artsmp" }],
    ["meta", { property: "og:type", content: "website" }],
  ],
  srcDir: "src",
  vite: {
    plugins: [
      {
        name: "watcher",
        configureServer(server) {
          server.watcher.add([componentsDir, pagesDir]);
          server.watcher.add([composablesDir, utilsDir]);
        },
      },
      Components({
        dirs: [componentsDir, pagesDir],
        include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
        dts: join(currentDir, "components.d.ts"),
      }),
      AutoImport({
        imports: ["vue", "vitepress"],
        dirs: [composablesDir, utilsDir],
        dts: join(currentDir, "auto-imports.d.ts"),
      }),
    ],
  },
  markdown: {
    theme: "everforest-light",
    config(md) {
      md.use(MarkdownItGithubAlerts);
    },
    gfmAlerts: false,
  },
  transformPageData(pageData, { siteConfig }) {
    // Set layout for blog articles
    if (pageData.filePath.startsWith("blog/")) {
      pageData.frontmatter.layout = "blog-show";
    }
    pageData.frontmatter.head ??= [];
    const title =
      pageData.frontmatter.title || pageData.title || siteConfig.site.title;
    const description =
      pageData.frontmatter.description ||
      pageData.description ||
      siteConfig.site.description;
    pageData.frontmatter.head.push(
      [
        "meta",
        {
          name: "og:title",
          content: title,
        },
      ],
      [
        "meta",
        {
          name: "twitter:title",
          content: title,
        },
      ],
      [
        "meta",
        {
          property: "og:description",
          content: description,
        },
      ],
      [
        "meta",
        {
          name: "twitter:description",
          content: description,
        },
      ],
    );

    // Create the canonical URL
    pageData.frontmatter.head.push([
      "link",
      {
        rel: "canonical",
        href: joinURL(
          "https://example.com",
          withoutTrailingSlash(pageData.filePath.replace(/(index)?\.md$/, "")),
        ),
      },
    ]);

    pageData.frontmatter.head.push([
      "meta",
      {
        property: "og:url",
        content: joinURL(
          "https://example.com",
          withoutTrailingSlash(pageData.filePath.replace(/(index)?\.md$/, "")),
        ),
      },
    ]);
  },
});
