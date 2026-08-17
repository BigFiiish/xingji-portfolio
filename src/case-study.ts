import type { Project } from "./content";
import { xrayMarkup } from "./mockups";

const archCaption: Record<string, string> = {
  clearbay: "Request path",
  grantline: "Trust path",
  "durable-brief": "Durable execution path",
  pulsequeue: "Control path",
};

export function caseHtml(p: Project): string {
  const c = p.caseStudy;
  const cap = archCaption[p.slug];
  return `
    <header class="case-id">
      <h2 id="case-title" class="case-name" tabindex="-1">${p.name}</h2>
      <p class="case-kicker">${p.headline}</p>
      <p class="case-stack">${p.stack.join(" · ")}</p>
      <p class="case-id-links">
        ${p.live ? `<a href="${p.live}" target="_blank" rel="noreferrer">Live demo ↗</a>` : ""}
        <a href="${p.repo}" target="_blank" rel="noreferrer">GitHub ↗</a>
      </p>
    </header>
    <section>
      <h3><span>01</span> Problem</h3>
      <p class="case-problem">${c.problem}</p>
    </section>
    <section>
      <h3><span>02</span> Constraints</h3>
      <ol class="case-bounds">
        ${c.constraints
          .map(
            (x, i) =>
              `<li><span class="case-n">${String(i + 1).padStart(2, "0")}</span><span class="case-bound">${x}</span></li>`,
          )
          .join("")}
      </ol>
    </section>
    <section>
      <h3><span>03</span> Architecture</h3>
      <figure class="case-arch">
        ${cap ? `<figcaption class="case-arch-cap">${cap}</figcaption>` : ""}
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
            <summary>${d.decision}</summary>
            <p class="case-note"><span class="case-k">Why</span> ${d.why}</p>
            <p class="case-note"><span class="case-k">Tradeoff</span> ${d.tradeoff}</p>
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
              `<li><p class="fail-k">${f.fail}</p><p class="fail-h">${f.handle}</p></li>`,
          )
          .join("")}
      </ul>
    </section>
    <section>
      <h3><span>06</span> Inspect</h3>
      <div class="case-inspect">
        ${p.live ? `<p><span class="case-k">Live</span> <a href="${p.live}" target="_blank" rel="noreferrer">Open product ↗</a></p>` : ""}
        <p><span class="case-k">Source</span> <a href="${p.repo}" target="_blank" rel="noreferrer">GitHub ↗</a></p>
      </div>
    </section>`;
}
