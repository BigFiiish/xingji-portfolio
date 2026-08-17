export const person = {
  name: "Xingji Yan",
  handle: "BigFiiish",
  mark: "XY",
  title: "Software Engineer",
  school: "M.S. Electrical & Computer Engineering",
  university: "Carnegie Mellon University",
  schoolShort: "M.S. ECE, Carnegie Mellon",
  statement: ["I build systems", "people actually use."],
  summary:
    "Full-stack software engineer building reliable product systems, AI workflows, and developer infrastructure.",
  email: "yanxingji7@gmail.com",
  phone: "321-367-0900",
  github: "https://github.com/BigFiiish",
  linkedin: "https://www.linkedin.com/in/xingji-yan",
  resume: "/Xingji-Yan-Resume.pdf",
  site: "https://www.xingjiyan.com/",
  aboutLede:
    "I ship the unglamorous systems that keep operations alive — then I put an agent on top of them, with guardrails, so people can talk to the warehouse instead of clicking through twelve screens.",
  aboutBody:
    "Most recently at JASCI Software: a smart WMS used by 20+ 3PL customers and 500+ concurrent users. I took an LLM action layer from a sketch to production — JSON Schema contracts, idempotent writes, audit trails — and I still carried on-call. Before that: search pipelines at Sonos, payment APIs at Tencent. M.S. ECE, Carnegie Mellon.",
  systemLine: "Xingji builds systems around correctness, state, failure, and humans.",
};

export const impact = [
  { value: "20+", label: "JASCI · production customer organizations" },
  { value: "10s → <1s", label: "Search latency" },
  { value: "~95%", label: "Fewer DB round trips" },
  { value: "CMU", label: "M.S. ECE" },
];

export const domains = [
  {
    id: "reliable",
    label: "Reliable systems",
    detail: "Correctness · retries · concurrency · isolation",
    href: "#clearbay",
    related: [
      { name: "Clearbay", href: "#clearbay" },
      { name: "Grantline", href: "#grantline" },
    ],
    story: "Tenant isolation · idempotency · signed identity",
    accent: "#3ECF8E",
  },
  {
    id: "ai",
    label: "AI workflows",
    detail: "Agents · evaluation · durable execution",
    href: "#durable-brief",
    related: [
      { name: "Durable Brief", href: "#durable-brief" },
      { name: "Dockline", href: "#dockline" },
    ],
    story: "Agents · evaluation · durable execution",
    accent: "#8F7BFF",
  },
  {
    id: "infra",
    label: "Dev infrastructure",
    detail: "Queues · real-time · observability",
    href: "#pulsequeue",
    related: [
      { name: "PulseQueue", href: "#pulsequeue" },
      { name: "SketchSync", href: "#sketchsync" },
    ],
    story: "Queues · real-time · observability",
    accent: "#E0A657",
  },
] as const;

export type ArchNode = { label: string; children?: ArchNode[] };

export type CaseStudy = {
  problem: string;
  constraints: string[];
  architecture: ArchNode[];
  decisions: { decision: string; why: string; tradeoff: string }[];
  failures: { fail: string; handle: string }[];
  artifact?: { caption: string; body: string };
};

export type Project = {
  name: string;
  slug: string;
  year: string;
  featured: boolean;
  headline: string;
  blurb: string;
  stack: string[];
  proof?: string[];
  live: string | null;
  repo: string;
  accent: string;
  preview: "clearbay" | "grantline" | "durable" | "pulse" | "dockline" | "sketch" | "resumatch";
  caseStudy: CaseStudy;
  xray: string[];
};

export const projects: Project[] = [
  {
    name: "Clearbay",
    slug: "clearbay",
    year: "2026",
    featured: true,
    headline: "Financial workflows that stay correct under retries.",
    blurb:
      "Multi-tenant Java/Spring platform demonstrating tenant isolation, idempotent billing, optimistic concurrency, async jobs, MCP guardrails, and production-style observability.",
    stack: ["Java 21", "Spring Boot", "PostgreSQL", "Redis", "MCP"],
    proof: ["Idempotent", "Multi-tenant", "Retry-safe"],
    live: "https://clearbay.onrender.com",
    repo: "https://github.com/BigFiiish/clearbay",
    accent: "#3ECF8E",
    preview: "clearbay",
    xray: ["Browser", "Spring REST API", "Tenant Context", "Service Layer", "PostgreSQL / Redis", "Async Worker", "MCP / Audit"],
    caseStudy: {
      problem:
        "Warehouse SaaS shares one database across customers. A retry, a spoofed header, or a cache key without a tenant prefix is enough to charge twice or leak inventory.",
      constraints: [
        "Tenant must come from the token, never the client body or a header.",
        "Billing reruns must be idempotent on (tenant, period).",
        "Concurrent wave releases cannot double-reserve stock.",
        "Workers start after commit — never racing the insert.",
        "MCP writes need schema, role, and an audit row.",
      ],
      architecture: [
        { label: "JWT (tid + roles)" },
        { label: "TenantInterceptor" },
        { label: "Hibernate filter + TenantContext" },
        {
          label: "Services",
          children: [
            { label: "Inventory (indexed query + tenant cache)" },
            { label: "Billing engine" },
            { label: "MCP + audit" },
          ],
        },
        { label: "Jobs table → afterCommit worker" },
      ],
      decisions: [
        {
          decision: "Tenant is a JWT claim. X-Tenant-Id is ignored.",
          why: "A header the client sends is not a security boundary. Tests assert the spoof.",
          tradeoff: "Demo ships a built-in /oauth/token. Production would use Cognito/Keycloak — the isolation contract stays.",
        },
        {
          decision: "Cache keys are tenantId:version:sku:location.",
          why: "A shared Redis without the tenant prefix is a cross-tenant leak. Writes bump that tenant's version only.",
          tradeoff: "Other tenants keep their cache. Slightly more key cardinality than a global flush.",
        },
        {
          decision: "Jobs persist first, run afterCommit, retry with next_attempt_at.",
          why: "Workers must not start before the row exists. Transient failures reschedule; exhausted attempts fail closed.",
          tradeoff: "At-least-once delivery. Billing and MCP writes therefore require idempotency keys.",
        },
      ],
      failures: [
        { fail: "Client sends another tenant in a header.", handle: "Ignored. TenantContext is bound from the token only." },
        { fail: "Invoice generate is retried.", handle: "Idempotent on (tenant, period). Same invoice, no double charge." },
        { fail: "Two ops release the same wave.", handle: "Optimistic lock on version. Loser gets 409; inventory is not double-reserved." },
        { fail: "Worker starts before the job row commits.", handle: "afterCommit callback. The insert is visible first." },
        { fail: "MCP call includes extra JSON fields.", handle: "Unknown fields rejected before execution." },
      ],
      artifact: {
        caption: "POST /api/v1/waves/482/release · loser",
        body: `{
  "type": "about:blank",
  "title": "Conflict",
  "status": 409,
  "detail": "record was updated by another request"
}`,
      },
    },
  },
  {
    name: "Grantline",
    slug: "grantline",
    year: "2026",
    featured: true,
    headline: "Identity from a signed grant, never a header.",
    blurb:
      "Passwordless Go broker: humans, machines, and AI agents prove an ed25519 key, receive a five-minute grant, then open policy-checked sessions. Tenant isolation and server-side pagination included.",
    stack: ["Go", "React", "TypeScript", "ed25519"],
    proof: ["Signed grant", "Five-minute TTL", "Policy"],
    live: "https://grantline.onrender.com",
    repo: "https://github.com/BigFiiish/grantline",
    accent: "#5B8CFF",
    preview: "grantline",
    xray: ["Console", "Challenge / Prove", "Grant (ed25519)", "Policy", "Sessions + audit"],
    caseStudy: {
      problem:
        "Passwords and spoofable tenant headers confuse authentication with authorization. Humans, machines, and agents need short-lived access that still fails closed.",
      constraints: [
        "No password store. Proof is a public-key signature over a nonce.",
        "Grants expire in minutes. Sessions cannot outlive the grant.",
        "Kind and role are policy, not UI labels.",
        "Lists are filtered then paginated on the server.",
        "Self-register cannot mint admin.",
      ],
      architecture: [
        { label: "Ed25519 challenge" },
        { label: "Grant token (signed payload)" },
        { label: "Policy: tenant + kind + role + audience" },
        { label: "Session + audit log" },
      ],
      decisions: [
        {
          decision: "The broker package has no HTTP. Clock is injected.",
          why: "Replay, expiry, policy, and pagination can be unit-tested without a server.",
          tradeoff: "In-memory demo. Production would persist grants and add a denylist.",
        },
        {
          decision: "WebAuthn is an adapter, not the model.",
          why: "Same proof shape (public key over a nonce) without a hardware key on a free host.",
          tradeoff: "Humans in production should use passkeys. The tests still lock the contract.",
        },
        {
          decision: "Audience is bound on the grant, checked again at session open.",
          why: "A valid proof is not a blank check. billing.api stays human-admin.",
          tradeoff: "Two checks instead of one. Clearer logs when a machine is denied.",
        },
      ],
      failures: [
        { fail: "Wrong key or replayed challenge.", handle: "Invalid signature / already used. Challenges are 60s and single-use." },
        { fail: "X-Tenant-Id: globex on an acme grant.", handle: "Echoed and ignored. /v1/me still returns acme." },
        { fail: "Machine opens billing.api.", handle: "403. Kind and role fail the resource policy." },
        { fail: "Grant past TTL.", handle: "Open session returns expired. Sessions expire lazily on list." },
      ],
      artifact: {
        caption: "POST /v1/sessions · grant past TTL",
        body: `{
  "error": "expired"
}`,
      },
    },
  },
  {
    name: "Durable Brief",
    slug: "durable-brief",
    year: "2026",
    featured: true,
    headline: "AI workflows that can wait.",
    blurb:
      "A durable TypeScript workflow with parallel research, sequential drafting, evaluator-optimizer loops, and human approval.",
    stack: ["TypeScript", "Next.js", "Vercel Workflows"],
    proof: ["Pause", "Resume", "Human approval"],
    live: "https://durable-brief.vercel.app",
    repo: "https://github.com/BigFiiish/durable-brief",
    accent: "#8F7BFF",
    preview: "durable",
    xray: ["Next.js", "Workflow", "Parallel Research", "Draft", "Evaluator / Revision Loop", "Human Hook", "Publish"],
    caseStudy: {
      problem:
        "Most AI demos die when the tab closes. A briefing desk that publishes without a human, or forgets the run, is not a workflow — it is a prompt.",
      constraints: [
        "The run must survive refresh, sleep, and redeploy.",
        "Research fans out in parallel; draft is sequential.",
        "An evaluator loop can send the draft back.",
        "Publish is gated on a human hook. Closing the tab does not skip it.",
      ],
      architecture: [
        { label: "Next.js briefing desk" },
        {
          label: "Vercel Workflow",
          children: [
            { label: "Research ×3 (parallel)" },
            { label: "Draft (sequential)" },
            { label: "Evaluator-optimizer loop" },
            { label: "Human approval hook" },
            { label: "Publish" },
          ],
        },
      ],
      decisions: [
        {
          decision: "Durable execution, not a long-lived Node process.",
          why: "The platform stores the wait. Close the tab — the hook is still there.",
          tradeoff: "Tied to Vercel Workflows. The product lesson is the hook, not the vendor.",
        },
        {
          decision: "Parallel research, then a single draft.",
          why: "Fan-out where IO waits; fan-in before language is committed.",
          tradeoff: "Conflicting sources need the evaluator. That is the point of the loop.",
        },
        {
          decision: "Publish has not happened until a human says so.",
          why: "An optimizer can loop. It cannot ship.",
          tradeoff: "Throughput is gated on a person. Correct for anything leaving the building.",
        },
      ],
      failures: [
        { fail: "Tab closed mid-run.", handle: "Workflow is durable. The approval step is still waiting." },
        { fail: "Draft is weak.", handle: "Evaluator-optimizer loop revises before the hook." },
        { fail: "Someone tries to skip the human.", handle: "Publish is not a step the model can call." },
      ],
      artifact: {
        caption: "hook still waiting after the tab closed",
        body: `{
  "type": "awaiting_approval",
  "token": "brief-approval:brief_1042",
  "passed": true
}`,
      },
    },
  },
  {
    name: "PulseQueue",
    slug: "pulsequeue",
    year: "2026",
    featured: true,
    headline: "Retries are easy. Correct retries aren't.",
    blurb:
      "A TypeScript queue engine with lease exclusivity, exponential backoff, dead-lettering, worker state, and real-time SSE visualization.",
    stack: ["TypeScript", "React", "SSE", "Node.js"],
    proof: ["Lease", "Backoff", "Dead letter"],
    live: "https://pulsequeue-wokz.onrender.com",
    repo: "https://github.com/BigFiiish/pulsequeue",
    accent: "#E0A657",
    preview: "pulse",
    xray: ["React Dashboard", "SSE", "Express", "Worker Pool", "Queue / Lease", "Retry / Backoff", "DLQ"],
    caseStudy: {
      problem:
        "A retry that two workers both own is a double send. A retry with no backoff is a thundering herd. A retry that never dies is a poison pill.",
      constraints: [
        "A job is leased by at most one worker.",
        "Backoff is base * 2^(attempts-1).",
        "After maxAttempts the job is dead, not queued.",
        "The engine has no HTTP and no wall clock — time is injected.",
        "The dashboard is a subscriber, not the source of truth.",
      ],
      architecture: [
        { label: "React dashboard" },
        { label: "SSE /api/events" },
        { label: "Express" },
        { label: "WorkerPool" },
        { label: "JobQueue (pure TS)" },
        { label: "FIFO · lease · backoff · DLQ" },
      ],
      decisions: [
        {
          decision: "The queue engine is pure TypeScript. Clock injected.",
          why: "Lease exclusivity, retry delay, and dead-lettering are unit tests, not a running server.",
          tradeoff: "In-memory. The semantics are the demo; persistence is a store swap.",
        },
        {
          decision: "SSE, not polling.",
          why: "Every state change is pushed. The UI never invents a tick.",
          tradeoff: "Free hosts sleep. First event after wake can lag.",
        },
        {
          decision: "Dead-letter instead of infinite retry.",
          why: "Poison messages must stop cycling so operators can see them.",
          tradeoff: "Someone has to drain the DLQ. The dashboard makes that visible.",
        },
      ],
      failures: [
        { fail: "Two workers lease the same job.", handle: "Lease is exclusive. Tests lock single-owner complete/fail." },
        { fail: "A flaky job fails twice.", handle: "Exponential backoff. It becomes eligible later, not immediately." },
        { fail: "A job fails past maxAttempts.", handle: "Marked dead. It leaves the active cycle." },
      ],
      artifact: {
        caption: "job_014 after maxAttempts",
        body: `{
  "id": "job_014",
  "type": "flaky",
  "payload": "partner-call-14",
  "status": "dead",
  "attempts": 3,
  "maxAttempts": 3,
  "workerId": null,
  "error": "partner timeout"
}`,
      },
    },
  },
  {
    name: "Dockline",
    slug: "dockline",
    year: "2026",
    featured: false,
    headline: "Don't ask the model if the model was right.",
    blurb:
      "An eval-first agent layer with 40 deterministic cases testing tenant isolation, write refusal, schemas, clarification, and traces.",
    stack: ["Python", "FastAPI", "MCP", "Evals"],
    live: "https://dockline.onrender.com",
    repo: "https://github.com/BigFiiish/dockline",
    accent: "#7b8cff",
    preview: "dockline",
    xray: ["Prompt", "Deterministic router", "Clearbay MCP", "Rule scorer", "Trace"],
    caseStudy: {
      problem:
        "If the model grades the model, you will ship a confident wrong tool call. An ops agent on a warehouse API needs a judge that does not float.",
      constraints: [
        "The agent only acts through Clearbay MCP.",
        "Forty rule-scored cases. The model is never the judge.",
        "Tenant isolation, read-only writes, extra JSON fields, vague prompts must fail closed.",
        "Default router is deterministic. OpenAI tools are optional.",
      ],
      architecture: [
        { label: "Ops prompt" },
        { label: "Deterministic router (default)" },
        { label: "Clearbay MCP tools" },
        { label: "JSON Schema guardrails" },
        { label: "Rule scorer · 40 cases" },
        { label: "Trace log" },
      ],
      decisions: [
        {
          decision: "Eval harness is the product, not a later test.",
          why: "Tenant leaks and extra fields are scoring rules, not vibes.",
          tradeoff: "Cases are hand-written. That is cheaper than a wrong wave release.",
        },
        {
          decision: "Deterministic router by default.",
          why: "You can demo isolation without an API key. The optional model is never the judge.",
          tradeoff: "Vague language still needs a clarification case, not a guess.",
        },
        {
          decision: "Traces are first-class.",
          why: "When a case fails, you read the tool call, not a chat bubble.",
          tradeoff: "More logging than a toy agent. Necessary for an on-site loop.",
        },
      ],
      failures: [
        { fail: "Prompt tries another tenant.", handle: "Isolation case fails the run. Tool never fires cross-tenant." },
        { fail: "Read role attempts a write.", handle: "Refusal case. MCP write tools require ROLE_OPS." },
        { fail: "Extra JSON fields on a tool call.", handle: "Schema case. Unknown fields rejected." },
        { fail: "Vague prompt.", handle: "Clarification case. No speculative write." },
      ],
    },
  },
  {
    name: "SketchSync",
    slug: "sketchsync",
    year: "2026",
    featured: false,
    headline: "Realtime whiteboard. Raw WebSockets.",
    blurb:
      "Shareable rooms, live named cursors, per-user undo, PNG export. Typed protocol — no Socket.IO.",
    stack: ["TypeScript", "WebSocket", "React"],
    live: "https://sketchsync-fwed.onrender.com",
    repo: "https://github.com/BigFiiish/sketchsync",
    accent: "#c4b082",
    preview: "sketch",
    xray: ["Canvas", "Typed messages", "Room logic", "WebSocket"],
    caseStudy: {
      problem: "A whiteboard that hides behind Socket.IO does not show whether rooms, undo, or presence are actually correct.",
      constraints: ["Raw WebSockets.", "Per-user undo.", "Room logic unit-tested without the browser."],
      architecture: [{ label: "React canvas" }, { label: "Typed protocol" }, { label: "Room server" }],
      decisions: [
        {
          decision: "No Socket.IO.",
          why: "The message protocol is the product.",
          tradeoff: "More plumbing. Clearer tests.",
        },
      ],
      failures: [{ fail: "Two users undo.", handle: "Undo is per-user, not a shared stack." }],
    },
  },
  {
    name: "ResuMatch",
    slug: "resumatch",
    year: "2026",
    featured: false,
    headline: "A match score, not a vibe.",
    blurb:
      "Paste a resume and a job. Get a 0–100 score, skill gaps, and concrete fixes. Deterministic TF-IDF core with an optional LLM coaching layer.",
    stack: ["React", "FastAPI", "NLP", "TypeScript"],
    live: "https://resumatch-livid.vercel.app",
    repo: "https://github.com/BigFiiish/resumatch",
    accent: "#7ec8c8",
    preview: "resumatch",
    xray: ["React", "TF-IDF core", "Optional LLM coach"],
    caseStudy: {
      problem: "An LLM-only matcher cannot explain a score, and cannot run in CI.",
      constraints: ["Score is deterministic.", "LLM is coaching, not the judge."],
      architecture: [{ label: "Paste resume + JD" }, { label: "TF-IDF + skills" }, { label: "Optional coach" }],
      decisions: [
        {
          decision: "Deterministic core.",
          why: "The number has to be repeatable.",
          tradeoff: "Less poetry. More honesty.",
        },
      ],
      failures: [{ fail: "Coach unavailable.", handle: "Score and gaps still return." }],
    },
  },
];

export const experience = [
  {
    id: "jasci",
    company: "JASCI Software",
    role: "Software Engineer",
    dates: "2023 — 2026",
    line: "Multi-tenant warehouse SaaS. Agentic action layer, sub-second search, billing engine, production on-call.",
  },
  {
    id: "sonos",
    company: "Sonos",
    role: "Software Engineer Intern",
    dates: "2022",
    line: "Universal Search — Kafka indexing, Redis query cache, search speed +30%.",
  },
  {
    id: "tencent",
    company: "Tencent",
    role: "Software Engineer Assistant",
    dates: "2020",
    line: "WeChat identity and payments. Redis −30% DB load. JMeter at 8k users, P99 −30%.",
  },
];

export const education = [
  {
    school: "Carnegie Mellon University",
    degree: "M.S. Electrical & Computer Engineering",
    dates: "2022",
    place: "Pittsburgh, PA",
  },
  {
    school: "Florida Institute of Technology",
    degree: "B.S. Electrical & Computer Engineering",
    dates: "2021",
    place: "Melbourne, FL",
  },
];

export const stackLine =
  "Java/Spring · React/TypeScript · AI systems · M.S. ECE · Carnegie Mellon";

export const principles = [
  {
    idx: "01",
    title: "Correctness",
    line: "Retries should not double-write. Tenant boundaries should not depend on client input.",
    seen: { name: "Clearbay", href: "#clearbay" },
  },
  {
    idx: "02",
    title: "State",
    line: "Processes should survive the request that started them.",
    seen: { name: "Durable Brief", href: "#durable-brief" },
  },
  {
    idx: "03",
    title: "Failure",
    line: "Failures should be visible, bounded, and recoverable.",
    seen: { name: "PulseQueue", href: "#pulsequeue" },
  },
  {
    idx: "04",
    title: "Humans",
    line: "Automation should know where its authority ends.",
    seen: { name: "Dockline", href: "#dockline" },
  },
];
