import { useCtaLinks } from "@/hooks/useCtaLinks";
import { CTA_META, normalizeUrl, pickPrimary, trackCtaClick, type CtaLink } from "@/lib/ctaLinks";
import { useAuth } from "@/hooks/useAuth";
import { useAdUnits } from "@/hooks/useAdUnits";
import { useAdsEnabled } from "@/hooks/useAdsEnabled";
import { ShieldCheck, Lock, ArrowRight } from "lucide-react";
import { getRegion, type Region } from "@/lib/regions";

const SMARTLINK_KEY = "smartlink_fired_v1";

type Variant = "full" | "compact" | "sticky";

export function ContactCTAButtons({
  profileId,
  variant = "full",
  className = "",
  region: regionSlug,
}: {
  profileId?: string | null;
  variant?: Variant;
  className?: string;
  region?: Region;
}) {
  const { links, loading } = useCtaLinks(profileId);
  const { user } = useAuth();
  const adsEnabled = useAdsEnabled();
  const { getBySlot } = useAdUnits();
  const smartlink = getBySlot("smartlink");
  const region = getRegion(regionSlug);
  const T = region.cta;
  const bnClass = region.slug === "bd" ? "font-bn" : "";

  if (loading) {
    if (variant === "compact") return <div className={`h-9 w-full animate-pulse rounded-full bg-muted ${className}`} />;
    return <div className={`h-32 w-full animate-pulse rounded-2xl bg-muted ${className}`} />;
  }
  if (links.length === 0) return null;

  const { primary, secondary, hasOverride } = pickPrimary(links);
  if (!primary) return null;

  const fireSmartlink = () => {
    if (!adsEnabled) return;
    if (!smartlink?.target_url) return;
    try {
      const last = parseInt(sessionStorage.getItem(SMARTLINK_KEY) || "0", 10) || 0;
      // fire at most once every 30 minutes per session
      if (Date.now() - last < 30 * 60 * 1000) return;
      sessionStorage.setItem(SMARTLINK_KEY, String(Date.now()));
    } catch {}
    try { window.open(smartlink.target_url, "_blank", "noopener,noreferrer"); } catch {}
  };

  const open = (l: CtaLink) => {
    const url = normalizeUrl(l.kind, l.url);
    trackCtaClick(l, profileId ?? null, user?.id ?? null);
    fireSmartlink();
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  const pmeta = CTA_META[primary.kind];
  const channelName = pmeta.defaultLabel.split(" ")[0]; // e.g. "WhatsApp"

  // Compact — single slim primary inside profile cards
  if (variant === "compact") {
    return (
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); open(primary); }}
        className={`group inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-primary/85 px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft transition hover:shadow-card active:scale-[0.98] ${className}`}
      >
        <img src={pmeta.icon} alt="" className="h-4 w-4" />
        <span className={bnClass}>{T.contactNow}</span>
        <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
      </button>
    );
  }

  // Sticky — mobile bottom bar
  if (variant === "sticky") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <button
          onClick={() => open(primary)}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-primary/85 px-4 py-3 text-sm font-bold text-primary-foreground shadow-soft transition active:scale-95"
        >
          <img src={pmeta.icon} alt="" className="h-5 w-5" />
          <span className={bnClass}>{T.contactNow}</span> · {channelName}
        </button>
        {secondary.slice(0, 2).map((l) => {
          const m = CTA_META[l.kind];
          return (
            <button
              key={l.id}
              onClick={() => open(l)}
              aria-label={m.defaultLabel}
              className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-border bg-card shadow-soft transition active:scale-95"
            >
              <img src={m.icon} alt="" className="h-6 w-6" />
            </button>
          );
        })}
      </div>
    );
  }

  // Full — premium card
  return (
    <div dir={region.dir}
      className={`relative overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-card via-card to-primary/5 p-4 shadow-soft ${className}`}
    >
      {/* Header strip */}
      <div className="mb-3 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span className={bnClass}>{T.verifiedContact}</span>
        </span>
        <span className={`text-[11px] font-medium text-muted-foreground ${bnClass}`}>{T.talkDirectly}</span>
      </div>

      {/* Primary CTA */}
      <button
        onClick={() => open(primary)}
        className="group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-gradient-to-r from-primary via-primary to-primary/85 px-5 py-3.5 text-base font-bold text-primary-foreground shadow-card transition hover:shadow-lg active:scale-[0.98]"
      >
        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" aria-hidden />
        <img src={pmeta.icon} alt="" className="h-5 w-5 drop-shadow" />
        <span className={bnClass}>{T.contactNow}</span>
        <span className="text-sm font-medium opacity-90">· {channelName}</span>
      </button>

      {/* Secondary icon row */}
      {secondary.length > 0 && (
        <div className="mt-3 flex items-center justify-center gap-2.5">
          <span className={`text-[11px] text-muted-foreground ${bnClass}`}>{T.or}</span>
          {secondary.map((l) => {
            const m = CTA_META[l.kind];
            return (
              <button
                key={l.id}
                onClick={() => open(l)}
                aria-label={m.defaultLabel}
                title={m.defaultLabel}
                className="grid h-9 w-9 place-items-center rounded-full border border-border bg-background/60 transition hover:scale-110 hover:border-primary/30 hover:bg-card hover:shadow-soft"
              >
                <img src={m.icon} alt="" className="h-4.5 w-4.5" style={{ width: 18, height: 18 }} />
              </button>
            );
          })}
        </div>
      )}

      {/* Trust footer */}
      <div className="mt-3 flex items-center justify-center gap-1.5 border-t border-border/60 pt-2.5 text-[11px] text-muted-foreground">
        <Lock className="h-3 w-3" />
        <span className={bnClass}>{hasOverride ? T.ownContact : T.identityHidden}</span>
      </div>
    </div>
  );
}
