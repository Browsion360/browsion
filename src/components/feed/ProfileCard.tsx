import { useState } from "react";
import { Heart, MapPin, GraduationCap, Briefcase, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { photoUrl, cmToFtIn } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { ContactCTAButtons } from "@/components/cta/ContactCTAButtons";
import { OnlineBadge } from "@/components/feed/OnlineBadge";
import { SmartPhoto } from "@/components/feed/SmartPhoto";
import { isProfileOnline } from "@/lib/presence";

type Profile = {
  id: string;
  slug?: string | null;
  name: string;
  age: number;
  height_cm: number | null;
  district: string | null;
  country?: string | null;
  education: string | null;
  profession: string | null;
  religion?: string | null;
  about: string | null;
  photos: string[];
  created_at: string;
};

export function ProfileCard({
  profile,
  isFavourite = false,
  isUnlocked = false,
  blurPhoto = false,
  onToggleFavourite,
  variant = "default",
  priority = false,
}: {
  profile: Profile;
  isFavourite?: boolean;
  isUnlocked?: boolean;
  blurPhoto?: boolean;
  onToggleFavourite?: (id: string) => void;
  variant?: "default" | "compact";
  priority?: boolean;
}) {
  const photo = photoUrl(profile.photos?.[0]);
  const isNew = Date.now() - new Date(profile.created_at).getTime() < 86400000;
  const online = isProfileOnline(profile.id);
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <article className="glossy-card gradient-border group">
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted">
        <SmartPhoto
          src={photo}
          alt={profile.name}
          priority={priority}
          locked={blurPhoto && !isUnlocked}
          width={600}
          height={800}
          onLoad={() => setImgLoaded(true)}
        />

        {/* shimmer sweep on first paint */}
        <div className="shimmer-overlay" />

        {/* dark gradient bottom */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

        {/* top-row badges */}
        <div className="absolute inset-x-3 top-3 flex items-start justify-between">
          {isNew ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-accent-foreground shadow-soft">
              <Sparkles className="h-3 w-3" /> New
            </span>
          ) : <span />}
          {onToggleFavourite && (
            <button
              onClick={(e) => { e.preventDefault(); onToggleFavourite(profile.id); }}
              aria-label="Favourite"
              className="grid h-9 w-9 place-items-center rounded-full bg-background/80 backdrop-blur-md transition hover:scale-110"
            >
              <Heart className={`h-4 w-4 ${isFavourite ? "fill-primary text-primary" : ""}`} />
            </button>
          )}
        </div>

        {/* name overlay on photo */}
        <div className="absolute inset-x-0 bottom-0 p-5 text-white">
          <h3 className="font-display text-2xl font-bold leading-tight drop-shadow-md">
            {profile.name}<span className="text-white/85">, {profile.age}</span>
          </h3>
          {online && <OnlineBadge className="mt-1.5" />}
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-white/90">
            {profile.height_cm && <span>{cmToFtIn(profile.height_cm)}</span>}
            {(profile.district || profile.country) && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {profile.district || profile.country}</span>}
            {profile.religion && <span>· {profile.religion}</span>}
          </div>
        </div>
      </div>

      {/* glassy biodata strip */}
      <div className="space-y-2.5 bg-gradient-to-b from-card to-secondary/30 p-5">
        <div className="space-y-1.5 text-sm">
          {profile.profession && (
            <div className="flex items-center gap-2 text-foreground/80">
              <Briefcase className="h-4 w-4 shrink-0 text-primary" />
              <span className="line-clamp-1">{profile.profession}</span>
            </div>
          )}
          {profile.education && (
            <div className="flex items-center gap-2 text-foreground/80">
              <GraduationCap className="h-4 w-4 shrink-0 text-primary" />
              <span className="line-clamp-1">{profile.education}</span>
            </div>
          )}
        </div>
        {profile.about && <p className="line-clamp-2 text-xs text-muted-foreground">{profile.about}</p>}
        <ContactCTAButtons profileId={profile.id} variant="compact" className="pt-1" region={(profile as any).region || "bd"} />
        <div className="flex gap-2 pt-1">
          <Link to={profile.slug ? `/p/${profile.slug}` : `/profile/${profile.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">View</Button>
          </Link>
          {(() => {
            const r = (profile as any).region || "bd";
            const href = r === "bd" ? `/explore/${profile.id}` : `/${r}/explore/${profile.id}`;
            return (
              <Link to={href} className="flex-1">
                <Button size="sm" className="w-full gradient-rose text-primary-foreground">Explore</Button>
              </Link>
            );
          })()}
        </div>
      </div>
    </article>
  );
}
