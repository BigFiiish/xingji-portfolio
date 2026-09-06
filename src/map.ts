import { domains } from "./content";

type Node = {
  id: string;
  x: number;
  y: number;
  label: string;
  href?: string;
  domain?: (typeof domains)[number]["id"];
  hub?: boolean;
};

const nodes: Node[] = [
  { id: "xy", x: 310, y: 248, label: "XY", hub: true },
  { id: "catalog", x: 264, y: 70, label: "Catalog Orders", domain: "reliable", href: "#catalog-order-service" },
  { id: "clearbay", x: 448, y: 82, label: "Clearbay", domain: "reliable", href: "#clearbay" },
  { id: "grantline", x: 78, y: 186, label: "Grantline", domain: "reliable", href: "#grantline" },
  { id: "crawlforge", x: 514, y: 380, label: "CrawlForge", domain: "reliable", href: "#crawlforge" },
  { id: "pulsequeue", x: 548, y: 158, label: "PulseQueue", domain: "infra", href: "#pulsequeue" },
  { id: "durable", x: 168, y: 418, label: "Durable Brief", domain: "ai", href: "#durable-brief" },
  { id: "dockline", x: 418, y: 452, label: "Dockline", domain: "ai", href: "#dockline" },
  { id: "resumatch", x: 76, y: 334, label: "ResuMatch", domain: "ai", href: "#resumatch" },
  { id: "sketchsync", x: 600, y: 302, label: "SketchSync", domain: "infra", href: "#sketchsync" },
];

const edges: [string, string][] = [
  ["grantline", "xy"],
  ["catalog", "xy"],
  ["xy", "pulsequeue"],
  ["xy", "clearbay"],
  ["xy", "crawlforge"],
  ["catalog", "clearbay"],
  ["grantline", "durable"],
  ["pulsequeue", "durable"],
  ["durable", "dockline"],
  ["resumatch", "durable"],
  ["pulsequeue", "sketchsync"],
];

const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
const projectHashes = new Set(nodes.flatMap((node) => (node.href ? [node.href] : [])));

const esc = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

function pathD(a: string, b: string): string {
  const p = byId[a];
  const q = byId[b];
  const lift = (q.y - p.y) * 0.18 + (q.x - p.x) * 0.04;
  const mx = (p.x + q.x) / 2 + lift * 0.12;
  const my = (p.y + q.y) / 2 - Math.abs(q.x - p.x) * 0.06;
  return `M ${p.x} ${p.y} Q ${mx} ${my} ${q.x} ${q.y}`;
}

function projectOffset(): number {
  const nav = document.querySelector<HTMLElement>(".nav");
  return Math.max(nav?.getBoundingClientRect().height ?? 0, 56) + 16;
}

function jumpToProject(hash: string, reduce: boolean, updateHistory = true): boolean {
  if (!projectHashes.has(hash)) return false;
  const target = document.getElementById(decodeURIComponent(hash.slice(1)));
  if (!target) return false;

  if (updateHistory && location.hash !== hash) history.pushState(null, "", hash);
  else if (updateHistory) history.replaceState(null, "", hash);

  document.querySelectorAll<HTMLElement>(".is-anchor-target").forEach((item) => {
    item.classList.remove("is-anchor-target");
  });
  target.classList.add("is-anchor-target");
  target.setAttribute("tabindex", "-1");

  const exactTop = () =>
    Math.max(0, window.scrollY + target.getBoundingClientRect().top - projectOffset());
  window.scrollTo({ top: exactTop(), behavior: reduce ? "auto" : "smooth" });

  const settle = () => {
    const correction = target.getBoundingClientRect().top - projectOffset();
    if (Math.abs(correction) > 2) window.scrollBy({ top: correction, behavior: "auto" });
    target.focus({ preventScroll: true });
  };
  window.setTimeout(settle, reduce ? 0 : 700);
  document.fonts?.ready
    .then(() => window.setTimeout(settle, reduce ? 0 : 700))
    .catch(() => undefined);
  return true;
}

export function initMap(svg: SVGSVGElement) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wrap = svg.closest<HTMLElement>(".hero-map");
  const readout = document.querySelector<HTMLElement>("#map-readout");

  svg.setAttribute("viewBox", "0 0 680 520");
  svg.setAttribute("preserveAspectRatio", "xMidYMid meet");

  const edgeMarkup = edges
    .map(([a, b]) => {
      const da = byId[a].domain ?? "";
      const db = byId[b].domain ?? "";
      return `<path class="topo-edge" data-a="${a}" data-b="${b}" data-da="${da}" data-db="${db}" d="${pathD(a, b)}" fill="none"/>`;
    })
    .join("");

  const pulsePaths = reduce
    ? ""
    : [
        pathD("catalog", "xy"),
        pathD("catalog", "clearbay"),
        pathD("xy", "pulsequeue"),
        pathD("xy", "crawlforge"),
        pathD("grantline", "durable"),
        pathD("pulsequeue", "sketchsync"),
      ]
        .map(
          (d, i) => `
        <circle class="topo-pulse" r="2.55">
          <animateMotion dur="${12 + i * 2.2}s" begin="${i * 1.8}s" repeatCount="indefinite" path="${d}" />
        </circle>`,
        )
        .join("");

  svg.innerHTML = `
    ${edgeMarkup}
    ${pulsePaths}
    ${nodes
      .map((n) => {
        const domain = domains.find((d) => d.id === n.domain);
        if (n.hub) {
          return `<g class="topo-node hub" data-id="${n.id}" aria-hidden="true">
          <circle class="topo-hit" cx="${n.x}" cy="${n.y}" r="${n.hub ? 28 : 20}"/>
          <circle class="topo-halo" cx="${n.x}" cy="${n.y}" r="22"/>
          <circle class="topo-dot" cx="${n.x}" cy="${n.y}" r="17"/>
          <text class="topo-hub" x="${n.x}" y="${n.y}" text-anchor="middle" dominant-baseline="middle">XY</text>
        </g>`;
        }
        const aria = `${n.label}. ${domain?.label ?? "Software project"}. Open project.`;
        return `<a class="topo-link" href="${esc(n.href ?? "#work")}" data-id="${n.id}" data-domain="${n.domain ?? ""}" aria-label="${esc(aria)}">
          <title>${esc(aria)}</title>
          <g class="topo-node" data-id="${n.id}" data-domain="${n.domain ?? ""}">
            <circle class="topo-hit" cx="${n.x}" cy="${n.y}" r="22"/>
            <circle class="topo-dot" cx="${n.x}" cy="${n.y}" r="4.4"/>
            <text class="topo-label" x="${n.x}" y="${n.y - 16}" text-anchor="${n.x > 520 ? "end" : "middle"}">${esc(n.label)}</text>
          </g>
        </a>`;
      })
      .join("")}
    ${domains
      .map((d) => {
        const pts = nodes.filter((n) => n.domain === d.id);
        const x = pts.reduce((s, n) => s + n.x, 0) / pts.length;
        const y = Math.min(...pts.map((n) => n.y)) - 36;
        return `<text class="topo-domain" data-domain="${d.id}" x="${x}" y="${y}" text-anchor="middle">${d.label}</text>`;
      })
      .join("")}
  `;

  const paintReadout = (id?: string) => {
    if (!readout) return;
    const node = nodes.find((n) => n.id === id && !n.hub);
    const domain = domains.find((d) => d.id === node?.domain);
    if (!node || !domain) {
      readout.replaceChildren();
      return;
    }
    const line = document.createElement("span");
    domain.related.forEach((rel, n) => {
      if (n) line.append(" / ");
      const a = document.createElement("a");
      a.href = rel.href;
      a.textContent = rel.name;
      line.append(a);
    });
    const cap = document.createElement("small");
    cap.textContent = domain.detail;
    readout.replaceChildren(line, document.createElement("br"), cap);
  };

  const setHot = (id: string) => {
    const node = byId[id];
    svg.classList.add("awake");
    if (node?.hub) {
      delete svg.dataset.hot;
      delete svg.dataset.domain;
      paintReadout();
      return;
    }
    svg.dataset.hot = id;
    if (node?.domain) svg.dataset.domain = node.domain;
    else delete svg.dataset.domain;
    paintReadout(id);
  };

  const clearHot = () => {
    delete svg.dataset.hot;
    delete svg.dataset.domain;
    paintReadout();
  };

  wrap?.addEventListener("pointerenter", () => svg.classList.add("awake"));
  wrap?.addEventListener("pointerleave", () => {
    svg.classList.remove("awake");
    clearHot();
  });
  wrap?.addEventListener(
    "pointermove",
    (e: PointerEvent) => {
      const ctm = svg.getScreenCTM();
      if (!ctm) return;
      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const p = pt.matrixTransform(ctm.inverse());
      let best = "";
      let near = 92;
      for (const n of nodes) {
        if (n.hub) continue;
        const d = Math.hypot(n.x - p.x, n.y - p.y);
        if (d < near) {
          near = d;
          best = n.id;
        }
      }
      if (best) setHot(best);
      else clearHot();
    },
    { passive: true },
  );

  svg.querySelectorAll<SVGAElement>(".topo-link").forEach((link) => {
    const id = link.dataset.id;
    if (!id) return;
    link.addEventListener("focus", () => setHot(id));
    link.addEventListener("blur", clearHot);
    link.addEventListener("pointerenter", () => setHot(id));
  });

  document
    .querySelectorAll<Element>(".topo-link, .map-links a, .work-directory a")
    .forEach((link) => {
      link.addEventListener("click", (event) => {
        const hash = link.getAttribute("href") ?? "";
        if (!jumpToProject(hash, reduce)) return;
        event.preventDefault();
      });
    });

  const restoreProjectHash = () => {
    if (!projectHashes.has(location.hash)) return;
    jumpToProject(location.hash, true, false);
  };
  window.addEventListener("popstate", restoreProjectHash);
  if (document.readyState === "complete") restoreProjectHash();
  else window.addEventListener("load", restoreProjectHash, { once: true });
}
