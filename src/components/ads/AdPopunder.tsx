import { useEffect } from "react";
import { useAdsEnabled } from "@/hooks/useAdsEnabled";
import { useAdUnits } from "@/hooks/useAdUnits";

const SCRIPT_ID = "ads-popunder";
const STORAGE_KEY = "pu_last_loaded_at_v1";
const COOLDOWN_MS = 2 * 60 * 60 * 1000; // 2 hours

export function AdPopunder() {
  const enabled = useAdsEnabled();
  const { getBySlot } = useAdUnits();
  const unit = getBySlot("popunder");

  useEffect(() => {
    if (!enabled || !unit) return;
    if (typeof window === "undefined") return;
    try {
      const last = parseInt(localStorage.getItem(STORAGE_KEY) || "0", 10) || 0;
      if (Date.now() - last < COOLDOWN_MS) return;
    } catch {}
    if (document.getElementById(SCRIPT_ID)) return;

    const inject = () => {
      if (document.getElementById(SCRIPT_ID)) return;
      try { localStorage.setItem(STORAGE_KEY, String(Date.now())); } catch {}
      if (unit.raw_html?.trim()) {
        const wrap = document.createElement("div");
        wrap.id = SCRIPT_ID;
        wrap.innerHTML = unit.raw_html;
        document.body.appendChild(wrap);
        wrap.querySelectorAll("script").forEach((old) => {
          const s = document.createElement("script");
          Array.from(old.attributes).forEach(a => s.setAttribute(a.name, a.value));
          s.text = old.text;
          old.replaceWith(s);
        });
      } else if (unit.script_url) {
        const s = document.createElement("script");
        s.id = SCRIPT_ID;
        s.src = unit.script_url;
        s.async = true;
        document.body.appendChild(s);
      }
      cleanup();
    };
    const cleanup = () => {
      window.removeEventListener("click", inject);
      window.removeEventListener("touchstart", inject);
      window.removeEventListener("keydown", inject);
    };

    window.addEventListener("click", inject, { once: true });
    window.addEventListener("touchstart", inject, { once: true });
    window.addEventListener("keydown", inject, { once: true });

    return cleanup;
  }, [enabled, unit?.id]);

  return null;
}
