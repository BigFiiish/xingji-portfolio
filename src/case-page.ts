import { caseHtml } from "./case-study";
import { caseStudyPath, projects, type Project } from "./content";

const esc = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

const fontPreloads = `
    <link rel="preload" href="/fonts/inter-tight-latin.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="preload" href="/fonts/ibm-plex-mono-regular-latin.woff2" as="font" type="font/woff2" crossorigin />`;

export function casePageHtml(project: Project, stylesheet: string): string {
  const index = projects.findIndex((item) => item.slug === project.slug);
  const previous = projects[(index - 1 + projects.length) % projects.length];
  const next = projects[(index + 1) % projects.length];
  const canonical = `https://www.xingjiyan.com${caseStudyPath(project)}`;
  const image = `https://www.xingjiyan.com/og/projects/${project.slug}.png`;
  const description = `${project.name}: ${project.blurb}`;
  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: project.name,
    description: project.headline,
    url: canonical,
    codeRepository: project.repo,
    programmingLanguage: project.stack[0],
    ...(project.live ? { sameAs: project.live } : {}),
    author: { "@type": "Person", name: "Xingji Yan", url: "https://www.xingjiyan.com" },
  });

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${esc(project.name)} case study — Xingji Yan</title>
    <meta name="description" content="${esc(description)}" />
    <link rel="canonical" href="${canonical}" />
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="Xingji Yan" />
    <meta property="og:title" content="${esc(project.name)} case study — Xingji Yan" />
    <meta property="og:description" content="${esc(description)}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:image:type" content="image/png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${esc(project.name)} — ${esc(project.headline)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(project.name)} case study — Xingji Yan" />
    <meta name="twitter:description" content="${esc(description)}" />
    <meta name="twitter:image" content="${image}" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    ${fontPreloads}
    <link rel="stylesheet" href="${stylesheet}" />
    <script type="application/ld+json">${jsonLd}</script>
  </head>
  <body class="case-page-shell" style="--accent:${esc(project.accent)}">
    <header class="case-page-nav">
      <a href="/#work">← Selected work</a>
      <span>${esc(project.name)} / Case study</span>
      <a href="${esc(project.repo)}" target="_blank" rel="noreferrer">Source ↗</a>
    </header>
    <main class="case case-page">
      <div class="case-body">${caseHtml(project, true)}</div>
      <nav class="case-page-next" aria-label="More case studies">
        <a href="${caseStudyPath(previous)}"><span>Previous</span>${esc(previous.name)}</a>
        <a href="${caseStudyPath(next)}"><span>Next</span>${esc(next.name)}</a>
      </nav>
    </main>
  </body>
</html>`;
}
