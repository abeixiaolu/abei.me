import { defineConfig } from "vitepress";
import Components from "unplugin-vue-components/vite";
import AutoImport from "unplugin-auto-import/vite";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import MarkdownItGithubAlerts from "markdown-it-github-alerts";

const currentDir = dirname(fileURLToPath(import.meta.url));
const componentsDir = join(currentDir, "theme/components");
const pagesDir = join(currentDir, "theme/pages");
const composablesDir = join(currentDir, "theme/composables");
const utilsDir = join(currentDir, "theme/utils");

export default defineConfig({
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
});
