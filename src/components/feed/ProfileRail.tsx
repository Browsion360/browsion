import { Link } from "react-router-dom";
import { Sparkles, MapPin } from "lucide-react";
import { photoUrl } from "@/lib/format";
import { SmartPhoto } from "@/components/feed/SmartPhoto";
import type { PubProfile } from "@/hooks/usePublishedProfiles";

export function ProfileRail({ profiles, title = "আজকের নতুন পাত্রী", subtitle = "New today", titleClassName = "font-bn" }: {
  profiles: PubProfile[];
  title?: string;
  subtitle?: string;
  titleClassName?: string;
}) {
  if (!profiles.length) return null;
  return (
    <section className="space-y-3 md:space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <div className="hidden items-center gap-2 text-primary md:flex">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em]">{subtitle}</span>
          </div>
          <h2 className={`font-display text-xl font-bold md:text-4xl ${titleClassName}`}>{title}</h2>
        </div>
      </div>

      <div className="scroll-snap-x no-scrollbar flex gap-3 overflow-x-auto pb-2 -mr-5 pr-5 scroll-pl-5 md:gap-4 md:-mr-0 md:pr-0 md:scroll-pl-0 md:pb-4">
        {profiles.map((p) => {
          const photo = photoUrl(p.photos?.[0]);
          return (
            <Link
              key={p.id}
              to={(() => {
                const r = (p as any).region || "bd";
                return r === "bd" ? `/explore/${p.id}` : `/${r}/explore/${p.id}`;
              })()}
              className="glossy-card gradient-border group relative w-[78%] shrink-0 sm:w-[42%] md:w-[28%] lg:w-[22%]"
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                <SmartPhoto src={photo} alt={p.name} />
                <div className="shimmer-overlay" />
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                <span className="absolute left-3 top-3 rounded-full bg-accent px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-accent-foreground shadow-soft">
                  New
                </span>
                <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                  <div className="font-display text-xl font-bold drop-shadow">{p.name}, {p.age}</div>
                  {p.district && (
                    <div className="mt-0.5 flex items-center gap-1 text-xs text-white/90">
                      <MapPin className="h-3 w-3" /> {p.district}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
