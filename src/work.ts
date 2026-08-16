import { projects, type Project } from "./content";
import { caseFails } from "./failures";
import { productMarkup, xrayMarkup } from "./mockups";
import { bindLife } from "./life";

const featured = () => projects.filter((p) => p.featured);
const rest = () => projects.filter((p) => !p.featured);

export function renderWork(root: HTMLElement) {
  root.innerHTML = featured()
    .map(
      (p, i) => `
      <article class="work-row reveal" id="${p.slug}" data-slug="${p.slug}" style="--accent:${p.accent}">
        <div class="work-copy">
          <span class="work-idx">${String(i + 1).padStart(2, "0")}</span>
          <h3>${p.name}</h3>
          <p class="work-head">${p.headline}</p>
          <p class="tags">${p.stack.map((s) => `<span>${s}</span>`).join("")}</p>
          <p class="work-body">${p.blurb}</p>
          <p class="work-links">
            ${p.live ? `<a class="btn" href="${p.live}" target="_blank" rel="noreferrer">Live demo ↗</a>` : ""}
            <a href="${p.repo}" target="_blank" rel="noreferrer">GitHub ↗</a>
            <button type="button" data-case="${p.slug}">Case study</button>
          </p>
        </div>
        <div class="work-visual">
          <p class="xray-pill">Hold <kbd>⇧</kbd> to inspect architecture</p>
          <button class="xray-toggle" type="button" hidden>View architecture</button>
          <div class="frame">
            <div class="frame-bar"><span></span><span></span><span></span><em>${p.slug}</em></div>
            <div class="scan" aria-hidden="true"></div>
            <div class="frame-body product">${productMarkup(p)}</div>
            <div class="frame-body xray">${xrayMarkup(p)}</div>
          </div>
        </div>
      </article>`
    )
    .join("");
  bindLife(root);
}

export function renderMore(root: HTMLElement) {
  root.innerHTML =
    `<p class="more-label">Also</p>` +
    rest()
      .map(
        (p) => `
      <a class="more-row" href="${p.live ?? p.repo}" target="_blank" rel="noreferrer" id="${p.slug}">
        <strong>${p.name}</strong>
        <span>${p.headline}</span>
        <em>${p.year}</em>
      </a>`
      )
      .join("");
}

export function bindXray(root: HTMLElement) {
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  root.querySelectorAll<HTMLElement>(".work-visual").forEach((visual) => {
    const product = visual.querySelector<HTMLElement>(".product");
    const xray = visual.querySelector<HTMLElement>(".xray");
    const pill = visual.querySelector<HTMLElement>(".xray-pill");
    const toggle = visual.querySelector<HTMLButtonElement>(".xray-toggle");
    const frame = visual.querySelector<HTMLElement>(".frame");
    if (!product || !xray || !frame) return;

    const show = (on: boolean) => {
      visual.classList.toggle("is-xray", on);
    };

    if (coarse) {
      if (pill) pill.hidden = true;
      if (toggle) {
        toggle.hidden = false;
        toggle.addEventListener("click", () => show(!visual.classList.contains("is-xray")));
      }
      return;
    }

    let shift = false;
    const sync = () => show(shift && visual.matches(":hover"));
    visual.addEventListener("pointerenter", sync);
    visual.addEventListener("pointerleave", () => {
      if (!shift) show(false);
    });
    window.addEventListener("keydown", (e) => {
      if (e.key === "Shift") {
        shift = true;
        sync();
      }
    });
    window.addEventListener("keyup", (e) => {
      if (e.key === "Shift") {
        shift = false;
        show(false);
      }
    });

    if (!reduce) {
      visual.addEventListener("pointermove", (e) => {
        const r = visual.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width - 0.5) * 5;
        const y = ((e.clientY - r.top) / r.height - 0.5) * -5;
        frame.style.transform = `perspective(1100px) rotateY(${x}deg) rotateX(${y}deg)`;
      });
      visual.addEventListener("pointerleave", () => {
        frame.style.transform = "";
      });
    }
  });
}

export function caseHtml(p: Project): string {
  const c = p.caseStudy;
  return `
    <header class="case-top">
      <p class="kicker">Dossier · ${p.name}</p>
      <p class="case-anno">01 / Problem</p>
      <h2 class="case-problem">${c.problem}</h2>
      <p class="case-head">${p.headline}</p>
    </header>
    <section>
      <h3><span>02</span> Constraints</h3>
      <ul class="case-list">${c.constraints.map((x) => `<li>${x}</li>`).join("")}</ul>
    </section>
    <section>
      <h3><span>03</span> Architecture</h3>
      <p class="case-anno">signal path · ${p.stack[0]}</p>
      ${xrayMarkup(p)}
    </section>
    <section>
      <h3><span>04</span> Decisions</h3>
      <div class="decisions">
        ${c.decisions
          .map(
            (d) => `
          <details>
            <summary>${d.decision}</summary>
            <p><b>Why.</b> ${d.why}</p>
            <p><b>Tradeoff.</b> ${d.tradeoff}</p>
          </details>`
          )
          .join("")}
      </div>
    </section>
    <section>
      <h3><span>05</span> Failure modes</h3>
      ${caseFails(p.slug)}
      <ul class="fail-list">
        ${c.failures.map((f) => `<li><b>${f.fail}</b><span>${f.handle}</span></li>`).join("")}
      </ul>
    </section>
    <section>
      <h3><span>06</span> Demo</h3>
      <p class="work-links">
        ${p.live ? `<a class="btn" href="${p.live}" target="_blank" rel="noreferrer">Live demo ↗</a>` : ""}
        <a class="btn ghost" href="${p.repo}" target="_blank" rel="noreferrer">GitHub ↗</a>
      </p>
    </section>`;
}
