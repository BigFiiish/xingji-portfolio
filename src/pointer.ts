export function initPointer() {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  if (reduce || coarse) return;

  const root = document.documentElement;
  const comet = document.createElement("div");
  comet.className = "comet";
  comet.setAttribute("aria-hidden", "true");
  document.body.append(comet);

  const startX = window.innerWidth * 0.68;
  const startY = window.innerHeight * 0.3;
  root.classList.add("has-pointer");
  root.style.setProperty("--lx", `${startX}px`);
  root.style.setProperty("--ly", `${startY}px`);
  let tx = startX;
  let ty = startY;
  let x = startX;
  let y = startY;
  let lx = startX;
  let ly = startY;
  let px = startX;
  let py = startY;
  let live = false;
  let raf = 0;

  const frame = () => {
    x += (tx - x) * 0.16;
    y += (ty - y) * 0.16;
    lx += (tx - lx) * 0.055;
    ly += (ty - ly) * 0.055;
    const vx = x - px;
    const vy = y - py;
    const spd = Math.hypot(vx, vy);
    const ang = Math.atan2(vy, vx);
    const len = Math.min(86, 18 + spd * 14);
    const on = live && spd > 0.18;
    root.style.setProperty("--lx", `${lx.toFixed(1)}px`);
    root.style.setProperty("--ly", `${ly.toFixed(1)}px`);
    comet.style.width = `${len}px`;
    comet.style.transform = `translate(${x}px, ${y}px) rotate(${ang}rad)`;
    comet.style.opacity = on ? String(Math.min(0.72, 0.12 + spd * 0.16)) : "0";
    px = x;
    py = y;
    raf = requestAnimationFrame(frame);
  };

  window.addEventListener(
    "pointermove",
    (e) => {
      if (e.pointerType === "touch") return;
      live = true;
      tx = e.clientX;
      ty = e.clientY;
    },
    { passive: true },
  );
  document.addEventListener("pointerleave", () => {
    live = false;
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) live = false;
  });

  raf = requestAnimationFrame(frame);
  window.addEventListener("pagehide", () => cancelAnimationFrame(raf), { once: true });
}
