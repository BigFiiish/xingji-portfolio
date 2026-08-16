import { domains } from "./content";

export function initMap(svg: SVGSVGElement) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobile = window.matchMedia("(max-width: 860px)").matches;
  const cx = 200;
  const cy = 200;
  const radii = [72, 118, 164];

  svg.setAttribute("viewBox", "0 0 400 400");
  svg.innerHTML = `
    <defs>
      <radialGradient id="xyg" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#d8d4cc" stop-opacity="0.16"/>
        <stop offset="100%" stop-color="#d8d4cc" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <circle class="map-glow" cx="${cx}" cy="${cy}" r="36" fill="url(#xyg)"/>
    ${radii.map((r, i) => `<circle class="orbit" data-orbit="${i}" cx="${cx}" cy="${cy}" r="${r}" fill="none"/>`).join("")}
    ${Array.from({ length: 6 }, (_, i) => {
      const orbit = radii[i % 3];
      const a = (i / 6) * Math.PI * 2;
      return `<circle class="particle" data-orbit="${i % 3}" data-a="${a}" cx="${cx + Math.cos(a) * orbit}" cy="${cy + Math.sin(a) * orbit}" r="0.8"/>`;
    }).join("")}
    <g class="hub">
      <circle cx="${cx}" cy="${cy}" r="18" />
      <text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle">XY</text>
    </g>
    ${domains
      .map((d, i) => {
        const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 3;
        const r = radii[i] ?? 118;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        return `<g class="domain" data-domain="${d.id}" data-href="${d.href}" data-i="${i}" tabindex="0" role="link" aria-label="${d.label}. ${d.related.map((x) => x.name).join(" and ")}">
          <circle class="domain-dot" cx="${x}" cy="${y}" r="3.2"/>
          <text class="domain-label" x="${x}" y="${y - 14}" text-anchor="middle">${d.label}</text>
        </g>`;
      })
      .join("")}
  `;

  const wrap = svg.closest(".hero-map");
  const readout = document.querySelector<HTMLElement>("#map-readout");
  const dots = [...svg.querySelectorAll<SVGGElement>(".domain")];
  const orbits = [...svg.querySelectorAll<SVGCircleElement>(".orbit")];
  const particles = [...svg.querySelectorAll<SVGCircleElement>(".particle")];

  const paintReadout = (i?: number) => {
    if (!readout) return;
    const domain = i === undefined ? undefined : domains[i];
    if (!domain) {
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
    readout.replaceChildren(line);
  };

  const go = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  };

  wrap?.addEventListener("pointerenter", () => svg.classList.add("awake"));
  wrap?.addEventListener("pointerleave", () => {
    svg.classList.remove("awake");
    paintReadout();
  });

  dots.forEach((g) => {
    const href = g.dataset.href ?? "#work";
    const i = Number(g.dataset.i);
    const domain = domains[i];
    g.addEventListener("click", () => go(href));
    g.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        go(href);
      }
    });
    g.addEventListener("pointerenter", () => {
      svg.classList.add("awake");
      svg.dataset.hot = g.dataset.domain;
      if (domain) svg.style.setProperty("--map-accent", domain.accent);
      orbits.forEach((o, n) => o.classList.toggle("hot", n === i));
      orbits.forEach((o, n) => o.classList.toggle("dim", n !== i));
      dots.forEach((d) => d.classList.toggle("dim", d !== g));
      paintReadout(i);
    });
    g.addEventListener("pointerleave", () => {
      svg.dataset.hot = "";
      svg.style.removeProperty("--map-accent");
      orbits.forEach((o) => o.classList.remove("dim", "hot"));
      dots.forEach((d) => d.classList.remove("dim"));
    });
  });

  if (mobile || reduce) return;

  let t = 0;
  let px = 0;
  let py = 0;
  const tick = () => {
    t += 0.0014;
    dots.forEach((g, i) => {
      const r = radii[i] ?? 118;
      const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 3 + t;
      const x = cx + Math.cos(angle) * r + px * 4;
      const y = cy + Math.sin(angle) * r + py * 4;
      g.querySelector("circle")?.setAttribute("cx", String(x));
      g.querySelector("circle")?.setAttribute("cy", String(y));
      g.querySelector("text")?.setAttribute("x", String(x));
      g.querySelector("text")?.setAttribute("y", String(y - 14));
    });
    particles.forEach((p, i) => {
      const orbit = radii[Number(p.dataset.orbit) || 0];
      const a = Number(p.dataset.a) + t * (0.9 + (i % 3) * 0.15);
      p.setAttribute("cx", String(cx + Math.cos(a) * orbit));
      p.setAttribute("cy", String(cy + Math.sin(a) * orbit));
    });
    requestAnimationFrame(tick);
  };
  tick();

  wrap?.addEventListener("pointermove", (e) => {
    const r = svg.getBoundingClientRect();
    px = ((e as PointerEvent).clientX - r.left) / r.width - 0.5;
    py = ((e as PointerEvent).clientY - r.top) / r.height - 0.5;
  });
  wrap?.addEventListener("pointerleave", () => {
    px = 0;
    py = 0;
  });
}
