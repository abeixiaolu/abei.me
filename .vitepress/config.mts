import { defineConfig } from "vitepress";
import Components from "unplugin-vue-components/vite";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  vite: {
    plugins: [Components()],
  },
});
