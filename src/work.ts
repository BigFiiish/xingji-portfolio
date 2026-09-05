import { featuredProjects, moreArticle, secondaryProjects, staticPrinciplesHtml, workCopy, workDirectoryHtml } from "./markup";
import { xrayMarkup } from "./mockups";
import { bindScenes, sceneMarkup, type PulseCtl } from "./scenes";

export function renderWork(root: HTMLElement) {
  const rows = featuredProjects()
    .map((p, i) => {
      const caseBtn = `<button type="button" data-case="${p.slug}">${p.slug === "catalog-order-service" || p.slug === "crawlforge" || p.slug === "clearbay" || p.slug === "grantline" ? "Case study →" : "Case study"}</button>`;
      return `
      <article class="work-row scene-${p.slug}" id="${p.slug}" data-slug="${p.slug}" style="--accent:${p.accent}">
        ${workCopy(p, i, caseBtn)}
        <div class="work-visual">
          <div class="view-tabs" role="tablist" aria-label="Product or architecture">
            <button type="button" class="view-tab on" role="tab" data-view="product" aria-selected="true">Product</button>
            <button type="button" class="view-tab" role="tab" data-view="xray" aria-selected="false" title="Hold Shift while hovering to preview">Architecture</button>
          </div>
          <div class="stage">
            <div class="scan" aria-hidden="true"></div>
            <div class="stage-body product">${sceneMarkup(p)}</div>
            <div class="stage-body xray">${xrayMarkup(p)}</div>
          </div>
        </div>
      </article>`;
    })
    .join("");
  root.innerHTML = `${workDirectoryHtml()}<div class="work-rows">${rows}</div>`;
  bindScenes(root);
}

export function renderMore(root: HTMLElement) {
  root.innerHTML =
    `<div class="more-heading"><span>06 more projects</span><h3>More systems</h3></div><div class="more-grid">` +
    secondaryProjects()
      .map((p) => moreArticle(p))
      .join("") +
    `</div>`;
}

export function bindXray(root: HTMLElement) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let shift = false;
  const visuals: Array<{ apply: () => void }> = [];

  root.querySelectorAll<HTMLElement>(".work-visual").forEach((visual) => {
    const product = visual.querySelector<HTMLElement>(".product");
    const xray = visual.querySelector<HTMLElement>(".xray");
    const stage = visual.querySelector<HTMLElement>(".stage");
    const productTab = visual.querySelector<HTMLButtonElement>("[data-view='product']");
    const xrayTab = visual.querySelector<HTMLButtonElement>("[data-view='xray']");
    if (!product || !xray || !stage) return;

    const scan = visual.querySelector<HTMLElement>(".scan");
    const lock = () => {
      if (visual.classList.contains("is-xray")) return;
      const h = product.offsetHeight;
      if (h > 0) stage.style.height = `${Math.ceil(h)}px`;
    };
    lock();
    new ResizeObserver(lock).observe(product);

    let chosen = false;
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

    const apply = () => {
      const on = chosen || (shift && visual.matches(":hover"));
      show(on);
      productTab?.classList.toggle("on", !on);
      xrayTab?.classList.toggle("on", on);
      productTab?.setAttribute("aria-selected", String(!on));
      xrayTab?.setAttribute("aria-selected", String(on));
    };

    productTab?.addEventListener("click", () => {
      chosen = false;
      apply();
    });
    xrayTab?.addEventListener("click", () => {
      chosen = true;
      apply();
    });

    visual.addEventListener("pointerenter", apply);
    visual.addEventListener("pointerleave", apply);
    visuals.push({ apply });
  });

  window.addEventListener("keydown", (e) => {
    if (e.key !== "Shift") return;
    shift = true;
    visuals.forEach((v) => v.apply());
  });
  window.addEventListener("keyup", (e) => {
    if (e.key !== "Shift") return;
    shift = false;
    visuals.forEach((v) => v.apply());
  });
}

export function renderPrinciples(root: HTMLElement) {
  root.innerHTML = staticPrinciplesHtml();
}
