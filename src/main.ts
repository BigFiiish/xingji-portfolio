import "./style.css";
import { Fluid } from "./fluid";
import {
  credentials,
  education,
  experience,
  projects,
  skills,
  tracks,
  type Track,
} from "./content";

const canvas = document.querySelector<HTMLCanvasElement>("#fluid")!;
let fluid: Fluid | null = null;

try {
  fluid = new Fluid(canvas);
  fluid.start();
} catch {
  canvas.style.background =
    "radial-gradient(circle at 30% 20%, #123, #05070d 55%)";
}

const loader = document.querySelector("#loader")!;
window.setTimeout(() => loader.classList.add("gone"), 1500);

const cursor = document.querySelector<HTMLElement>("#cursor")!;
const ring = cursor.querySelector<HTMLElement>(".cursor-ring")!;
const dot = cursor.querySelector<HTMLElement>(".cursor-dot")!;
let mx = innerWidth / 2;
let my = innerHeight / 2;
let rx = mx;
let ry = my;

window.addEventListener(
  "pointermove",
  (e) => {
    mx = e.clientX;
    my = e.clientY;
  },
  { passive: true }
);

const tickCursor = () => {
  rx += (mx - rx) * 0.18;
  ry += (my - ry) * 0.18;
  dot.style.transform = `translate(${mx}px, ${my}px)`;
  ring.style.transform = `translate(${rx}px, ${ry}px)`;
  requestAnimationFrame(tickCursor);
};
tickCursor();

document.querySelectorAll(".magnetic").forEach((el) => {
  const node = el as HTMLElement;
  node.addEventListener("pointerenter", () => document.body.classList.add("is-hover"));
  node.addEventListener("pointerleave", () => {
    document.body.classList.remove("is-hover");
    node.style.transform = "";
  });
  node.addEventListener("pointermove", (e) => {
    const r = node.getBoundingClientRect();
    const x = ((e as PointerEvent).clientX - r.left - r.width / 2) * 0.28;
    const y = ((e as PointerEvent).clientY - r.top - r.height / 2) * 0.28;
    node.style.transform = `translate(${x}px, ${y}px)`;
  });
});

const io = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) entry.target.classList.add("in");
    }
  },
  { threshold: 0.16 }
);
document.querySelectorAll(".reveal").forEach((n) => io.observe(n));

let activeTrack: Track = "ai";

function renderTimeline() {
  const root = document.querySelector("#timeline")!;
  root.innerHTML = experience
    .map(
      (job) => `
      <article class="job reveal in">
        <div class="job-top">
          <h3>${job.company} — ${job.role}</h3>
          <p class="meta">${job.place} · ${job.dates}</p>
        </div>
        <p class="context">${job.context}</p>
        <ul>${job.tracks[activeTrack].map((b) => `<li>${b}</li>`).join("")}</ul>
      </article>`
    )
    .join("");
}

function renderResume() {
  const edu = education
    .map((e) => `<p><strong>${e.school}</strong> — ${e.degree} · ${e.place} · ${e.dates}</p>`)
    .join("");
  const creds = `<p>${credentials.join(" · ")}</p>`;
  document.querySelector("#resume-body")!.innerHTML = `
    ${edu && `<div class="resume-edu"><h4 style="color:var(--gold);letter-spacing:.16em;text-transform:uppercase;font-size:.72rem;margin-bottom:.4rem">Education</h4>${edu}</div>`}
    <div class="resume-creds"><h4 style="color:var(--gold);letter-spacing:.16em;text-transform:uppercase;font-size:.72rem;margin:.8rem 0 .4rem">Certifications & patent</h4>${creds}</div>
  `;
}

document.querySelectorAll<HTMLButtonElement>("[data-track]").forEach((btn) => {
  btn.addEventListener("click", () => {
    activeTrack = btn.dataset.track as Track;
    document.querySelectorAll("[data-track]").forEach((b) => {
      const on = b === btn;
      b.classList.toggle("on", on);
      b.setAttribute("aria-selected", String(on));
    });
    const meta = tracks.find((t) => t.id === activeTrack);
    document.querySelector("#track-kicker")!.textContent = meta?.kicker ?? "";
    renderTimeline();
  });
});

const grid = document.querySelector("#project-grid")!;
grid.innerHTML = projects
  .map(
    (p, i) => `
    <article class="card magnetic" data-project="${i}">
      <span class="card-year">${p.year}</span>
      <h3>${p.name}</h3>
      <p>${p.blurb}</p>
      <div class="tags">${p.stack.map((s) => `<span>${s}</span>`).join("")}</div>
      <div class="card-links">
        ${p.live ? `<a href="${p.live}" target="_blank" rel="noreferrer">Live</a>` : ""}
        <a href="${p.repo}" target="_blank" rel="noreferrer">Repo</a>
      </div>
    </article>`
  )
  .join("");

grid.querySelectorAll<HTMLElement>("[data-project]").forEach((card) => {
  card.addEventListener("pointerenter", (e) => {
    const p = projects[Number(card.dataset.project)];
    const r = canvas.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width;
    const ny = 1 - (e.clientY - r.top) / r.height;
    fluid?.splatAt(nx, ny, 40, -20, p.accent as [number, number, number], 0.0007);
    document.body.classList.add("is-hover");
  });
  card.addEventListener("pointerleave", () => document.body.classList.remove("is-hover"));
  card.addEventListener("pointermove", (e) => {
    const b = card.getBoundingClientRect();
    const px = (e.clientX - b.left) / b.width - 0.5;
    const py = (e.clientY - b.top) / b.height - 0.5;
    card.style.transform = `rotateY(${px * 8}deg) rotateX(${-py * 8}deg) translateY(-4px)`;
  });
  card.addEventListener("pointerleave", () => {
    card.style.transform = "";
  });
});

const skillLabels: Record<string, string> = {
  languages: "Languages",
  backend: "Backend",
  frontend: "Frontend",
  data: "Data",
  ai: "AI",
  cloud: "Cloud",
};

const board = document.querySelector("#skills-board")!;
board.innerHTML = (Object.entries(skills) as [string, string[]][])
  .map(
    ([k, vals]) => `
    <div class="skill-row reveal in">
      <h4>${skillLabels[k] ?? k}</h4>
      <div class="pills">${vals.map((v) => `<span>${v}</span>`).join("")}</div>
    </div>`
  )
  .join("");

document.querySelector("#print-resume")?.addEventListener("click", () => window.print());

renderTimeline();
renderResume();
