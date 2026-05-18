import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useNavigate, useParams, Link, useSearchParams, useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight, X, Heart, MapPin, GraduationCap, Briefcase, Users, Calendar, Sparkles, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePublishedProfiles, type PubProfile } from "@/hooks/usePublishedProfiles";
import { photoUrl, cmToFtIn } from "@/lib/format";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ContactCTAButtons } from "@/components/cta/ContactCTAButtons";
import { ProfileStreamSection } from "@/components/feed/ProfileStreamSection";
import { SmartPhoto } from "@/components/feed/SmartPhoto";
import { AdNative } from "@/components/ads/AdNative";
import { AdBanner } from "@/components/ads/AdBanner";
import { StickyBottomBar } from "@/components/ads/StickyBottomBar";
import { getRegion, type Region } from "@/lib/regions";

const Explore = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const routeLocation = useLocation();
  const { user } = useAuth();
  const [search, setSearch] = useSearchParams();
  const queryRegion = search.get("r") as Region | null;
  // Detect region from URL prefix: /ar/explore, /es/explore, /global/explore, /bd/explore
  const pathPrefixMatch = routeLocation.pathname.match(/^\/(bd|ar|es|global)\/explore/);
  const pathRegion = (pathPrefixMatch?.[1] as Region | undefined) ?? undefined;
  const usePathPrefix = !!pathRegion;
  const initialRegion: Region | undefined = pathRegion ?? queryRegion ?? undefined;
  const [resolvedRegion, setResolvedRegion] = useState<Region | undefined>(initialRegion);
  const region = getRegion(resolvedRegion);
  const L = region.labels;
  const isBD = region.slug === "bd";

  // Build explore URL: prefixed style when entered via /:region/explore, else legacy ?r= form
  const exploreUrl = (targetId?: string) => {
    if (usePathPrefix && pathRegion) {
      return targetId ? `/${pathRegion}/explore/${targetId}` : `/${pathRegion}/explore`;
    }
    const qs = resolvedRegion ? `?r=${resolvedRegion}` : "";
    return targetId ? `/explore/${targetId}${qs}` : `/explore${qs}`;
  };

  // If ?r= missing (and not using path prefix), look up the profile's region once
  useEffect(() => {
    if (resolvedRegion || !id || usePathPrefix) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase.from("patri_profiles").select("region").eq("id", id).maybeSingle();
      if (cancelled) return;
      const r = (data?.region as Region) || "bd";
      setResolvedRegion(r);
      const next = new URLSearchParams(search);
      next.set("r", r);
      setSearch(next, { replace: true });
    })();
    return () => { cancelled = true; };
  }, [id, resolvedRegion, usePathPrefix]);

  // Apply RTL on this page based on region
  useEffect(() => {
    const html = document.documentElement;
    const prevDir = html.getAttribute("dir") || "ltr";
    const prevLang = html.getAttribute("lang") || "en";
    html.setAttribute("dir", region.dir);
    html.setAttribute("lang", region.locale);
    return () => {
      html.setAttribute("dir", prevDir);
      html.setAttribute("lang", prevLang);
    };
  }, [region]);

  const { data, loading, hasMore, loadMore } = usePublishedProfiles({ region: resolvedRegion });

  const [idx, setIdx] = useState(0);
  const [photoIdx, setPhotoIdx] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const touchStartX = useRef<number | null>(null);

  // sync idx with route param
  useEffect(() => {
    if (!id || !data.length) return;
    const i = data.findIndex((p) => p.id === id);
    if (i >= 0) setIdx(i);
  }, [id, data]);

  const profile: PubProfile | undefined = data[id ? idx : 0];

  // Region-aware SEO: title, description, canonical
  useEffect(() => {
    const baseTitle = region.copy.seoTitle;
    const title = id && profile ? `${profile.name}, ${profile.age} — ProthomAlap` : baseTitle;
    document.title = title;

    const ensureMeta = (name: string, attr: "name" | "property" = "name") => {
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      return el;
    };
    const desc = region.copy.seoDescription;
    ensureMeta("description").content = desc;
    ensureMeta("og:title", "property").content = title;
    ensureMeta("og:description", "property").content = desc;
    if (region.copy.ogImage) {
      const imgUrl = `${window.location.origin}${region.copy.ogImage}`;
      ensureMeta("og:image", "property").content = imgUrl;
      ensureMeta("twitter:image").content = imgUrl;
    }

    const slug = usePathPrefix && pathRegion ? pathRegion : (resolvedRegion || "bd");
    const path = id ? `/${slug}/explore/${id}` : `/${slug}/explore`;
    const canonicalHref = `${window.location.origin}${path}`;
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = canonicalHref;
  }, [region, id, profile, resolvedRegion, usePathPrefix, pathRegion]);

  const goTo = useCallback((newIdx: number) => {
    if (newIdx < 0 || newIdx >= data.length) return;
    setIdx(newIdx);
    setPhotoIdx(0);
    setAnimKey((k) => k + 1);
    const nxt = data[newIdx];
    if (nxt) navigate(exploreUrl(nxt.id), { replace: true });
    if (newIdx >= data.length - 3 && hasMore && !loading) loadMore();
  }, [data, navigate, hasMore, loading, loadMore, resolvedRegion, usePathPrefix, pathRegion]);

  const next = useCallback(() => goTo(idx + 1), [goTo, idx]);
  const prev = useCallback(() => goTo(idx - 1), [goTo, idx]);

  // keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "Escape") navigate(resolvedRegion && resolvedRegion !== "bd" ? `/${resolvedRegion}` : "/");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, navigate, resolvedRegion]);

  // preload next photo
  useEffect(() => {
    const np = data[idx + 1]?.photos?.[0];
    if (np) {
      const img = new Image();
      const url = photoUrl(np);
      if (url) img.src = url;
    }
  }, [idx, data]);

  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (dx < -50) next();
    else if (dx > 50) prev();
    touchStartX.current = null;
  };

  const photos = profile?.photos ?? [];
  const currentPhoto = photoUrl(photos[photoIdx]);

  const askSignup = () => {
    if (!user) { toast.message("Sign up to save profiles", { action: { label: "Sign up", onClick: () => navigate("/auth") } }); return true; }
    return false;
  };

  const favourite = async () => {
    if (askSignup() || !profile || !user) return;
    const { error } = await supabase.from("favourites").insert({ user_id: user.id, profile_id: profile.id });
    if (error) toast.error(error.message); else toast.success("Saved to favourites");
  };

  if (loading && !profile) {
    return <div className="grid min-h-screen place-items-center text-muted-foreground">Loading profiles…</div>;
  }
  if (!profile) {
    return (
      <div className="grid min-h-screen place-items-center p-6 text-center">
        <div>
          <p className="text-muted-foreground">No profiles available.</p>
          <Link to="/" className="mt-4 inline-block"><Button variant="outline">Back home</Button></Link>
        </div>
      </div>
    );
  }

  const homeHref = resolvedRegion && resolvedRegion !== "bd" ? `/${resolvedRegion}` : "/";
  const profileSlugPath = profile.slug ? `/p/${profile.slug}` : `/profile/${profile.id}`;
  const slugWithSearch = profileSlugPath + (resolvedRegion ? `?r=${resolvedRegion}` : "");
  const location = profile.district || (profile as any).country;

  return (
    <div className="min-h-screen bg-background" dir={region.dir} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
        <div className="container flex h-14 items-center justify-between">
          <Link to={homeHref} className="text-sm text-muted-foreground hover:text-foreground"><X className="inline h-4 w-4" /> {L.close}</Link>
          <div className="text-xs text-muted-foreground">
            <span className="font-display text-base font-semibold text-foreground">{idx + 1}</span> / {data.length}{hasMore ? "+" : ""}
          </div>
          <div className="flex items-center gap-1">
            <Button size="icon" variant="outline" onClick={prev} disabled={idx === 0} aria-label={L.previous}><ChevronLeft className="h-4 w-4" /></Button>
            <Button size="icon" variant="outline" onClick={next} disabled={idx >= data.length - 1 && !hasMore} aria-label={L.nextProfile}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      </header>

      <div key={animKey} className="container animate-fade-in py-6">
        <div className="grid gap-6 md:grid-cols-2 md:gap-10">
          {/* Photo gallery */}
          <div className="animate-scale-in">
            <div className="glossy-card gradient-border relative aspect-[3/4] overflow-hidden">
              <SmartPhoto src={currentPhoto} alt={profile.name} priority />
              <div className="shimmer-overlay" />
              {photos.length > 1 && (
                <>
                  <button onClick={() => setPhotoIdx((i) => Math.max(0, i - 1))} className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-background/80 backdrop-blur-md hover:scale-110">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button onClick={() => setPhotoIdx((i) => Math.min(photos.length - 1, i + 1))} className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-background/80 backdrop-blur-md hover:scale-110">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-6 text-white">
                <h1 className="font-display text-4xl font-bold drop-shadow">{profile.name}, {profile.age}</h1>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 text-sm text-white/90">
                  {profile.height_cm && <span>{cmToFtIn(profile.height_cm)}</span>}
                  {location && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {location}{profile.current_location ? ` → ${profile.current_location}` : ""}</span>}
                  {profile.religion && <span>{profile.religion}</span>}
                </div>
              </div>
            </div>
            {photos.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto">
                {photos.map((p, i) => (
                  <button key={i} onClick={() => setPhotoIdx(i)} className={`aspect-square w-16 shrink-0 overflow-hidden rounded-xl border-2 ${i === photoIdx ? "border-primary" : "border-transparent"}`}>
                    <img src={photoUrl(p)!} className="h-full w-full object-cover" alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Biodata panel */}
          <div className="space-y-4 pb-24 md:pb-0">
            {/* Contact CTA — primary revenue surface */}
            <ContactCTAButtons profileId={profile.id} variant="full" region={region.slug} />

            <div className="flex flex-wrap gap-2">
              <Button onClick={favourite} variant="outline" size="sm">
                <Heart className="mr-1 h-4 w-4" /> {L.save}
              </Button>
              <Link to={slugWithSearch}>
                <Button size="sm" className="gradient-rose text-primary-foreground">
                  {user ? <><Sparkles className="mr-1 h-4 w-4" /> {L.openFullProfile}</> : <><Lock className="mr-1 h-4 w-4" /> {L.signUpToMessage}</>}
                </Button>
              </Link>
            </div>

            {profile.visit_note && (
              <section className="rounded-2xl border border-accent/40 bg-gradient-to-br from-accent/15 via-accent/5 to-transparent p-5 shadow-soft">
                <div className="text-xs font-bold uppercase tracking-wider text-accent-foreground/80">{L.visitNote}</div>
                <p className="mt-1 text-sm font-medium text-foreground">{profile.visit_note}</p>
              </section>
            )}

            {profile.about && (
              <section className="rounded-2xl border border-border bg-card p-5">
                <h2 className="font-display text-lg font-semibold">{L.about}</h2>
                <p className="mt-2 whitespace-pre-line text-sm text-foreground/90">{profile.about}</p>
              </section>
            )}

            <section className="grid gap-4 rounded-2xl border border-border bg-card p-5 sm:grid-cols-2">
              <Info icon={Briefcase} label={L.profession} value={profile.profession} />
              <Info icon={GraduationCap} label={L.education} value={profile.education} />
              <Info icon={Calendar} label={L.maritalStatus} value={profile.marital_status} />
              <Info icon={Sparkles} label={L.religion} value={[profile.religion, profile.sect].filter(Boolean).join(" · ")} />
              <Info icon={Users} label={L.family} value={profile.family_type} />
              <Info icon={MapPin} label={isBD ? L.district : L.country} value={profile.district || (profile as any).country} />
              <Info icon={MapPin} label={L.currentLocation} value={profile.current_location} />
              <Info icon={Sparkles} label={L.weight} value={profile.weight_kg ? `${profile.weight_kg} kg` : null} />
              <Info icon={Users} label={L.children} value={profile.children_info} />
            </section>

            {/* Inline native ad inside biodata flow */}
            <div className="my-2"><AdNative /></div>

            {profile.expectations && (
              <section className="rounded-2xl border border-border bg-card p-5">
                <h2 className="font-display text-lg font-semibold">{L.lookingFor}</h2>
                <p className="mt-2 whitespace-pre-line text-sm text-foreground/90">{profile.expectations}</p>
              </section>
            )}

            <div className="flex justify-center md:hidden"><AdBanner size="300x250" /></div>

            {/* Bottom prev/next */}
            <div className="sticky bottom-4 flex items-center justify-between gap-2 rounded-2xl border border-border bg-card/95 p-3 shadow-soft backdrop-blur-md">
              <Button variant="outline" onClick={prev} disabled={idx === 0} className="flex-1">
                <ChevronLeft className="mr-1 h-4 w-4" /> {L.previous}
              </Button>
              <Button onClick={next} disabled={idx >= data.length - 1 && !hasMore} className="flex-1 gradient-rose text-primary-foreground">
                {L.nextProfile} <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <ProfileStreamSection currentId={profile.id} syncUrl={false} region={resolvedRegion} />
      <StickyBottomBar />
    </div>
  );
};

function Info({ icon: Icon, label, value }: any) {
  if (!value) return null;
  return (
    <div className="flex gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="text-sm font-medium capitalize">{value}</div>
      </div>
    </div>
  );
}

export default Explore;
