import { principles, projects, type Project } from "./content";
import { caseFails } from "./failures";
import { xrayMarkup } from "./mockups";
import { bindScenes, sceneMarkup } from "./scenes";

const featured = () => projects.filter((p) => p.featured);
const rest = () => projects.filter((p) => !p.featured);

const shorts: Record<string, string> = {
  dockline: "Agent evaluation without letting the model grade itself.",
  sketchsync: "Realtime collaboration over a typed WebSocket protocol.",
  resumatch: "Deterministic resume/JD scoring with an optional grounded LLM layer.",
};

const shots: Partial<Record<string, { src: string; alt: string }>> = {};

export function renderWork(root: HTMLElement) {
  root.innerHTML = featured()
    .map(
      (p, i) => `
      <article class="work-row scene-${p.slug} reveal" id="${p.slug}" data-slug="${p.slug}" style="--accent:${p.accent}">
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
          <p class="xray-pill">Hold <kbd>⇧</kbd> inspect system</p>
          <button class="xray-toggle" type="button" hidden>View architecture</button>
          <div class="stage">
            <div class="scan" aria-hidden="true"></div>
            <div class="stage-body product">${sceneMarkup(p)}</div>
            <div class="stage-body xray">${xrayMarkup(p)}</div>
          </div>
          ${shot(p.slug)}
        </div>
      </article>`
    )
    .join("");
  bindScenes(root);
}

function shot(slug: string): string {
  const s = shots[slug];
  if (!s) return "";
  return `<figure class="shot"><img src="${s.src}" alt="${s.alt}" width="1280" height="720" loading="lazy" /></figure>`;
}

export function renderMore(root: HTMLElement) {
  root.innerHTML =
    `<p class="more-label">Also</p>` +
    rest()
      .map(
        (p) => `
      <article class="more-row" id="${p.slug}">
        <div>
          <strong>${p.name}</strong>
          <span>${shorts[p.slug] ?? p.headline}</span>
        </div>
        <em>${p.stack.join(" · ")}</em>
        <p class="more-links">
          ${p.live ? `<a href="${p.live}" target="_blank" rel="noreferrer">Live</a>` : ""}
          <a href="${p.repo}" target="_blank" rel="noreferrer">GitHub</a>
        </p>
      </article>`
      )
      .join("");
}

export function bindXray(root: HTMLElement) {
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let pulsed = false;

  root.querySelectorAll<HTMLElement>(".work-visual").forEach((visual) => {
    const product = visual.querySelector<HTMLElement>(".product");
    const xray = visual.querySelector<HTMLElement>(".xray");
    const pill = visual.querySelector<HTMLElement>(".xray-pill");
    const toggle = visual.querySelector<HTMLButtonElement>(".xray-toggle");
    const stage = visual.querySelector<HTMLElement>(".stage");
    if (!product || !xray || !stage) return;

    const show = (on: boolean) => visual.classList.toggle("is-xray", on);

    if (!coarse && !reduce && !pulsed && pill) {
      const io = new IntersectionObserver((entries) => {
        if (!entries.some((e) => e.isIntersecting) || pulsed) return;
        pulsed = true;
        pill.classList.add("pulse");
        window.setTimeout(() => pill.classList.remove("pulse"), 2800);
        io.disconnect();
      }, { threshold: 0.5 });
      io.observe(visual);
    }

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
  });
}

export function renderPrinciples(root: HTMLElement) {
  root.innerHTML = principles
    .map(
      (p) => `
    <li class="reveal">
      <span>${p.idx}</span>
      <strong>${p.title}</strong>
      <p>${p.line}</p>
    </li>`,
    )
    .join("");
}

export function caseHtml(p: Project): string {
  const c = p.caseStudy;
  return `
    <header class="case-top">
      <p class="case-anno">01 / Problem</p>
      <h2 class="case-problem">${c.problem}</h2>
    </header>
    <section>
      <h3><span>02</span> Constraints</h3>
      <ul class="case-list mono">${c.constraints.map((x) => `<li>${x}</li>`).join("")}</ul>
    </section>
    <section>
      <h3><span>03</span> Architecture</h3>
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
      <h3><span>05</span> Failure</h3>
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
