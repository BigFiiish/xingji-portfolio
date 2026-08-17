import "./style.css";
import { person } from "./content";
import { initCommand } from "./command";
import { bindFailures, failSection } from "./failures";
import { initMap } from "./map";
import { initPanel } from "./panel";
import { bindSecondary } from "./secondary";
import { bindXray, renderMore, renderPrinciples, renderWork } from "./work";

document.documentElement.classList.add("js");

const loader = document.querySelector("#loader");
window.setTimeout(() => loader?.classList.add("gone"), 380);

const io = new IntersectionObserver(
  (entries) => {
    for (const e of entries) if (e.isIntersecting) e.target.classList.add("in");
  },
  { threshold: 0.12 },
);
document.querySelectorAll(".reveal").forEach((n) => io.observe(n));

const work = document.querySelector<HTMLElement>("#work-list");
const more = document.querySelector<HTMLElement>("#more");
if (work) {
  renderWork(work);
  bindXray(work);
  work.querySelectorAll(".reveal").forEach((n) => io.observe(n));
}
if (more) {
  renderMore(more);
  bindSecondary(more);
}

const fails = document.querySelector<HTMLElement>("#fail-grid");
if (fails) {
  fails.innerHTML = failSection();
  bindFailures(fails);
  fails.querySelectorAll(".reveal").forEach((n) => io.observe(n));
}

const principles = document.querySelector<HTMLElement>("#principles");
if (principles) {
  renderPrinciples(principles);
  principles.querySelectorAll(".reveal").forEach((n) => io.observe(n));
}

const map = document.querySelector<SVGSVGElement>("#systems-map");
if (map) initMap(map);

initPanel();
initCommand();

document.querySelector("#mail")?.setAttribute("href", `mailto:${person.email}`);

const nav = document.querySelector(".nav");
window.addEventListener(
  "scroll",
  () => nav?.classList.toggle("dense", window.scrollY > 24),
  { passive: true },
);

const tintIO = new IntersectionObserver(
  (entries) => {
    const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!vis) {
      document.body.style.setProperty("--tint", "transparent");
      return;
    }
    const accent = (vis.target as HTMLElement).style.getPropertyValue("--accent").trim();
    document.body.style.setProperty("--tint", accent || "transparent");
  },
  { threshold: 0.45 },
);
document.querySelectorAll(".work-row").forEach((n) => tintIO.observe(n));
