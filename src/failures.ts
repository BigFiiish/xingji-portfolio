export type FailId = "retry" | "race" | "fail" | "hallucinate";

export const failDemos: {
  id: FailId;
  kicker: string;
  title: string;
  from: string;
  to: string;
  project: string;
  slugs: string[];
}[] = [
  {
    id: "retry",
    kicker: "Retry",
    title: "Duplicate billing request",
    from: "POST /invoice twice. Same idempotency scope.",
    to: "CREATED then REPLAYED. Same invoice #482.",
    project: "Clearbay",
    slugs: ["clearbay"],
  },
  {
    id: "race",
    kicker: "Race",
    title: "Two concurrent writes",
    from: "Both read version = 8.",
    to: "A: 200 OK version = 9. B: 409 CONFLICT.",
    project: "Clearbay",
    slugs: ["clearbay"],
  },
  {
    id: "fail",
    kicker: "Fail",
    title: "Job fails repeatedly",
    from: "attempt 1 → 1s → 2 → 2s → 3.",
    to: "DEAD LETTER. Infinite retry is not resilience.",
    project: "PulseQueue",
    slugs: ["pulsequeue"],
  },
  {
    id: "hallucinate",
    kicker: "Hallucinate",
    title: "Untrusted tool call",
    from: '{ "action": "release", "tenant": "globex", "unexpected": true }',
    to: "SCHEMA REJECTED. The model is an untrusted caller.",
    project: "Dockline",
    slugs: ["dockline"],
  },
];

export function failSection(): string {
  return `
    <div class="play-pause">
      <p class="pause-a reveal">Happy paths are easy.</p>
      <p class="pause-b reveal delay-1">I design the other paths.</p>
    </div>
    <div class="play-board">
      <div class="play-controls" role="tablist" aria-label="Failure simulations">
        ${failDemos
          .map(
            (d, i) =>
              `<button type="button" role="tab" class="play-tab${i === 0 ? " on" : ""}" data-fail="${d.id}" aria-selected="${i === 0}">${d.kicker}</button>`,
          )
          .join("")}
      </div>
      <div class="play-stage" id="play-stage">${stage("retry")}</div>
      <button type="button" class="play-reset" data-reset>Reset</button>
    </div>`;
}

function stage(id: FailId): string {
  const d = failDemos.find((x) => x.id === id)!;
  return `
    <p class="play-proj">${d.project}</p>
    <h3>${d.title}</h3>
    ${failSvg(id)}
    <p class="fail-from">${d.from}</p>
    <p class="fail-to">${d.to}</p>`;
}

export function failSvg(id: FailId): string {
  if (id === "retry") {
    return `<svg class="fail-svg" viewBox="0 0 360 88" aria-hidden="true">
      <path class="w" d="M 40 24 H 180 H 300"/>
      <path class="w alt" d="M 40 64 H 180 H 300"/>
      <text x="40" y="18">POST /invoice</text>
      <text x="40" y="58">POST /invoice</text>
      <rect class="ok" x="250" y="28" width="96" height="32" rx="4"/>
      <text x="298" y="48">#482</text>
      <circle class="t t1" r="3.5"/><circle class="t t2" r="3.5"/>
    </svg>`;
  }
  if (id === "race") {
    return `<svg class="fail-svg" viewBox="0 0 360 88" aria-hidden="true">
      <text x="24" y="18">A v=8</text>
      <text x="24" y="62">B v=8</text>
      <path class="w" d="M 70 20 H 180"/>
      <path class="w alt" d="M 70 64 H 180"/>
      <rect class="ok" x="230" y="6" width="110" height="26" rx="4"/><text x="285" y="23">200 v=9</text>
      <rect class="bad" x="230" y="50" width="110" height="26" rx="4"/><text x="285" y="67">409</text>
      <circle class="t t1" r="3.5"/><circle class="t t2" r="3.5"/>
    </svg>`;
  }
  if (id === "fail") {
    return `<svg class="fail-svg" viewBox="0 0 360 88" aria-hidden="true">
      <path class="w" d="M 24 44 H 120 Q 180 12 240 44 H 330"/>
      <text class="n" x="180" y="18">1s · 2s · 4s</text>
      <rect class="bad" x="268" y="30" width="72" height="28" rx="4"/><text x="304" y="48">DLQ</text>
      <circle class="t t1" r="3.5"/>
    </svg>`;
  }
  return `<svg class="fail-svg" viewBox="0 0 360 88" aria-hidden="true">
    <path class="w" d="M 24 44 H 140 H 230 H 330"/>
    <text x="70" y="28">SCHEMA</text>
    <text x="180" y="28">AUTH</text>
    <text x="280" y="28">EXECUTE</text>
    <rect class="bad" x="250" y="52" width="96" height="24" rx="4"/><text x="298" y="68">rejected</text>
    <circle class="t t1" r="3.5"/>
  </svg>`;
}

export function bindFailures(root: HTMLElement) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const stageEl = root.querySelector<HTMLElement>("#play-stage") ?? root.querySelector(".play-stage");
  const tabs = [...root.querySelectorAll<HTMLButtonElement>(".play-tab")];
  const play = (id: FailId) => {
    tabs.forEach((t) => {
      const on = t.dataset.fail === id;
      t.classList.toggle("on", on);
      t.setAttribute("aria-selected", String(on));
    });
    if (stageEl) {
      stageEl.innerHTML = stage(id);
      stageEl.dataset.fail = id;
      stageEl.classList.remove("play");
      void stageEl.offsetWidth;
      if (!reduce) stageEl.classList.add("play");
      else stageEl.classList.add("play");
    }
  };
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => play((tab.dataset.fail as FailId) ?? "retry"));
    tab.addEventListener("pointerenter", () => {
      if (reduce) return;
      tab.classList.add("preview");
    });
    tab.addEventListener("pointerleave", () => tab.classList.remove("preview"));
  });
  root.querySelector("[data-reset]")?.addEventListener("click", () => play("retry"));
  if (stageEl) {
    stageEl.innerHTML = stage("retry");
    stageEl.dataset.fail = "retry";
  }

  root.querySelectorAll<HTMLElement>(".fail-card").forEach((card) => {
    const run = () => {
      card.classList.remove("play");
      void card.offsetWidth;
      card.classList.add("play");
    };
    card.addEventListener("click", run);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        run();
      }
    });
  });
}

export function caseFails(slug: string): string {
  const hits = failDemos.filter((d) => d.slugs.includes(slug));
  if (!hits.length) return "";
  return `<div class="case-fails">${hits
    .map(
      (d) => `<article class="fail-card compact" data-fail="${d.id}" tabindex="0">
    <span class="fail-kicker">${d.kicker}</span>
    ${failSvg(d.id)}
    <p class="fail-to">${d.to}</p>
  </article>`,
    )
    .join("")}</div>`;
}
