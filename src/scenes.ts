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
    <div class="scene scene-cb" data-scene="clearbay" data-mode="retry">
      <p class="scene-k">POST /invoice</p>
      <p class="scene-k mute">POST /invoice</p>
      <p class="scene-mid">idempotency key</p>
      <p class="scene-hero" data-inv>#482</p>
      <p class="scene-split"><span data-a>created</span><span data-b>replayed</span></p>
      <p class="scene-end" data-end></p>
      <div class="scene-ops">
        <button type="button" data-act="retry">Run retry</button>
        <button type="button" class="text" data-act="spoof">Tenant spoof</button>
      </div>
    </div>`;
}

function grantline(): string {
  return `
    <div class="scene scene-gl" data-scene="grantline">
      <p class="scene-hero clock" data-ttl>04:59</p>
      <ol class="vchain">
        <li data-step="0">Challenge</li>
        <li data-step="1">Proof</li>
        <li data-step="2">Signed grant</li>
        <li data-step="3">Policy</li>
        <li data-step="4">Session</li>
      </ol>
      <p class="scene-end" data-log></p>
      <div class="scene-ops">
        <button type="button" data-act="open">Open session</button>
        <button type="button" class="text" data-act="badkey">Wrong key</button>
      </div>
    </div>`;
}

function durable(): string {
  return `
    <div class="scene scene-db" data-scene="durable">
      <svg class="flowline" viewBox="0 0 760 140" role="img" aria-label="Parallel research joining into draft, evaluate, human gate, publish">
        <path d="M 40 20 H 180 V 70 H 300"/>
        <path d="M 40 70 H 300"/>
        <path d="M 40 120 H 180 V 70"/>
        <path d="M 300 70 H 720"/>
        <text x="40" y="16">Research A</text>
        <text x="40" y="66">Research B</text>
        <text x="40" y="116">Research C</text>
        <text x="300" y="62">Draft</text>
        <text x="430" y="62">Evaluate</text>
        <text x="560" y="62">Human gate</text>
        <text x="690" y="62">Publish</text>
      </svg>
      <p class="scene-end" data-log>WAITING FOR HUMAN</p>
      <p class="scene-note">The tab can close. The workflow doesn't.</p>
      <button type="button" data-act="approve" disabled>Approve</button>
    </div>`;
}

function pulse(): string {
  return `
    <div class="scene scene-pq" data-scene="pulse">
      <div class="pq">
        <div>
          <p class="scene-k">Queued</p>
          <p data-queue>○ ○ ○ ○ ○ ○</p>
        </div>
        <div>
          <p class="scene-k">Workers</p>
          <p data-workers>01  02  03</p>
        </div>
        <div>
          <p class="scene-k">Complete</p>
          <p data-done>—</p>
          <p class="scene-k">Dead letter</p>
          <p data-dlq>—</p>
        </div>
      </div>
      <p class="scene-hero job" data-job>job-14</p>
      <p class="scene-end" data-log></p>
      <button type="button" data-act="run">Run job</button>
    </div>`;
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
  const end = el.querySelector("[data-end]");
  const a = el.querySelector("[data-a]");
  const b = el.querySelector("[data-b]");
  const inv = el.querySelector("[data-inv]");
  el.querySelector("[data-act='retry']")?.addEventListener("click", () => {
    el.dataset.mode = "retry";
    if (!invoice) {
      invoice = "#482";
      if (inv) inv.textContent = invoice;
      if (a) a.classList.add("on");
      if (b) b.classList.remove("on");
      if (end) end.textContent = "";
      el.dataset.step = "create";
    } else {
      if (b) b.classList.add("on");
      if (end) end.textContent = "ONE INVOICE.";
      el.dataset.step = "replay";
    }
  });
  el.querySelector("[data-act='spoof']")?.addEventListener("click", () => {
    el.dataset.mode = "spoof";
    if (inv) inv.textContent = "ACME";
    if (a) a.textContent = "header ignored";
    if (b) b.textContent = "jwt bound";
    a?.classList.add("on");
    b?.classList.add("on");
    if (end) end.textContent = "X-Tenant-Id: globex never wins.";
  });
}

function bindGrantline(el: HTMLElement, reduce: boolean) {
  const ttl = el.querySelector("[data-ttl]");
  const log = el.querySelector("[data-log]");
  const steps = [...el.querySelectorAll("[data-step]")];
  let left = 299;
  const tick = () => {
    if (left <= 0) {
      if (ttl) ttl.textContent = "00:00";
      return;
    }
    left -= 1;
    if (ttl) ttl.textContent = `${String(Math.floor(left / 60)).padStart(2, "0")}:${String(left % 60).padStart(2, "0")}`;
  };
  if (!reduce) window.setInterval(tick, 1000);
  const light = (n: number) => steps.forEach((s, i) => s.classList.toggle("on", i <= n));
  el.querySelector("[data-act='open']")?.addEventListener("click", () => {
    if (left <= 0) {
      light(2);
      if (log) log.textContent = "EXPIRED";
      return;
    }
    light(4);
    if (log) log.textContent = "SESSION OPEN";
  });
  el.querySelector("[data-act='badkey']")?.addEventListener("click", () => {
    light(1);
    if (log) log.textContent = "SIGNATURE INVALID";
  });
}

function bindDurable(el: HTMLElement, reduce: boolean) {
  const log = el.querySelector("[data-log]");
  const btn = el.querySelector<HTMLButtonElement>("[data-act='approve']");
  const io = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      el.dataset.phase = "run";
      window.setTimeout(() => {
        el.dataset.phase = "gate";
        if (log) log.textContent = "WAITING FOR HUMAN";
        if (btn) btn.disabled = false;
      }, reduce ? 0 : 2400);
    },
    { threshold: 0.45 },
  );
  io.observe(el);
  btn?.addEventListener("click", () => {
    el.dataset.phase = "publish";
    if (log) log.textContent = "PUBLISH";
    btn.disabled = true;
  });
}

function bindPulse(el: HTMLElement, reduce: boolean) {
  const job = el.querySelector("[data-job]");
  const log = el.querySelector("[data-log]");
  const workers = el.querySelector("[data-workers]");
  const queue = el.querySelector("[data-queue]");
  const dlq = el.querySelector("[data-dlq]");
  const wait = (ms: number) => new Promise((r) => setTimeout(r, reduce ? 0 : ms));
  el.querySelector("[data-act='run']")?.addEventListener("click", async () => {
    if (queue) queue.textContent = "○ ○ ○ ○ ○";
    const steps = [
      ["LEASED", "01"],
      ["RUNNING", "01"],
      ["FAILED", "01"],
      ["RETRY IN 1.0s", ""],
      ["LEASED", "02"],
      ["FAILED", "02"],
      ["RETRY IN 2.0s", ""],
      ["LEASED", "03"],
      ["FAILED", "03"],
    ];
    for (const [state, w] of steps) {
      if (job) job.textContent = "job-14";
      if (log) log.textContent = state;
      if (workers) workers.textContent = w ? `${w}  leased` : "01  02  03";
      await wait(state.includes("RETRY") ? (state.includes("2.0") ? 1400 : 900) : 550);
    }
    if (log) log.textContent = "DEAD LETTER";
    if (dlq) dlq.textContent = "job-14";
    if (workers) workers.textContent = "01  02  03";
  });
}
