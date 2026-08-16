/** Editorial scroll signal: one thin spine, motifs only at featured work. */

type Motif = "clearbay" | "grantline" | "durable-brief" | "pulsequeue" | "failures";

const MOTIFS: Motif[] = ["clearbay", "grantline", "durable-brief", "pulsequeue", "failures"];

export function initFlow(svg: SVGSVGElement) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobile = window.matchMedia("(max-width: 860px)").matches;
  if (reduce || mobile) {
    svg.style.display = "none";
    const cap = document.querySelector<HTMLElement>("#flow-cap");
    if (cap) cap.hidden = true;
    return;
  }

  const cap = document.querySelector<HTMLElement>("#flow-cap");
  if (!cap) return;

  const ns = "http://www.w3.org/2000/svg";
  svg.replaceChildren();
  svg.setAttribute("preserveAspectRatio", "none");

  const spine = document.createElementNS(ns, "path");
  spine.setAttribute("class", "flow-spine");
  spine.setAttribute("fill", "none");
  svg.append(spine);

  const motifs = document.createElementNS(ns, "g");
  motifs.setAttribute("class", "flow-motifs");
  svg.append(motifs);

  const head = document.createElementNS(ns, "circle");
  head.setAttribute("r", "1.8");
  head.setAttribute("class", "flow-head");
  svg.append(head);

  const yOf = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return 0;
    return el.getBoundingClientRect().top + window.scrollY;
  };

  const layout = () => {
    const h = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
    svg.setAttribute("viewBox", `0 0 40 ${h}`);
    svg.style.height = `${h}px`;

    const start = Math.max(120, yOf("systems-map") || 180);
    const end = Math.max(start + 400, yOf("contact") || h - 80);
    const x = 18;

    const pts = [start, ...MOTIFS.map(yOf).filter(Boolean), end];
    let d = `M ${x} ${pts[0]}`;
    for (let i = 1; i < pts.length; i++) {
      const y0 = pts[i - 1];
      const y1 = pts[i];
      const mid = (y0 + y1) / 2;
      d += ` C ${x} ${mid - 20}, ${x} ${mid + 20}, ${x} ${y1}`;
    }
    spine.setAttribute("d", d);

    motifs.replaceChildren();
    for (const id of MOTIFS) {
      const y = yOf(id);
      if (!y) continue;
      const g = document.createElementNS(ns, "g");
      g.setAttribute("data-motif", id);
      g.innerHTML = motifSvg(id, x, y);
      motifs.append(g);
    }
  };

  let ticking = false;
  const paint = () => {
    ticking = false;
    const max = document.documentElement.scrollHeight - innerHeight;
    const p = max <= 0 ? 0 : Math.min(1, Math.max(0, scrollY / max));
    const len = spine.getTotalLength();
    if (!len) return;
    const pt = spine.getPointAtLength(len * p);
    head.setAttribute("cx", String(pt.x));
    head.setAttribute("cy", String(pt.y));
    spine.style.strokeDasharray = `${len}`;
    spine.style.strokeDashoffset = `${len * (1 - p)}`;

    const view = scrollY + innerHeight * 0.42;
    let active = "";
    for (const id of MOTIFS) {
      const el = document.getElementById(id);
      if (!el) continue;
      const top = el.offsetTop;
      const on = view > top - 40 && view < top + el.offsetHeight;
      const g = motifs.querySelector(`[data-motif="${id}"]`);
      g?.classList.toggle("on", on);
      if (on) active = id;
    }

    if (p > 0.9) {
      cap.textContent = "Build → Measure → Improve.";
      cap.dataset.strong = "1";
    } else {
      cap.dataset.strong = "0";
      cap.textContent =
        active === "clearbay"
          ? "idempotency"
          : active === "grantline"
            ? "policy gate"
            : active === "durable-brief"
              ? "join · human gate"
              : active === "pulsequeue"
                ? "lease · retry · dlq"
                : active === "failures"
                  ? "unstable → resolve"
                  : "";
    }
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(paint);
  };

  layout();
  paint();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => {
    layout();
    paint();
  });
}

function motifSvg(id: Motif, x: number, y: number): string {
  if (id === "clearbay") {
    return `
      <path d="M ${x - 5} ${y - 28} V ${y + 28}" />
      <path d="M ${x + 5} ${y - 28} V ${y + 28}" />`;
  }
  if (id === "grantline") {
    return `
      <path d="M ${x} ${y - 22} L ${x + 7} ${y} L ${x} ${y + 22} L ${x - 7} ${y} Z" />`;
  }
  if (id === "durable-brief") {
    return `
      <path d="M ${x} ${y - 30} C ${x - 10} ${y - 12}, ${x - 10} ${y - 8}, ${x} ${y + 4}" />
      <path d="M ${x} ${y - 30} C ${x + 10} ${y - 12}, ${x + 10} ${y - 8}, ${x} ${y + 4}" />
      <path d="M ${x} ${y - 30} V ${y + 4}" />
      <circle cx="${x}" cy="${y + 14}" r="2.4" class="flow-gate" />`;
  }
  if (id === "failures") {
    return `
      <path d="M ${x - 8} ${y - 10} Q ${x} ${y + 18}, ${x + 8} ${y - 10}" />`;
  }
  return `
    <path d="M ${x - 6} ${y - 18} H ${x + 6}" />
    <path d="M ${x} ${y - 18} V ${y}" />
    <path d="M ${x} ${y} L ${x - 6} ${y + 16}" />
    <path d="M ${x} ${y} L ${x + 6} ${y + 16}" />`;
}
