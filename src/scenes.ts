import type { Project } from "./content";

export function sceneMarkup(p: Project): string {
  switch (p.preview) {
    case "clearbay":
      return clearbay();
    case "grantline":
      return grantline();
    case "durable":
      return durable();
    case "pulse":
      return pulse();
    default:
      return "";
  }
}

function clearbay(): string {
  return `
    <div class="scene scene-cb" data-scene="clearbay">
      <svg class="scene-svg" viewBox="0 0 640 280" role="img" aria-label="Clearbay request path: JWT tenant, service, postgres, redis, audit">
        <path class="wire" d="M 80 40 V 92 H 320 V 148"/>
        <path class="wire" d="M 320 148 H 160 V 220"/>
        <path class="wire" d="M 320 148 H 480 V 220"/>
        <path class="wire" d="M 320 148 V 220"/>
        ${box(80, 16, "REQUEST")}
        ${box(80, 80, "JWT / TENANT")}
        ${box(320, 80, "AUTHZ")}
        ${box(320, 136, "SERVICE")}
        ${box(160, 208, "POSTGRES")}
        ${box(320, 208, "REDIS")}
        ${box(480, 208, "AUDIT / JOB")}
        <circle class="tok" r="4"/>
      </svg>
      <div class="scene-ops">
        <div class="op">
          <button type="button" data-act="retry">Retry invoice request</button>
          <ol class="log" data-log="retry">
            <li class="mute">POST /invoice · demo scope (acme, 2026-08)</li>
          </ol>
        </div>
        <div class="op">
          <button type="button" data-act="spoof">Send X-Tenant-Id: globex</button>
          <p class="log-line" data-log="spoof">Bound tenant: ACME · header ignored</p>
        </div>
      </div>
    </div>`;
}

function grantline(): string {
  return `
    <div class="scene scene-gl" data-scene="grantline">
      <div class="grant-clock">
        <span data-ttl>04:59</span>
        <em>grant ttl</em>
      </div>
      <ol class="chain">
        <li data-step="0">Challenge</li>
        <li data-step="1">ed25519 proof</li>
        <li data-step="2">Signed grant</li>
        <li data-step="3">Policy</li>
        <li data-step="4">Session</li>
      </ol>
      <div class="scene-ops">
        <button type="button" data-act="open">Open session</button>
        <button type="button" class="ghost" data-act="badkey">Wrong key</button>
        <button type="button" class="ghost" data-act="expired">Expired grant</button>
        <button type="button" class="ghost" data-act="policy">Machine → billing.api</button>
      </div>
      <p class="log-line" data-log="gl">Proof over nonce. Tenant from the grant.</p>
    </div>`;
}

function durable(): string {
  return `
    <div class="scene scene-db" data-scene="durable">
      <svg class="scene-svg wide" viewBox="0 0 720 160" role="img" aria-label="Durable Brief workflow: parallel research, draft, evaluate, human gate, publish">
        <path class="wire" d="M 70 28 H 210"/>
        <path class="wire" d="M 70 80 H 210"/>
        <path class="wire" d="M 70 132 H 210"/>
        <path class="wire" d="M 210 28 V 132"/>
        <path class="wire" d="M 210 80 H 340 H 470 H 590 H 680"/>
        ${box(70, 16, "Research A")}
        ${box(70, 68, "Research B")}
        ${box(70, 120, "Research C")}
        ${box(340, 68, "Draft")}
        ${box(470, 68, "Evaluate")}
        ${box(590, 68, "Human gate")}
        ${box(680, 68, "Publish")}
        <circle class="tok t0" r="3.5"/><circle class="tok t1" r="3.5"/><circle class="tok t2" r="3.5"/>
      </svg>
      <div class="scene-ops">
        <p class="log-line" data-log="db">Waiting for human. Publish has not happened.</p>
        <button type="button" data-act="approve" disabled>Approve</button>
      </div>
    </div>`;
}

function pulse(): string {
  return `
    <div class="scene scene-pq" data-scene="pulse">
      <div class="pq-grid">
        <div>
          <p class="kicker">Queued</p>
          <p class="pq-dots" data-queue>○ ○ ○ ○ ○</p>
        </div>
        <div>
          <p class="kicker">Workers</p>
          <ul class="workers" data-workers>
            <li>w1 idle</li>
            <li>w2 idle</li>
            <li>w3 idle</li>
            <li>w4 idle</li>
          </ul>
        </div>
      </div>
      <p class="pq-job" data-job>job-14 · queued</p>
      <pre class="sse" data-log="pq">sse · waiting</pre>
      <button type="button" data-act="run">Run poison job</button>
    </div>`;
}

function box(x: number, y: number, label: string): string {
  const w = Math.max(86, label.length * 7.2);
  return `<g transform="translate(${x - w / 2} ${y})">
    <rect width="${w}" height="24" rx="5"/>
    <text x="${w / 2}" y="16" text-anchor="middle">${label}</text>
  </g>`;
}

export function bindScenes(root: HTMLElement) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  root.querySelectorAll<HTMLElement>("[data-scene]").forEach((el) => {
    const kind = el.dataset.scene;
    if (kind === "clearbay") bindClearbay(el);
    if (kind === "grantline") bindGrantline(el, reduce);
    if (kind === "durable") bindDurable(el, reduce);
    if (kind === "pulse") bindPulse(el, reduce);
  });
}

function bindClearbay(el: HTMLElement) {
  let invoice: string | null = null;
  const log = el.querySelector("[data-log='retry']");
  const spoof = el.querySelector("[data-log='spoof']");
  el.querySelector("[data-act='retry']")?.addEventListener("click", () => {
    if (!log) return;
    if (!invoice) {
      invoice = "INV-482";
      log.innerHTML = `<li>POST /invoice → idempotency miss</li><li class="ok">created ${invoice}</li>`;
    } else {
      log.innerHTML = `<li>POST /invoice → same (tenant, period)</li><li class="ok">200 replay · ${invoice}</li>`;
    }
    el.classList.add("play");
  });
  el.querySelector("[data-act='spoof']")?.addEventListener("click", () => {
    if (spoof) spoof.textContent = "X-Tenant-Id: globex ignored. Bound tenant still ACME.";
    el.classList.add("spoofed");
  });
}

function bindGrantline(el: HTMLElement, reduce: boolean) {
  const ttl = el.querySelector("[data-ttl]");
  const log = el.querySelector("[data-log='gl']");
  const steps = [...el.querySelectorAll("[data-step]")];
  let left = 299;
  let timer = 0;
  const tick = () => {
    if (left <= 0) {
      if (ttl) ttl.textContent = "00:00";
      return;
    }
    left -= 1;
    const m = String(Math.floor(left / 60)).padStart(2, "0");
    const s = String(left % 60).padStart(2, "0");
    if (ttl) ttl.textContent = `${m}:${s}`;
  };
  if (!reduce) timer = window.setInterval(tick, 1000);
  const setLog = (t: string) => {
    if (log) log.textContent = t;
  };
  const light = (n: number) => {
    steps.forEach((s, i) => s.classList.toggle("on", i <= n));
  };
  el.querySelector("[data-act='open']")?.addEventListener("click", () => {
    if (left <= 0) {
      setLog("Grant expired. Session not opened.");
      light(-1);
      return;
    }
    light(4);
    setLog("Proof valid · tenant bound · role checked · audience checked · session opened.");
  });
  el.querySelector("[data-act='badkey']")?.addEventListener("click", () => {
    light(1);
    setLog("Signature rejected. Wrong key.");
  });
  el.querySelector("[data-act='expired']")?.addEventListener("click", () => {
    left = 0;
    tick();
    light(2);
    setLog("Grant expired.");
  });
  el.querySelector("[data-act='policy']")?.addEventListener("click", () => {
    light(3);
    setLog("Policy denied. billing.api is not for machines.");
  });
  el.addEventListener(
    "remove",
    () => {
      if (timer) clearInterval(timer);
    },
    { once: true },
  );
}

function bindDurable(el: HTMLElement, reduce: boolean) {
  const log = el.querySelector("[data-log='db']");
  const btn = el.querySelector<HTMLButtonElement>("[data-act='approve']");
  const play = () => {
    el.dataset.phase = "research";
    if (log) log.textContent = "Research ×3 in parallel.";
    window.setTimeout(() => {
      el.dataset.phase = "draft";
      if (log) log.textContent = "Draft sequential.";
    }, reduce ? 0 : 900);
    window.setTimeout(() => {
      el.dataset.phase = "eval";
      if (log) log.textContent = "Evaluator below threshold. Looping to revise.";
    }, reduce ? 0 : 1800);
    window.setTimeout(() => {
      el.dataset.phase = "gate";
      if (log) log.textContent = "WAITING FOR HUMAN. Publish has not happened.";
      if (btn) btn.disabled = false;
    }, reduce ? 0 : 2800);
  };
  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        play();
        io.disconnect();
      }
    },
    { threshold: 0.4 },
  );
  io.observe(el);
  btn?.addEventListener("click", () => {
    el.dataset.phase = "publish";
    if (log) log.textContent = "Approved. Publish.";
    btn.disabled = true;
  });
}

function bindPulse(el: HTMLElement, reduce: boolean) {
  const job = el.querySelector("[data-job]");
  const log = el.querySelector("[data-log='pq']");
  const workers = el.querySelector("[data-workers]");
  const queue = el.querySelector("[data-queue]");
  const wait = (ms: number) => new Promise((r) => setTimeout(r, reduce ? 0 : ms));
  const line = (t: string) => {
    if (log) log.textContent = t;
  };
  el.querySelector("[data-act='run']")?.addEventListener("click", async () => {
    if (queue) queue.textContent = "○ ○ ○ ○";
    if (workers) workers.innerHTML = "<li class='on'>w1 leased job-14</li><li>w2 idle</li><li>w3 idle</li><li>w4 idle</li>";
    if (job) job.textContent = "job-14 · attempt 1 · running";
    line("sse lease job-14 attempt 1");
    await wait(700);
    if (job) job.textContent = "job-14 · attempt 1 · failed";
    line("fail · backoff 1.0s");
    await wait(1000);
    if (job) job.textContent = "job-14 · attempt 2 · running";
    line("sse lease job-14 attempt 2");
    await wait(700);
    if (job) job.textContent = "job-14 · attempt 2 · failed";
    line("fail · backoff 2.0s");
    await wait(1400);
    if (job) job.textContent = "job-14 · attempt 3 · running";
    line("sse lease job-14 attempt 3");
    await wait(700);
    if (job) job.textContent = "job-14 · dead letter";
    if (workers) workers.innerHTML = "<li>w1 idle</li><li>w2 idle</li><li>w3 idle</li><li>w4 idle</li>";
    line("maxAttempts · DLQ. Infinite retry is not resilience.");
  });
}
