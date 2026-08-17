import { projects } from "./content";
import { caseHtml } from "./case-study";

export function initPanel() {
  const dlg = document.querySelector<HTMLDialogElement>("#case");
  const body = document.querySelector<HTMLElement>("#case-body");
  const closeBtn = document.querySelector<HTMLButtonElement>("#case-close");
  const chromeName = document.querySelector<HTMLElement>("#case-chrome-name");
  if (!dlg || !body) return;

  let opener: HTMLElement | null = null;

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

  const open = (slug: string, push: boolean) => {
    const p = projects.find((x) => x.slug === slug);
    if (!p) return;
    body.innerHTML = caseHtml(p);
    body.dataset.slug = slug;
    dlg.setAttribute("aria-labelledby", "case-title");
    if (chromeName) chromeName.textContent = p.name;
    if (!dlg.open) dlg.showModal();
    resetScroll();
    body.querySelector<HTMLElement>("#case-title")?.focus({ preventScroll: true });
    if (push && location.hash !== `#project/${slug}`) {
      history.pushState({ case: slug }, "", `#project/${slug}`);
    }
  };

  const close = (push: boolean) => {
    const restore = opener;
    opener = null;
    if (dlg.open) dlg.close();
    if (push && location.hash.startsWith("#project/")) {
      history.pushState({}, "", location.pathname);
    }
    if (restore?.isConnected) restore.focus();
  };

  const fromHash = () => {
    const m = location.hash.match(/^#project\/([a-z0-9-]+)/i);
    if (m?.[1]) open(m[1], false);
    else if (dlg.open) close(false);
  };

  document.addEventListener("click", (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLElement>("[data-case]");
    if (!btn) return;
    e.preventDefault();
    opener = btn;
    open(btn.dataset.case ?? "", true);
  });

  closeBtn?.addEventListener("click", () => close(true));
  dlg.addEventListener("cancel", (e) => {
    e.preventDefault();
    close(true);
  });
  dlg.addEventListener("click", (e) => {
    if (e.target === dlg) close(true);
  });
  dlg.addEventListener("scroll", syncChrome, { passive: true });
  window.addEventListener("popstate", fromHash);
  window.addEventListener("hashchange", fromHash);
  fromHash();
}
