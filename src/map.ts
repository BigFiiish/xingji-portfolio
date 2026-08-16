import { domains } from "./content";

export function initMap(svg: SVGSVGElement) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobile = window.matchMedia("(max-width: 860px)").matches;
  const cx = 240;
  const cy = 248;
  const radii = [88, 148, 204];

  svg.setAttribute("viewBox", "0 0 480 500");
  svg.innerHTML = `
    <defs>
      <radialGradient id="xyg" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#c5d8f4" stop-opacity="0.42"/>
        <stop offset="55%" stop-color="#9ecbff" stop-opacity="0.14"/>
        <stop offset="100%" stop-color="#9ecbff" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <circle class="map-glow" cx="${cx}" cy="${cy}" r="52" fill="url(#xyg)"/>
    ${radii
      .map((r, i) => `<circle class="orbit" data-orbit="${i}" cx="${cx}" cy="${cy}" r="${r}" fill="none"/>`)
      .join("")}
    ${Array.from({ length: 12 }, (_, i) => {
      const orbit = radii[i % 3];
      const a = (i / 12) * Math.PI * 2;
      return `<circle class="particle" data-orbit="${i % 3}" data-a="${a}" cx="${cx + Math.cos(a) * orbit}" cy="${cy + Math.sin(a) * orbit}" r="1.15"/>`;
    }).join("")}
    <g class="hub">
      <circle cx="${cx}" cy="${cy}" r="26" />
      <text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle">XY</text>
    </g>
    ${domains
      .map((d, i) => {
        const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 3;
        const r = radii[i] ?? 148;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        return `<g class="domain" data-domain="${d.id}" data-href="${d.href}" data-i="${i}" tabindex="0" role="link" aria-label="${d.label}. ${d.related.map((x) => x.name).join(" and ")}">
          <circle class="domain-dot" cx="${x}" cy="${y}" r="5.2"/>
          <text class="domain-label" x="${x}" y="${y - 16}" text-anchor="middle">${d.label}</text>
        </g>`;
      })
      .join("")}
  `;

  const readout = document.querySelector<HTMLElement>("#map-readout");
  const dots = [...svg.querySelectorAll<SVGGElement>(".domain")];
  const orbits = [...svg.querySelectorAll<SVGCircleElement>(".orbit")];
  const particles = [...svg.querySelectorAll<SVGCircleElement>(".particle")];

  const idle = "Correctness · state · failure · humans";
  const paintReadout = (i?: number) => {
    if (!readout) return;
    const domain = i === undefined ? undefined : domains[i];
    if (!domain) {
      readout.replaceChildren(document.createTextNode(idle));
      return;
    }
    readout.replaceChildren();
    domain.related.forEach((rel, n) => {
      if (n) readout.append(" / ");
      const a = document.createElement("a");
      a.href = rel.href;
      a.textContent = rel.name;
      readout.append(a);
    });
  };

  const go = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  };

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
      svg.dataset.hot = g.dataset.domain;
      if (domain) svg.style.setProperty("--map-accent", domain.accent);
      orbits.forEach((o, n) => o.classList.toggle("hot", n === i));
      orbits.forEach((o, n) => o.classList.toggle("dim", n !== i));
      dots.forEach((d) => d.classList.toggle("dim", d !== g));
      g.querySelector(".domain-dot")?.setAttribute("fill", domain?.accent ?? "");
      paintReadout(i);
    });
    g.addEventListener("pointerleave", () => {
      svg.dataset.hot = "";
      svg.style.removeProperty("--map-accent");
      orbits.forEach((o) => o.classList.remove("dim", "hot"));
      dots.forEach((d) => d.classList.remove("dim"));
      g.querySelector(".domain-dot")?.removeAttribute("fill");
      paintReadout();
    });
  });

  if (mobile || reduce) return;

  let t = 0;
  let px = 0;
  let py = 0;
  const tick = () => {
    t += 0.0022;
    dots.forEach((g, i) => {
      const r = radii[i] ?? 148;
      const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 3 + t;
      const x = cx + Math.cos(angle) * r + px * (6 + i * 2);
      const y = cy + Math.sin(angle) * r + py * (6 + i * 2);
      g.querySelector("circle")?.setAttribute("cx", String(x));
      g.querySelector("circle")?.setAttribute("cy", String(y));
      const label = g.querySelector("text");
      label?.setAttribute("x", String(x));
      label?.setAttribute("y", String(y - 16));
    });
    particles.forEach((p, i) => {
      const orbit = radii[Number(p.dataset.orbit) || 0];
      const a = Number(p.dataset.a) + t * (1.15 + (i % 3) * 0.2);
      p.setAttribute("cx", String(cx + Math.cos(a) * orbit + px * 3));
      p.setAttribute("cy", String(cy + Math.sin(a) * orbit + py * 3));
    });
    requestAnimationFrame(tick);
  };
  tick();

  const hero = svg.closest(".hero");
  hero?.addEventListener("pointermove", (e) => {
    const r = svg.getBoundingClientRect();
    px = ((e as PointerEvent).clientX - r.left) / r.width - 0.5;
    py = ((e as PointerEvent).clientY - r.top) / r.height - 0.5;
  });
  hero?.addEventListener("pointerleave", () => {
    px = 0;
    py = 0;
  });
}
