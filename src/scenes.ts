import type { Project } from "./content";

export type PulseCtl = {
  pause: () => void;
  resume: () => void;
};

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
        <button type="button" class="text" data-act="spoof">Spoof tenant</button>
        <button type="button" class="text" data-act="reset" hidden>Reset</button>
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
    <div class="scene scene-db" data-scene="durable" data-phase="idle" data-on="" data-now="">
      <p class="db-status" data-log aria-live="polite">READY</p>
      <div class="db-canvas">
        <svg class="db-flow db-desk" viewBox="0 0 1100 300" aria-hidden="true">
          <path data-wire="a" d="M 148 46 H 248 L 300 150"/>
          <path data-wire="b" d="M 148 150 H 300"/>
          <path data-wire="c" d="M 148 254 H 248 L 300 150"/>
          <path data-wire="join" d="M 300 150 H 400"/>
          <path data-wire="eval" d="M 400 150 H 590"/>
          <path data-wire="loop" d="M 610 150 V 246 H 548 V 150 H 610"/>
          <path data-wire="gate" d="M 610 150 H 790"/>
          <path data-wire="pub" d="M 790 150 H 980"/>
          <circle data-dot="a" cx="148" cy="46" r="2.4"/>
          <circle data-dot="b" cx="148" cy="150" r="2.4"/>
          <circle data-dot="c" cx="148" cy="254" r="2.4"/>
          <circle data-dot="join" cx="300" cy="150" r="2.4"/>
          <circle data-dot="draft" cx="400" cy="150" r="2.4"/>
          <circle data-dot="eval" cx="590" cy="150" r="2.4"/>
          <circle data-dot="revise" cx="590" cy="246" r="2.4"/>
          <circle data-dot="gate" cx="790" cy="150" r="2.4"/>
          <circle data-dot="pub" cx="980" cy="150" r="2.4"/>
          <text data-node="a" x="24" y="50">Research A</text>
          <text data-node="b" x="24" y="154">Research B</text>
          <text data-node="c" x="24" y="258">Research C</text>
          <text data-node="draft" x="400" y="136" text-anchor="middle">Draft</text>
          <text data-node="eval" x="590" y="136" text-anchor="middle">Evaluate</text>
          <text data-node="revise" x="590" y="272" text-anchor="middle">Revise</text>
          <text data-node="gate" x="790" y="136" text-anchor="middle">Human gate</text>
          <text data-node="pub" x="980" y="136" text-anchor="middle">Publish</text>
          <circle class="db-sig" data-sig="a" data-x="148" data-y="46" r="3.4" cx="148" cy="46"/>
          <circle class="db-sig" data-sig="b" data-x="148" data-y="150" r="3.4" cx="148" cy="150"/>
          <circle class="db-sig" data-sig="c" data-x="148" data-y="254" r="3.4" cx="148" cy="254"/>
          <circle class="db-sig" data-sig="m" data-x="300" data-y="150" r="3.4" cx="300" cy="150"/>
        </svg>
        <svg class="db-flow db-hand" viewBox="0 0 360 680" aria-hidden="true">
          <path data-wire="a" d="M 216 40 V 188"/>
          <path data-wire="b" d="M 216 96 V 188"/>
          <path data-wire="c" d="M 216 152 V 188"/>
          <path data-wire="join" d="M 216 188 V 250"/>
          <path data-wire="eval" d="M 216 250 V 320"/>
          <path data-wire="loop" d="M 216 320 C 288 320 288 400 216 400"/>
          <path data-wire="eval2" d="M 216 400 V 480"/>
          <path data-wire="gate" d="M 216 480 V 560"/>
          <path data-wire="pub" d="M 216 560 V 640"/>
          <circle data-dot="a" cx="216" cy="40" r="2.4"/>
          <circle data-dot="b" cx="216" cy="96" r="2.4"/>
          <circle data-dot="c" cx="216" cy="152" r="2.4"/>
          <circle data-dot="join" cx="216" cy="188" r="2.4"/>
          <circle data-dot="draft" cx="216" cy="250" r="2.4"/>
          <circle data-dot="eval" cx="216" cy="320" r="2.4"/>
          <circle data-dot="revise" cx="216" cy="400" r="2.4"/>
          <circle data-dot="eval2" cx="216" cy="480" r="2.4"/>
          <circle data-dot="gate" cx="216" cy="560" r="2.4"/>
          <circle data-dot="pub" cx="216" cy="640" r="2.4"/>
          <text data-node="a" x="24" y="44">Research A</text>
          <text data-node="b" x="24" y="100">Research B</text>
          <text data-node="c" x="24" y="156">Research C</text>
          <text data-node="join" x="24" y="192">Join</text>
          <text data-node="draft" x="24" y="254">Draft</text>
          <text data-node="eval" x="24" y="324">Evaluate</text>
          <text data-node="revise" x="24" y="404">Revise</text>
          <text data-node="eval2" x="24" y="484">Evaluate</text>
          <text data-node="gate" x="24" y="564">Human gate</text>
          <text data-node="pub" x="24" y="644">Publish</text>
          <circle class="db-sig" data-sig="a" data-x="216" data-y="40" r="3.4" cx="216" cy="40"/>
          <circle class="db-sig" data-sig="b" data-x="216" data-y="96" r="3.4" cx="216" cy="96"/>
          <circle class="db-sig" data-sig="c" data-x="216" data-y="152" r="3.4" cx="216" cy="152"/>
          <circle class="db-sig" data-sig="m" data-x="216" data-y="188" r="3.4" cx="216" cy="188"/>
        </svg>
      </div>
      <p class="scene-note db-note">The tab can close. The workflow doesn't.</p>
      <div class="scene-ops">
        <button type="button" data-act="run">Run workflow</button>
        <button type="button" data-act="approve" hidden>Approve</button>
        <button type="button" class="text" data-act="replay" hidden>Replay</button>
      </div>
    </div>`;
}

function pulse(): string {
  return `
    <div class="scene scene-pq" data-scene="pulse" data-phase="idle" data-lease="">
      <p class="pq-status" data-log aria-live="polite">READY</p>
      <div class="pq-canvas">
        <svg class="pq-flow pq-desk" viewBox="0 0 1100 280" aria-hidden="true">
          <path data-wire="c1" d="M 168 88 H 500"/>
          <path data-wire="c2" d="M 168 88 H 650"/>
          <path data-wire="c3" d="M 168 88 H 800"/>
          <path data-wire="d1" d="M 500 88 V 200"/>
          <path data-wire="b1" d="M 500 200 H 168"/>
          <path data-wire="r1" d="M 168 200 V 88"/>
          <path data-wire="d2" d="M 650 88 V 200"/>
          <path data-wire="b2" d="M 650 200 H 168"/>
          <path data-wire="r2" d="M 168 200 V 88"/>
          <path data-wire="dlq" d="M 800 88 L 960 200"/>
          <path class="pq-lane" d="M 168 200 H 800"/>
          <line class="pq-stem" data-stem="01" x1="500" y1="54" x2="500" y2="80"/>
          <line class="pq-stem" data-stem="02" x1="650" y1="54" x2="650" y2="80"/>
          <line class="pq-stem" data-stem="03" x1="800" y1="54" x2="800" y2="80"/>
          <circle class="pq-slot" cx="48" cy="88" r="3.2"/>
          <circle class="pq-slot" cx="72" cy="88" r="3.2"/>
          <circle class="pq-slot" cx="96" cy="88" r="3.2"/>
          <circle class="pq-slot" cx="120" cy="88" r="3.2"/>
          <circle class="pq-slot" cx="144" cy="88" r="3.2"/>
          <circle data-dot="01" cx="500" cy="88" r="2.4"/>
          <circle data-dot="02" cx="650" cy="88" r="2.4"/>
          <circle data-dot="03" cx="800" cy="88" r="2.4"/>
          <circle data-dot="dlq" cx="960" cy="200" r="2.4"/>
          <text class="pq-col" x="48" y="32">Queue</text>
          <text class="pq-col" x="500" y="32" text-anchor="middle">Workers</text>
          <text class="pq-col" x="960" y="32" text-anchor="middle">Result</text>
          <text data-node="01" x="500" y="48" text-anchor="middle">01</text>
          <text data-node="02" x="650" y="48" text-anchor="middle">02</text>
          <text data-node="03" x="800" y="48" text-anchor="middle">03</text>
          <text data-node="done" x="960" y="56" text-anchor="middle">Complete  —</text>
          <text data-node="wait" x="168" y="222">Backoff</text>
          <text data-node="dlq" x="960" y="186" text-anchor="middle">Dead letter</text>
          <text class="pq-dlq-val" data-dlq x="960" y="222" text-anchor="middle">—</text>
          <g class="pq-token" data-token transform="translate(168 88)">
            <circle r="8"/>
            <text y="3.2" text-anchor="middle">14</text>
          </g>
        </svg>
        <svg class="pq-flow pq-hand" viewBox="0 0 360 700" aria-hidden="true">
          <path data-wire="c1" d="M 148 48 H 216 V 140"/>
          <path data-wire="b1" d="M 216 140 V 210"/>
          <path data-wire="c2" d="M 216 210 V 290"/>
          <path data-wire="b2" d="M 216 290 V 370"/>
          <path data-wire="c3" d="M 216 370 V 460"/>
          <path data-wire="dlq" d="M 216 460 V 560"/>
          <line class="pq-stem" data-stem="01" x1="200" y1="140" x2="216" y2="140"/>
          <line class="pq-stem" data-stem="02" x1="200" y1="290" x2="216" y2="290"/>
          <line class="pq-stem" data-stem="03" x1="200" y1="460" x2="216" y2="460"/>
          <circle class="pq-slot" cx="48" cy="48" r="3.2"/>
          <circle class="pq-slot" cx="68" cy="48" r="3.2"/>
          <circle class="pq-slot" cx="88" cy="48" r="3.2"/>
          <circle class="pq-slot" cx="108" cy="48" r="3.2"/>
          <circle class="pq-slot" cx="128" cy="48" r="3.2"/>
          <circle data-dot="01" cx="216" cy="140" r="2.4"/>
          <circle data-dot="02" cx="216" cy="290" r="2.4"/>
          <circle data-dot="03" cx="216" cy="460" r="2.4"/>
          <circle data-dot="dlq" cx="216" cy="560" r="2.4"/>
          <text class="pq-col" x="24" y="32">Queue</text>
          <text data-node="01" x="24" y="144">Worker 01</text>
          <text data-node="wait1" x="24" y="204">Backoff</text>
          <text data-node="wait1s" x="24" y="222">1s</text>
          <text data-node="02" x="24" y="294">Worker 02</text>
          <text data-node="wait2" x="24" y="364">Backoff</text>
          <text data-node="wait2s" x="24" y="382">2s</text>
          <text data-node="03" x="24" y="464">Worker 03</text>
          <text data-node="dlq" x="24" y="564">Dead letter</text>
          <text class="pq-dlq-val" data-dlq x="24" y="588">—</text>
          <g class="pq-token" data-token transform="translate(148 48)">
            <circle r="8"/>
            <text y="3.2" text-anchor="middle">14</text>
          </g>
        </svg>
      </div>
      <p class="scene-note pq-note" data-note></p>
      <div class="scene-ops">
        <button type="button" data-act="run">Run job</button>
        <button type="button" class="text" data-act="replay" hidden>Replay</button>
      </div>
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
  const resetBtn = el.querySelector<HTMLButtonElement>("[data-act='reset']");
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
      retryBtn.hidden = replayed;
      retryBtn.textContent = created ? "Retry same request" : "Run request";
    }
    if (spoofBtn) spoofBtn.hidden = false;
    if (resetBtn) resetBtn.hidden = !replayed;
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
    if (busy) return;
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
    if (resetBtn) resetBtn.hidden = false;
  });
  resetBtn?.addEventListener("click", () => {
    if (busy) return;
    created = false;
    replayed = false;
    paintRetry();
  });
}

function bindGrantline(el: HTMLElement, reduce: boolean) {
  const ttl = el.querySelector("[data-ttl]");
  const log = el.querySelector("[data-log]");
  const box = el.querySelector<HTMLElement>(".vchain-box");
  const signal = el.querySelector<HTMLElement>(".gl-signal");
  const steps = [...el.querySelectorAll<HTMLElement>(".vchain [data-step]")];
  let left = 299;
  let playing = false;
  let ticking = false;
  const pace = reduce ? 0 : 300;
  const tick = () => {
    if (left <= 0) {
      if (ttl) ttl.textContent = "00:00";
      return;
    }
    left -= 1;
    if (ttl) ttl.textContent = `${String(Math.floor(left / 60)).padStart(2, "0")}:${String(left % 60).padStart(2, "0")}`;
  };
  let ttlTimer = 0;
  const startTtl = () => {
    if (ticking) return;
    ticking = true;
    ttlTimer = window.setInterval(() => {
      tick();
      if (left <= 0) {
        window.clearInterval(ttlTimer);
        ttlTimer = 0;
        ticking = false;
      }
    }, 1000);
  };
  const io = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.intersectionRatio >= 0.45)) return;
      io.disconnect();
      startTtl();
    },
    { threshold: [0, 0.4, 0.45, 0.5] },
  );
  io.observe(el);
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

type DbPhase = "idle" | "research" | "join" | "draft" | "eval1" | "revise" | "eval2" | "gate" | "publish";

function bindDurable(el: HTMLElement, reduce: boolean) {
  const log = el.querySelector("[data-log]");
  const runBtn = el.querySelector<HTMLButtonElement>("[data-act='run']");
  const approveBtn = el.querySelector<HTMLButtonElement>("[data-act='approve']");
  const replayBtn = el.querySelector<HTMLButtonElement>("[data-act='replay']");
  let gen = 0;
  const hold = (ms: number) => new Promise((r) => setTimeout(r, reduce ? 90 : ms));

  const canvas = () => {
    const desk = el.querySelector<SVGSVGElement>(".db-desk");
    if (desk && getComputedStyle(desk).display !== "none") return desk;
    return el.querySelector<SVGSVGElement>(".db-hand");
  };

  const park = () => {
    el.querySelectorAll<SVGCircleElement>("[data-sig]").forEach((sig) => {
      sig.classList.remove("on");
      sig.setAttribute("cx", sig.dataset.x ?? "0");
      sig.setAttribute("cy", sig.dataset.y ?? "0");
    });
  };

  const travel = (name: string, wire: string, ms: number, id: number) => {
    const root = canvas();
    const token = root?.querySelector<SVGCircleElement>(`[data-sig="${name}"]`);
    const path = root?.querySelector<SVGPathElement>(`[data-wire="${wire}"]`);
    if (!token || !path) return Promise.resolve();
    token.classList.add("on");
    const len = path.getTotalLength();
    const end = path.getPointAtLength(len);
    if (reduce) {
      token.setAttribute("cx", String(end.x));
      token.setAttribute("cy", String(end.y));
      return Promise.resolve();
    }
    const t0 = performance.now();
    return new Promise<void>((resolve) => {
      const step = (now: number) => {
        if (id !== gen) {
          resolve();
          return;
        }
        const t = Math.min(1, (now - t0) / ms);
        const p = path.getPointAtLength(len * t);
        token.setAttribute("cx", String(p.x));
        token.setAttribute("cy", String(p.y));
        if (t < 1) requestAnimationFrame(step);
        else resolve();
      };
      requestAnimationFrame(step);
    });
  };

  const paint = (phase: DbPhase, on: string, now: string, status: string) => {
    el.dataset.phase = phase;
    el.dataset.on = on;
    el.dataset.now = now;
    if (log) log.textContent = status;
    const idle = phase === "idle";
    const gate = phase === "gate";
    const done = phase === "publish";
    if (runBtn) runBtn.hidden = !idle;
    if (approveBtn) approveBtn.hidden = !gate;
    if (replayBtn) replayBtn.hidden = !done;
    el.setAttribute("aria-busy", idle || gate || done ? "false" : "true");
  };

  const idle = () => {
    park();
    paint("idle", "", "", "READY");
  };

  const alive = (id: number) => id === gen;

  runBtn?.addEventListener("click", async () => {
    if (el.dataset.phase !== "idle") return;
    const id = ++gen;
    paint("research", "", "a b c", "RESEARCH");
    await Promise.all([travel("a", "a", 700, id), travel("b", "b", 700, id), travel("c", "c", 700, id)]);
    if (!alive(id)) return;
    paint("research", "a b c", "a b c", "RESEARCH");
    await hold(180);
    if (!alive(id)) return;
    el.querySelectorAll<SVGCircleElement>('[data-sig="a"], [data-sig="b"], [data-sig="c"]').forEach((s) => {
      s.classList.remove("on");
      s.setAttribute("cx", s.dataset.x ?? "0");
      s.setAttribute("cy", s.dataset.y ?? "0");
    });
    paint("join", "a b c join", "join", "RESEARCH");
    await travel("m", "join", 500, id);
    if (!alive(id)) return;
    await hold(180);
    if (!alive(id)) return;
    paint("draft", "a b c join draft", "draft", "DRAFT");
    await hold(420);
    if (!alive(id)) return;
    await travel("m", "eval", 600, id);
    if (!alive(id)) return;
    paint("eval1", "a b c join draft eval", "eval", "NEEDS REVISION");
    await hold(520);
    if (!alive(id)) return;
    paint("revise", "a b c join draft eval revise", "revise", "REVISE");
    await travel("m", "loop", 900, id);
    if (!alive(id)) return;
    await hold(200);
    if (!alive(id)) return;
    const hand = canvas()?.classList.contains("db-hand");
    if (hand) {
      paint("eval2", "a b c join draft eval revise eval2", "eval2", "PASS");
      await travel("m", "eval2", 500, id);
    } else {
      paint("eval2", "a b c join draft eval revise", "eval", "PASS");
      await hold(420);
    }
    if (!alive(id)) return;
    await hold(280);
    if (!alive(id)) return;
    await travel("m", "gate", 650, id);
    if (!alive(id)) return;
    paint("gate", "a b c join draft eval revise eval2 gate", "gate", "WAITING FOR HUMAN");
    el.querySelectorAll<SVGCircleElement>('[data-sig="m"]').forEach((s) => s.classList.remove("on"));
  });

  approveBtn?.addEventListener("click", async () => {
    if (el.dataset.phase !== "gate") return;
    const id = ++gen;
    if (approveBtn) approveBtn.hidden = true;
    const token = canvas()?.querySelector<SVGCircleElement>('[data-sig="m"]');
    token?.classList.add("on");
    await travel("m", "pub", 700, id);
    if (!alive(id)) return;
    paint("publish", "a b c join draft eval revise eval2 gate pub", "pub", "PUBLISHED");
    el.querySelectorAll<SVGCircleElement>('[data-sig="m"]').forEach((s) => s.classList.remove("on"));
  });

  replayBtn?.addEventListener("click", () => {
    gen += 1;
    idle();
  });

  idle();
}

function bindPulse(el: HTMLElement, reduce: boolean) {
  const log = el.querySelector("[data-log]");
  const note = el.querySelector("[data-note]");
  const runBtn = el.querySelector<HTMLButtonElement>("[data-act='run']");
  const replayBtn = el.querySelector<HTMLButtonElement>("[data-act='replay']");
  let gen = 0;
  let paused = false;
  let pauseStarted = 0;
  let pauseAccum = 0;
  const clock = () => {
    const p = performance.now();
    return p - pauseAccum - (paused ? p - pauseStarted : 0);
  };
  const pause = () => {
    if (paused) return;
    paused = true;
    pauseStarted = performance.now();
  };
  const resume = () => {
    if (!paused) return;
    pauseAccum += performance.now() - pauseStarted;
    pauseStarted = 0;
    paused = false;
  };
  (el as HTMLElement & { __pulse?: PulseCtl }).__pulse = { pause, resume };

  const hold = (ms: number, id: number) =>
    new Promise<void>((resolve) => {
      const t0 = clock();
      const need = reduce ? 90 : ms;
      const tick = () => {
        if (id !== gen) {
          resolve();
          return;
        }
        if (clock() - t0 >= need) resolve();
        else requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });

  const canvas = () => {
    const desk = el.querySelector<SVGSVGElement>(".pq-desk");
    if (desk && getComputedStyle(desk).display !== "none") return desk;
    return el.querySelector<SVGSVGElement>(".pq-hand");
  };

  const put = (x: number, y: number) => {
    el.querySelectorAll<SVGGElement>("[data-token]").forEach((token) => {
      const root = token.closest("svg");
      const visible = root && getComputedStyle(root).display !== "none";
      if (!visible) return;
      token.setAttribute("transform", `translate(${x} ${y})`);
    });
  };

  const park = () => {
    el.querySelectorAll<SVGGElement>("[data-token]").forEach((token) => {
      const start = token.closest("svg")?.classList.contains("pq-hand") ? [148, 48] : [168, 88];
      token.setAttribute("transform", `translate(${start[0]} ${start[1]})`);
    });
  };

  const travel = (wire: string, ms: number, id: number) => {
    const root = canvas();
    const token = root?.querySelector<SVGGElement>("[data-token]");
    const path = root?.querySelector<SVGPathElement>(`[data-wire="${wire}"]`);
    if (!token || !path) return Promise.resolve();
    const len = path.getTotalLength();
    const end = path.getPointAtLength(len);
    if (reduce || len < 1) {
      put(end.x, end.y);
      return Promise.resolve();
    }
    const t0 = clock();
    return new Promise<void>((resolve) => {
      const step = () => {
        if (id !== gen) {
          resolve();
          return;
        }
        const t = Math.min(1, (clock() - t0) / ms);
        const p = path.getPointAtLength(len * t);
        put(p.x, p.y);
        if (t < 1) requestAnimationFrame(step);
        else resolve();
      };
      requestAnimationFrame(step);
    });
  };

  const paint = (phase: string, lease: string, status: string, footnote = "") => {
    el.dataset.phase = phase;
    el.dataset.lease = lease;
    if (log) log.textContent = status;
    if (note) note.textContent = footnote;
    const idle = phase === "idle";
    const done = phase === "dlq";
    if (runBtn) runBtn.hidden = !idle;
    if (replayBtn) replayBtn.hidden = !done;
    el.querySelectorAll("[data-dlq]").forEach((n) => {
      n.textContent = done ? "job-14" : "—";
    });
    el.setAttribute("aria-busy", idle || done ? "false" : "true");
  };

  const idle = () => {
    park();
    paint("idle", "", "READY");
  };

  const alive = (id: number) => id === gen;

  runBtn?.addEventListener("click", async () => {
    if (el.dataset.phase !== "idle") return;
    const id = ++gen;
    pauseAccum = 0;
    paused = false;
    paint("lease1", "01", "LEASED BY 01");
    await travel("c1", 420, id);
    if (!alive(id)) return;
    await hold(200, id);
    if (!alive(id)) return;
    paint("run1", "01", "RUNNING");
    await hold(320, id);
    if (!alive(id)) return;
    paint("fail1", "", "FAILED");
    await hold(220, id);
    if (!alive(id)) return;
    await travel("d1", 200, id);
    if (!alive(id)) return;
    paint("wait1", "", "BACKOFF 1s");
    await travel("b1", 700, id);
    if (!alive(id)) return;
    await travel("r1", 250, id);
    if (!alive(id)) return;
    paint("lease2", "02", "LEASED BY 02");
    await travel("c2", 420, id);
    if (!alive(id)) return;
    await hold(200, id);
    if (!alive(id)) return;
    paint("run2", "02", "RUNNING");
    await hold(300, id);
    if (!alive(id)) return;
    paint("fail2", "", "FAILED");
    await hold(220, id);
    if (!alive(id)) return;
    await travel("d2", 200, id);
    if (!alive(id)) return;
    paint("wait2", "", "BACKOFF 2s");
    await travel("b2", 1000, id);
    if (!alive(id)) return;
    await travel("r2", 250, id);
    if (!alive(id)) return;
    paint("lease3", "03", "LEASED BY 03");
    await travel("c3", 420, id);
    if (!alive(id)) return;
    await hold(200, id);
    if (!alive(id)) return;
    paint("run3", "03", "RUNNING");
    await hold(300, id);
    if (!alive(id)) return;
    paint("fail3", "", "FAILED");
    await hold(220, id);
    if (!alive(id)) return;
    await travel("dlq", 450, id);
    if (!alive(id)) return;
    paint("dlq", "", "DEAD LETTER", "retry budget exhausted");
  });

  replayBtn?.addEventListener("click", () => {
    gen += 1;
    pauseAccum = 0;
    paused = false;
    idle();
  });

  idle();
}
