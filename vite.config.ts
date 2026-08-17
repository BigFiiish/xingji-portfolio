import { defineConfig } from "vite";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { injectStatic } from "./src/markup";

const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  build: {
    target: "es2022",
    cssMinify: true,
    rollupOptions: {
      input: {
        main: resolve(root, "index.html"),
        note: resolve(root, "note/index.html"),
      },
    },
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
