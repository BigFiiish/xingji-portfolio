import type { Project } from "./content";

export function productMarkup(p: Project): string {
  switch (p.preview) {
    case "clearbay":
      return `
        <div class="ui-split">
          <aside>
            <b>Acme 3PL</b>
            <small>tenant from JWT</small>
            <ul>
              <li>Inventory</li>
              <li class="on">Billing</li>
              <li>Jobs</li>
              <li>Audit</li>
            </ul>
          </aside>
          <div class="ui-main">
            <header>
              <div>
                <h4>Inventory search</h4>
                <p>one query · tenant-versioned cache</p>
              </div>
              <span class="pill ok">isolated</span>
            </header>
            <label class="tenant-sel">Tenant <b>Acme 3PL</b></label>
            <label class="search-fake">WIDGET-100 <em>sku · this tenant</em></label>
            <table>
              <thead><tr><th>Event</th><th>Key</th><th></th></tr></thead>
              <tbody>
                <tr><td>Invoice generate</td><td>period 2026-08</td><td class="ok">once</td></tr>
                <tr><td>Retry same period</td><td>period 2026-08</td><td class="mute">replayed</td></tr>
                <tr><td>Wave release</td><td>version 12</td><td class="ok">locked</td></tr>
                <tr><td>MCP write</td><td>schema + ROLE_OPS</td><td class="ok">audited</td></tr>
              </tbody>
            </table>
          </div>
        </div>`;
    case "grantline":
      return `
        <div class="ui-main pad">
          <header>
            <div>
              <h4>maya · human · admin</h4>
              <p>grant · acme · 04:12 remaining</p>
            </div>
            <span class="pill ok">ed25519</span>
          </header>
          <div class="bars">
            <div class="bar"><i style="width:68%"></i><span>grant ttl</span></div>
          </div>
          <table>
            <thead><tr><th>Subject</th><th>Resource</th><th></th></tr></thead>
            <tbody>
              <tr><td>maya</td><td>warehouse.api</td><td class="ok">open</td></tr>
              <tr><td>picker-bot</td><td>warehouse.api</td><td class="ok">open</td></tr>
              <tr><td>inv-sync</td><td>billing.api</td><td class="bad">403</td></tr>
            </tbody>
          </table>
          <p class="note">X-Tenant-Id: globex ignored. Tenant still acme.</p>
        </div>`;
    case "durable":
      return `
        <div class="ui-main pad">
          <p class="kicker">workflow · waiting on human</p>
          <h4>Q3 ops brief</h4>
          <ol class="pipe">
            <li class="done">Research <em>×3</em></li>
            <li class="done">Draft</li>
            <li class="done">Critique</li>
            <li class="done">Revise</li>
            <li class="now">Human approval</li>
            <li>Publish</li>
          </ol>
          <p class="note">Tab closed. Run still waiting. Publish has not happened.</p>
        </div>`;
    case "pulse":
      return `
        <div class="ui-main pad">
          <header>
            <div>
              <h4>workers</h4>
              <p>lease · backoff · dlq</p>
            </div>
            <span class="pill live">sse</span>
          </header>
          <div class="dots" aria-hidden="true">
            <span class="lane"><i>queued</i><i>leased</i><i>retry</i><i>complete</i><i>dlq</i></span>
            <span class="dot d1"></span>
            <span class="dot d2"></span>
            <span class="dot d3"></span>
          </div>
          <p class="dot-legend">Queued → Leased → Retry → Complete / Dead letter</p>
          <table>
            <thead><tr><th>Job</th><th>Attempt</th><th>State</th></tr></thead>
            <tbody>
              <tr><td>index.rebuild</td><td>1</td><td class="ok">leased</td></tr>
              <tr><td>erp.sync</td><td>3</td><td class="warn">backoff 8s</td></tr>
              <tr><td>mail.burst</td><td>5</td><td class="bad">dead letter</td></tr>
            </tbody>
          </table>
        </div>`;
    case "dockline":
      return `
        <div class="ui-main pad">
          <p class="kicker">eval harness · model is not the judge</p>
          <h4>40 rule-scored cases</h4>
          <div class="eval-split">
            <table class="eval">
              <thead><tr><th>Case</th><th>Rule</th><th></th></tr></thead>
              <tbody>
                <tr><td>cross-tenant tool</td><td>isolation</td><td class="ok">pass</td></tr>
                <tr><td>read role write</td><td>refusal</td><td class="ok">pass</td></tr>
                <tr><td>extra JSON field</td><td>schema</td><td class="ok">pass</td></tr>
                <tr><td>vague “do the thing”</td><td>clarify</td><td class="ok">pass</td></tr>
                <tr class="on"><td>trace missing tool</td><td>trace</td><td class="bad">fail</td></tr>
              </tbody>
            </table>
            <aside class="trace">
              <p>trace inspector</p>
              <code>tool: inventory.search
tenant: acme
span: missing
score: fail</code>
            </aside>
          </div>
        </div>`;
    default:
      return `<div class="ui-main pad"><h4>${p.name}</h4><p>${p.headline}</p></div>`;
  }
}

export function xrayMarkup(p: Project): string {
  return `<div class="xray-board">${diagram(p.preview)}</div>`;
}

function box(x: number, y: number, w: number, h: number, label: string): string {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5"/>
    <text x="${x + w / 2}" y="${y + h / 2 + 1}" text-anchor="middle" dominant-baseline="middle">${label}</text>`;
}

function vline(x: number, y1: number, y2: number): string {
  return `<path d="M ${x} ${y1} V ${y2}"/>`;
}

function diagram(kind: Project["preview"]): string {
  if (kind === "clearbay") {
    return `<svg class="xray-svg" viewBox="0 0 320 300" aria-hidden="true">
      ${box(90, 8, 140, 28, "Browser")}
      ${vline(160, 36, 50)}
      ${box(78, 50, 164, 28, "Spring REST API")}
      ${vline(160, 78, 92)}
      ${box(78, 92, 164, 28, "Tenant Context")}
      ${vline(160, 120, 134)}
      ${box(78, 134, 164, 28, "Service Layer")}
      ${vline(160, 162, 176)}
      ${box(70, 176, 180, 28, "PostgreSQL / Redis")}
      <path d="M 120 204 L 70 230"/><path d="M 200 204 L 250 230"/>
      ${box(8, 230, 124, 28, "Async Worker")}
      ${box(188, 230, 124, 28, "MCP / Audit")}
    </svg>`;
  }
  if (kind === "pulse") {
    return `<svg class="xray-svg" viewBox="0 0 320 300" aria-hidden="true">
      ${box(80, 10, 160, 28, "React Dashboard")}
      <path d="M 160 38 V 54"/><text class="xray-note" x="176" y="50">SSE</text>
      ${box(90, 54, 140, 28, "Express")}
      ${vline(160, 82, 96)}
      ${box(80, 96, 160, 28, "Worker Pool")}
      ${vline(160, 124, 138)}
      ${box(80, 138, 160, 28, "Queue Engine")}
      ${vline(160, 166, 188)}
      ${box(28, 188, 120, 28, "Retry")}
      ${box(172, 188, 120, 28, "DLQ")}
    </svg>`;
  }
  if (kind === "durable") {
    return `<svg class="xray-svg" viewBox="0 0 320 300" aria-hidden="true">
      ${box(100, 10, 120, 28, "Next.js")}
      ${vline(160, 38, 52)}
      ${box(100, 52, 120, 28, "Workflow")}
      <path d="M 160 80 V 104"/>
      <path d="M 160 104 H 48 V 118"/>
      <path d="M 160 104 H 272 V 118"/>
      <path d="M 160 104 V 118"/>
      ${box(8, 118, 88, 28, "Research ×3")}
      ${box(116, 118, 88, 28, "Draft")}
      ${box(224, 118, 88, 28, "Eval loop")}
      <path d="M 52 146 V 168 H 160"/><path d="M 160 146 V 180"/>
      <path d="M 268 146 V 168 H 160"/>
      ${box(86, 180, 148, 28, "Human hook")}
    </svg>`;
  }
  if (kind === "dockline") {
    return `<svg class="xray-svg" viewBox="0 0 320 280" aria-hidden="true">
      ${box(90, 12, 140, 28, "Prompt")}
      ${vline(160, 40, 56)}
      ${box(64, 56, 192, 28, "Deterministic router")}
      ${vline(160, 84, 100)}
      ${box(74, 100, 172, 28, "Clearbay MCP")}
      ${vline(160, 128, 144)}
      ${box(74, 144, 172, 28, "Rule scorer")}
      ${vline(160, 172, 188)}
      ${box(90, 188, 140, 28, "Trace")}
    </svg>`;
  }
  if (kind === "grantline") {
    return `<svg class="xray-svg" viewBox="0 0 320 280" aria-hidden="true">
      ${box(90, 12, 140, 28, "Console")}
      ${vline(160, 40, 56)}
      ${box(64, 56, 192, 28, "Challenge / Prove")}
      ${vline(160, 84, 100)}
      ${box(70, 100, 180, 28, "Grant (ed25519)")}
      ${vline(160, 128, 144)}
      ${box(90, 144, 140, 28, "Policy")}
      ${vline(160, 172, 188)}
      ${box(64, 188, 192, 28, "Sessions + audit")}
    </svg>`;
  }
  const items = ["Canvas", "Typed messages", "Room logic"].map(
    (label, i) => `${box(70, 16 + i * 48, 180, 28, label)}${i < 2 ? vline(160, 44 + i * 48, 64 + i * 48) : ""}`,
  );
  return `<svg class="xray-svg" viewBox="0 0 320 200">${items.join("")}</svg>`;
}

