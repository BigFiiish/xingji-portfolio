export type FailId = "race" | "expire" | "fail" | "hallucinate";

export const failDemos: {
  id: FailId;
  kicker: string;
  title: string;
  from: string;
  to: string;
  project: string;
  slug: string;
  slugs: string[];
  line: string;
  result: string;
}[] = [
  {
    id: "race",
    kicker: "Race",
    title: "Two buyers, one unit",
    from: "Both target stock = 1",
    to: "1 CREATED / 1 CONFLICT",
    project: "Catalog Order Service",
    slug: "catalog-order-service",
    slugs: ["catalog-order-service"],
    line: "Concurrent orders cannot oversell the last unit.",
    result: "The database admits exactly one winner; final stock is zero, never negative.",
  },
  {
    id: "expire",
    kicker: "Expire",
    title: "Grant past TTL",
    from: "TTL reaches 00:00",
    to: "EXPIRED / DENIED",
    project: "Grantline",
    slug: "grantline",
    slugs: ["grantline"],
    line: "Expired authority does not open a session.",
    result: "A signed grant is still rejected when its five-minute authority has ended.",
  },
  {
    id: "fail",
    kicker: "Fail",
    title: "Bounded retries",
    from: "1s / 2s / attempt 3",
    to: "DEAD LETTER",
    project: "PulseQueue",
    slug: "pulsequeue",
    slugs: ["pulsequeue"],
    line: "Infinite retry is not resilience.",
    result: "The job stops after its retry budget and becomes operator-visible work.",
  },
  {
    id: "hallucinate",
    kicker: "Hallucinate",
    title: "Untrusted tool call",
    from: "SCHEMA / AUTH / EXECUTE",
    to: "SCHEMA REJECTED",
    project: "Dockline",
    slug: "dockline",
    slugs: ["dockline"],
    line: "The model is an untrusted caller.",
    result: "Deterministic schema and authorization gates decide whether execution is possible.",
  },
];

const esc = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

export function failSection(): string {
  return `<div class="failure-cards" aria-label="Four failure guarantees">
    ${failDemos
      .map(
        (demo, index) => `<a class="failure-card" data-fail="${demo.id}" href="/work/${demo.slug}/#failure">
          <span class="failure-card-top"><span>${String(index + 1).padStart(2, "0")}</span><em>${esc(demo.kicker)}</em></span>
          <strong>${esc(demo.title)}</strong>
          <span class="failure-project">${esc(demo.project)}</span>
          <span class="failure-transition"><span>${esc(demo.from)}</span><b>${esc(demo.to)}</b></span>
          <span class="failure-result">${esc(demo.result)}</span>
          <span class="failure-open">Inspect the case study →</span>
        </a>`,
      )
      .join("")}
  </div>`;
}

function idFromHash(): FailId | null {
  const match = location.hash.match(/^#failures\/(race|expire|fail|hallucinate)$/i);
  return match ? (match[1].toLowerCase() as FailId) : null;
}

export function playFail(id: FailId) {
  const target = document.querySelector<HTMLAnchorElement>(`.failure-card[data-fail="${id}"]`);
  if (!target) {
    history.replaceState(history.state, "", `#failures/${id}`);
    return;
  }
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
  target.focus({ preventScroll: true });
  history.replaceState(history.state, "", `#failures/${id}`);
}

export function bindFailures(root: HTMLElement) {
  const focusFromHash = () => {
    const id = idFromHash();
    if (!id) return;
    root.querySelector<HTMLAnchorElement>(`.failure-card[data-fail="${id}"]`)?.focus({ preventScroll: true });
  };
  window.addEventListener("hashchange", focusFromHash);
  focusFromHash();
}

export function caseFails(slug: string): string {
  const demo = failDemos.find((item) => item.slugs.includes(slug));
  if (!demo) return "";
  return `<a class="case-run" href="/work/${demo.slug}/#failure">
    <strong>${esc(demo.title)}</strong>
    <span>${esc(demo.result)}</span>
  </a>`;
}
