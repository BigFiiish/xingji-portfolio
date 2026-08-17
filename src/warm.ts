const warmed = new Set<string>();

function healthFor(href: string): string | null {
  try {
    const host = new URL(href, location.href).hostname;
    if (host === "clearbay.onrender.com") return "https://clearbay.onrender.com/actuator/health";
    if (host === "grantline.onrender.com") return "https://grantline.onrender.com/health";
    if (host === "pulsequeue-wokz.onrender.com") return "https://pulsequeue-wokz.onrender.com/api/health";
    if (host === "dockline.onrender.com") return "https://dockline.onrender.com/api/health";
    if (host === "sketchsync-fwed.onrender.com") return "https://sketchsync-fwed.onrender.com/api/health";
  } catch {
    return null;
  }
  return null;
}

function ping(url: string) {
  if (warmed.has(url)) return;
  warmed.add(url);
  void fetch(url, { mode: "no-cors", cache: "no-store", keepalive: true }).catch(() => {
    warmed.delete(url);
  });
}

export function initWarm() {
  const onPoint = (e: Event) => {
    const a = (e.target as HTMLElement | null)?.closest?.("a[href]");
    if (!a) return;
    const href = a.getAttribute("href");
    if (!href) return;
    const health = healthFor(href);
    if (health) ping(health);
  };
  document.addEventListener("pointerenter", onPoint, true);
  document.addEventListener("focusin", onPoint);
}
