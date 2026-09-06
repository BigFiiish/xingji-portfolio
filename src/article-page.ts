import { articlePath, articles, type Article, type ArticleSection } from "./articles";

const esc = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

const fonts = `
    <link rel="preload" href="/fonts/inter-tight-latin.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="preload" href="/fonts/ibm-plex-mono-regular-latin.woff2" as="font" type="font/woff2" crossorigin />`;

const displayDate = (date: string) =>
  new Intl.DateTimeFormat("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" }).format(
    new Date(`${date}T00:00:00Z`),
  );

function sectionHtml(section: ArticleSection, index: number): string {
  const paragraphs = section.paragraphs?.map((paragraph) => `<p>${esc(paragraph)}</p>`).join("") ?? "";
  const list = section.list
    ? `<ul>${section.list.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>`
    : "";
  const code = section.code ? `<pre><code>${esc(section.code)}</code></pre>` : "";
  const callout = section.callout ? `<blockquote>${esc(section.callout)}</blockquote>` : "";
  return `<section class="article-section">
      <div class="article-section-label">${String(index + 1).padStart(2, "0")}</div>
      <div class="article-section-body">
        <h2>${esc(section.heading)}</h2>
        ${paragraphs}${callout}${code}${list}
      </div>
    </section>`;
}

function diagramHtml(article: Article): string {
  const diagram = article.diagram;
  return `<figure class="article-diagram" aria-labelledby="decision-map-${esc(article.slug)}">
    <figcaption>
      <span>Decision map</span>
      <strong id="decision-map-${esc(article.slug)}">${esc(diagram.title)}</strong>
      <p>${esc(diagram.caption)}</p>
    </figcaption>
    <ol>
      ${diagram.steps
        .map(
          (step, index) => `<li>
            <span>${String(index + 1).padStart(2, "0")}</span>
            <strong>${esc(step.label)}</strong>
            <p>${esc(step.detail)}</p>
          </li>`,
        )
        .join("")}
    </ol>
  </figure>`;
}

function sourcesHtml(article: Article): string {
  return `<section class="article-sources" aria-labelledby="source-notes-${esc(article.slug)}">
    <div>
      <p>Source notes</p>
      <h2 id="source-notes-${esc(article.slug)}">Claims you can inspect.</h2>
    </div>
    <ol>
      ${article.sources
        .map(
          (source) => `<li>
            <span>${esc(source.kind)}</span>
            <a href="${esc(source.href)}" target="_blank" rel="noreferrer">${esc(source.label)} ↗</a>
            <p>${esc(source.note)}</p>
          </li>`,
        )
        .join("")}
    </ol>
  </section>`;
}

export function articlePageHtml(article: Article, stylesheet: string): string {
  const related = article.related
    .map((slug) => articles.find((item) => item.slug === slug))
    .filter((item): item is Article => Boolean(item));
  const canonical = `https://www.xingjiyan.com${articlePath(article)}`;
  const image = `https://www.xingjiyan.com/og/writing/${article.slug}.png`;
  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: article.title,
    description: article.dek,
    datePublished: article.date,
    dateModified: article.updated,
    url: canonical,
    image,
    keywords: article.tags.join(", "),
    author: { "@type": "Person", name: "Xingji Yan", url: "https://www.xingjiyan.com" },
    about: { "@type": "SoftwareSourceCode", name: article.project.name, url: `https://www.xingjiyan.com${article.project.href}` },
  });
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${esc(article.title)} — Xingji Yan</title>
    <meta name="description" content="${esc(article.dek)}" />
    <link rel="canonical" href="${canonical}" />
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="Xingji Yan" />
    <meta property="og:title" content="${esc(article.title)}" />
    <meta property="og:description" content="${esc(article.dek)}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:image:type" content="image/png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="article:published_time" content="${article.date}" />
    <meta property="article:modified_time" content="${article.updated}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(article.title)}" />
    <meta name="twitter:description" content="${esc(article.dek)}" />
    <meta name="twitter:image" content="${image}" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    ${fonts}
    <link rel="stylesheet" href="${stylesheet}" />
    <script type="application/ld+json">${jsonLd}</script>
  </head>
  <body class="article-page-shell" style="--accent:${esc(article.accent)}">
    <header class="article-nav">
      <a href="/">XY</a>
      <nav aria-label="Article navigation"><a href="/notes/">Writing</a><a href="/#work">Work</a><a href="/Xingji-Yan-Resume.pdf">Resume</a></nav>
    </header>
    <main class="article-page">
      <header class="article-hero">
        <p class="article-eyebrow">${esc(article.eyebrow)}</p>
        <h1>${esc(article.title)}</h1>
        <p class="article-dek">${esc(article.dek)}</p>
        <div class="article-meta"><span>Published <time datetime="${article.date}">${displayDate(article.date)}</time></span><span>Last updated <time datetime="${article.updated}">${displayDate(article.updated)}</time></span><span>${esc(article.readTime)}</span><a href="${esc(article.project.href)}">Built from ${esc(article.project.name)} →</a></div>
      </header>
      ${diagramHtml(article)}
      <article class="article-copy">
        ${article.sections.map(sectionHtml).join("")}
      </article>
      <aside class="article-project">
        <p>Inspect the system behind the essay.</p>
        <strong>${esc(article.project.name)}</strong>
        <div><a href="${esc(article.project.href)}">Case study →</a><a href="${esc(article.project.repo)}" target="_blank" rel="noreferrer">Source ↗</a></div>
      </aside>
      ${sourcesHtml(article)}
      <nav class="article-next" aria-label="Related writing">
        ${related.map((item) => `<a href="${articlePath(item)}"><span>Related essay</span>${esc(item.title)}</a>`).join("")}
      </nav>
    </main>
  </body>
</html>`;
}

export function writingIndexHtml(stylesheet: string): string {
  const canonical = "https://www.xingjiyan.com/notes/";
  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Writing — Xingji Yan",
    description: "Engineering notes on reliability, transactions, agent evaluation, and durable AI workflows.",
    url: canonical,
    author: { "@type": "Person", name: "Xingji Yan", url: "https://www.xingjiyan.com" },
    hasPart: articles.map((article) => ({ "@type": "TechArticle", headline: article.title, url: `https://www.xingjiyan.com${articlePath(article)}` })),
  });
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Writing — Xingji Yan</title>
    <meta name="description" content="Engineering notes on reliable systems, transactions, agent evaluation, and durable AI workflows." />
    <link rel="canonical" href="${canonical}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Xingji Yan" />
    <meta property="og:title" content="Writing — Xingji Yan" />
    <meta property="og:description" content="Field notes from building systems around correctness, state, failure, and humans." />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:image" content="https://www.xingjiyan.com/og.png" />
    <meta name="twitter:card" content="summary_large_image" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    ${fonts}
    <link rel="stylesheet" href="${stylesheet}" />
    <script type="application/ld+json">${jsonLd}</script>
  </head>
  <body class="writing-page-shell">
    <header class="article-nav">
      <a href="/">XY</a>
      <nav aria-label="Writing navigation"><a href="/#work">Work</a><a href="/#experience">Experience</a><a href="/Xingji-Yan-Resume.pdf">Resume</a></nav>
    </header>
    <main class="writing-index">
      <header class="writing-index-hero">
        <p>Writing / Collection 01 / 04 notes</p>
        <h1>Engineering judgment,<br /><em>made inspectable.</em></h1>
        <p>Four connected field notes launched as the first collection. Each starts from a working project, links to inspectable code and primary references, and keeps an honest revision date as the system evolves.</p>
      </header>
      <ol class="writing-index-list">
        ${articles
          .map(
            (article, index) => `<li style="--accent:${esc(article.accent)}">
          <a href="${articlePath(article)}">
            <span class="writing-index-no">${String(index + 1).padStart(2, "0")}</span>
            <div><p>${esc(article.eyebrow)} · ${esc(article.readTime)} · Updated ${displayDate(article.updated)}</p><h2>${esc(article.title)}</h2><span>${esc(article.dek)}</span></div>
            <b>Read →</b>
          </a>
        </li>`,
          )
          .join("")}
      </ol>
    </main>
  </body>
</html>`;
}
