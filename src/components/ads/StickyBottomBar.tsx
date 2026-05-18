import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { useAdsEnabled } from "@/hooks/useAdsEnabled";
import { useAdUnits, bannerSlot } from "@/hooks/useAdUnits";
import { useStickyBannerConfig } from "@/hooks/useStickyBannerConfig";

const STATE_KEY = "sticky_banner_state_v1";

type State = { closeCount: number; lastActivityAt: number; hiddenUntil: number };

function readState(): State {
  try {
    const raw = sessionStorage.getItem(STATE_KEY);
    if (!raw) return { closeCount: 0, lastActivityAt: Date.now(), hiddenUntil: 0 };
    return JSON.parse(raw) as State;
  } catch {
    return { closeCount: 0, lastActivityAt: Date.now(), hiddenUntil: 0 };
  }
}
function writeState(s: State) {
  try { sessionStorage.setItem(STATE_KEY, JSON.stringify(s)); } catch {}
}

export function StickyBottomBar() {
  const adsEnabled = useAdsEnabled();
  const cfg = useStickyBannerConfig();
  const { getBySlot } = useAdUnits();
  const [visible, setVisible] = useState(false);
  const [, force] = useState(0);
  const stateRef = useRef<State>(readState());
  const timerRef = useRef<number | null>(null);

  // Pick a unit: prefer dedicated sticky_bottom, fallback to 320x50.
  const unit = getBySlot("sticky_bottom") ?? getBySlot(bannerSlot("320x50"));

  // Decide initial visibility & schedule reappear / session reset
  useEffect(() => {
    if (!adsEnabled || !cfg.enabled || !unit) { setVisible(false); return; }

    const tick = () => {
      const now = Date.now();
      const st = stateRef.current;
      // Session expired -> reset
      if (now - st.lastActivityAt > cfg.session_minutes * 60_000) {
        const fresh: State = { closeCount: 0, lastActivityAt: now, hiddenUntil: 0 };
        stateRef.current = fresh;
        writeState(fresh);
      }
      const s = stateRef.current;
      if (s.closeCount >= cfg.max_closes_per_session) {
        setVisible(false);
        return;
      }
      if (s.hiddenUntil && now < s.hiddenUntil) {
        setVisible(false);
        const wait = s.hiddenUntil - now;
        timerRef.current = window.setTimeout(tick, wait + 50);
        return;
      }
      setVisible(true);
    };
    tick();

    const onActivity = () => {
      stateRef.current = { ...stateRef.current, lastActivityAt: Date.now() };
      writeState(stateRef.current);
    };
    window.addEventListener("scroll", onActivity, { passive: true });
    window.addEventListener("click", onActivity);
    window.addEventListener("keydown", onActivity);

    // Periodic session check (every 30s)
    const interval = window.setInterval(tick, 30_000);

    return () => {
      window.removeEventListener("scroll", onActivity);
      window.removeEventListener("click", onActivity);
      window.removeEventListener("keydown", onActivity);
      window.clearInterval(interval);
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [adsEnabled, cfg.enabled, cfg.max_closes_per_session, cfg.session_minutes, unit?.id]);

  if (!adsEnabled || !cfg.enabled || !unit || !visible) return null;

  const w = unit.width ?? 320;
  const h = unit.height ?? 50;
  const body = unit.raw_html?.trim()
    ? unit.raw_html
    : unit.zone_key
    ? `<script type="text/javascript">atOptions={'key':'${unit.zone_key}','format':'iframe','height':${h},'width':${w},'params':{}};<\/script><script type="text/javascript" src="https://www.highperformanceformat.com/${unit.zone_key}/invoke.js"><\/script>`
    : "";
  const srcdoc = `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;padding:0;background:transparent;overflow:hidden;display:flex;align-items:center;justify-content:center;}</style></head><body>${body}</body></html>`;

  const handleClose = () => {
    const now = Date.now();
    const next: State = {
      closeCount: stateRef.current.closeCount + 1,
      lastActivityAt: now,
      hiddenUntil: now + cfg.reappear_seconds * 1000,
    };
    stateRef.current = next;
    writeState(next);
    setVisible(false);
    force(x => x + 1);
    if (next.closeCount < cfg.max_closes_per_session) {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        setVisible(true);
      }, cfg.reappear_seconds * 1000);
    }
  };

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 flex justify-center pb-[env(safe-area-inset-bottom)] pointer-events-none"
      role="complementary"
      aria-label="Sponsored banner"
    >
      <div
        className="pointer-events-auto relative bg-background/95 backdrop-blur border border-border shadow-lg rounded-t-md"
        style={{ width: w, maxWidth: "100%" }}
      >
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close ad"
          className="absolute -top-3 -right-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-background shadow ring-1 ring-border hover:opacity-90"
        >
          <X className="h-3.5 w-3.5" />
        </button>
        <div style={{ width: w, height: h, maxWidth: "100%" }} className="overflow-hidden">
          <iframe
            title="sticky-bottom-ad"
            srcDoc={srcdoc}
            width={w}
            height={h}
            scrolling="no"
            frameBorder={0}
            sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
            style={{ width: w, height: h, border: 0, display: "block" }}
          />
        </div>
      </div>
    </div>
  );
}
