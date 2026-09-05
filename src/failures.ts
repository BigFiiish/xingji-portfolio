export type FailId = "race" | "expire" | "fail" | "hallucinate";

export const failDemos: {
  id: FailId;
  kicker: string;
  title: string;
  from: string;
  to: string;
  project: string;
  slugs: string[];
  line: string;
}[] = [
  {
    id: "race",
    kicker: "Race",
    title: "Two buyers, one unit",
    from: "Both target stock = 1.",
    to: "1 CREATED  /  1 CONFLICT",
    project: "Catalog Order Service",
    slugs: ["catalog-order-service"],
    line: "Concurrent orders cannot oversell the last unit.",
  },
  {
    id: "expire",
    kicker: "Expire",
    title: "Grant past TTL",
    from: "TTL 00:03.",
    to: "EXPIRED  /  DENIED",
    project: "Grantline",
    slugs: ["grantline"],
    line: "Expired authority does not open a session.",
  },
  {
    id: "fail",
    kicker: "Fail",
    title: "Bounded retries",
    from: "1s · 2s · attempt 3",
    to: "DEAD LETTER",
    project: "PulseQueue",
    slugs: ["pulsequeue"],
    line: "Infinite retry is not resilience.",
  },
  {
    id: "hallucinate",
    kicker: "Hallucinate",
    title: "Untrusted tool call",
    from: "SCHEMA → AUTH → EXECUTE",
    to: "SCHEMA REJECTED",
    project: "Dockline",
    slugs: ["dockline"],
    line: "The model is an untrusted caller.",
  },
];

export function failSection(): string {
  return `
    <div class="play-words" role="tablist" aria-label="Failure simulations">
      ${failDemos
        .map(
          (d, i) =>
            `<button type="button" role="tab" class="play-word" id="fail-tab-${d.id}" data-fail="${d.id}" aria-selected="false" aria-controls="play-stage" tabindex="${i === 0 ? "0" : "-1"}">
              <span class="play-card-top"><span>${String(i + 1).padStart(2, "0")}</span><em>${d.kicker}</em></span>
              <strong>${d.title}</strong>
              <span class="play-project">${d.project}</span>
              <span class="play-transition"><span>${d.from}</span><b>${d.to}</b></span>
              <span class="play-line">${d.line}</span>
            </button>`,
        )
        .join("")}
    </div>
    <p class="fp-hint" hidden>Click Race.</p>
    <div class="play-stage" id="play-stage" role="tabpanel" hidden></div>
    <p class="fp-live" aria-live="polite"></p>
    <button type="button" class="play-reset" data-reset hidden>Reset</button>`;
}

function stage(id: FailId): string {
  const d = failDemos.find((x) => x.id === id)!;
  if (id === "race") {
    return `<p class="mono">version = 8</p><p class="split">WRITE A &nbsp; WRITE B</p><p class="split">200 / v9 &nbsp; 409</p><p class="line">${d.line}</p>`;
  }
  if (id === "expire") {
    return `<p class="mono">SIGNED GRANT</p><p class="mute">TTL 00:00</p><p class="big">EXPIRED</p><p class="line">${d.line}</p>`;
  }
  if (id === "fail") {
    return `<p class="mono">attempt 1</p><p class="mute">1s</p><p class="mono">attempt 2</p><p class="mute">2s</p><p class="mono">attempt 3</p><p class="big">DLQ</p><p class="line">${d.line}</p>`;
  }
  return `<p class="mono">AGENT CALL</p><p class="mute">schema → auth → execute</p><p class="big">SCHEMA REJECTED</p><p class="line">${d.line}</p>`;
}

function simMarkup(id: FailId): string {
  const d = failDemos.find((x) => x.id === id)!;
  if (id === "race") {
    return `
      <svg class="fp-svg fp-desk" viewBox="0 0 720 220" aria-hidden="true">
        <path data-wire="a" d="M 120 70 H 280 L 410 110"/>
        <path data-wire="b" d="M 120 150 H 280 L 410 110"/>
        <circle data-dot="rec" cx="410" cy="110" r="3"/>
        <text x="40" y="74">Write A</text>
        <text x="40" y="154">Write B</text>
        <text data-node="ver" x="410" y="52" text-anchor="middle">version 8</text>
        <text data-node="ok" x="470" y="96">200</text>
        <text data-node="bad" x="470" y="154">409</text>
        <circle class="fp-sig" data-sig="a" r="3.4" cx="120" cy="70"/>
        <circle class="fp-sig" data-sig="b" r="3.4" cx="120" cy="150"/>
      </svg>
      <svg class="fp-svg fp-hand" viewBox="0 0 320 360" aria-hidden="true">
        <path data-wire="a" d="M 160 56 V 140"/>
        <path data-wire="b" d="M 160 188 V 280"/>
        <text x="24" y="40">Write A</text>
        <text data-node="ver" x="24" y="148">version 8</text>
        <text data-node="ok" x="200" y="148">200</text>
        <text x="24" y="184">Write B</text>
        <text data-node="bad" x="24" y="300">409</text>
        <circle class="fp-sig" data-sig="a" r="3.4" cx="160" cy="56"/>
        <circle class="fp-sig" data-sig="b" r="3.4" cx="160" cy="188"/>
      </svg>
      <p class="fp-out" data-out></p>
      <p class="fp-line">${d.line}</p>`;
  }
  if (id === "expire") {
    return `
      <svg class="fp-svg fp-desk" viewBox="0 0 640 220" aria-hidden="true">
        <path data-wire="s" d="M 180 110 H 300"/>
        <circle data-dot="g" cx="150" cy="110" r="2.6"/>
        <circle data-dot="s" cx="460" cy="110" r="2.6"/>
        <text data-node="grant" x="150" y="48" text-anchor="middle">Grant</text>
        <text data-node="ttl" x="150" y="168" text-anchor="middle">00:03</text>
        <text data-node="sess" x="460" y="48" text-anchor="middle">Session</text>
        <circle class="fp-sig" data-sig="s" r="3.4" cx="150" cy="110"/>
      </svg>
      <svg class="fp-svg fp-hand" viewBox="0 0 320 340" aria-hidden="true">
        <path data-wire="s" d="M 160 80 V 150"/>
        <text data-node="grant" x="24" y="48">Grant</text>
        <text data-node="ttl" x="24" y="120">00:03</text>
        <text data-node="sess" x="24" y="240">Session</text>
        <circle class="fp-sig" data-sig="s" r="3.4" cx="160" cy="80"/>
      </svg>
      <p class="fp-out" data-out></p>
      <p class="fp-line">${d.line}</p>`;
  }
  if (id === "fail") {
    return `
      <svg class="fp-svg fp-desk" viewBox="0 0 720 240" aria-hidden="true">
        <path data-wire="a" d="M 92 120 H 224"/>
        <path data-wire="b" d="M 260 120 H 392"/>
        <path data-wire="c" d="M 428 120 H 560"/>
        <text data-node="a1" x="92" y="80" text-anchor="middle">Attempt 01</text>
        <text data-node="w1" x="242" y="154" text-anchor="middle">1s</text>
        <text data-node="a2" x="326" y="80" text-anchor="middle">Attempt 02</text>
        <text data-node="w2" x="410" y="154" text-anchor="middle">2s</text>
        <text data-node="a3" x="494" y="80" text-anchor="middle">Attempt 03</text>
        <text data-node="dlq" x="624" y="124" text-anchor="middle">DLQ</text>
        <circle class="fp-sig" data-sig="s" r="3.4" cx="92" cy="120"/>
      </svg>
      <svg class="fp-svg fp-hand" viewBox="0 0 320 340" aria-hidden="true">
        <path data-wire="a" d="M 200 40 V 96"/>
        <path data-wire="b" d="M 200 118 V 180"/>
        <path data-wire="c" d="M 200 202 V 268"/>
        <text data-node="a1" x="24" y="44">Attempt 01</text>
        <text data-node="w1" x="24" y="112">1s</text>
        <text data-node="a2" x="24" y="184">Attempt 02</text>
        <text data-node="w2" x="24" y="216">2s</text>
        <text data-node="a3" x="24" y="272">Attempt 03</text>
        <text data-node="dlq" x="24" y="320">DLQ</text>
        <circle class="fp-sig" data-sig="s" r="3.4" cx="200" cy="40"/>
      </svg>
      <p class="fp-out" data-out></p>
      <p class="fp-line">${d.line}</p>`;
  }
  return `
    <svg class="fp-svg fp-desk" viewBox="0 0 720 240" aria-hidden="true">
      <path data-wire="a" d="M 92 120 H 248"/>
      <path data-wire="x" d="M 248 102 V 138"/>
      <text data-node="call" x="92" y="80" text-anchor="middle">Agent call</text>
      <text data-node="blob" x="92" y="162" text-anchor="middle">{ "action": "releaseWave" }</text>
      <text data-node="schema" x="308" y="124" text-anchor="middle">Schema</text>
      <text data-node="auth" x="456" y="124" text-anchor="middle">Auth</text>
      <text data-node="exec" x="604" y="124" text-anchor="middle">Execute</text>
      <circle class="fp-sig" data-sig="s" r="3.4" cx="92" cy="120"/>
    </svg>
    <svg class="fp-svg fp-hand" viewBox="0 0 320 340" aria-hidden="true">
      <path data-wire="a" d="M 200 44 V 110"/>
      <path data-wire="x" d="M 182 110 L 218 110"/>
      <text data-node="call" x="24" y="48">Agent call</text>
      <text data-node="blob" x="24" y="72">{ "action": "releaseWave" }</text>
      <text data-node="schema" x="24" y="114">Schema</text>
      <text data-node="auth" x="24" y="190">Auth</text>
      <text data-node="exec" x="24" y="266">Execute</text>
      <circle class="fp-sig" data-sig="s" r="3.4" cx="200" cy="44"/>
    </svg>
    <p class="fp-out" data-out></p>
    <p class="fp-line">${d.line}</p>`;
}

let play: ((id: FailId) => void) | null = null;

export function playFail(id: FailId) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelector("#failures")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  play?.(id);
}

export function bindFailures(root: HTMLElement) {
  const stageEl = root.querySelector<HTMLElement>("#play-stage");
  const reset = root.querySelector<HTMLButtonElement>("[data-reset]");
  const live = root.querySelector<HTMLElement>(".fp-live");
  const words = [...root.querySelectorAll<HTMLButtonElement>(".play-word")];
  const chapter = root.closest<HTMLElement>(".failures") ?? root;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let gen = 0;
  const hold = (ms: number, id: number) => new Promise<void>((r) => setTimeout(r, id !== gen ? 0 : reduce ? 40 : ms));

  const canvas = (wrap: HTMLElement) => {
    const desk = wrap.querySelector<SVGSVGElement>(".fp-desk");
    if (desk && getComputedStyle(desk).display !== "none") return desk;
    return wrap.querySelector<SVGSVGElement>(".fp-hand");
  };

  const travel = (wrap: HTMLElement, name: string, wire: string, ms: number, id: number) => {
    const svg = canvas(wrap);
    const token = svg?.querySelector<SVGCircleElement>(`[data-sig="${name}"]`);
    const path = svg?.querySelector<SVGPathElement>(`[data-wire="${wire}"]`);
    if (!token || !path) return Promise.resolve();
    token.classList.add("on");
    const len = path.getTotalLength();
    const end = path.getPointAtLength(len);
    if (reduce || len < 1) {
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

  const say = (t: string) => {
    if (live) live.textContent = t;
    const out = stageEl?.querySelector("[data-out]");
    if (out) out.textContent = t;
  };

  const run = async (id: FailId, token: number) => {
    if (!stageEl) return;
    const wrap = stageEl;
    wrap.dataset.sim = id;
    wrap.dataset.phase = "run";
    if (id === "race") {
      if (reduce) {
        wrap.querySelectorAll("[data-node='ver']").forEach((n) => {
          n.textContent = "version 9";
        });
        wrap.dataset.phase = "conflict";
        say("409 CONFLICT");
        return;
      }
      wrap.dataset.phase = "read";
      wrap.querySelectorAll(".fp-sig").forEach((n) => n.classList.add("on"));
      say("BOTH READ VERSION 8");
      await hold(720, token);
      if (token !== gen) return;
      wrap.dataset.phase = "run";
      await travel(wrap, "a", "a", 760, token);
      if (token !== gen) return;
      wrap.dataset.phase = "win";
      wrap.querySelectorAll("[data-node='ver']").forEach((n) => {
        n.textContent = "version 9";
      });
      say("WRITE A · 200");
      await hold(520, token);
      if (token !== gen) return;
      wrap.dataset.phase = "stale";
      await travel(wrap, "b", "b", 820, token);
      if (token !== gen) return;
      wrap.dataset.phase = "conflict";
      say("409 CONFLICT");
    } else if (id === "expire") {
      const ttl = wrap.querySelectorAll("[data-node='ttl']");
      const deny = () => {
        wrap.dataset.phase = "denied";
        ttl.forEach((n) => {
          n.textContent = "00:00";
        });
        canvas(wrap)?.querySelector<SVGCircleElement>("[data-sig='s']")?.classList.remove("on");
        say("DENIED");
      };
      if (reduce) {
        deny();
        return;
      }
      wrap.dataset.phase = "tick";
      const ticks = ["00:03", "00:02", "00:01", "00:00"];
      for (const t of ticks) {
        if (token !== gen) return;
        ttl.forEach((n) => {
          n.textContent = t;
        });
        wrap.dataset.phase = t === "00:00" ? "zero" : "tick";
        if (t === "00:00") say("EXPIRED");
        await hold(t === "00:00" ? 680 : 740, token);
      }
      if (token !== gen) return;
      await travel(wrap, "s", "s", 560, token);
      if (token !== gen) return;
      deny();
    } else if (id === "fail") {
      wrap.dataset.phase = "a1";
      await travel(wrap, "s", "a", 380, token);
      if (token !== gen) return;
      wrap.dataset.phase = "w1";
      await hold(820, token);
      if (token !== gen) return;
      wrap.dataset.phase = "a2";
      await travel(wrap, "s", "b", 380, token);
      if (token !== gen) return;
      wrap.dataset.phase = "w2";
      await hold(1100, token);
      if (token !== gen) return;
      wrap.dataset.phase = "a3";
      await travel(wrap, "s", "c", 420, token);
      if (token !== gen) return;
      wrap.dataset.phase = "dlq";
      say("DEAD LETTER");
    } else {
      if (reduce) {
        wrap.dataset.phase = "reject";
        say("SCHEMA REJECTED");
        return;
      }
      wrap.dataset.phase = "call";
      await travel(wrap, "s", "a", 520, token);
      if (token !== gen) return;
      await hold(320, token);
      if (token !== gen) return;
      wrap.dataset.phase = "reject";
      canvas(wrap)?.querySelector<SVGCircleElement>("[data-sig='s']")?.classList.remove("on");
      say("SCHEMA REJECTED");
    }
  };

  const close = () => {
    gen += 1;
    words.forEach((w, i) => {
      w.classList.remove("on", "dim");
      w.setAttribute("aria-selected", "false");
      w.tabIndex = i === 0 ? 0 : -1;
    });
    chapter.classList.remove("is-open");
    if (stageEl) {
      stageEl.hidden = true;
      stageEl.innerHTML = "";
      delete stageEl.dataset.sim;
      delete stageEl.dataset.phase;
      stageEl.removeAttribute("aria-labelledby");
    }
    if (live) live.textContent = "";
    if (reset) reset.hidden = true;
  };

  const hint = root.querySelector<HTMLElement>(".fp-hint");
  const raceBtn = words.find((w) => w.dataset.fail === "race");
  let hintIO: IntersectionObserver | null = null;
  const hinted = () => {
    try {
      return sessionStorage.getItem("fp-hint") === "1";
    } catch {
      return true;
    }
  };
  const dismissHint = () => {
    try {
      sessionStorage.setItem("fp-hint", "1");
    } catch {
      /* ignore */
    }
    if (hint) hint.hidden = true;
    raceBtn?.classList.remove("is-hint");
    hintIO?.disconnect();
  };

  const open = (id: FailId) => {
    const token = ++gen;
    words.forEach((w) => {
      const on = w.dataset.fail === id;
      w.classList.toggle("on", on);
      w.classList.toggle("dim", !on);
      w.setAttribute("aria-selected", String(on));
      w.tabIndex = on ? 0 : -1;
    });
    chapter.classList.add("is-open");
    if (stageEl) {
      stageEl.hidden = false;
      stageEl.innerHTML = simMarkup(id);
      stageEl.dataset.sim = id;
      stageEl.dataset.phase = "idle";
      stageEl.setAttribute("aria-labelledby", `fail-tab-${id}`);
    }
    if (live) live.textContent = "";
    if (reset) reset.hidden = false;
    dismissHint();
    const next = `#failures/${id}`;
    if (location.hash.toLowerCase() !== next) {
      history.replaceState(history.state, "", next);
    }
    void run(id, token);
  };

  play = open;

  const failFromHash = (): FailId | null => {
    const m = location.hash.match(/^#failures\/(race|expire|fail|hallucinate)$/i);
    return m ? (m[1].toLowerCase() as FailId) : null;
  };

  const fromHash = (scroll: boolean) => {
    const id = failFromHash();
    if (!id) return;
    if (stageEl?.dataset.sim === id && !stageEl.hidden) return;
    if (scroll) {
      document.querySelector("#failures")?.scrollIntoView({ behavior: "auto" });
    }
    open(id);
  };

  if (!hinted() && hint && raceBtn) {
    hintIO = new IntersectionObserver(
      (entries) => {
        if (hinted() || !entries.some((e) => e.isIntersecting)) return;
        hint.hidden = false;
        raceBtn.classList.add("is-hint");
      },
      { threshold: 0.35 },
    );
    hintIO.observe(chapter);
  }

  words.forEach((w) =>
    w.addEventListener("click", () => {
      const id = (w.dataset.fail as FailId) ?? "race";
      if (w.getAttribute("aria-selected") === "true") return;
      open(id);
    }),
  );

  root.querySelector(".play-words")?.addEventListener("keydown", (e) => {
    const ev = e as KeyboardEvent;
    if (ev.key !== "ArrowRight" && ev.key !== "ArrowLeft" && ev.key !== "Home" && ev.key !== "End") return;
    ev.preventDefault();
    const i = words.findIndex((w) => w.tabIndex === 0);
    let n = i < 0 ? 0 : i;
    if (ev.key === "ArrowRight") n = (n + 1) % words.length;
    if (ev.key === "ArrowLeft") n = (n - 1 + words.length) % words.length;
    if (ev.key === "Home") n = 0;
    if (ev.key === "End") n = words.length - 1;
    words[n].focus();
    if (chapter.classList.contains("is-open")) open((words[n].dataset.fail as FailId) ?? "race");
  });

  reset?.addEventListener("click", () => {
    if (location.hash.toLowerCase().startsWith("#failures/")) {
      history.replaceState(history.state, "", "#failures");
    }
    close();
  });

  root.querySelectorAll<HTMLButtonElement>("[data-run]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const wrap = btn.closest(".case-run");
      if (!wrap) return;
      wrap.classList.add("play");
      let slot = wrap.querySelector(".case-stage");
      if (!slot) {
        slot = document.createElement("div");
        slot.className = "case-stage";
        wrap.append(slot);
      }
      slot.innerHTML = stage((btn.dataset.run as FailId) ?? "race");
    });
  });

  window.addEventListener("hashchange", () => fromHash(false));
  fromHash(true);
}

export function caseFails(slug: string): string {
  const hits = failDemos.filter((d) => d.slugs.includes(slug));
  if (!hits.length) return "";
  const d = hits[0];
  return `<div class="case-run" data-fail="${d.id}">
    <button type="button" data-run="${d.id}">Run ${d.kicker.toLowerCase()}</button>
    <p class="line">${d.line}</p>
  </div>`;
}
