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
  ["pulsequeue", "sketchsync"],
];

const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));

function pathD(a: string, b: string): string {
  const p = byId[a];
  const q = byId[b];
  const lift = (q.y - p.y) * 0.18 + (q.x - p.x) * 0.04;
  const mx = (p.x + q.x) / 2 + lift * 0.12;
  const my = (p.y + q.y) / 2 - Math.abs(q.x - p.x) * 0.06;
  return `M ${p.x} ${p.y} Q ${mx} ${my} ${q.x} ${q.y}`;
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
        const aria = n.hub
          ? "Xingji Yan"
          : `${n.label}. ${domain?.label ?? ""}`;
        return `<g class="topo-node${n.hub ? " hub" : ""}" data-id="${n.id}" data-domain="${n.domain ?? ""}" data-href="${n.href ?? ""}" tabindex="${n.hub ? -1 : 0}" role="${n.hub ? "presentation" : "link"}" aria-label="${aria}">
          <circle class="topo-hit" cx="${n.x}" cy="${n.y}" r="${n.hub ? 28 : 20}"/>
          ${n.hub ? `<circle class="topo-halo" cx="${n.x}" cy="${n.y}" r="22"/>` : ""}
          <circle class="topo-dot" cx="${n.x}" cy="${n.y}" r="${n.hub ? 17 : 4.4}"/>
          ${n.hub ? `<text class="topo-hub" x="${n.x}" y="${n.y}" text-anchor="middle" dominant-baseline="middle">XY</text>` : ""}
          ${n.hub ? "" : `<text class="topo-label" x="${n.x}" y="${n.y - 16}" text-anchor="${n.x > 520 ? "end" : "middle"}">${n.label}</text>`}
        </g>`;
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

  const go = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
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

  svg.querySelectorAll<SVGGElement>(".topo-node").forEach((g) => {
    const href = g.dataset.href;
    if (!href) return;
    g.addEventListener("click", () => go(href));
    g.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      go(href);
    });
  });
}
