import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { MapPin, GraduationCap, Briefcase, Users, Sparkles, ArrowRight } from "lucide-react";
import { photoUrl, cmToFtIn } from "@/lib/format";
import { ContactCTAButtons } from "@/components/cta/ContactCTAButtons";
import { OnlineBadge } from "@/components/feed/OnlineBadge";
import { SmartPhoto } from "@/components/feed/SmartPhoto";
import { isProfileOnline } from "@/lib/presence";
import { getRegion, type Region } from "@/lib/regions";
import type { PubProfile } from "@/hooks/usePublishedProfiles";

export function InlineProfileBiodata({
  profile,
  onInView,
  region: regionSlug,
}: {
  profile: PubProfile;
  onInView?: (id: string) => void;
  region?: Region;
}) {
  const ref = useRef<HTMLElement>(null);
  const photo = photoUrl(profile.photos?.[0]);
  const online = isProfileOnline(profile.id);
  const region = getRegion(regionSlug ?? (profile as any).region);
  const L = region.labels;
  const search = regionSlug ? `?r=${regionSlug}` : "";
  const location = profile.district || (profile as any).country;

  useEffect(() => {
    if (!onInView || !ref.current) return;
    const el = ref.current;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && e.intersectionRatio > 0.5) onInView(profile.id);
        });
      },
      { threshold: [0.5] }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [onInView, profile.id]);

  return (
    <article ref={ref} dir={region.dir} className="overflow-hidden rounded-3xl border border-border bg-card shadow-card">
      {photo && (
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted sm:aspect-[16/10]">
          <SmartPhoto src={photo} alt={profile.name} />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5 text-white">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display text-2xl font-bold drop-shadow-md break-words min-w-0">
                {profile.name}<span className="text-white/85">, {profile.age}</span>
              </h3>
              {online && <OnlineBadge />}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-white/90">
              {profile.height_cm && <span>{cmToFtIn(profile.height_cm)}</span>}
              {location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {location}</span>}
              {profile.religion && <span>· {profile.religion}</span>}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4 p-5">
        {profile.about && (
          <p className="line-clamp-4 text-sm text-foreground/90 break-words">{profile.about}</p>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <Mini icon={Briefcase} label={L.profession} value={profile.profession} />
          <Mini icon={GraduationCap} label={L.education} value={profile.education} />
          <Mini icon={Users} label={L.family} value={profile.family_type} />
          <Mini icon={Sparkles} label={L.religion} value={[profile.religion, profile.sect].filter(Boolean).join(" · ")} />
          <Mini icon={MapPin} label={L.currentLocation} value={profile.current_location} />
          <Mini icon={Sparkles} label={L.maritalStatus} value={profile.marital_status?.replace("_", " ")} />
        </div>

        {profile.expectations && (
          <div className="rounded-2xl bg-secondary/50 p-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{L.expectations}</div>
            <p className="mt-1 line-clamp-3 text-sm text-foreground/90 break-words">{profile.expectations}</p>
          </div>
        )}

        <ContactCTAButtons profileId={profile.id} variant="full" region={region.slug} />

        <Link
          to={(profile.slug ? `/p/${profile.slug}` : `/profile/${profile.id}`) + search}
          className="group flex items-center justify-center gap-1.5 rounded-2xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm font-semibold text-primary transition hover:bg-primary/10"
        >
          {L.viewFullProfile}
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </Link>
      </div>
    </article>
  );
}

function Mini({ icon: Icon, label, value }: { icon: any; label: string; value: any }) {
  if (!value) return null;
  return (
    <div className="flex gap-2">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="truncate text-sm font-medium capitalize">{value}</div>
      </div>
    </div>
  );
}

export function ProfileDivider({ region: regionSlug }: { region?: Region } = {}) {
  const region = getRegion(regionSlug);
  return (
    <div className="my-8 flex items-center gap-3" aria-hidden>
      <div className="h-px flex-1 bg-gradient-to-r from-transparent to-border" />
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{region.labels.nextBride}</span>
      <div className="h-px flex-1 bg-gradient-to-l from-transparent to-border" />
    </div>
  );
}

