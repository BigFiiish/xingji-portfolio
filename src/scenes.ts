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
    <div class="scene scene-cb" data-scene="clearbay" data-mode="retry" data-step="idle">
      <div class="cb-stack">
        <p class="scene-k" data-post="1">POST /invoice</p>
        <p class="scene-k mute" data-post="2">POST /invoice</p>
        <span class="cb-spine" aria-hidden="true"></span>
        <p class="scene-mid">idempotency key</p>
        <p class="scene-hero" data-inv>#482</p>
        <p class="scene-split"><span data-a>created</span><span data-b>replayed</span></p>
        <p class="scene-end" data-end></p>
      </div>
      <div class="scene-ops">
        <button type="button" data-act="retry">Run request</button>
        <button type="button" class="text" data-act="spoof" hidden>Tenant spoof</button>
        <button type="button" class="text" data-act="retry-mode" hidden>Idempotency</button>
      </div>
    </div>`;
}

function grantline(): string {
  return `
    <div class="scene scene-gl" data-scene="grantline">
      <p class="scene-hero clock" data-ttl>04:59</p>
      <p class="gl-cap">grant ttl</p>
      <div class="vchain-box">
        <i class="gl-signal" aria-hidden="true"></i>
        <ol class="vchain">
          <li data-step="0">Challenge</li>
          <li data-step="1">Proof</li>
          <li data-step="2">Signed grant</li>
          <li data-step="3">Policy</li>
          <li data-step="4">Session</li>
        </ol>
      </div>
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
    if (kind === "clearbay") bindClearbay(el, reduce);
    if (kind === "grantline") bindGrantline(el, reduce);
    if (kind === "durable") bindDurable(el, reduce);
    if (kind === "pulse") bindPulse(el, reduce);
  });
}

function bindClearbay(el: HTMLElement, reduce: boolean) {
  let created = false;
  let replayed = false;
  let busy = false;
  const end = el.querySelector("[data-end]");
  const a = el.querySelector("[data-a]");
  const b = el.querySelector("[data-b]");
  const inv = el.querySelector("[data-inv]");
  const post2 = el.querySelector("[data-post='2']");
  const spoofBtn = el.querySelector<HTMLButtonElement>("[data-act='spoof']");
  const backBtn = el.querySelector<HTMLButtonElement>("[data-act='retry-mode']");
  const retryBtn = el.querySelector<HTMLButtonElement>("[data-act='retry']");
  const wait = (ms: number) => new Promise((r) => setTimeout(r, reduce ? 0 : ms));

  const paintRetry = () => {
    el.dataset.mode = "retry";
    delete el.dataset.flow;
    if (inv) inv.textContent = "#482";
    if (post2) post2.textContent = "POST /invoice";
    if (a) a.textContent = "created";
    if (b) b.textContent = "replayed";
    a?.classList.toggle("on", created);
    b?.classList.toggle("on", replayed);
    if (end) end.textContent = replayed ? "ONE INVOICE." : "";
    el.dataset.step = replayed ? "replay" : created ? "create" : "idle";
    if (retryBtn) {
      retryBtn.hidden = false;
      retryBtn.textContent = created ? "Retry same request" : "Run request";
    }
    if (spoofBtn) spoofBtn.hidden = !replayed;
    if (backBtn) backBtn.hidden = true;
  };

  retryBtn?.addEventListener("click", async () => {
    if (busy || replayed) return;
    busy = true;
    if (!created) {
      if (!reduce) {
        el.dataset.flow = "1";
        await wait(320);
      }
      created = true;
    } else {
      if (!reduce) {
        el.dataset.flow = "2";
        await wait(320);
      }
      replayed = true;
    }
    paintRetry();
    busy = false;
  });
  spoofBtn?.addEventListener("click", () => {
    if (busy || !replayed) return;
    el.dataset.mode = "spoof";
    el.dataset.step = "spoof";
    delete el.dataset.flow;
    if (inv) inv.textContent = "#482";
    if (post2) post2.textContent = "X-Tenant-Id: globex";
    if (a) a.textContent = "header ignored";
    if (b) b.textContent = "jwt bound";
    a?.classList.add("on");
    b?.classList.add("on");
    if (end) end.textContent = "X-Tenant-Id: globex never wins.";
    if (retryBtn) retryBtn.hidden = true;
    if (spoofBtn) spoofBtn.hidden = true;
    if (backBtn) backBtn.hidden = false;
  });
  backBtn?.addEventListener("click", paintRetry);
}

function bindGrantline(el: HTMLElement, reduce: boolean) {
  const ttl = el.querySelector("[data-ttl]");
  const log = el.querySelector("[data-log]");
  const box = el.querySelector<HTMLElement>(".vchain-box");
  const signal = el.querySelector<HTMLElement>(".gl-signal");
  const steps = [...el.querySelectorAll<HTMLElement>(".vchain [data-step]")];
  let left = 299;
  let playing = false;
  const pace = reduce ? 0 : 300;
  const tick = () => {
    if (left <= 0) {
      if (ttl) ttl.textContent = "00:00";
      return;
    }
    left -= 1;
    if (ttl) ttl.textContent = `${String(Math.floor(left / 60)).padStart(2, "0")}:${String(left % 60).padStart(2, "0")}`;
  };
  window.setInterval(tick, 1000);
  const place = (n: number, instant = false) => {
    if (!signal || !box) return;
    const step = steps[Math.max(n, 0)];
    if (!step || n < 0) {
      signal.style.opacity = "";
      box.style.setProperty("--lit", "0px");
      return;
    }
    const br = box.getBoundingClientRect();
    const sr = step.getBoundingClientRect();
    const y = sr.top - br.top + sr.height / 2;
    if (instant) signal.style.transition = "none";
    signal.style.top = `${y - signal.offsetHeight / 2}px`;
    signal.style.opacity = "";
    box.style.setProperty("--lit", `${Math.max(y, 0)}px`);
    if (instant) {
      void signal.offsetTop;
      signal.style.transition = "";
    }
  };
  const light = (n: number, instant = false) => {
    steps.forEach((s, i) => s.classList.toggle("on", i <= n));
    place(n, instant);
  };
  const lit = () => steps.reduce((acc, s, i) => (s.classList.contains("on") ? i : acc), -1);
  if (box) new ResizeObserver(() => place(lit(), true)).observe(box);
  const setLog = (t: string) => {
    if (log) log.textContent = t;
  };
  const reset = () => {
    delete el.dataset.payoff;
    delete el.dataset.fail;
    delete el.dataset.run;
    setLog("");
    light(-1, true);
  };
  const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

  el.querySelector("[data-act='open']")?.addEventListener("click", async () => {
    if (playing) return;
    playing = true;
    reset();
    if (left <= 0) {
      el.dataset.run = "expired";
      light(0, true);
      if (!reduce) await wait(pace);
      el.dataset.fail = "exp";
      setLog("EXPIRED");
      playing = false;
      return;
    }
    el.dataset.run = "open";
    if (reduce) {
      light(4, true);
      el.dataset.payoff = "open";
      setLog("SESSION OPEN");
      playing = false;
      return;
    }
    light(0, true);
    for (let n = 1; n <= 4; n += 1) {
      await wait(pace);
      light(n);
    }
    await wait(pace);
    el.dataset.payoff = "open";
    setLog("SESSION OPEN");
    playing = false;
  });
  el.querySelector("[data-act='badkey']")?.addEventListener("click", async () => {
    if (playing) return;
    playing = true;
    reset();
    el.dataset.run = "bad";
    if (reduce) {
      light(1, true);
      el.dataset.fail = "sig";
      setLog("SIGNATURE INVALID");
      playing = false;
      return;
    }
    light(0, true);
    await wait(pace);
    light(1);
    await wait(pace);
    el.dataset.fail = "sig";
    setLog("SIGNATURE INVALID");
    playing = false;
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
