import { defineConfig } from "vite";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { injectStatic } from "./src/markup";
import { projects } from "./src/content";
import { casePageHtml } from "./src/case-page";

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
    {
      name: "static-case-study-pages",
      configureServer(server) {
        server.middlewares.use(async (request, response, next) => {
          const pathname = new URL(request.url ?? "/", "http://localhost").pathname;
          const match = pathname.match(/^\/work\/([a-z0-9-]+)\/?$/i);
          const project = match ? projects.find((item) => item.slug === match[1]) : undefined;
          if (!project) return next();
          const html = await server.transformIndexHtml(pathname, casePageHtml(project, "/src/style.css"));
          response.statusCode = 200;
          response.setHeader("Content-Type", "text/html; charset=utf-8");
          response.end(html);
        });
      },
      generateBundle(_options, bundle) {
        const stylesheet = Object.values(bundle).find(
          (entry) => entry.type === "asset" && entry.fileName.endsWith(".css"),
        );
        if (!stylesheet) throw new Error("Portfolio stylesheet was not emitted");
        projects.forEach((project) => {
          this.emitFile({
            type: "asset",
            fileName: `work/${project.slug}/index.html`,
            source: casePageHtml(project, `/${stylesheet.fileName}`),
          });
        });
      },
    },
  ],
});
