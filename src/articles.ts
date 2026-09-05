export type ArticleSection = {
  heading: string;
  paragraphs?: string[];
  list?: string[];
  code?: string;
  callout?: string;
};

export type Article = {
  title: string;
  slug: string;
  eyebrow: string;
  dek: string;
  date: string;
  readTime: string;
  accent: string;
  project: { name: string; href: string; repo: string };
  tags: string[];
  sections: ArticleSection[];
};

export const articlePath = (article: Article) => `/notes/${article.slug}/`;

export const articles: Article[] = [
  {
    title: "Bounded BFS: How to Crawl Careers Sites Without Crawling Forever",
    slug: "bounded-bfs-careers-crawler",
    eyebrow: "Crawlers · Reliability",
    dek: "A careers URL is not a job API. The useful system is the one that discovers enough, stops on purpose, and can explain every URL it did or did not fetch.",
    date: "2026-09-05",
    readTime: "9 min read",
    accent: "#4FA685",
    project: {
      name: "CrawlForge",
      href: "/work/crawlforge/",
      repo: "https://github.com/BigFiiish/crawlforge",
    },
    tags: ["Java 21", "Spring Boot", "BFS", "Web crawling"],
    sections: [
      {
        heading: "A URL is the beginning, not the input format",
        paragraphs: [
          "A company careers page may contain job cards, links to an applicant-tracking system, embedded JobPosting JSON-LD, or almost no useful HTML at all. It may redirect across domains, repeat the same listing under tracking parameters, or link into an effectively unbounded corporate site. Treating that page as a single scrape works only in the happy-path demo.",
          "CrawlForge starts from a different contract: accept one public Careers URL, discover a bounded set of candidate pages, extract only supported evidence, and return structured jobs plus diagnostics. Discovery and extraction are deliberately separate. One decides which URLs deserve attention; the other decides whether a retrieved document contains a defensible job posting.",
        ],
        callout: "The crawler's product guarantee is not “fetch everything.” It is “do useful work inside explicit limits.”",
      },
      {
        heading: "Why breadth-first search fits careers discovery",
        paragraphs: [
          "Careers sites tend to place useful pages close to the seed: a jobs index, department pages, pagination, then job detail pages. Breadth-first search visits that neighborhood before spending the budget on deep navigation chains. That makes the result easier to reason about than an unconstrained recursive walk.",
          "The frontier is persisted rather than held only in memory. Each URL carries depth and lifecycle state. If the process stops after a fetch but before parsing completes, the database still contains the work and its last known state. Recovery becomes a state transition, not a fresh crawl that silently duplicates requests.",
        ],
        code: `PENDING → FETCHING → DONE
                   ↘ RETRY
                   ↘ SKIPPED
                   ↘ FAILED`,
      },
      {
        heading: "Bounds are part of the API",
        paragraphs: [
          "Maximum pages and maximum depth are visible inputs, not hidden implementation constants. Host scope prevents a careers crawl from wandering into unrelated domains. Canonicalization removes fragments and known tracking noise before deduplication, so two marketing URLs do not consume two units of crawl budget.",
          "Network safety has to survive redirects. Blocking a private address only before the first request is insufficient if a public URL can redirect to localhost or an internal range. CrawlForge validates the initial target and every redirect, caps redirect count, limits response size, applies per-host rate limits, and can respect robots.txt. These controls serve different purposes: robots expresses site policy; SSRF checks protect the service; budgets protect both sides from accidental excess.",
        ],
        list: [
          "Page and depth ceilings make completion predictable.",
          "Canonical URLs and a visited set make duplicate work visible and avoidable.",
          "Host boundaries, redirect validation, and response limits keep the crawler inside its authority.",
          "A bounded retry policy handles transient failure without creating an immortal request.",
        ],
      },
      {
        heading: "Extract evidence before inference",
        paragraphs: [
          "Once a page is retrieved, the extractor prefers JobPosting JSON-LD. Structured data usually provides a cleaner title, location, description, employment type, and hiring organization than a page-wide text scrape. The HTML fallback is intentionally conservative. Navigation copy that happens to contain words such as engineering or remote is not enough to invent a job.",
          "Skills and experience are normalized from the evidence that was actually found. JSON and CSV exports remain available without an AI key. Resume matching also has a deterministic base score, matched skills, and gaps. An optional model may explain that evidence, but it cannot be the only path that makes the product work.",
        ],
      },
      {
        heading: "Test the graph, not just the parser",
        paragraphs: [
          "Parser unit tests are necessary but they miss the system behavior that makes this a crawler. CrawlForge's 20-test suite includes a local end-to-end link graph, tracking-parameter canonicalization, robots exclusion, bounded traversal, and a transient 503 that succeeds on retry. Those cases test ownership of the frontier and the conditions under which a run stops.",
          "A useful failure report should answer: Was the URL rejected for safety? Skipped by policy? Retried after a transient response? Parsed without a supported job? A total count without those distinctions turns operations into guesswork.",
        ],
      },
      {
        heading: "What I would improve next",
        paragraphs: [
          "The current HTTP-first crawler intentionally does not pretend to render every JavaScript-only job board. I would add a browser adapter behind the same retrieval boundary, enabled only for supported providers or explicit cases. The default path should stay cheap, observable, and easy to test.",
          "For multiple workers, I would move H2 state to PostgreSQL and add database leases or fencing tokens so only the current owner can complete frontier work. I would also publish parser coverage, host latency, retry causes, and remaining crawl budget as first-class metrics. The next version should not merely crawl more sites; it should make every additional capability easier to operate.",
        ],
      },
    ],
  },
  {
    title: "Idempotency Is a Product Guarantee, Not an HTTP Header",
    slug: "idempotency-product-guarantee",
    eyebrow: "Transactions · APIs",
    dek: "The header only names a request. The database transaction, uniqueness rule, replay semantics, and side-effect boundary are what prevent a customer from paying twice.",
    date: "2026-09-05",
    readTime: "8 min read",
    accent: "#E6B566",
    project: {
      name: "Catalog Order Service",
      href: "/work/catalog-order-service/",
      repo: "https://github.com/BigFiiish/catalog-order-service",
    },
    tags: ["Java 21", "Spring", "Transactions", "Idempotency"],
    sections: [
      {
        heading: "The header is a label",
        paragraphs: [
          "Adding Idempotency-Key to an endpoint does not make the endpoint idempotent. It gives the server a stable request identity. The guarantee appears only when concurrent requests, database state, response replay, and external side effects all agree on what that identity means.",
          "In an order API the customer-level promise is simple: if the network times out and the client retries, the server will not create a second order or decrement stock twice. That promise must hold when the retries arrive sequentially and when they arrive at the same instant on different threads.",
        ],
        callout: "Idempotency is observable product behavior under uncertainty—not a field in an API example.",
      },
      {
        heading: "Let the database close the race",
        paragraphs: [
          "Catalog Order Service uses a fast lookup for the ordinary replay path and a database UNIQUE constraint for the concurrent path. If the key already has an order, the service returns that order. If two requests both miss the initial read, only one insert can win. The loser handles the constraint conflict and re-reads the winner.",
          "The same principle protects inventory. A conditional update claims stock only when enough quantity remains. With one unit and two buyers, one statement affects one row and the other affects zero. No application-level read-then-write window gets to oversell the product.",
        ],
        code: `UPDATE products
SET stock_quantity = stock_quantity - :quantity
WHERE id = :productId
  AND stock_quantity >= :quantity;`,
      },
      {
        heading: "One request needs one transactional story",
        paragraphs: [
          "An order with several line items is not partially useful. The service combines duplicate product lines, processes product IDs in stable sorted order, creates the order, inserts its items, and deducts every quantity inside one transaction. If a later product is missing or out of stock, earlier changes roll back with it.",
          "Stable ordering reduces avoidable deadlock risk when concurrent orders touch the same set of products in different client order. It does not eliminate the need for database-level correctness; it makes contention more predictable while the conditional update remains the authority.",
        ],
        list: [
          "Validate and aggregate the request before taking stock.",
          "Use a unique idempotency key to select one winning order.",
          "Claim inventory with conditional SQL, not an unlocked read followed by a write.",
          "Commit order, line items, and deductions together—or keep none of them.",
        ],
      },
      {
        heading: "Replay means replaying semantics",
        paragraphs: [
          "A retry should receive the original resource rather than a newly generated approximation. The service returns the winning order and does not execute stock deduction again. That makes the result useful to clients that lost the original response after the server committed.",
          "A production API should also decide what happens when a client reuses the same key with a different payload. The focused demo proves same-key replay and the concurrent race. A larger system should persist a canonical request fingerprint and return a clear conflict when identity and payload disagree.",
        ],
      },
      {
        heading: "Side effects start after commit",
        paragraphs: [
          "Shipping illustrates the boundary between database truth and external IO. The order may transition from CREATED to SHIPPED once. Webhook delivery begins after that transaction commits, so a slow or failing receiver cannot hold the database transaction open. Retries are asynchronous and stop after three attempts.",
          "That is sufficient to demonstrate bounded failure, but in-process retry is not durable delivery. A production version should write an outbox record in the shipping transaction, then let a durable worker claim and deliver it. The idempotency contract must extend to the receiver because at-least-once delivery can repeat a successful call whose acknowledgement was lost.",
        ],
      },
      {
        heading: "Evidence is the concurrent test",
        paragraphs: [
          "The most important test does not call the service twice in a loop. It starts two threads against stock quantity one and verifies one success, one rejection, and final stock zero. The 44-test suite also covers repeated keys, transactional rollback, shipping conflicts, and bounded webhook retries.",
          "That proof is more valuable than a badge that says idempotent. It states the invariant, creates the race, and verifies the stored result after both contenders finish.",
        ],
      },
      {
        heading: "What I would improve next",
        paragraphs: [
          "I would replace embedded H2 with PostgreSQL and versioned migrations, then run the concurrency suite against the production database engine. I would add request fingerprints, a durable transactional outbox, authenticated webhook signing, destination allowlisting, and operator-visible redrive controls.",
          "The design goal would remain the same: a client should be able to retry because the network is unreliable without making the business operation unreliable too.",
        ],
      },
    ],
  },
  {
    title: "The Model Is Never the Judge: Deterministic Agent Evals",
    slug: "the-model-is-never-the-judge",
    eyebrow: "Agents · Evaluation",
    dek: "Language models are useful actors and useful critics. They are the wrong final authority for tenant isolation, tool schemas, write permissions, and other invariants that must not drift.",
    date: "2026-09-05",
    readTime: "8 min read",
    accent: "#7B8CFF",
    project: {
      name: "Dockline",
      href: "/work/dockline/",
      repo: "https://github.com/BigFiiish/dockline",
    },
    tags: ["Agents", "MCP", "Evals", "Guardrails"],
    sections: [
      {
        heading: "A fluent answer can still be a failed run",
        paragraphs: [
          "At JASCI I worked on an LLM action layer for warehouse operations. The difficult part was not getting a model to call a tool once. It was preserving the contracts that already protected a multi-tenant production system: identity comes from trusted context, writes are role-gated, schemas reject unknown fields, and repeated actions do not create repeated damage.",
          "A model can produce an elegant explanation after choosing the wrong tenant or inventing an argument. Asking another model whether the result looks correct can be useful for language quality, but it does not turn a security invariant into a reliable test.",
        ],
        callout: "If a rule can be stated exactly, score it exactly before asking a model for an opinion.",
      },
      {
        heading: "Separate behavior from judgment",
        paragraphs: [
          "Dockline is an eval-first agent layer over Clearbay's warehouse MCP tools. A prompt enters a deterministic router by default, the router chooses a typed tool or clarification path, and every call produces a trace containing arguments, tool results, and final output. An optional model can replace the router, but it never replaces the scorer.",
          "The suite contains 40 hand-authored cases across lookup behavior, tenant isolation, read-only write refusal, schema validation, clarification, and final summaries. Each case defines the input, allowed behavior, and explicit pass conditions. The scorer reads the trace and output as data.",
        ],
        code: `prompt → router → MCP tool → trace → rule scorer
                    ↘ clarify
                    ↘ refuse`,
      },
      {
        heading: "Turn production contracts into eval rules",
        paragraphs: [
          "The strongest evals come from rules the underlying system already needs. A read-only user must not execute a wave release. A tenant-scoped session must not retrieve another tenant's inventory. Tool arguments must match JSON Schema exactly. A vague request that could mutate state must ask for clarification instead of guessing.",
          "Those assertions do not require semantic taste. The trace either contains a prohibited tool call or it does not. The arguments either include an unknown field or they do not. The final answer either leaks a protected location or it does not. A case can fail even when the lookup itself succeeded if the final response exposes information outside the allowed boundary.",
        ],
        list: [
          "Authorization: was a write attempted without the required role?",
          "Isolation: did any tool argument or result cross the active tenant?",
          "Schema: were unknown or malformed fields rejected before execution?",
          "Uncertainty: did the agent clarify when required inputs were missing?",
          "Disclosure: did the final answer reveal data the caller could not request?",
        ],
      },
      {
        heading: "Why an LLM judge is still useful—but second",
        paragraphs: [
          "Not every property is binary. Clarity, tone, completeness, and whether a summary preserves important nuance may benefit from model-based critique or human review. The mistake is letting that flexible judge decide the same gate as security and correctness.",
          "I prefer a layered score: deterministic invariants first; task-specific structural checks second; optional semantic review third. If an invariant fails, the run fails regardless of how persuasive the explanation sounds. If all invariants pass, a model judge can help compare two acceptable summaries without being asked to certify authorization.",
        ],
      },
      {
        heading: "A trace is a debugging artifact, not telemetry decoration",
        paragraphs: [
          "A percentage alone cannot explain a regression. The useful unit is a replayable case with the prompt, routing decision, selected tool, arguments, result, refusal or clarification, and final text. That artifact lets an engineer distinguish a prompt problem from a schema change, service failure, or scorer bug.",
          "This also makes model changes reviewable. A new model version may improve conversational quality while reducing clarification discipline. Without the same deterministic corpus and trace format, that tradeoff disappears inside an aggregate success rate.",
        ],
      },
      {
        heading: "What I would improve next",
        paragraphs: [
          "Forty cases are a credible beginning, not a permanent safety claim. I would add adversarial and property-based generation, then mutation-test the scorer to prove that removing a guard causes the expected cases to fail. Real incidents and near misses should become a versioned replay corpus.",
          "I would also run the corpus across model, prompt, and tool-schema versions while tracking latency and cost budgets. Requests that cannot be evaluated safely should have an explicit human escalation path. The goal is not to prove that a model is universally good; it is to know exactly which behaviors the system is willing to ship.",
        ],
      },
    ],
  },
  {
    title: "Human Approval in Durable AI Workflows",
    slug: "human-approval-durable-ai-workflows",
    eyebrow: "AI workflows · Durable execution",
    dek: "A human-in-the-loop button is not a safety boundary if the process forgets the wait, the approval has no identity, or the model can call publish by another route.",
    date: "2026-09-05",
    readTime: "8 min read",
    accent: "#8F7BFF",
    project: {
      name: "Durable Brief",
      href: "/work/durable-brief/",
      repo: "https://github.com/BigFiiish/durable-brief",
    },
    tags: ["TypeScript", "Durable workflows", "Human approval", "AI"],
    sections: [
      {
        heading: "Waiting is a state",
        paragraphs: [
          "Many AI demos keep a request open while a model works, then show an approval button in the same browser tab. Close the tab, restart the server, or deploy a new version and the apparent workflow disappears. That is a UI sequence, not durable coordination.",
          "Durable Brief treats waiting as persisted workflow state. Research can finish, a draft can pass evaluation, and the run can pause on an approval hook without keeping one Node process alive. Refreshing the page does not authorize publication and does not erase the pending decision.",
        ],
        callout: "Human approval matters only when the system can remember what is waiting, who may approve it, and exactly what will happen next.",
      },
      {
        heading: "Give each phase different execution semantics",
        paragraphs: [
          "The workflow fans out three research tasks in parallel because they spend most of their time waiting on IO. It fans in before drafting because one artifact needs one coherent state. An evaluator-optimizer loop can revise the draft, but it is capped at three passes so the system cannot spend indefinitely in self-critique.",
          "LLM calls and publication are retryable steps. The orchestration function records the sequence, while step functions define work that may be retried. That boundary matters: replaying orchestration should not silently duplicate an irreversible side effect.",
        ],
        code: `research A ─┐
research B ─┼→ draft → evaluate ↺ revise → HUMAN GATE → publish
research C ─┘`,
      },
      {
        heading: "The gate must sit outside model authority",
        paragraphs: [
          "A prompt that says ask a human before publishing is not an enforcement mechanism. The model may misunderstand the instruction, a later refactor may bypass it, or another tool path may expose the same side effect. In Durable Brief, publish follows a workflow hook that the model cannot satisfy by generating text.",
          "This is the same principle as keeping authorization out of a client-supplied tenant header. The actor proposing the action does not define the authority to execute it. The workflow runtime and approval endpoint own that decision.",
        ],
        list: [
          "The artifact under review needs a stable version or digest.",
          "The approver needs authenticated identity and an allowed role.",
          "Approve, reject, edit, timeout, cancel, and escalate need explicit states.",
          "Publication must consume the approved artifact—not regenerate it after approval.",
        ],
      },
      {
        heading: "A demo can be deterministic without being fake",
        paragraphs: [
          "The public demo works without a model API key. Its research and draft content are deterministic, and the evaluator is forced through a revise-then-pass sequence. That makes the durable behavior inspectable on every visit while the approval hook remains real.",
          "This split is useful for portfolio software and production tests. External intelligence may be unavailable, expensive, or variable; the state machine should still be demonstrable. Deterministic fixtures let tests prove fan-out, revision, pause, resume, and publication order without claiming that fixed text represents model quality.",
        ],
      },
      {
        heading: "Approval creates operational obligations",
        paragraphs: [
          "Once a system can wait for a person, it needs a policy for silence. Does the request expire? Who is paged? Can another reviewer take over? Can the requester cancel it? What happens if the underlying policy changes while an artifact waits? A queue of permanent pending approvals is another form of failure.",
          "The approval record should answer who approved which artifact under which policy and when. High-risk actions may require two reviewers or separation of duties. Lower-risk actions may use time-boxed delegated authority. Human-in-the-loop is not one pattern; it is an authorization workflow with latency and accountability tradeoffs.",
        ],
      },
      {
        heading: "What I would improve next",
        paragraphs: [
          "The current project proves durable waiting and ordering. I would next authenticate approvers, sign the decision together with the artifact version, and persist a queryable audit trail. I would add timeout, escalation, cancellation, and optional multi-reviewer quorum.",
          "I would also version prompts and policies and enforce per-run model, tool, latency, and cost budgets. The most important improvement is conceptual: approval should not be a decorative pause near the end of an AI flow. It should be a durable, inspectable transfer of authority.",
        ],
      },
    ],
  },
];
