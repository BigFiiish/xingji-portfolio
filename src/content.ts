export const person = {
  name: "Xingji Yan",
  handle: "BigFiiish",
  title: "Software Engineer",
  tagline: "The job keeps swimming.",
  location: "United States",
  email: "yanxingji7@gmail.com",
  phone: "321-367-0900",
  github: "https://github.com/BigFiiish",
  linkedin: "https://www.linkedin.com/in/xingji-yan",
  summary:
    "Software engineer with 4+ years shipping agentic AI, multi-tenant SaaS, and high-performance backends. Took an LLM action layer from concept to production — MCP tools, JSON Schema contracts, audit-trail guardrails — on a warehouse platform serving 20+ 3PL customers and 500+ concurrent users. M.S. ECE, Carnegie Mellon.",
};

export const stats = [
  { value: "4+", label: "Years shipping" },
  { value: "20+", label: "Live customer sites" },
  { value: "<1s", label: "Search, from 10s+" },
  { value: "CMU", label: "M.S. ECE" },
];

export const experience = [
  {
    company: "JASCI Software",
    role: "Software Engineer",
    dates: "Feb 2023 — Jul 2026",
    place: "Melbourne, FL",
    context:
      "Smart Warehouse Management — mission-critical multi-tenant SaaS for 20+ 3PL customers and 500+ concurrent users. Features owned from ambiguous requirements through production on-call.",
    tracks: {
      ai: [
        "Took a new agentic AI action layer from concept to production: 10+ warehouse operations as MCP tools with JSON Schema contracts and audit logging — multi-screen workflows collapsed into single natural-language requests.",
        "Engineered guardrails so agents can touch live data: schema validation before execution, idempotent write handlers, and structured audit trails for every AI-initiated action.",
        "Drove daily implementation with Claude Code and Cursor from structured specs, then codified the patterns into team spec and code-review standards.",
      ],
      fullstack: [
        "Built a drag-and-drop workflow designer in React/TypeScript for operations teams: drag-state with hooks and context, live dependency validation, reusable configuration components.",
        "Shipped the screens 500+ concurrent users live in all day — task workflows and operational dashboards — and kept them fast: highest-traffic search from 10+ seconds to sub-second.",
        "Designed a configurable 3PL billing engine end-to-end (pricing rules, cycles, multi-currency) with idempotent reruns — ~10 hours of manual reconciliation eliminated per customer each month.",
      ],
      backend: [
        "Moved long-running jobs off request threads onto async worker pools and tuned Oracle UCP pools — eliminating recurring peak-load outages.",
        "Cut inventory search from 10+ seconds to sub-second on million-record tables by killing N+1 query patterns (~95% fewer round trips).",
        "Implemented tenant-scoped OAuth 2.1 with tenant/company/fulfillment-center context through the stack — data isolation for 20+ organizations on shared infrastructure.",
        "Carried production on-call across 20+ sites; shifted incident response from reactive to preventive (lock contention, malformed ERP data) — recovery from days to hours.",
      ],
    },
  },
  {
    company: "Sonos",
    role: "Software Engineer Intern, Universal Search",
    dates: "Jun 2022 — Aug 2022",
    place: "Remote",
    context: "Universal Search — indexing, query cache, and frontend delivery.",
    tracks: {
      ai: [
        "Streamed database change events into the search index over Apache Kafka and cached weekly top queries in Redis — search speed +30%.",
      ],
      fullstack: [
        "Deployed a React application via S3/CloudFront and wired SonarQube into Jenkins CI so quality regressions never merged.",
        "Built a near-real-time Kafka indexing pipeline with a Redis query cache — search speed +30%.",
      ],
      backend: [
        "Built a near-real-time indexing pipeline on Apache Kafka: incremental change events into the search index, Redis cache for weekly top queries — search speed +30%.",
      ],
    },
  },
  {
    company: "Tencent",
    role: "Software Engineer Assistant, WeChat Applet (Smart Property)",
    dates: "Oct 2020 — Dec 2020",
    place: "Remote",
    context: "WeChat Mini Program — identity, payments, and property services.",
    tracks: {
      ai: [
        "Built Spring Boot REST APIs for WeChat identity and payment flows; Redis caching cut database load 30%; JMeter at 8,000 concurrent users, P99 −30%.",
      ],
      fullstack: [
        "Integrated WeChat platform APIs for identity and payment, with Redis caching (−30% database load) and JMeter load tests at 8k concurrent users (P99 −30%).",
      ],
      backend: [
        "Spring Boot services and REST APIs; Redis caching (−30% DB load); JMeter at 8,000 concurrent users, cutting P99 latency 30%.",
      ],
    },
  },
];

export const education = [
  {
    school: "Carnegie Mellon University",
    degree: "M.S. Electrical & Computer Engineering",
    dates: "Dec 2022",
    place: "Pittsburgh, PA",
  },
  {
    school: "Florida Institute of Technology",
    degree: "B.S. Electrical & Computer Engineering",
    dates: "May 2021",
    place: "Melbourne, FL",
  },
];

export const credentials = [
  "Google Cloud Professional Cloud Architect",
  "IBM RAG and Agentic AI",
  "Duke MLOps | Machine Learning Operations",
  "Advanced ML on Google Cloud",
  "Patent CN205178942U — flexible solar emergency power (2016)",
];

export const projects = [
  {
    name: "Clearbay",
    year: "2026",
    blurb:
      "Multi-tenant 3PL operations API that maps to real warehouse work: tenant-scoped OAuth, sub-second inventory search, MCP tools with JSON Schema guardrails, configurable billing, async jobs.",
    stack: ["Java 21", "Spring Boot", "PostgreSQL", "Redis", "MCP"],
    live: "https://clearbay.onrender.com",
    repo: "https://github.com/BigFiiish/clearbay",
    accent: [0.18, 0.78, 0.92],
  },
  {
    name: "Dockline",
    year: "2026",
    blurb:
      "Eval-first warehouse ops agent that only acts through Clearbay MCP. 40 rule-scored cases lock tenant isolation and refusals. The model is never the judge.",
    stack: ["Python", "FastAPI", "MCP", "Evals"],
    live: "https://dockline.onrender.com",
    repo: "https://github.com/BigFiiish/dockline",
    accent: [0.45, 0.38, 1.0],
  },
  {
    name: "Durable Brief",
    year: "2026",
    blurb:
      "A briefing desk on Vercel Workflows: parallel research, sequential draft, evaluator-optimizer loop, then a human approval hook. Close the tab — the run is still waiting.",
    stack: ["TypeScript", "Next.js", "Vercel Workflows"],
    live: "https://durable-brief.vercel.app",
    repo: "https://github.com/BigFiiish/durable-brief",
    accent: [0.95, 0.42, 0.78],
  },
  {
    name: "PulseQueue",
    year: "2026",
    blurb:
      "Watch a job queue work in real time: workers, exponential backoff, dead letters. Pure TypeScript engine with a React dashboard over Server-Sent Events.",
    stack: ["TypeScript", "React", "SSE", "Node.js"],
    live: "https://pulsequeue-wokz.onrender.com",
    repo: "https://github.com/BigFiiish/pulsequeue",
    accent: [0.35, 0.92, 0.62],
  },
  {
    name: "SketchSync",
    year: "2026",
    blurb:
      "Realtime collaborative whiteboard: shareable rooms, live named cursors, per-user undo, PNG export. Raw WebSockets over a typed protocol — no Socket.IO.",
    stack: ["TypeScript", "WebSocket", "React", "Canvas"],
    live: null,
    repo: "https://github.com/BigFiiish/sketchsync",
    accent: [1.0, 0.72, 0.28],
  },
  {
    name: "ResuMatch",
    year: "2026",
    blurb:
      "Paste a resume and a job description. Get a 0–100 match score, skill-gap breakdown, and concrete fixes. Deterministic TF-IDF core with an optional LLM coaching layer.",
    stack: ["React", "FastAPI", "NLP", "TypeScript"],
    live: "https://resumatch-livid.vercel.app",
    repo: "https://github.com/BigFiiish/resumatch",
    accent: [0.55, 0.85, 1.0],
  },
];

export const skills = {
  languages: ["Java", "TypeScript", "Python", "SQL", "Go", "C#"],
  backend: [
    "Spring Boot",
    "REST",
    "Microservices",
    "OAuth 2.1",
    "Kafka",
    "Redis",
    "Hibernate/JPA",
  ],
  frontend: ["React", "Next.js", "Vue", "HTML/CSS", "WebGL"],
  data: ["Oracle", "PostgreSQL", "MySQL", "MongoDB"],
  ai: ["MCP tools", "LLM guardrails", "Claude Code", "Cursor", "RAG"],
  cloud: ["AWS", "GCP", "Docker", "Kubernetes", "Jenkins", "GitHub Actions"],
};

export type Track = "ai" | "fullstack" | "backend";

export const tracks: { id: Track; label: string; kicker: string }[] = [
  { id: "ai", label: "Agentic AI", kicker: "MCP · guardrails · production agents" },
  { id: "fullstack", label: "Full-Stack", kicker: "React · Spring · product surfaces" },
  { id: "backend", label: "Backend", kicker: "Latency · multi-tenant · on-call" },
];
