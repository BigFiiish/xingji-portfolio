import { projects } from "./content";
import { caseHtml } from "./work";

export function initPanel() {
  const dlg = document.querySelector<HTMLDialogElement>("#case");
  const body = document.querySelector<HTMLElement>("#case-body");
  const closeBtn = document.querySelector<HTMLButtonElement>("#case-close");
  if (!dlg || !body) return;

  const open = (slug: string, push: boolean) => {
    const p = projects.find((x) => x.slug === slug);
    if (!p) return;
    body.innerHTML = caseHtml(p);
    body.dataset.slug = slug;
    if (!dlg.open) dlg.showModal();
    body.focus();
    if (push && location.hash !== `#project/${slug}`) {
      history.pushState({ case: slug }, "", `#project/${slug}`);
    }
  };

  const close = (push: boolean) => {
    if (dlg.open) dlg.close();
    if (push && location.hash.startsWith("#project/")) {
      history.pushState({}, "", location.pathname);
    }
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
  window.addEventListener("popstate", fromHash);
  window.addEventListener("hashchange", fromHash);
  fromHash();
}
