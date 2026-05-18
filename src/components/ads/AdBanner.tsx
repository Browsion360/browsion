import { useEffect, useRef, useState } from "react";
import { useAdsEnabled } from "@/hooks/useAdsEnabled";
import { useAdUnits, bannerSlot } from "@/hooks/useAdUnits";
import { scheduleAdMount } from "@/lib/adQueue";

export type BannerSize = "728x90" | "320x50" | "300x250" | "160x600" | "160x300" | "468x60";

const SIZE_MAP: Record<BannerSize, { w: number; h: number }> = {
  "728x90":  { w: 728, h: 90 },
  "320x50":  { w: 320, h: 50 },
  "300x250": { w: 300, h: 250 },
  "160x600": { w: 160, h: 600 },
  "160x300": { w: 160, h: 300 },
  "468x60":  { w: 468, h: 60 },
};

export function AdBanner({
  size,
  className = "",
  label = true,
}: {
  size: BannerSize;
  className?: string;
  label?: boolean;
}) {
  const enabled = useAdsEnabled();
  const { getBySlot } = useAdUnits();
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dims = SIZE_MAP[size];
  const unit = getBySlot(bannerSlot(size));

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
      { rootMargin: "300px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [enabled, near]);

  useEffect(() => {
    if (!near || mounted) return;
    return scheduleAdMount(() => setMounted(true));
  }, [near, mounted]);

  if (!enabled || !unit) return null;

  const w = unit.width ?? dims.w;
  const h = unit.height ?? dims.h;

  const body = unit.raw_html?.trim()
    ? unit.raw_html
    : `<script type="text/javascript">atOptions={'key':'${unit.zone_key}','format':'iframe','height':${h},'width':${w},'params':{}};<\/script><script type="text/javascript" src="https://www.highperformanceformat.com/${unit.zone_key}/invoke.js"><\/script>`;

  const srcdoc = `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;padding:0;background:transparent;overflow:hidden;display:flex;align-items:center;justify-content:center;}</style></head><body>${body}</body></html>`;

  return (
    <div ref={ref} className={`mx-auto flex flex-col items-center ${className}`} style={{ maxWidth: w }}>
      {label && (
        <div className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground/70">Sponsored</div>
      )}
      <div
        style={{ width: w, height: h, maxWidth: "100%" }}
        className="relative overflow-hidden rounded-md bg-muted/30"
      >
        {!mounted && (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-muted/40 via-muted/20 to-muted/40" aria-hidden />
        )}
        {mounted && (
          <iframe
            title={`ad-${size}`}
            srcDoc={srcdoc}
            width={w}
            height={h}
            scrolling="no"
            frameBorder={0}
            loading="lazy"
            // @ts-ignore non-standard but supported in Chromium
            fetchpriority="low"
            sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
            style={{ width: w, height: h, border: 0, display: "block" }}
          />
        )}
      </div>
    </div>
  );
}
