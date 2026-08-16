export type FailId = "retry" | "race" | "fail" | "hallucinate";

export const failDemos: {
  id: FailId;
  kicker: string;
  title: string;
  from: string;
  to: string;
  project: string;
  slugs: string[];
  line: string;
}[] = [
  {
    id: "retry",
    kicker: "Retry",
    title: "Duplicate billing request",
    from: "POST /invoice twice.",
    to: "CREATED · REPLAYED · #482",
    project: "Clearbay",
    slugs: ["clearbay"],
    line: "Duplicate execution. Same outcome.",
  },
  {
    id: "race",
    kicker: "Race",
    title: "Two concurrent writes",
    from: "Both read version = 8.",
    to: "200 · version 9  /  409 CONFLICT",
    project: "Clearbay",
    slugs: ["clearbay"],
    line: "Concurrent writes do not silently overwrite each other.",
  },
  {
    id: "fail",
    kicker: "Fail",
    title: "Job fails repeatedly",
    from: "1s · 2s · 4s",
    to: "DEAD LETTER",
    project: "PulseQueue",
    slugs: ["pulsequeue"],
    line: "Infinite retry is not resilience.",
  },
  {
    id: "hallucinate",
    kicker: "Hallucinate",
    title: "Untrusted tool call",
    from: "SCHEMA → AUTH → EXECUTE",
    to: "SCHEMA REJECTED",
    project: "Dockline",
    slugs: ["dockline"],
    line: "The model is an untrusted caller.",
  },
];

export function failSection(): string {
  return `
    <div class="play-pause">
      <p class="pause-a reveal">Happy paths are easy.</p>
      <p class="pause-b reveal delay-1">I design the other paths.</p>
    </div>
    <div class="play-words" role="tablist" aria-label="Failure simulations">
      ${failDemos
        .map(
          (d) =>
            `<button type="button" role="tab" class="play-word" data-fail="${d.id}" aria-selected="false">${d.kicker}</button>`,
        )
        .join("")}
    </div>
    <div class="play-stage" id="play-stage" hidden></div>
    <button type="button" class="play-reset" data-reset hidden>Reset</button>`;
}

function stage(id: FailId): string {
  const d = failDemos.find((x) => x.id === id)!;
  if (id === "retry") {
    return `<p class="mono">POST /invoice</p><p class="mono mute">POST /invoice</p><p class="gate">idempotency</p><p class="big">#482</p><p class="split">CREATED &nbsp; REPLAYED</p><p class="line">${d.line}</p>`;
  }
  if (id === "race") {
    return `<p class="mono">version = 8</p><p class="split">WRITE A &nbsp; WRITE B</p><p class="split">200 / v9 &nbsp; 409</p><p class="line">${d.line}</p>`;
  }
  if (id === "fail") {
    return `<p class="mono">attempt 1</p><p class="mute">1s</p><p class="mono">attempt 2</p><p class="mute">2s</p><p class="mono">attempt 3</p><p class="big">DLQ</p><p class="line">${d.line}</p>`;
  }
  return `<p class="mono">AGENT CALL</p><p class="mute">schema → auth → execute</p><p class="big">SCHEMA REJECTED</p><p class="line">${d.line}</p>`;
}

export function bindFailures(root: HTMLElement) {
  const stageEl = root.querySelector<HTMLElement>("#play-stage");
  const reset = root.querySelector<HTMLButtonElement>("[data-reset]");
  const words = [...root.querySelectorAll<HTMLButtonElement>(".play-word")];
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const close = () => {
    words.forEach((w) => {
      w.classList.remove("on", "dim");
      w.setAttribute("aria-selected", "false");
    });
    if (stageEl) {
      stageEl.hidden = true;
      stageEl.innerHTML = "";
      stageEl.classList.remove("play");
    }
    if (reset) reset.hidden = true;
  };

  const open = (id: FailId) => {
    words.forEach((w) => {
      const on = w.dataset.fail === id;
      w.classList.toggle("on", on);
      w.classList.toggle("dim", !on);
      w.setAttribute("aria-selected", String(on));
    });
    if (stageEl) {
      stageEl.hidden = false;
      stageEl.innerHTML = stage(id);
      stageEl.classList.remove("play");
      void stageEl.offsetWidth;
      if (!reduce) stageEl.classList.add("play");
    }
    if (reset) reset.hidden = false;
  };

  words.forEach((w) => w.addEventListener("click", () => open((w.dataset.fail as FailId) ?? "retry")));
  reset?.addEventListener("click", close);

  root.querySelectorAll<HTMLButtonElement>("[data-run]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const wrap = btn.closest(".case-run");
      if (!wrap) return;
      wrap.classList.add("play");
      let slot = wrap.querySelector(".case-stage");
      if (!slot) {
        slot = document.createElement("div");
        slot.className = "case-stage";
        wrap.append(slot);
      }
      slot.innerHTML = stage((btn.dataset.run as FailId) ?? "retry");
    });
  });
}

export function caseFails(slug: string): string {
  const hits = failDemos.filter((d) => d.slugs.includes(slug));
  if (!hits.length) return "";
  const d = hits[0];
  return `<div class="case-run" data-fail="${d.id}">
    <button type="button" data-run="${d.id}">Run ${d.kicker.toLowerCase()}</button>
    <p class="line">${d.line}</p>
  </div>`;
}
