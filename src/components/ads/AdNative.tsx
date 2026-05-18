import { useEffect, useRef, useState } from "react";
import { useAdsEnabled } from "@/hooks/useAdsEnabled";
import { useAdUnits } from "@/hooks/useAdUnits";
import { scheduleAdMount } from "@/lib/adQueue";

export function AdNative({
  className = "",
  label = true,
  minHeight = 250,
  maxHeight = 360,
}: {
  className?: string;
  label?: boolean;
  minHeight?: number;
  maxHeight?: number;
}) {
  const enabled = useAdsEnabled();
  const { getBySlot } = useAdUnits();
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [height, setHeight] = useState(minHeight);
  const unit = getBySlot("native");

  useEffect(() => {
    if (!enabled || !ref.current || near) return;
    const el = ref.current;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "400px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [enabled, near]);

  useEffect(() => {
    if (!near || mounted) return;
    return scheduleAdMount(() => setMounted(true));
  }, [near, mounted]);

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      const h = (e.data as any)?.__adNativeHeight;
      if (typeof h === "number" && isFinite(h)) {
        setHeight(Math.max(minHeight, Math.min(maxHeight, Math.ceil(h))));
      }
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [minHeight, maxHeight]);

  if (!enabled || !unit) return null;

  const inner = unit.raw_html?.trim()
    ? unit.raw_html
    : `<script async data-cfasync="false" src="${unit.script_url}"><\/script><div id="${unit.container_id}"></div>`;

  const resizer = `<script>(function(){function post(){try{var h=Math.max(document.body.scrollHeight,document.documentElement.scrollHeight);parent.postMessage({__adNativeHeight:h},'*');}catch(e){}}var ro;try{ro=new ResizeObserver(post);ro.observe(document.body);}catch(e){}window.addEventListener('load',post);setInterval(post,1500);})();<\/script>`;

  const srcdoc = `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;padding:0;background:transparent;}</style></head><body>${inner}${resizer}</body></html>`;

  return (
    <div ref={ref} className={`w-full ${className}`}>
      {label && (
        <div className="mb-1 text-center text-[10px] uppercase tracking-wider text-muted-foreground/70">Sponsored</div>
      )}
      <div
        className="relative w-full overflow-hidden rounded-2xl border border-border/40 bg-card/30"
        style={{ minHeight }}
      >
        {!mounted && (
          <div
            className="absolute inset-0 animate-pulse bg-gradient-to-r from-muted/40 via-muted/20 to-muted/40"
            aria-hidden
          />
        )}
        {mounted && (
          <iframe
            title="ad-native"
            srcDoc={srcdoc}
            scrolling="no"
            frameBorder={0}
            loading="lazy"
            // @ts-ignore non-standard but supported
            fetchpriority="low"
            sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
            style={{ width: "100%", height, border: 0, display: "block" }}
          />
        )}
      </div>
    </div>
  );
}
