import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = resolve(new URL("..", import.meta.url).pathname.replace(/^\/(?:([A-Za-z]:))/, "$1"));
const out = join(root, "public", "og");
const scratch = mkdtempSync(join(tmpdir(), "xingji-og-"));

const projects = [
  { slug: "crawlforge", no: "01", name: "CRAWLFORGE", title: ["Careers pages in.", "Job intelligence out."], accent: "#4FA685", meta: "JAVA 21 · BOUNDED BFS · 20 TESTS", kind: "crawl", flagship: true },
  { slug: "catalog-order-service", no: "02", name: "CATALOG ORDER SERVICE", title: ["One last unit.", "One winning order."], accent: "#E6B566", meta: "SPRING · TRANSACTIONS · 44 TESTS", kind: "catalog", flagship: true },
  { slug: "clearbay", no: "03", name: "CLEARBAY", title: ["Financial workflows", "that survive retries."], accent: "#3ECF8E", meta: "MULTI-TENANT · BILLING · MCP", kind: "clearbay", flagship: true },
  { slug: "grantline", no: "04", name: "GRANTLINE", title: ["Identity from a", "signed grant."], accent: "#5B8CFF", meta: "ED25519 · FIVE-MINUTE TTL · POLICY", kind: "grant" },
  { slug: "durable-brief", no: "05", name: "DURABLE BRIEF", title: ["AI workflows", "that can wait."], accent: "#8F7BFF", meta: "EVALUATE · RESUME · HUMAN GATE", kind: "durable" },
  { slug: "pulsequeue", no: "06", name: "PULSEQUEUE", title: ["Retries are easy.", "Correct retries aren't."], accent: "#E0A657", meta: "LEASE · BACKOFF · DEAD LETTER", kind: "queue" },
  { slug: "dockline", no: "07", name: "DOCKLINE", title: ["The model is", "never the judge."], accent: "#7B8CFF", meta: "MCP · TRACE · 40 RULE-SCORED CASES", kind: "eval" },
  { slug: "sketchsync", no: "08", name: "SKETCHSYNC", title: ["Realtime whiteboard.", "Raw WebSockets."], accent: "#C4B082", meta: "TYPED PROTOCOL · ROOMS · UNDO", kind: "sketch" },
  { slug: "resumatch", no: "09", name: "RESUMATCH", title: ["A match score,", "not a vibe."], accent: "#7EC8C8", meta: "TF-IDF · SKILL GAPS · GROUNDED COACH", kind: "match" },
];

const essays = [
  { slug: "bounded-bfs-careers-crawler", no: "01", title: ["Bounded BFS:", "How to Crawl Careers Sites", "Without Crawling Forever"], accent: "#4FA685", meta: "CRAWLERS · RELIABILITY · 9 MIN" },
  { slug: "idempotency-product-guarantee", no: "02", title: ["Idempotency Is a", "Product Guarantee,", "Not an HTTP Header"], accent: "#E6B566", meta: "TRANSACTIONS · APIS · 8 MIN" },
  { slug: "the-model-is-never-the-judge", no: "03", title: ["The Model Is Never", "the Judge:", "Deterministic Agent Evals"], accent: "#7B8CFF", meta: "AGENTS · EVALS · 8 MIN" },
  { slug: "human-approval-durable-ai-workflows", no: "04", title: ["Human Approval in", "Durable AI Workflows"], accent: "#8F7BFF", meta: "AI WORKFLOWS · AUTHORITY · 8 MIN" },
];

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const line = (x1, y1, x2, y2, color = "#47505f", dash = "") => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="2" ${dash ? `stroke-dasharray="${dash}"` : ""}/>`;
const node = (x, y, label, accent, active = false) => `<circle cx="${x}" cy="${y}" r="${active ? 9 : 6}" fill="${active ? accent : "#d9d8d2"}"/><text x="${x}" y="${y - 22}" text-anchor="middle" class="mono dim">${esc(label)}</text>`;

function motif(kind, accent) {
  if (kind === "crawl") return `<g transform="translate(630 220)">${line(0, 135, 500, 135, accent)}${["DISCOVER", "EXTRACT", "STRUCTURE", "EXPORT", "MATCH"].map((x, i) => node(i * 125, 135, x, accent, i === 4)).join("")}<text x="0" y="55" class="metric">CAREERS</text><text x="492" y="55" text-anchor="end" class="metric accent">JSON / CSV</text><text x="0" y="190" class="mono dim">BOUNDED · PERSISTED · RESTART-SAFE</text></g>`;
  if (kind === "catalog") return `<g transform="translate(650 188)"><text x="230" y="55" text-anchor="middle" class="mono dim">STOCK 1</text>${line(0, 130, 175, 130)}${line(285, 130, 460, 130)}<circle cx="230" cy="130" r="78" fill="none" stroke="${accent}" stroke-width="2"/><text x="230" y="159" text-anchor="middle" class="big accent">1</text><text x="0" y="112" class="mono">ORDER A</text><text x="460" y="112" text-anchor="end" class="mono">ORDER B</text><text x="0" y="175" class="mono accent">CREATED</text><text x="460" y="175" text-anchor="end" class="mono dim">CONFLICT</text><text x="230" y="265" text-anchor="middle" class="mono dim">ONE CONDITIONAL UPDATE WINS</text></g>`;
  if (kind === "clearbay") return `<g transform="translate(640 170)"><rect x="0" y="0" width="475" height="265" rx="2" fill="none" stroke="#303744"/><text x="28" y="40" class="mono dim">JWT: tid=acme · ROLE_OPS</text>${line(28, 72, 447, 72, accent)}<text x="28" y="115" class="mono">TENANT A</text><text x="447" y="115" text-anchor="end" class="mono accent">INVOICE #482</text>${line(28, 143, 447, 143)}<text x="28" y="184" class="mono dim">TENANT B</text><text x="447" y="184" text-anchor="end" class="mono dim">ISOLATED</text><text x="28" y="232" class="mono accent">IDEMPOTENT REPLAY · SAME RESULT</text></g>`;
  if (kind === "grant") return `<g transform="translate(665 175)"><text x="215" y="50" text-anchor="middle" class="metric accent">05:00</text><text x="215" y="80" text-anchor="middle" class="mono dim">GRANT TTL</text>${line(0, 150, 430, 150, accent)}${node(0,150,"CHALLENGE",accent)}${node(143,150,"PROOF",accent)}${node(286,150,"POLICY",accent)}${node(430,150,"SESSION",accent,true)}<text x="215" y="235" text-anchor="middle" class="mono dim">IDENTITY FROM ED25519, NEVER A HEADER</text></g>`;
  if (kind === "durable") return `<g transform="translate(630 165)">${line(0,40,140,125)}${line(0,125,140,125)}${line(0,210,140,125)}${line(140,125,500,125,accent)}${line(290,125,290,205)}${line(290,205,385,205)}${line(385,205,385,125)}${node(0,40,"RESEARCH A",accent)}${node(0,125,"RESEARCH B",accent)}${node(0,210,"RESEARCH C",accent)}${node(140,125,"DRAFT",accent)}${node(290,125,"EVALUATE",accent)}${node(385,125,"HUMAN GATE",accent,true)}${node(500,125,"PUBLISH",accent)}<text x="337" y="238" text-anchor="middle" class="mono dim">REVISE</text></g>`;
  if (kind === "queue") return `<g transform="translate(625 180)">${line(0,120,510,120,accent)}${line(80,120,80,230)}${line(80,230,345,230,"#47505f","8 8")}${line(410,120,510,210)}${node(80,120,"LEASE",accent,true)}${node(215,120,"RETRY 01",accent)}${node(345,120,"RETRY 02",accent)}${node(410,120,"MAX",accent)}${node(510,210,"DLQ",accent,true)}<text x="80" y="266" class="mono dim">EXPONENTIAL BACKOFF</text></g>`;
  if (kind === "eval") return `<g transform="translate(650 168)">${["PROMPT", "MCP", "TRACE", "RULE SCORER"].map((x,i)=>`<rect x="${i*120}" y="85" width="96" height="78" fill="none" stroke="${i===3?accent:"#39414f"}"/><text x="${i*120+48}" y="130" text-anchor="middle" class="mono ${i===3?"accent":""}">${x}</text>${i<3?line(i*120+96,124,i*120+120,124):""}`).join("")}<text x="408" y="230" text-anchor="middle" class="metric accent">40 / 40</text><text x="408" y="258" text-anchor="middle" class="mono dim">DETERMINISTIC CASES</text></g>`;
  if (kind === "sketch") return `<g transform="translate(655 145)"><rect x="0" y="25" width="445" height="285" fill="none" stroke="#303744"/><path d="M55 245 C120 90 235 300 385 90" fill="none" stroke="${accent}" stroke-width="4"/><path d="M175 75 l18 46 -14 -8 -9 16 z" fill="#f7f6f1"/><text x="196" y="77" class="mono accent">ADA</text><path d="M330 205 l18 46 -14 -8 -9 16 z" fill="#f7f6f1"/><text x="351" y="207" class="mono accent">XINGJI</text><text x="20" y="292" class="mono dim">ROOM 9F2 · 2 CONNECTED · TYPED EVENTS</text></g>`;
  return `<g transform="translate(670 150)"><rect x="0" y="40" width="175" height="235" fill="none" stroke="#39414f"/><rect x="290" y="40" width="175" height="235" fill="none" stroke="${accent}"/><text x="87" y="80" text-anchor="middle" class="mono dim">RESUME</text><text x="377" y="80" text-anchor="middle" class="mono dim">JOB</text>${line(175,157,290,157,accent)}<circle cx="232" cy="157" r="37" fill="#0a0b10" stroke="${accent}"/><text x="232" y="165" text-anchor="middle" class="mono accent">TF-IDF</text><text x="377" y="178" text-anchor="middle" class="big accent">78</text><text x="377" y="215" text-anchor="middle" class="mono dim">MATCH · GAPS</text></g>`;
}

function base(content, accent) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs><radialGradient id="glow" cx="85%" cy="18%" r="70%"><stop offset="0" stop-color="${accent}" stop-opacity=".14"/><stop offset="1" stop-color="#08090d" stop-opacity="0"/></radialGradient><pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M48 0H0V48" fill="none" stroke="#fff" stroke-opacity=".026"/></pattern></defs>
  <rect width="1200" height="630" fill="#08090d"/><rect width="1200" height="630" fill="url(#glow)"/><rect width="1200" height="630" fill="url(#grid)"/>
  <style>.sans{font-family:Arial,sans-serif}.mono{font-family:'Courier New',monospace;font-size:14px;letter-spacing:1.5px;fill:#e8e7e1}.dim{fill:#777b84}.accent{fill:${accent}}.title{font-family:Arial,sans-serif;font-size:55px;font-weight:600;letter-spacing:-2.8px;fill:#f7f6f1}.metric{font-family:Arial,sans-serif;font-size:28px;font-weight:600;letter-spacing:-1px;fill:#f7f6f1}.big{font-family:Arial,sans-serif;font-size:92px;font-weight:500;fill:#f7f6f1}</style>
  ${content}
  <text x="60" y="590" class="mono dim">XINGJI YAN · SOFTWARE ENGINEER</text><text x="1140" y="590" text-anchor="end" class="mono dim">XINGJIYAN.COM</text>
  </svg>`;
}

function projectSvg(p) {
  const title = p.title.map((t, i) => `<text x="60" y="${220 + i * 62}" class="title">${esc(t)}</text>`).join("");
  return base(`<text x="60" y="70" class="mono accent">${p.no} / ${p.flagship ? "FLAGSHIP CASE STUDY" : "CASE STUDY"}</text><text x="60" y="112" class="mono">${p.name}</text>${title}<text x="60" y="420" class="mono dim">${p.meta}</text>${motif(p.kind, p.accent)}`, p.accent);
}

function essaySvg(a) {
  const title = a.title.map((t, i) => `<text x="76" y="${205 + i * 72}" class="title" style="font-size:62px">${esc(t)}</text>`).join("");
  return base(`<text x="76" y="76" class="mono accent">WRITING / ${a.no}</text>${title}<text x="76" y="475" class="mono dim">${a.meta}</text>${line(850,90,1110,90,a.accent)}${line(980,90,980,440,a.accent,"7 9")}<circle cx="980" cy="250" r="78" fill="none" stroke="${a.accent}" stroke-opacity=".5"/><circle cx="980" cy="250" r="8" fill="${a.accent}"/><text x="980" y="370" text-anchor="middle" class="mono dim">JUDGMENT → EVIDENCE</text>`, a.accent);
}

function chromePath() {
  const candidates = process.platform === "win32"
    ? [
        join(process.env.PROGRAMFILES ?? "", "Google", "Chrome", "Application", "chrome.exe"),
        join(process.env["PROGRAMFILES(X86)"] ?? "", "Google", "Chrome", "Application", "chrome.exe"),
        join(process.env.LOCALAPPDATA ?? "", "Google", "Chrome", "Application", "chrome.exe"),
        join(process.env.PROGRAMFILES ?? "", "Microsoft", "Edge", "Application", "msedge.exe"),
      ]
    : ["google-chrome", "chromium", "chromium-browser"];
  for (const candidate of candidates) {
    const result = spawnSync(candidate, ["--version"], { stdio: "ignore" });
    if (!result.error) return candidate;
  }
  throw new Error("Chrome or Edge is required to render OG PNGs");
}

function render(svg, target) {
  const source = join(scratch, `${target.replace(/\//g, "-")}.svg`);
  const png = join(out, `${target}.png`);
  mkdirSync(resolve(png, ".."), { recursive: true });
  writeFileSync(source, svg);
  const browser = chromePath();
  const url = `file:///${source.replace(/\\/g, "/")}`;
  const result = spawnSync(browser, [
    "--headless=new",
    "--no-sandbox",
    "--disable-gpu",
    "--disable-gpu-compositing",
    "--disable-features=Vulkan,WebGPU",
    "--hide-scrollbars",
    "--force-device-scale-factor=1",
    `--user-data-dir=${join(scratch, "chrome-profile")}`,
    "--window-size=1200,630",
    `--screenshot=${png}`,
    url,
  ], { encoding: "utf8" });
  if (result.status !== 0) throw new Error(result.stderr || `Could not render ${target}`);
  console.log(`generated ${target}.png`);
}

try {
  projects.forEach((project) => render(projectSvg(project), `projects/${project.slug}`));
  essays.forEach((essay) => render(essaySvg(essay), `writing/${essay.slug}`));
} finally {
  rmSync(scratch, { recursive: true, force: true });
}
