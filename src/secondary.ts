export function secondaryPreview(slug: string): string {
  if (slug === "dockline") return dockline();
  if (slug === "sketchsync") return sketch();
  if (slug === "resumatch") return resume();
  return "";
}

function dockline(): string {
  return `
    <svg class="more-svg more-svg-dl" viewBox="0 0 240 148" aria-hidden="true">
      <path d="M 22 16 V 132"/>
      <text data-n="case" x="38" y="20">Case</text>
      <text data-n="trace" x="38" y="44">Trace</text>
      <text data-n="schema" x="38" y="68">Schema</text>
      <text data-n="read" x="38" y="92">Read only</text>
      <text data-n="tenant" x="38" y="116">Tenant</text>
      <text data-n="pass" x="38" y="140">Pass</text>
    </svg>`;
}

function sketch(): string {
  return `
    <svg class="more-svg more-svg-ss" viewBox="0 0 240 96" aria-hidden="true">
      <path class="ss-stroke" d="M 40 38 L 118 52"/>
      <g class="ss-cur ss-a">
        <path d="M 0 0 L 8 2 L 3 8 Z"/>
      </g>
      <g class="ss-cur ss-b">
        <path d="M 0 0 L 8 2 L 3 8 Z"/>
      </g>
    </svg>`;
}

function resume(): string {
  return `
    <svg class="more-svg more-svg-rm" viewBox="0 0 220 136" aria-hidden="true">
      <path d="M 16 14 V 118"/>
      <path data-n="llm-wire" d="M 16 118 H 118"/>
      <text data-n="jd" x="32" y="18">JD</text>
      <text data-n="skills" x="32" y="38">Skills</text>
      <text data-n="alias" x="32" y="58">Aliases</text>
      <text data-n="a1" x="32" y="76">Spring Boot → Spring</text>
      <text data-n="a2" x="32" y="90">React.js → React</text>
      <text data-n="tfidf" x="32" y="108">TF-IDF</text>
      <text data-n="score" x="32" y="126">Match score</text>
      <text data-n="llm" x="128" y="126">Optional LLM</text>
    </svg>`;
}

export function bindSecondary(root: HTMLElement) {
  const reduceMq = window.matchMedia("(prefers-reduced-motion: reduce)");
  const narrowMq = window.matchMedia("(max-width: 980px)");
  const frozen = () => reduceMq.matches || narrowMq.matches;
  const hold = (ms: number, alive: () => boolean) =>
    new Promise<void>((resolve) => {
      window.setTimeout(resolve, alive() && !reduceMq.matches ? ms : 0);
    });

  root.querySelectorAll<HTMLElement>(".more-row").forEach((row) => {
    const slug = row.dataset.more ?? "";
    let gen = 0;
    const settle = () => {
      gen += 1;
      row.dataset.phase = "done";
    };
    const idle = () => {
      gen += 1;
      row.dataset.phase = "idle";
    };
    const play = async () => {
      if (frozen()) {
        settle();
        return;
      }
      if (row.dataset.phase !== "idle") return;
      const token = ++gen;
      const alive = () => token === gen;
      if (slug === "dockline") await docklineRun(row, alive, hold);
      else if (slug === "sketchsync") await sketchRun(row, alive, hold);
      else await resumeRun(row, alive, hold);
    };
    const leave = (e: FocusEvent | PointerEvent) => {
      const next = "relatedTarget" in e ? (e.relatedTarget as Node | null) : null;
      if (next && row.contains(next)) return;
      if (frozen()) settle();
      else idle();
    };

    if (frozen()) settle();
    else idle();

    row.addEventListener("pointerenter", () => void play());
    row.addEventListener("pointerleave", leave);
    row.addEventListener("focusin", () => void play());
    row.addEventListener("focusout", leave);
  });

  const sync = () => {
    root.querySelectorAll<HTMLElement>(".more-row").forEach((row) => {
      row.dataset.phase = frozen() ? "done" : "idle";
    });
  };
  reduceMq.addEventListener("change", sync);
  narrowMq.addEventListener("change", sync);
}

type Hold = (ms: number, alive: () => boolean) => Promise<void>;

const docklineRun = async (row: HTMLElement, alive: () => boolean, wait: Hold) => {
  const steps = ["case", "trace", "schema", "read", "tenant", "pass"] as const;
  for (const step of steps) {
    if (!alive()) return;
    row.dataset.phase = step;
    await wait(step === "pass" ? 80 : 160, alive);
  }
  if (alive()) row.dataset.phase = "done";
};

const sketchRun = async (row: HTMLElement, alive: () => boolean, wait: Hold) => {
  row.dataset.phase = "a";
  await wait(380, alive);
  if (!alive()) return;
  row.dataset.phase = "stroke";
  await wait(420, alive);
  if (!alive()) return;
  row.dataset.phase = "b";
  await wait(280, alive);
  if (alive()) row.dataset.phase = "done";
};

const resumeRun = async (row: HTMLElement, alive: () => boolean, wait: Hold) => {
  const steps = ["jd", "skills", "alias", "tfidf", "score"] as const;
  for (const step of steps) {
    if (!alive()) return;
    row.dataset.phase = step;
    await wait(150, alive);
  }
  if (alive()) row.dataset.phase = "done";
};
