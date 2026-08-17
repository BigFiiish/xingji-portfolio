import { principles, projects } from "./content";
import { moreArticle, productFigure, workCopy } from "./markup";
import { xrayMarkup } from "./mockups";
import { bindScenes, sceneMarkup, type PulseCtl } from "./scenes";
import { secondaryPreview } from "./secondary";

const featured = () => projects.filter((p) => p.featured);
const rest = () => projects.filter((p) => !p.featured);

export function renderWork(root: HTMLElement) {
  root.innerHTML = featured()
    .map((p, i) => {
      const caseBtn = `<button type="button" data-case="${p.slug}">${p.slug === "clearbay" || p.slug === "grantline" ? "Case study →" : "Case study"}</button>`;
      return `
      <article class="work-row scene-${p.slug}" id="${p.slug}" data-slug="${p.slug}" style="--accent:${p.accent}">
        ${workCopy(p, i, caseBtn)}
        <div class="work-visual">
          <p class="xray-pill">Hold <kbd>⇧</kbd> inspect system</p>
          <button class="xray-toggle" type="button" hidden>View architecture</button>
          <div class="stage">
            <div class="scan" aria-hidden="true"></div>
            <div class="stage-body product">${sceneMarkup(p)}</div>
            <div class="stage-body xray">${xrayMarkup(p)}</div>
          </div>
          ${productFigure(p)}
        </div>
      </article>`;
    })
    .join("");
  bindScenes(root);
}

export function renderMore(root: HTMLElement) {
  root.innerHTML =
    `<h3 class="more-label">Also</h3>` +
    rest()
      .map((p) => moreArticle(p, secondaryPreview(p.slug)))
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
