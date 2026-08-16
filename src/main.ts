import "./style.css";
import { experience, person } from "./content";
import { initCommand } from "./command";
import { initFlow } from "./flow";
import { initMap } from "./map";
import { initPanel } from "./panel";
import { bindXray, renderMore, renderWork } from "./work";

document.documentElement.classList.add("js");

const loader = document.querySelector("#loader");
window.setTimeout(() => loader?.classList.add("gone"), 600);

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
if (more) renderMore(more);

const jobs = document.querySelector("#jobs");
if (jobs) {
  jobs.innerHTML = experience
    .map(
      (j) => `
      <li class="reveal">
        <div class="job-who"><strong>${j.company}</strong><span>${j.role}</span></div>
        <p>${j.line}</p>
        <em>${j.dates}</em>
      </li>`
    )
    .join("");
  jobs.querySelectorAll(".reveal").forEach((n) => io.observe(n));
}

const map = document.querySelector<SVGSVGElement>("#systems-map");
if (map) initMap(map);

const flow = document.querySelector<SVGSVGElement>("#page-flow");
if (flow) initFlow(flow);

initPanel();
initCommand();

document.querySelector("#mail")?.setAttribute("href", `mailto:${person.email}`);
