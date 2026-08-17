import { projects } from "./content";
import { caseHtml } from "./case-study";

type OpenFn = (slug: string, push: boolean) => void;

let openImpl: OpenFn = () => {};

export function openCase(slug: string, push = true) {
  openImpl(slug, push);
}

function isCaseState(state: unknown): state is { case: string } {
  return !!state && typeof state === "object" && "case" in state && typeof (state as { case: unknown }).case === "string";
}

export function initPanel() {
  const dlg = document.querySelector<HTMLDialogElement>("#case");
  const body = document.querySelector<HTMLElement>("#case-body");
  const closeBtn = document.querySelector<HTMLButtonElement>("#case-close");
  const chromeName = document.querySelector<HTMLElement>("#case-chrome-name");
  if (!dlg || !body) return;

  let opener: HTMLElement | null = null;
  let ignoreUrl = false;

  const syncChrome = () => {
    const on = dlg.scrollTop > 56;
    dlg.classList.toggle("is-scrolled", on);
    if (chromeName) chromeName.hidden = !on;
  };

  const resetScroll = () => {
    dlg.scrollTop = 0;
    body.scrollTop = 0;
    dlg.classList.remove("is-scrolled");
    if (chromeName) chromeName.hidden = true;
  };

  const restoreFocus = () => {
    if (opener?.isConnected) {
      opener.focus();
      return;
    }
    const slug = body.dataset.slug;
    const article = slug ? document.getElementById(slug) : null;
    const fallback = (article as HTMLElement | null) ?? document.querySelector<HTMLElement>("#work h2");
    if (!fallback) return;
    if (!fallback.hasAttribute("tabindex")) fallback.tabIndex = -1;
    fallback.focus({ preventScroll: true });
  };

  const open = (slug: string, push: boolean) => {
    const p = projects.find((x) => x.slug === slug);
    if (!p) return;
    const url = `#project/${slug}`;
    const switching = dlg.open && location.hash.startsWith("#project/");
    body.innerHTML = caseHtml(p);
    body.dataset.slug = slug;
    dlg.setAttribute("aria-labelledby", "case-title");
    if (chromeName) chromeName.textContent = p.name;
    if (!dlg.open) dlg.showModal();
    resetScroll();
    body.querySelector<HTMLElement>("#case-title")?.focus({ preventScroll: true });
    if (!push) return;
    if (switching) {
      history.replaceState({ case: slug }, "", url);
    } else if (location.hash !== url) {
      history.pushState({ case: slug }, "", url);
    }
  };

  const close = (reason: "user" | "pop") => {
    const restore = opener;
    opener = null;
    if (dlg.open) dlg.close();
    if (reason === "user") {
      if (isCaseState(history.state)) {
        ignoreUrl = true;
        history.back();
      } else if (location.hash.startsWith("#project/")) {
        history.replaceState({}, "", `${location.pathname}${location.search}`);
      }
    }
    opener = restore;
    restoreFocus();
    opener = null;
  };

  const fromHash = () => {
    if (ignoreUrl) {
      ignoreUrl = false;
      return;
    }
    const m = location.hash.match(/^#project\/([a-z0-9-]+)/i);
    if (m?.[1]) {
      if (dlg.open && body.dataset.slug === m[1]) return;
      open(m[1], false);
    } else if (dlg.open) close("pop");
  };

  openImpl = open;

  document.addEventListener("click", (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLElement>("[data-case]");
    if (!btn) return;
    e.preventDefault();
    opener = btn;
    open(btn.dataset.case ?? "", true);
  });

  closeBtn?.addEventListener("click", () => close("user"));
  dlg.addEventListener("cancel", (e) => {
    e.preventDefault();
    close("user");
  });
  dlg.addEventListener("click", (e) => {
    if (e.target === dlg) close("user");
  });
  dlg.addEventListener("scroll", syncChrome, { passive: true });
  window.addEventListener("popstate", fromHash);
  window.addEventListener("hashchange", fromHash);
  fromHash();
}
