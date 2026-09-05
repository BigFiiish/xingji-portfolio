import {
  caseStudyPath,
  experience,
  isRenderProject,
  person,
  principles,
  projects,
  projectStatus,
  type Project,
} from "./content";
import { failDemos } from "./failures";
import { articlePath, articles } from "./articles";

export const shorts: Record<string, string> = {
  dockline: "The model is never the judge.",
  sketchsync: "Realtime collaboration over a typed WebSocket protocol.",
  resumatch: "Deterministic resume/JD scoring with an optional grounded LLM layer.",
};

export const shots: Partial<Record<string, { src: string; alt: string; w: number; h: number }>> = {
  "durable-brief": {
    src: "/proof/durable-brief.webp",
    alt: "Durable Brief desk paused on the human approval hook, with research, draft, and evaluator complete",
    w: 1600,
    h: 1002,
  },
  pulsequeue: {
    src: "/proof/pulsequeue.webp",
    alt: "PulseQueue dashboard showing workers, job statuses, retries, dead letters, and live throughput",
    w: 1600,
    h: 1002,
  },
  sketchsync: {
    src: "/proof/sketchsync.webp",
    alt: "SketchSync shared canvas with Ada's live cursor and two connected users",
    w: 1280,
    h: 720,
  },
};

export function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
}

const flagshipOrder = ["crawlforge", "catalog-order-service", "clearbay"];

export const featuredProjects = () =>
  flagshipOrder
    .map((slug) => projects.find((project) => project.slug === slug))
    .filter((project): project is Project => Boolean(project?.featured));

export const secondaryProjects = () => projects.filter((project) => !project.featured);

export const orderedProjects = () => [...featuredProjects(), ...secondaryProjects()];

export function workDirectoryHtml(): string {
  return `<nav class="work-directory" aria-label="All project overview">
    ${orderedProjects()
      .map(
        (p, i) => `<a href="#${esc(p.slug)}">
          <span>${String(i + 1).padStart(2, "0")}</span>
          <strong>${esc(p.name)}</strong>
          <small>${esc(p.proof?.[0] ?? p.stack[0])}</small>
        </a>`,
      )
      .join("")}
  </nav>`;
}

const renderNote = (project: Project, compact = false) =>
  isRenderProject(project)
    ? `<p class="demo-note${compact ? " compact" : ""}">Render may need up to ~60s to wake. <a href="${caseStudyPath(project)}">View instant proof →</a></p>`
    : "";

export function proofFallbackHtml(project: Project): string {
  return `<div class="work-visual proof-fallback" data-demo-pending>
    <div class="proof-fallback-card">
      <span>Static proof</span>
      <strong>${esc(project.evidence?.result ?? project.headline)}</strong>
      <p>${esc(project.evidence?.validation ?? project.caseStudy.artifact?.caption ?? project.blurb)}</p>
      <a href="${caseStudyPath(project)}">Open full case study →</a>
    </div>
  </div>`;
}

export function workCopy(p: Project, i: number): string {
  const proof = p.proof?.length
    ? `<p class="proof">${p.proof.map((s) => `<span>${esc(s)}</span>`).join("")}</p>`
    : "";
  const evidence = p.evidence
    ? `<dl class="work-evidence">
        <div><dt>Problem</dt><dd>${esc(p.evidence.problem)}</dd></div>
        <div><dt>Result</dt><dd>${esc(p.evidence.result)}</dd></div>
        <div><dt>Verified</dt><dd>${esc(p.evidence.validation)}</dd></div>
      </dl>`
    : `<p class="work-body">${esc(p.blurb)}</p>`;
  return `<div class="work-copy">
          <span class="work-idx">${String(i + 1).padStart(2, "0")}</span>
          <h3>${esc(p.name)}</h3>
          <p class="work-head">${esc(p.headline)}</p>
          ${proof}
          <p class="project-status">${esc(projectStatus(p))}</p>
          <p class="tags">${p.stack.map((s) => `<span>${esc(s)}</span>`).join("")}</p>
          ${evidence}
          <p class="work-links">
            ${p.live ? `<a href="${esc(p.live)}" target="_blank" rel="noreferrer">Open product ↗</a>` : ""}
            <a href="${esc(p.repo)}" target="_blank" rel="noreferrer">GitHub ↗</a>
            <a href="${caseStudyPath(p)}">Case study →</a>
          </p>
          ${renderNote(p)}
        </div>`;
}

export function productFigure(p: Project, compact = false): string {
  const s = shots[p.slug];
  if (!s) return "";
  const img = `<img src="${esc(s.src)}" alt="${esc(s.alt)}" width="${s.w}" height="${s.h}" loading="lazy" decoding="async" />`;
  const see = p.live
    ? `<a class="shot-link" href="${esc(p.live)}" target="_blank" rel="noreferrer">See the product ↗</a>`
    : "";
  const frame = p.live
    ? `<a class="shot-frame" href="${esc(p.live)}" target="_blank" rel="noreferrer">${img}</a>`
    : `<div class="shot-frame">${img}</div>`;
  return `<figure class="shot${compact ? " shot-compact" : ""}">
    <p class="shot-k">Product view</p>
    ${see}
    ${frame}
  </figure>`;
}

export function staticFeaturedHtml(): string {
  const rows = featuredProjects()
      .map(
        (p, i) => `
      <article class="work-row scene-${esc(p.slug)}" id="${esc(p.slug)}" data-slug="${esc(p.slug)}" style="--accent:${esc(p.accent)}">
        ${workCopy(p, i)}
        ${proofFallbackHtml(p)}
      </article>`,
      )
      .join("");
  return `${workDirectoryHtml()}<div class="work-rows">${rows}</div>`;
}

export function staticMoreHtml(): string {
  return (
    `<div class="more-heading"><span>06 more projects</span><h3>More systems</h3></div><div class="more-grid">` +
    secondaryProjects()
      .map((p) => moreArticle(p))
      .join("") +
    `</div>`
  );
}

export function moreArticle(p: Project): string {
  const index = orderedProjects().findIndex((project) => project.slug === p.slug) + 1;
  return `
      <article class="more-row" id="${esc(p.slug)}" data-more="${esc(p.slug)}" style="--accent:${esc(p.accent)}">
        <div class="more-card-top"><span>${String(index).padStart(2, "0")}</span><em>${esc(p.year)}</em></div>
        <h4>${esc(p.name)}</h4>
        <p class="more-summary">${esc(shorts[p.slug] ?? p.headline)}</p>
        <p class="project-status">${esc(projectStatus(p))}</p>
        <p class="more-tags">${p.stack.slice(0, 4).map((item) => `<span>${esc(item)}</span>`).join("")}</p>
        <p class="more-links">
          ${p.live ? `<a href="${esc(p.live)}" target="_blank" rel="noreferrer">Live ↗</a>` : ""}
          <a href="${esc(p.repo)}" target="_blank" rel="noreferrer">GitHub ↗</a>
          <a href="${caseStudyPath(p)}">Case study →</a>
        </p>
        ${renderNote(p, true)}
      </article>`;
}

export function staticPrinciplesHtml(): string {
  return principles
    .map(
      (p) => `
    <li class="reveal">
      <span>${esc(p.idx)}</span>
      <strong>${esc(p.title)}</strong>
      <div class="principle-copy">
        <p>${esc(p.line)}</p>
        <p class="seen">Seen in <a href="${esc(p.seen.href)}">${esc(p.seen.name)}</a></p>
      </div>
    </li>`,
    )
    .join("");
}

export function staticExperienceHtml(): string {
  return experience
    .map((job) => {
      if (job.lead) {
        const stats = job.stats
          ?.map((s) => `<li><b>${esc(s.value)}</b><span>${esc(s.label)}</span></li>`)
          .join("");
        return `
    <li class="job-lead reveal" id="${esc(job.id)}">
      <div class="job-who">
        <strong>${esc(job.company)}</strong>
        <span>${esc(job.role)}</span>
        <em>${esc(job.dates)}</em>
      </div>
      <div class="job-body">
        <p class="job-lede">${esc(job.lede ?? job.line)}</p>
        ${stats ? `<ul class="job-stats">${stats}</ul>` : ""}
        ${
          job.seen
            ? `<p class="seen">${esc(job.seen.label)}: <a href="${esc(job.seen.href)}">${esc(job.seen.name)}</a></p>`
            : ""
        }
      </div>
    </li>`;
      }
      return `
    <li class="reveal" id="${esc(job.id)}">
      <div class="job-who">
        <strong>${esc(job.company)}</strong>
        <span>${esc(job.role)}</span>
      </div>
      <p>${esc(job.line)}</p>
      <em>${esc(job.dates)}</em>
    </li>`;
    })
    .join("");
}

export function staticWritingHtml(): string {
  return articles
    .map(
      (article, index) => `<article class="writing-card reveal" style="--accent:${esc(article.accent)}">
        <a href="${articlePath(article)}" aria-label="Read ${esc(article.title)}">
          <div class="writing-card-top"><span>${String(index + 1).padStart(2, "0")}</span><em>${esc(article.readTime)}</em></div>
          <p>${esc(article.eyebrow)}</p>
          <h3>${esc(article.title)}</h3>
          <span class="writing-card-dek">${esc(article.dek)}</span>
          <b>Read essay →</b>
        </a>
      </article>`,
    )
    .join("");
}

export function staticFailHtml(): string {
  return `<ul class="fail-static-list">
      ${failDemos
        .map(
          (d) =>
            `<li><b>${esc(d.kicker)}</b> · ${esc(d.project)}. ${esc(d.line)}</li>`,
        )
        .join("")}
    </ul>`;
}

export function jsonLd(): string {
  const works = projects.map((p) => ({
    "@type": "SoftwareSourceCode",
    name: p.name,
    description: p.headline,
    codeRepository: p.repo,
    url: `https://www.xingjiyan.com${caseStudyPath(p)}`,
    ...(p.live ? { sameAs: p.live } : {}),
    programmingLanguage: p.stack[0],
  }));
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Person",
    name: person.name,
    jobTitle: person.title,
    alumniOf: { "@type": "CollegeOrUniversity", name: person.university },
    worksFor: { "@type": "Organization", name: "JASCI Software" },
    url: person.site,
    sameAs: [person.github, person.linkedin],
    knowsAbout: ["On-call systems", "Multi-tenant isolation", "Idempotency", "AI guardrails", "Java", "TypeScript"],
    workExample: works,
    subjectOf: articles.map((article) => ({
      "@type": "TechArticle",
      headline: article.title,
      url: `https://www.xingjiyan.com${articlePath(article)}`,
    })),
  });
}

export function injectStatic(html: string): string {
  return html
    .replace("<!--inject:work-->", staticFeaturedHtml())
    .replace("<!--inject:more-->", staticMoreHtml())
    .replace("<!--inject:principles-->", staticPrinciplesHtml())
    .replace("<!--inject:experience-->", staticExperienceHtml())
    .replace("<!--inject:writing-->", staticWritingHtml())
    .replace("<!--inject:fail-->", staticFailHtml())
    .replace("<!--inject:jsonld-->", jsonLd());
}
