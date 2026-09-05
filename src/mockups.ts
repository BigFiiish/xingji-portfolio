import type { Project } from "./content";

export function xrayMarkup(p: Project): string {
  return `<div class="xray-board">${diagram(p.preview)}</div>`;
}

function line(x1: number, y1: number, x2: number, y2: number): string {
  return `<path d="M ${x1} ${y1} L ${x2} ${y2}"/>`;
}

function label(x: number, y: number, t: string, cls = ""): string {
  return `<text class="${cls}" x="${x}" y="${y}" text-anchor="middle">${t}</text>`;
}

function diagram(kind: Project["preview"]): string {
  if (kind === "crawlforge") {
    return `<svg class="xray-svg" viewBox="0 0 280 340" aria-hidden="true">
      ${label(140, 22, "Careers URL")}
      ${line(140, 32, 140, 52)}
      ${label(140, 68, "Safety + robots")}
      ${line(140, 78, 140, 98)}
      ${label(140, 114, "Durable BFS")}
      ${line(140, 124, 140, 152)}
      ${line(60, 152, 220, 152)}
      ${label(60, 174, "JSON-LD")}
      ${label(140, 174, "jsoup")}
      ${label(220, 174, "Dedup")}
      ${line(140, 184, 140, 212)}
      ${label(140, 228, "Job postings")}
      ${line(140, 238, 140, 266)}
      ${line(76, 266, 204, 266)}
      ${label(76, 288, "JSON / CSV")}
      ${label(204, 288, "Match")}
      ${line(204, 298, 204, 318)}
      ${label(204, 334, "Optional AI")}
    </svg>`;
  }
  if (kind === "catalog") {
    return `<svg class="xray-svg" viewBox="0 0 280 340" aria-hidden="true">
      ${label(140, 22, "Browser")}
      ${line(140, 32, 140, 52)}
      ${label(140, 68, "REST + API key")}
      ${line(140, 78, 140, 98)}
      ${label(140, 114, "OrderService")}
      ${line(140, 124, 140, 144)}
      ${label(140, 160, "TransactionTemplate")}
      ${line(140, 170, 140, 198)}
      ${line(52, 198, 228, 198)}
      ${label(52, 220, "Stock SQL")}
      ${label(140, 220, "Orders + items")}
      ${label(228, 220, "Unique key")}
      ${line(140, 230, 140, 258)}
      ${label(140, 274, "Commit")}
      ${line(140, 284, 140, 304)}
      ${label(140, 320, "Async webhook")}
    </svg>`;
  }
  if (kind === "clearbay") {
    return `<svg class="xray-svg" viewBox="0 0 280 320" aria-hidden="true">
      ${label(140, 22, "Browser")}
      ${line(140, 32, 140, 52)}
      ${label(140, 68, "REST")}
      ${line(140, 78, 140, 98)}
      ${label(140, 114, "JWT tenant")}
      ${line(140, 124, 140, 144)}
      ${label(140, 160, "Service")}
      ${line(140, 170, 140, 198)}
      ${line(70, 198, 210, 198)}
      ${label(70, 220, "Postgres")}
      ${label(140, 220, "Redis")}
      ${label(210, 220, "Jobs")}
      ${line(210, 230, 210, 258)}
      ${label(210, 274, "Audit")}
    </svg>`;
  }
  if (kind === "grantline") {
    return `<svg class="xray-svg" viewBox="0 0 280 300" aria-hidden="true">
      ${label(140, 24, "Console")}
      ${line(140, 36, 140, 56)}
      ${label(140, 72, "Challenge")}
      ${line(140, 84, 140, 104)}
      ${label(140, 120, "ed25519 proof")}
      ${line(140, 132, 140, 152)}
      ${label(140, 168, "Signed grant")}
      ${line(140, 180, 140, 200)}
      ${label(140, 216, "Policy")}
      ${line(140, 228, 140, 248)}
      ${label(140, 264, "Session")}
    </svg>`;
  }
  if (kind === "durable") {
    return `<svg class="xray-svg" viewBox="0 0 280 340" aria-hidden="true">
      ${label(140, 22, "Next.js")}
      ${line(140, 32, 140, 52)}
      ${label(140, 68, "Workflow")}
      ${line(140, 78, 140, 98)}
      ${label(140, 114, "Parallel Research")}
      ${line(140, 124, 140, 144)}
      ${label(140, 160, "Draft")}
      ${line(140, 170, 140, 190)}
      ${label(140, 206, "Evaluator / Revision")}
      ${line(140, 216, 140, 236)}
      ${label(140, 252, "Human Hook")}
      ${line(140, 262, 140, 282)}
      ${label(140, 298, "Publish")}
    </svg>`;
  }
  if (kind === "pulse") {
    return `<svg class="xray-svg" viewBox="0 0 280 340" aria-hidden="true">
      ${label(140, 22, "Dashboard")}
      ${line(140, 32, 140, 52)}
      ${label(140, 68, "SSE")}
      ${line(140, 78, 140, 98)}
      ${label(140, 114, "Express")}
      ${line(140, 124, 140, 144)}
      ${label(140, 160, "Worker pool")}
      ${line(140, 170, 140, 190)}
      ${label(140, 206, "Queue / lease")}
      ${line(140, 216, 140, 236)}
      ${label(140, 252, "Retry / backoff")}
      ${line(140, 262, 140, 282)}
      ${label(140, 298, "DLQ")}
    </svg>`;
  }
  if (kind === "dockline") {
    return `<svg class="xray-svg" viewBox="0 0 280 260" aria-hidden="true">
      ${label(140, 24, "Prompt")}
      ${line(140, 36, 140, 56)}
      ${label(140, 72, "Router")}
      ${line(140, 84, 140, 104)}
      ${label(140, 120, "MCP")}
      ${line(140, 132, 140, 152)}
      ${label(140, 168, "Rule scorer")}
      ${line(140, 180, 140, 200)}
      ${label(140, 216, "Trace")}
    </svg>`;
  }
  return `<svg class="xray-svg" viewBox="0 0 280 180" aria-hidden="true">
    ${label(140, 40, "Client")}
    ${line(140, 52, 140, 88)}
    ${label(140, 108, "Protocol")}
    ${line(140, 120, 140, 156)}
    ${label(140, 172, "Room")}
  </svg>`;
}
