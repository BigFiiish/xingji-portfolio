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
    from: "Invoice generate, then the same (tenant, period) again.",
    to: "Idempotency returns the existing invoice. No second charge.",
    project: "Clearbay",
    slugs: ["clearbay"],
  },
  {
    id: "race",
    kicker: "Race",
    title: "Two concurrent writes",
    from: "Two ops release the same wave.",
    to: "Optimistic lock. Loser gets 409. Stock is not double-reserved.",
    project: "Clearbay",
    slugs: ["clearbay"],
  },
  {
    id: "fail",
    kicker: "Fail",
    title: "Job fails repeatedly",
    from: "A poison message keeps throwing.",
    to: "Exponential backoff, then dead-letter. It leaves the cycle.",
    project: "PulseQueue",
    slugs: ["pulsequeue"],
  },
  {
    id: "hallucinate",
    kicker: "Hallucinate",
    title: "Unsafe / invalid tool call",
    from: "Agent invents a field, or writes as a read role.",
    to: "Schema and authorization reject it before execution.",
    project: "Dockline",
    slugs: ["dockline"],
  },
];

export function failSection(): string {
  return failDemos
    .map(
      (d) => `
    <article class="fail-card" data-fail="${d.id}" tabindex="0">
      <header>
        <span class="fail-kicker">${d.kicker}</span>
        <em>${d.project}</em>
      </header>
      <h3>${d.title}</h3>
      ${failSvg(d.id)}
      <p class="fail-from">${d.from}</p>
      <p class="fail-to">${d.to}</p>
    </article>`,
    )
    .join("");
}

export function failSvg(id: FailId): string {
  if (id === "retry") {
    return `<svg class="fail-svg" viewBox="0 0 280 72" aria-hidden="true">
      <path class="w" d="M 16 24 H 120 H 200"/>
      <path class="w alt" d="M 16 52 H 120 H 200"/>
      <rect x="8" y="12" width="54" height="24" rx="4"/><text x="35" y="28">req 1</text>
      <rect x="8" y="40" width="54" height="24" rx="4"/><text x="35" y="56">req 2</text>
      <rect class="ok" x="168" y="20" width="100" height="32" rx="4"/><text x="218" y="40">INV-08</text>
      <circle class="t t1" r="3"/><circle class="t t2" r="3"/>
    </svg>`;
  }
  if (id === "race") {
    return `<svg class="fail-svg" viewBox="0 0 280 72" aria-hidden="true">
      <path class="w" d="M 20 24 H 150"/>
      <path class="w alt" d="M 20 52 H 150"/>
      <rect x="8" y="12" width="50" height="24" rx="4"/><text x="33" y="28">write A</text>
      <rect x="8" y="40" width="50" height="24" rx="4"/><text x="33" y="56">write B</text>
      <rect class="ok" x="168" y="8" width="96" height="24" rx="4"/><text x="216" y="24">v12 committed</text>
      <rect class="bad" x="168" y="40" width="96" height="24" rx="4"/><text x="216" y="56">409 conflict</text>
      <circle class="t t1" r="3"/><circle class="t t2" r="3"/>
    </svg>`;
  }
  if (id === "fail") {
    return `<svg class="fail-svg" viewBox="0 0 280 72" aria-hidden="true">
      <path class="w" d="M 20 36 H 110"/>
      <path class="w" d="M 110 36 Q 150 12 190 36"/>
      <path class="w alt" d="M 190 36 H 260"/>
      <rect x="8" y="24" width="48" height="24" rx="4"/><text x="32" y="40">job</text>
      <text class="n" x="150" y="14">1s · 2s · 4s</text>
      <rect class="bad" x="208" y="24" width="60" height="24" rx="4"/><text x="238" y="40">DLQ</text>
      <circle class="t t1" r="3"/>
    </svg>`;
  }
  return `<svg class="fail-svg" viewBox="0 0 280 72" aria-hidden="true">
    <path class="w" d="M 20 36 H 130"/>
    <path class="w alt" d="M 130 36 H 250"/>
    <rect x="8" y="24" width="70" height="24" rx="4"/><text x="43" y="40">tool call</text>
    <rect x="108" y="24" width="54" height="24" rx="4"/><text x="135" y="40">schema</text>
    <rect class="bad" x="196" y="24" width="72" height="24" rx="4"/><text x="232" y="40">rejected</text>
    <circle class="t t1" r="3"/>
  </svg>`;
}

export function bindFailures(root: HTMLElement) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const play = (card: HTMLElement) => {
    card.classList.remove("play");
    void card.offsetWidth;
    card.classList.add("play");
  };
  root.querySelectorAll<HTMLElement>(".fail-card").forEach((card) => {
    if (reduce) {
      card.classList.add("play");
      return;
    }
    card.addEventListener("pointerenter", () => play(card));
    card.addEventListener("focus", () => play(card));
    card.addEventListener("click", () => play(card));
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        play(card);
      }
    });
  });
}

export function caseFails(slug: string): string {
  const hits = failDemos.filter((d) => d.slugs.includes(slug));
  if (!hits.length) return "";
  return `<div class="case-fails">${hits.map((d) => `<article class="fail-card compact" data-fail="${d.id}" tabindex="0">
    <span class="fail-kicker">${d.kicker}</span>
    ${failSvg(d.id)}
    <p class="fail-to">${d.to}</p>
  </article>`).join("")}</div>`;
}
