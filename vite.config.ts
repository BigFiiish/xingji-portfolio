import { defineConfig } from "vite";
import { injectStatic } from "./src/markup";

export default defineConfig({
  build: {
    target: "es2022",
    cssMinify: true,
  },
  plugins: [
    {
      name: "inject-static",
      transformIndexHtml(html) {
        return injectStatic(html);
      },
    },
  ],
});
