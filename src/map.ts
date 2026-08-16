import { domains } from "./content";

export function initMap(svg: SVGSVGElement) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobile = window.matchMedia("(max-width: 860px)").matches;
  const cx = 160;
  const cy = 168;
  const radii = [56, 92, 128];

  svg.setAttribute("viewBox", "0 0 320 336");
  svg.innerHTML = `
    <defs>
      <radialGradient id="xyg" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#9ecbff" stop-opacity="0.28"/>
        <stop offset="100%" stop-color="#9ecbff" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <circle class="map-glow" cx="${cx}" cy="${cy}" r="32" fill="url(#xyg)"/>
    ${radii
      .map((r, i) => `<circle class="orbit" data-orbit="${i}" cx="${cx}" cy="${cy}" r="${r}" fill="none"/>`)
      .join("")}
    ${Array.from({ length: 9 }, (_, i) => {
      const orbit = radii[i % 3];
      const a = (i / 9) * Math.PI * 2;
      return `<circle class="particle" data-orbit="${i % 3}" data-a="${a}" cx="${cx + Math.cos(a) * orbit}" cy="${cy + Math.sin(a) * orbit}" r="0.9"/>`;
    }).join("")}
    <g class="hub">
      <circle cx="${cx}" cy="${cy}" r="17" />
      <text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle">XY</text>
    </g>
    ${domains
      .map((d, i) => {
        const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 3;
        const r = radii[i] ?? 92;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        return `<g class="domain" data-domain="${d.id}" data-href="${d.href}" data-i="${i}" tabindex="0" role="link" aria-label="${d.label}. ${d.detail}">
          <circle class="domain-dot" cx="${x}" cy="${y}" r="4.2"/>
          <text class="domain-label" x="${x}" y="${y - 14}" text-anchor="middle">${d.label}</text>
        </g>`;
      })
      .join("")}
  `;

  const readout = document.querySelector<HTMLElement>("#map-readout");
  const dots = [...svg.querySelectorAll<SVGGElement>(".domain")];
  const orbits = [...svg.querySelectorAll<SVGCircleElement>(".orbit")];
  const particles = [...svg.querySelectorAll<SVGCircleElement>(".particle")];

  const go = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  };

  dots.forEach((g) => {
    const href = g.dataset.href ?? "#work";
    g.addEventListener("click", () => go(href));
    g.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        go(href);
      }
    });
    g.addEventListener("pointerenter", () => {
      svg.dataset.hot = g.dataset.domain;
      orbits.forEach((o, i) => o.classList.toggle("hot", String(i) === g.dataset.i));
      orbits.forEach((o, i) => o.classList.toggle("dim", String(i) !== g.dataset.i));
      dots.forEach((d) => d.classList.toggle("dim", d !== g));
      const domain = domains[Number(g.dataset.i)];
      if (readout && domain) readout.textContent = domain.detail;
    });
    g.addEventListener("pointerleave", () => {
      svg.dataset.hot = "";
      orbits.forEach((o) => o.classList.remove("dim", "hot"));
      dots.forEach((d) => d.classList.remove("dim"));
      if (readout) readout.textContent = "Correctness · state · failure · humans";
    });
  });

  if (mobile || reduce) return;

  let t = 0;
  let px = 0;
  let py = 0;
  const tick = () => {
    t += 0.0026;
    dots.forEach((g, i) => {
      const r = radii[i] ?? 92;
      const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 3 + t;
      const x = cx + Math.cos(angle) * r + px * (5 + i * 2);
      const y = cy + Math.sin(angle) * r + py * (5 + i * 2);
      g.querySelector("circle")?.setAttribute("cx", String(x));
      g.querySelector("circle")?.setAttribute("cy", String(y));
      const label = g.querySelector("text");
      label?.setAttribute("x", String(x));
      label?.setAttribute("y", String(y - 14));
    });
    particles.forEach((p, i) => {
      const orbit = radii[Number(p.dataset.orbit) || 0];
      const a = Number(p.dataset.a) + t * (1.4 + (i % 3) * 0.25);
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
