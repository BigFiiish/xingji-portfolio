import { principles, projects, type Project } from "./content";
import { xrayMarkup } from "./mockups";
import { bindScenes, sceneMarkup, type PulseCtl } from "./scenes";
import { secondaryPreview } from "./secondary";

const featured = () => projects.filter((p) => p.featured);
const rest = () => projects.filter((p) => !p.featured);

const shorts: Record<string, string> = {
  dockline: "Agent evaluation without letting the model grade itself.",
  sketchsync: "Realtime collaboration over a typed WebSocket protocol.",
  resumatch: "Deterministic resume/JD scoring with an optional grounded LLM layer.",
};

const shots: Partial<Record<string, { src: string; alt: string; w: number; h: number }>> = {
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

export function renderWork(root: HTMLElement) {
  root.innerHTML = featured()
    .map(
      (p, i) => `
      <article class="work-row scene-${p.slug}${p.slug === "clearbay" || p.slug === "grantline" || p.slug === "durable-brief" || p.slug === "pulsequeue" ? "" : " reveal"}" id="${p.slug}" data-slug="${p.slug}" style="--accent:${p.accent}">
        <div class="work-copy">
          <span class="work-idx">${String(i + 1).padStart(2, "0")}</span>
          <h3>${p.name}</h3>
          <p class="work-head">${p.headline}</p>
          <p class="tags">${p.stack.map((s) => `<span>${s}</span>`).join("")}</p>
          <p class="work-body">${p.blurb}</p>
          <p class="work-links">
            ${p.live ? `<a class="btn" href="${p.live}" target="_blank" rel="noreferrer">Live demo ↗</a>` : ""}
            <a href="${p.repo}" target="_blank" rel="noreferrer">GitHub ↗</a>
            <button type="button" data-case="${p.slug}">${p.slug === "clearbay" || p.slug === "grantline" ? "Case study →" : "Case study"}</button>
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
          ${shot(p)}
        </div>
      </article>`
    )
    .join("");
  bindScenes(root);
}

function shot(p: Project, compact = false): string {
  const s = shots[p.slug];
  if (!s) return "";
  const href = p.live ?? p.repo;
  const see = p.live
    ? `<a class="shot-link" href="${p.live}" target="_blank" rel="noreferrer">See the product ↗</a>`
    : "";
  return `<figure class="shot${compact ? " shot-compact" : ""}">
    <p class="shot-k">Product view</p>
    ${see}
    <a class="shot-frame" href="${href}" target="_blank" rel="noreferrer">
      <img src="${s.src}" alt="${s.alt}" width="${s.w}" height="${s.h}" loading="lazy" decoding="async" />
    </a>
  </figure>`;
}

export function renderMore(root: HTMLElement) {
  root.innerHTML =
    `<p class="more-label">Also</p>` +
    rest()
      .map(
        (p) => `
      <article class="more-row" id="${p.slug}" data-more="${p.slug}" data-phase="idle">
        <div class="more-copy">
          <strong>${p.name}</strong>
          <span>${shorts[p.slug] ?? p.headline}</span>
          ${p.slug === "dockline" ? `<p class="more-aside">The model is never the judge.</p>` : ""}
        </div>
        <div class="more-preview">${secondaryPreview(p.slug)}${p.slug === "sketchsync" ? shot(p, true) : ""}</div>
        <div class="more-foot">
          <em>${p.stack.join(" · ")}</em>
          <p class="more-links">
            ${p.live ? `<a href="${p.live}" target="_blank" rel="noreferrer">Live ↗</a>` : ""}
            <a href="${p.repo}" target="_blank" rel="noreferrer">GitHub ↗</a>
          </p>
        </div>
      </article>`
      )
      .join("");
}

export function bindXray(root: HTMLElement) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mqCoarse = window.matchMedia("(pointer: coarse)");
  const mqNarrow = window.matchMedia("(max-width: 980px)");
  const tap = () => mqCoarse.matches || mqNarrow.matches;
  let shift = false;
  const visuals: Array<{
    show: (on: boolean) => void;
    mode: () => void;
    sync: (on: boolean) => void;
  }> = [];

  root.querySelectorAll<HTMLElement>(".work-visual").forEach((visual) => {
    const product = visual.querySelector<HTMLElement>(".product");
    const xray = visual.querySelector<HTMLElement>(".xray");
    const pill = visual.querySelector<HTMLElement>(".xray-pill");
    const toggle = visual.querySelector<HTMLButtonElement>(".xray-toggle");
    const stage = visual.querySelector<HTMLElement>(".stage");
    if (!product || !xray || !stage) return;

    const scan = visual.querySelector<HTMLElement>(".scan");
    const lock = () => {
      if (visual.classList.contains("is-xray")) return;
      const h = product.offsetHeight;
      if (h > 0) stage.style.height = `${Math.ceil(h)}px`;
    };
    lock();
    new ResizeObserver(lock).observe(product);

    const show = (on: boolean) => {
      visual.classList.toggle("is-xray", on);
      const pulse = visual.querySelector<HTMLElement>("[data-scene='pulse']");
      const ctl = (pulse as (HTMLElement & { __pulse?: PulseCtl }) | null)?.__pulse;
      if (on) ctl?.pause();
      else ctl?.resume();
      if (!on || !scan || reduce) return;
      scan.style.animation = "none";
      void scan.offsetWidth;
      scan.style.animation = "";
    };

    const mode = () => {
      const useTap = tap();
      if (pill) pill.hidden = useTap;
      if (toggle) toggle.hidden = !useTap;
    };
    const sync = (shift: boolean) => {
      if (tap()) return;
      show(shift && visual.matches(":hover"));
    };

    visuals.push({ show, mode, sync });
    mode();
    toggle?.addEventListener("click", () => show(!visual.classList.contains("is-xray")));
    visual.addEventListener("pointerenter", () => sync(shift));
    visual.addEventListener("pointerleave", () => {
      if (tap()) return;
      if (!shift) show(false);
    });
  });

  const refresh = () => visuals.forEach((v) => v.mode());
  mqCoarse.addEventListener("change", refresh);
  mqNarrow.addEventListener("change", refresh);

  window.addEventListener("keydown", (e) => {
    if (e.key !== "Shift") return;
    shift = true;
    visuals.forEach((v) => v.sync(true));
  });
  window.addEventListener("keyup", (e) => {
    if (e.key !== "Shift") return;
    shift = false;
    if (tap()) return;
    visuals.forEach((v) => v.show(false));
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
