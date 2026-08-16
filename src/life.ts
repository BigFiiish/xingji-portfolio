import type { Project } from "./content";

export function lifeMarkup(kind: Project["preview"]): string {
  switch (kind) {
    case "clearbay":
      return clearbay();
    case "grantline":
      return grantline();
    case "durable":
      return durable();
    case "pulse":
      return pulse();
    case "dockline":
      return dockline();
    default:
      return "";
  }
}

function node(x: number, y: number, label: string, w = 86): string {
  return `<g class="life-node" transform="translate(${x - w / 2} ${y - 12})">
    <rect width="${w}" height="24" rx="5"/>
    <text x="${w / 2}" y="16" text-anchor="middle">${label}</text>
  </g>`;
}

function clearbay(): string {
  return `<svg class="life-svg" viewBox="0 0 520 168" aria-hidden="true">
    <path class="life-wire" d="M 48 44 H 472"/>
    <path class="life-wire alt" d="M 268 44 V 118 H 420"/>
    ${node(48, 44, "JWT", 70)}
    ${node(158, 44, "Tenant", 78)}
    ${node(268, 44, "Service", 82)}
    ${node(378, 44, "PG / Redis", 92)}
    ${node(472, 44, "Audit", 70)}
    ${node(420, 118, "invoice exists", 110)}
    <circle class="token a" r="3.6"/>
    <circle class="token b" r="3.6"/>
    <text class="life-cap" x="268" y="158">retry · same (tenant, period) · no second charge</text>
  </svg>`;
}

function grantline(): string {
  return `<svg class="life-svg" viewBox="0 0 520 120" aria-hidden="true">
    <path class="life-wire" d="M 46 52 H 474"/>
    ${node(46, 52, "Challenge", 88)}
    ${node(156, 52, "ed25519", 82)}
    ${node(268, 52, "5-min grant", 96)}
    ${node(378, 52, "Policy", 74)}
    ${node(474, 52, "Session", 78)}
    <circle class="token a" r="3.6"/>
    <text class="life-cap" x="260" y="104">proof over nonce · tenant from grant, never a header</text>
  </svg>`;
}

function durable(): string {
  return `<svg class="life-svg" viewBox="0 0 520 168" aria-hidden="true">
    <path class="life-wire" d="M 70 36 H 450"/>
    <path class="life-wire" d="M 70 36 V 78 H 160"/>
    <path class="life-wire" d="M 70 36 V 118 H 160"/>
    <path class="life-wire" d="M 70 36 H 160"/>
    <path class="life-wire" d="M 250 36 H 450"/>
    ${node(70, 36, "Research ×3", 100)}
    ${node(250, 36, "Draft", 74)}
    ${node(350, 36, "Evaluator", 88)}
    ${node(450, 36, "Revise", 70)}
    ${node(350, 118, "Human gate", 96)}
    ${node(450, 118, "Publish", 78)}
    <path class="life-wire alt" d="M 450 36 V 78 H 350 V 106"/>
    <circle class="token a" r="3.2"/>
    <circle class="token b" r="3.2"/>
    <circle class="token c" r="3.2"/>
    <text class="life-cap" x="260" y="156">tab closed · run still waiting · publish has not happened</text>
  </svg>`;
}

function pulse(): string {
  return `<svg class="life-svg" viewBox="0 0 520 120" aria-hidden="true">
    <path class="life-wire" d="M 40 48 H 300"/>
    <path class="life-wire" d="M 300 48 H 390"/>
    <path class="life-wire ok" d="M 390 48 H 480"/>
    <path class="life-wire alt" d="M 390 48 V 92 H 480"/>
    ${node(40, 48, "Queued", 74)}
    ${node(130, 48, "Leased", 74)}
    ${node(220, 48, "Running", 78)}
    ${node(320, 48, "Retry", 70)}
    ${node(480, 48, "Complete", 86)}
    ${node(480, 92, "DLQ", 64)}
    <circle class="token a" r="3.6"/>
    <circle class="token b" r="3.6"/>
    <text class="life-cap" x="260" y="112">lease exclusivity · backoff · poison messages leave the cycle</text>
  </svg>`;
}

function dockline(): string {
  return `<svg class="life-svg" viewBox="0 0 520 120" aria-hidden="true">
    <path class="life-wire" d="M 50 48 H 300"/>
    <path class="life-wire ok" d="M 300 48 H 390 V 48 H 470"/>
    <path class="life-wire alt" d="M 300 48 V 92 H 470"/>
    ${node(50, 48, "Prompt", 74)}
    ${node(160, 48, "Router", 74)}
    ${node(270, 48, "Eval gate", 86)}
    ${node(470, 48, "Pass", 64)}
    ${node(470, 92, "Fail closed", 92)}
    <circle class="token a" r="3.6"/>
    <text class="life-cap" x="260" y="112">40 deterministic cases · the model is never the judge</text>
  </svg>`;
}

export function bindLife(root: HTMLElement) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return;
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) e.target.classList.toggle("is-live", e.isIntersecting);
    },
    { threshold: 0.35 },
  );
  root.querySelectorAll(".work-row").forEach((n) => io.observe(n));
}
