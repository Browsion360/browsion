import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { X } from "lucide-react";
import { useAdsEnabled } from "@/hooks/useAdsEnabled";
import { AdNative } from "./AdNative";

const COUNT_KEY = "interstitial_nav_count_v1";
const SHOW_EVERY = 3; // every 3rd profile navigation

/**
 * Shows a centered modal with a Native Banner every 3rd profile page view in a session.
 * Skips first view; close button enabled after 4s.
 */
export function AdInterstitial() {
  const enabled = useAdsEnabled();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [canClose, setCanClose] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const isExplore = /^\/(?:(?:bd|ar|es|global)\/)?explore\//.test(pathname);
    if (!pathname.startsWith("/profile/") && !pathname.startsWith("/p/") && !isExplore) return;

    let count = 0;
    try { count = parseInt(sessionStorage.getItem(COUNT_KEY) || "0", 10) || 0; } catch {}
    count += 1;
    try { sessionStorage.setItem(COUNT_KEY, String(count)); } catch {}

    // Skip first view, then every Nth
    if (count > 1 && count % SHOW_EVERY === 0) {
      setOpen(true);
      setCanClose(false);
      const t = setTimeout(() => setCanClose(true), 4000);
      return () => clearTimeout(t);
    }
  }, [pathname, enabled]);

  if (!enabled || !open) return null;

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/70 p-4 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-4 shadow-card">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Sponsored</span>
          {canClose ? (
            <button
              onClick={() => setOpen(false)}
              className="grid h-7 w-7 place-items-center rounded-full bg-muted hover:bg-muted/70"
              aria-label="Close ad"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <span className="text-[10px] text-muted-foreground">Skip in a moment…</span>
          )}
        </div>
        <AdNative label={false} />
      </div>
    </div>
  );
}
