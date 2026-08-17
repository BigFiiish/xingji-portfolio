import type { Project } from "./content";
import { xrayMarkup } from "./mockups";

const archCaption: Record<string, string> = {
  clearbay: "Request path",
  grantline: "Trust path",
  "durable-brief": "Durable execution path",
  pulsequeue: "Control path",
};

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
}

export function caseHtml(p: Project): string {
  const c = p.caseStudy;
  const cap = archCaption[p.slug];
  const inspectN = c.artifact ? "07" : "06";
  const object = c.artifact
    ? `<section>
      <h3><span>06</span> Object</h3>
      <figure class="trace">
        <p>${esc(c.artifact.caption)}</p>
        <code>${esc(c.artifact.body)}</code>
      </figure>
    </section>`
    : "";
  return `
    <header class="case-id">
      <h2 id="case-title" class="case-name" tabindex="-1">${esc(p.name)}</h2>
      <p class="case-kicker">${esc(p.headline)}</p>
      <p class="case-stack">${esc(p.stack.join(" · "))}</p>
      <p class="case-id-links">
        ${p.live ? `<a href="${esc(p.live)}" target="_blank" rel="noreferrer">Open product ↗</a>` : ""}
        <a href="${esc(p.repo)}" target="_blank" rel="noreferrer">GitHub ↗</a>
      </p>
    </header>
    <section>
      <h3><span>01</span> Problem</h3>
      <p class="case-problem">${esc(c.problem)}</p>
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
      <figure class="case-arch">
        ${cap ? `<figcaption class="case-arch-cap">${esc(cap)}</figcaption>` : ""}
        ${xrayMarkup(p)}
      </figure>
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
      <div class="fail-cols" aria-hidden="true"><span>Failure</span><span>Handling</span></div>
      <ul class="fail-ledger">
        ${c.failures
          .map(
            (f) =>
              `<li><p class="fail-k">${esc(f.fail)}</p><p class="fail-h">${esc(f.handle)}</p></li>`,
          )
          .join("")}
      </ul>
    </section>
    ${object}
    <section>
      <h3><span>${inspectN}</span> Inspect</h3>
      <div class="case-inspect">
        ${p.live ? `<p><span class="case-k">Live</span> <a href="${esc(p.live)}" target="_blank" rel="noreferrer">Open product ↗</a></p>` : ""}
        <p><span class="case-k">Source</span> <a href="${esc(p.repo)}" target="_blank" rel="noreferrer">GitHub ↗</a></p>
      </div>
    </section>`;
}
