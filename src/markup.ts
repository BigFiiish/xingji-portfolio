import { experience, person, principles, projects, type Project } from "./content";
import { failDemos } from "./failures";

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

const featured = () => projects.filter((p) => p.featured);
const rest = () => projects.filter((p) => !p.featured);

export function workCopy(p: Project, i: number, extra = ""): string {
  const proof = p.proof?.length
    ? `<p class="proof">${p.proof.map((s) => `<span>${esc(s)}</span>`).join("")}</p>`
    : "";
  return `<div class="work-copy">
          <span class="work-idx">${String(i + 1).padStart(2, "0")}</span>
          <h3>${esc(p.name)}</h3>
          <p class="work-head">${esc(p.headline)}</p>
          ${proof}
          <p class="tags">${p.stack.map((s) => `<span>${esc(s)}</span>`).join("")}</p>
          <p class="work-body">${esc(p.blurb)}</p>
          <p class="work-links">
            ${p.live ? `<a href="${esc(p.live)}" target="_blank" rel="noreferrer">Open product ↗</a>` : ""}
            <a href="${esc(p.repo)}" target="_blank" rel="noreferrer">GitHub ↗</a>
            ${extra}
          </p>
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
  return featured()
    .map(
      (p, i) => `
      <article class="work-row" id="${esc(p.slug)}" data-slug="${esc(p.slug)}" style="--accent:${esc(p.accent)}">
        ${workCopy(p, i)}
      </article>`,
    )
    .join("");
}

export function staticMoreHtml(): string {
  return (
    `<h3 class="more-label">Also</h3>` +
    rest()
      .map((p) => moreArticle(p, "", false))
      .join("")
  );
}

export function moreArticle(p: Project, previewInner: string, withShot = true): string {
  return `
      <article class="more-row" id="${esc(p.slug)}" data-more="${esc(p.slug)}" data-phase="idle">
        <div class="more-copy">
          <h4>${esc(p.name)}</h4>
          <span>${esc(shorts[p.slug] ?? p.headline)}</span>
          ${p.slug === "dockline" ? `<p class="more-aside">40 deterministic cases. <a href="${esc(person.note)}">The model is never the judge.</a></p>` : ""}
        </div>
        <div class="more-preview">${previewInner}${withShot && p.slug === "sketchsync" ? productFigure(p, true) : ""}</div>
        <div class="more-foot">
          <em>${p.stack.map(esc).join(" · ")}</em>
          <p class="more-links">
            ${p.live ? `<a href="${esc(p.live)}" target="_blank" rel="noreferrer">Open product ↗</a>` : ""}
            <a href="${esc(p.repo)}" target="_blank" rel="noreferrer">GitHub ↗</a>
          </p>
        </div>
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
    ...(p.live ? { url: p.live } : {}),
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
  });
}

export function injectStatic(html: string): string {
  return html
    .replace("<!--inject:work-->", staticFeaturedHtml())
    .replace("<!--inject:more-->", staticMoreHtml())
    .replace("<!--inject:principles-->", staticPrinciplesHtml())
    .replace("<!--inject:experience-->", staticExperienceHtml())
    .replace("<!--inject:fail-->", staticFailHtml())
    .replace("<!--inject:jsonld-->", jsonLd());
}
