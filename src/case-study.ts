import { isRenderProject, projectStatus, type Project } from "./content";
import { xrayMarkup } from "./mockups";

const archCaption: Record<string, string> = {
  crawlforge: "Careers intelligence path",
  clearbay: "Request path",
  grantline: "Trust path",
  "durable-brief": "Durable execution path",
  pulsequeue: "Control path",
};

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
}

function header(p: Project, standalone: boolean): string {
  return `<header class="case-id${standalone ? " case-page-hero" : ""}">
      ${standalone ? `<p class="case-name">${esc(p.name)}</p><h1 id="case-title" class="case-page-title">${esc(p.headline)}</h1>` : `<h2 id="case-title" class="case-name" tabindex="-1">${esc(p.name)}</h2><p class="case-kicker">${esc(p.headline)}</p>`}
      <p class="project-status">${esc(projectStatus(p))}</p>
      <p class="case-stack">${esc(p.stack.join(" · "))}</p>
      <p class="case-id-links">
        ${p.live ? `<a href="${esc(p.live)}" target="_blank" rel="noreferrer">Open product ↗</a>` : ""}
        <a href="${esc(p.repo)}" target="_blank" rel="noreferrer">GitHub ↗</a>
      </p>
      ${isRenderProject(p) ? `<p class="demo-note">Hosted on Render. The first open may take up to about 60 seconds; the proof below remains available immediately.</p>` : ""}
    </header>`;
}

function artifact(p: Project): string {
  const a = p.caseStudy.artifact;
  if (!a) return "";
  return `<figure class="trace case-open" id="proof">
      <p>${esc(a.caption)}</p>
      <code>${esc(a.body)}</code>
    </figure>`;
}

function problem(p: Project): string {
  return `<p class="case-problem">${esc(p.caseStudy.problem)}</p>`;
}

function failures(p: Project): string {
  return `<div class="fail-cols" aria-hidden="true"><span>Failure</span><span>Handling</span></div>
      <ul class="fail-ledger">
        ${p.caseStudy.failures
          .map((f) => `<li><p class="fail-k">${esc(f.fail)}</p><p class="fail-h">${esc(f.handle)}</p></li>`)
          .join("")}
      </ul>`;
}

function inspect(p: Project): string {
  return `<div class="case-inspect">
        ${p.live ? `<p><span class="case-k">Live</span> <a href="${esc(p.live)}" target="_blank" rel="noreferrer">Open product ↗</a></p>` : ""}
        <p><span class="case-k">Source</span> <a href="${esc(p.repo)}" target="_blank" rel="noreferrer">GitHub ↗</a></p>
        ${isRenderProject(p) ? `<p><span class="case-k">Wake time</span> <span>Allow up to about 60 seconds on the first request.</span></p>` : ""}
      </div>`;
}

function arch(p: Project): string {
  const cap = archCaption[p.slug];
  return `<figure class="case-arch">
        ${cap ? `<figcaption class="case-arch-cap">${esc(cap)}</figcaption>` : ""}
        ${xrayMarkup(p)}
      </figure>`;
}

function objectFirst(p: Project, standalone: boolean): string {
  return `${header(p, standalone)}
    <section>
      ${artifact(p)}
      ${problem(p)}
    </section>
    <section>
      <h3>Failure</h3>
      ${failures(p)}
    </section>
    <section>
      <h3>Inspect</h3>
      ${inspect(p)}
    </section>`;
}

function grantFirst(p: Project, standalone: boolean): string {
  return `${header(p, standalone)}
    <section>
      ${artifact(p)}
      ${problem(p)}
    </section>
    <section>
      <h3>Trust path</h3>
      ${arch(p)}
    </section>
    <section>
      <h3>Failure</h3>
      ${failures(p)}
    </section>
    <section>
      <h3>Inspect</h3>
      ${inspect(p)}
    </section>`;
}

function hookOnly(p: Project, standalone: boolean): string {
  return `${header(p, standalone)}
    <section>
      ${problem(p)}
      ${artifact(p)}
    </section>
    <section>
      <h3>Inspect</h3>
      ${inspect(p)}
    </section>`;
}

function full(p: Project, standalone: boolean): string {
  const c = p.caseStudy;
  return `${header(p, standalone)}
    <section>
      <h3><span>01</span> Problem</h3>
      ${problem(p)}
    </section>
    <section>
      <h3><span>02</span> Constraints</h3>
      <ol class="case-bounds">
        ${c.constraints
          .map(
            (x, i) =>
              `<li><span class="case-n">${String(i + 1).padStart(2, "0")}</span><span class="case-bound">${esc(x)}</span></li>`,
          )
          .join("")}
      </ol>
    </section>
    <section>
      <h3><span>03</span> Architecture</h3>
      ${arch(p)}
    </section>
    <section>
      <h3><span>04</span> Decisions</h3>
      <div class="decisions">
        ${c.decisions
          .map(
            (d) => `
          <details>
            <summary>${esc(d.decision)}</summary>
            <p class="case-note"><span class="case-k">Why</span> ${esc(d.why)}</p>
            <p class="case-note"><span class="case-k">Tradeoff</span> ${esc(d.tradeoff)}</p>
          </details>`,
          )
          .join("")}
      </div>
    </section>
    <section>
      <h3><span>05</span> Failure</h3>
      ${failures(p)}
    </section>
    <section>
      <h3><span>06</span> Object</h3>
      ${artifact(p)}
    </section>
    <section>
      <h3><span>07</span> Inspect</h3>
      ${inspect(p)}
    </section>`;
}

export function caseHtml(p: Project, standalone = false): string {
  const shape = p.caseStudy.shape ?? "full";
  if (shape === "object") return objectFirst(p, standalone);
  if (shape === "grant") return grantFirst(p, standalone);
  if (shape === "hook") return hookOnly(p, standalone);
  return full(p, standalone);
}
