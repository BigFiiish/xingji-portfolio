import { caseStudyPath, experience, person, projects } from "./content";
import { failDemos, playFail } from "./failures";

type Item = { group: string; label: string; run: () => void; keywords: string };

function fuzzy(q: string, text: string): number {
  const needle = q.trim().toLowerCase();
  const hay = text.toLowerCase();
  if (!needle) return 1;
  const hit = hay.indexOf(needle);
  if (hit >= 0) return 200 - hit;
  let ti = 0;
  let score = 0;
  let run = 0;
  for (const ch of needle) {
    const found = hay.indexOf(ch, ti);
    if (found < 0) return 0;
    run = found === ti ? run + 2 : 1;
    score += run;
    ti = found + 1;
  }
  return score;
}

export function initCommand() {
  const dlg = document.querySelector<HTMLDialogElement>("#cmd");
  const input = document.querySelector<HTMLInputElement>("#cmd-input");
  const list = document.querySelector<HTMLElement>("#cmd-list");
  const openBtn = document.querySelector<HTMLButtonElement>("#cmd-open");
  if (!dlg || !input || !list) return;

  const apple = /Mac|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (openBtn) {
    openBtn.textContent = apple ? "⌘K" : "Ctrl K";
    openBtn.setAttribute("aria-label", apple ? "Open command palette, Command K" : "Open command palette, Control K");
  }

  dlg.setAttribute("aria-modal", "true");
  input.setAttribute("aria-controls", "cmd-list");

  const chips = document.querySelector<HTMLElement>("#cmd-chips");
  const showChips = (on: boolean) => {
    if (chips) chips.hidden = !on;
  };
  if (chips) {
    chips.setAttribute("role", "group");
    chips.setAttribute("aria-label", "Suggested searches");
    chips.innerHTML = `
      <button type="button" class="cmd-chip" data-chip="crawlforge">CrawlForge</button>
      <button type="button" class="cmd-chip" data-chip="grantline">Grantline</button>
      <button type="button" class="cmd-chip" data-chip="java">Java</button>
      <button type="button" class="cmd-chip" data-chip="resume">Resume</button>
      <button type="button" class="cmd-chip" data-chip="race">Race</button>`;
  }

  const go = (sel: string) => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.querySelector(sel)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  };

  const items: Item[] = [
    { group: "Navigation", label: "Selected Work", keywords: "work projects", run: () => go("#work") },
    { group: "Navigation", label: "Failure Modes", keywords: "race expire fail hallucinate playground", run: () => go("#failures") },
    { group: "Navigation", label: "Experience", keywords: "jobs career jasci sonos tencent", run: () => go("#experience") },
    { group: "Navigation", label: "Principles", keywords: "about bio principles correctness", run: () => go("#about") },
    { group: "Navigation", label: "Note", keywords: "note essay dockline judge model", run: () => { window.location.href = person.note; } },
    { group: "Navigation", label: "Contact", keywords: "email", run: () => go("#contact") },
    ...failDemos.map((d) => ({
      group: "Failure modes",
      label: `${d.kicker} · ${d.project}`,
      keywords: `${d.kicker} ${d.title} ${d.line} ${d.project} ${d.id}`,
      run: () => playFail(d.id),
    })),
    ...experience.map((job) => ({
      group: "Experience",
      label: `${job.company} · ${job.role}`,
      keywords: `${job.company} ${job.role} ${job.line} ${job.id}`,
      run: () => go(`#${job.id}`),
    })),
    ...projects.map((p) => ({
      group: "Projects",
      label: `${p.name} case study`,
      keywords: `${p.name} ${p.slug} ${p.stack.join(" ")} case study`,
      run: () => { window.location.href = caseStudyPath(p); },
    })),
    {
      group: "Actions",
      label: "View Resume",
      keywords: "resume cv pdf cmu",
      run: () => {
        window.open(person.resume, "_blank");
      },
    },
    {
      group: "Actions",
      label: "Copy Email",
      keywords: "email mail copy",
      run: async () => {
        await navigator.clipboard.writeText(person.email);
      },
    },
    {
      group: "Actions",
      label: "Open GitHub",
      keywords: "github",
      run: () => window.open(person.github, "_blank"),
    },
    {
      group: "Actions",
      label: "Open LinkedIn",
      keywords: "linkedin",
      run: () => window.open(person.linkedin, "_blank"),
    },
    {
      group: "Special",
      label: "> system",
      keywords: "system systems xingji",
      run: () => {
        list.innerHTML = `<p class="cmd-system">${person.systemLine}</p>`;
      },
    },
  ];

  let shown: Item[] = items;
  let active = 0;

  const paint = () => {
    let html = "";
    let last = "";
    shown.forEach((it, i) => {
      if (it.group !== last) {
        html += `<p class="cmd-group">${it.group}</p>`;
        last = it.group;
      }
      html += `<button class="cmd-item${i === active ? " on" : ""}" type="button" id="cmd-opt-${i}" data-i="${i}" role="option" aria-selected="${i === active}">${it.label}</button>`;
    });
    list.innerHTML = html || `<p class="cmd-empty">No match</p>`;
    input.setAttribute("aria-activedescendant", shown.length ? `cmd-opt-${active}` : "");
  };

  const filter = (q: string) => {
    const ranked = items
      .map((it) => ({ it, n: fuzzy(q, `${it.label} ${it.keywords}`) }))
      .filter((x) => x.n > 0)
      .sort((a, b) => b.n - a.n);
    shown = ranked.map((x) => x.it);
    active = 0;
    paint();
    showChips(!q.trim());
  };

  const open = () => {
    if (!dlg.open) dlg.showModal();
    input.value = "";
    filter("");
    input.focus();
  };
  const close = () => dlg.close();

  chips?.addEventListener("click", (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>("[data-chip]");
    if (!btn) return;
    const id = btn.dataset.chip;
    if (id === "java") {
      input.value = "java";
      filter("java");
      input.focus();
      return;
    }
    close();
    if (id === "crawlforge") window.location.href = "/work/crawlforge/";
    if (id === "grantline") window.location.href = "/work/grantline/";
    if (id === "resume") window.open(person.resume, "_blank");
    if (id === "race") playFail("race");
  });

  openBtn?.addEventListener("click", open);
  dlg.addEventListener("click", (e) => {
    if (e.target === dlg) close();
  });
  input.addEventListener("input", () => filter(input.value));
  list.addEventListener("click", (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>(".cmd-item");
    if (!btn) return;
    const it = shown[Number(btn.dataset.i)];
    if (!it) return;
    if (it.label !== "> system") close();
    it.run();
  });

  window.addEventListener("keydown", (e) => {
    const pal = e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey);
    if (pal) {
      e.preventDefault();
      dlg.open ? close() : open();
      return;
    }
    if (!dlg.open) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowDown") {
      e.preventDefault();
      active = Math.min(shown.length - 1, active + 1);
      paint();
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      active = Math.max(0, active - 1);
      paint();
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const it = shown[active];
      if (!it) return;
      if (it.label !== "> system") close();
      it.run();
    }
  });
}
