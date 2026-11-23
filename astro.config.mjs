import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://abei.me",
  vite: {
    plugins: [tailwindcss()],
  },
});
