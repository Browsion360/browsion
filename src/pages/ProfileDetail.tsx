import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { effectivePlan, UNLOCK_PRICE, BKASH_MERCHANT } from "@/lib/plan";
import { photoUrl, cmToFtIn } from "@/lib/format";
import { Heart, Share2, Lock, MapPin, GraduationCap, Briefcase, Users, Calendar, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { ContactCTAButtons } from "@/components/cta/ContactCTAButtons";
import { OnlineBadge } from "@/components/feed/OnlineBadge";
import { SmartPhoto } from "@/components/feed/SmartPhoto";
import { isProfileOnline } from "@/lib/presence";
import { ProfileStreamSection } from "@/components/feed/ProfileStreamSection";
import { AdBanner } from "@/components/ads/AdBanner";
import { AdNative } from "@/components/ads/AdNative";
import { profilePath, isUuid } from "@/lib/profileUrl";
import { getRegion } from "@/lib/regions";

const ProfileDetail = () => {
  const params = useParams();
  const slugOrId = params.slug ?? params.id;
  const { user, appUser } = useAuth();
  const navigate = useNavigate();
  const plan = effectivePlan(appUser?.plan ?? "free", appUser?.plan_expiry);

  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFav, setIsFav] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [photoIdx, setPhotoIdx] = useState(0);
  const [unlockOpen, setUnlockOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!slugOrId) return;
      const isId = isUuid(slugOrId);
      const { data: p } = await supabase
        .from("patri_profiles")
        .select("*")
        .eq(isId ? "id" : "slug", slugOrId)
        .maybeSingle();
      setProfile(p);
      // Auto-upgrade legacy /profile/:id URL to clean /p/:slug
      if (p && isId && p.slug) {
        navigate(`/p/${p.slug}`, { replace: true });
      }
      if (user && p) {
        const [{ data: f }, { data: u }] = await Promise.all([
          supabase.from("favourites").select("profile_id").eq("user_id", user.id).eq("profile_id", p.id).maybeSingle(),
          supabase.from("unlocks").select("profile_id").eq("user_id", user.id).eq("profile_id", p.id).maybeSingle(),
        ]);
        setIsFav(!!f); setIsUnlocked(!!u);
      }
      setLoading(false);
    };
    load();
  }, [slugOrId, user?.id]);

  const id: string | undefined = profile?.id;
  const canonicalPath = profile ? (profile.slug ? `/p/${profile.slug}` : `/profile/${profile.id}`) : "";

  useEffect(() => {
    if (!profile) return;
    const prev = document.title;
    document.title = `${profile.name}, ${profile.age} — ${profile.district ?? "Bangladesh"} | Patri biodata`;
    // Canonical URL
    let link = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = `${window.location.origin}${canonicalPath}`;
    return () => { document.title = prev; };
  }, [profile, canonicalPath]);

  const toggleFav = async () => {
    if (!user) {
      toast("Login to save favourites");
      navigate("/auth", { state: { from: canonicalPath } });
      return;
    }
    if (!id) return;
    if (isFav) {
      await supabase.from("favourites").delete().eq("user_id", user.id).eq("profile_id", id);
      setIsFav(false);
    } else {
      const { error } = await supabase.from("favourites").insert({ user_id: user.id, profile_id: id });
      if (error) return toast.error(error.message);
      setIsFav(true);
    }
  };

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) { try { await navigator.share({ title: profile?.name, url }); } catch {} }
    else { navigator.clipboard.writeText(url); toast.success("Link copied"); }
  };

  const submitUnlockPayment = async () => {
    if (!user || !id) return;
    const { error } = await supabase.from("payment_requests").insert({
      user_id: user.id, plan: "explorer", amount: UNLOCK_PRICE, note: `unlock:${id}`,
    });
    if (error) return toast.error(error.message);
    toast.success("Payment submitted. Admin will confirm shortly.");
    setUnlockOpen(false);
  };

  const send = async () => {
    if (!user) {
      toast("Login to send a message");
      navigate("/auth", { state: { from: canonicalPath } });
      return;
    }
    if (!id || !message.trim()) return;
    setSending(true);
    const { error } = await supabase.from("messages").insert({ user_id: user.id, profile_id: id, body: message.trim() });
    setSending(false);
    if (error) return toast.error(error.message);
    toast.success("Message sent. We'll forward it on your behalf.");
    setMessage("");
  };

  if (loading) return (
    <AppShell>
      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <div className="aspect-[3/4] w-full animate-pulse rounded-3xl bg-muted" />
        <div className="space-y-4">
          <div className="h-8 w-2/3 animate-pulse rounded bg-muted" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-muted/70" />
          <div className="h-32 w-full animate-pulse rounded bg-muted/60" />
          <div className="h-10 w-40 animate-pulse rounded bg-muted/60" />
        </div>
      </div>
    </AppShell>
  );
  if (!profile) return <AppShell><div className="py-20 text-center">Profile not found.</div></AppShell>;

  const photos: string[] = profile.photos ?? [];
  const blur = false; // launch promo: all profiles fully visible
  const messagingUnlocked = true; // launch promo: messaging open to all
  const currentPhoto = photoUrl(photos[photoIdx]);

  return (
    <AppShell>
      <Link to="/discover" className="text-sm text-muted-foreground hover:text-foreground">← Back to discover</Link>

      <div className="mt-4 grid gap-8 md:grid-cols-2">
        {/* Gallery */}
        <div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-muted shadow-card">
            <SmartPhoto src={currentPhoto} alt={profile.name} priority locked={blur} />
            {blur && (
              <div className="absolute inset-0 grid place-items-center bg-black/20">
                <div className="rounded-full bg-background/90 px-4 py-2 text-sm font-medium shadow-soft">
                  <Lock className="mr-1 inline h-4 w-4" /> Unlock to view clearly
                </div>
              </div>
            )}
          </div>
          {photos.length > 1 && (
            <div className="mt-3 flex gap-2">
              {photos.map((p, i) => (
                <button key={i} aria-label={`View photo ${i + 1} of ${photos.length}`} aria-current={i === photoIdx} onClick={() => setPhotoIdx(i)} className={`aspect-square w-16 overflow-hidden rounded-xl border-2 ${i === photoIdx ? "border-primary" : "border-transparent"}`}>
                  <img src={photoUrl(p)!} className={`h-full w-full object-cover ${blur ? "blur-photo" : ""}`} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-3xl font-bold leading-tight break-words sm:text-4xl">{profile.name}, {profile.age}</h1>
            {isProfileOnline(profile.id) && <OnlineBadge size="md" />}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            {profile.height_cm && <span>{cmToFtIn(profile.height_cm)}</span>}
            {profile.district && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {profile.district}{profile.current_location ? ` → ${profile.current_location}` : ""}</span>}
            {profile.marital_status && <span className="capitalize">{profile.marital_status.replace("_", " ")}</span>}
          </div>

          {profile.visit_note && (() => {
            const r = (profile.region as any) || "bd";
            const label = getRegion(r).labels.visitNote;
            return (
              <div className="mt-4 rounded-2xl border border-accent/40 bg-gradient-to-br from-accent/15 via-accent/5 to-transparent p-4 shadow-soft">
                <div className="text-xs font-bold uppercase tracking-wider text-accent-foreground/80">{label}</div>
                <p className="mt-1 text-sm font-medium text-foreground">{profile.visit_note}</p>
              </div>
            );
          })()}

          {/* Contact CTA — primary revenue surface */}
          <div className="mt-6">
            <ContactCTAButtons profileId={profile.id} variant="full" region={(profile.region as any) || "bd"} />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={() => document.getElementById("compose")?.scrollIntoView({ behavior: "smooth" })} className="gradient-rose text-primary-foreground">
              <Sparkles className="mr-1 h-4 w-4" /> Send message
            </Button>
            <Button onClick={toggleFav} variant="outline">
              <Heart className={`mr-1 h-4 w-4 ${isFav ? "fill-primary text-primary" : ""}`} />
              {isFav ? "Saved" : "Favourite"}
            </Button>
            <Button onClick={share} variant="outline" size="icon"><Share2 className="h-4 w-4" /></Button>
          </div>

          {profile.about && (
            <section className="mt-8 rounded-2xl border border-border bg-card p-5">
              <h2 className="font-display text-lg font-semibold">About</h2>
              <p className="mt-2 whitespace-pre-line text-sm text-foreground/90">{profile.about}</p>
            </section>
          )}

          {/* Native between About and info grid (lazy + idle-mounted) */}
          <div className="mt-4">
            <AdNative maxHeight={620} minHeight={300} />
          </div>

          {/* Mobile in-content 300x250 between sections */}
          <div className="mt-4 flex justify-center md:hidden">
            <AdBanner size="300x250" />
          </div>

          <section className="mt-4 grid gap-4 rounded-2xl border border-border bg-card p-5 sm:grid-cols-2">
            <Info icon={Briefcase} label="Profession" value={profile.profession} />
            <Info icon={GraduationCap} label="Education" value={profile.education} />
            <Info icon={Calendar} label="Income" value={profile.income_range} />
            <Info icon={Sparkles} label="Skin tone" value={profile.skin_tone} />
            <Info icon={Sparkles} label="Religion" value={[profile.religion, profile.sect].filter(Boolean).join(" · ")} />
            <Info icon={Users} label="Family" value={profile.family_type} />
            <Info icon={MapPin} label="Current location" value={profile.current_location} />
            <Info icon={MapPin} label="Ancestral address" value={profile.ancestral_address} />
            <Info icon={Sparkles} label="Weight" value={profile.weight_kg ? `${profile.weight_kg} kg` : null} />
            <Info icon={Users} label="Children" value={profile.children_info} />
            <Info icon={Users} label="Father" value={profile.father_profession} />
            <Info icon={Users} label="Mother" value={profile.mother_profession} />
            <Info icon={Users} label="Siblings" value={profile.siblings_count?.toString()} />
          </section>

          {profile.expectations && (
            <section className="mt-4 rounded-2xl border border-border bg-card p-5">
              <h2 className="font-display text-lg font-semibold">Looking for</h2>
              <p className="mt-2 whitespace-pre-line text-sm text-foreground/90">{profile.expectations}</p>
            </section>
          )}

          {messagingUnlocked && (
            <section id="compose" className="mt-6 rounded-2xl border border-primary/30 bg-primary/5 p-5">
              <h2 className="font-display text-lg font-semibold">Your first message</h2>
              <p className="mt-1 text-xs text-muted-foreground">Messages are reviewed and forwarded on your behalf.</p>
              <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Hello, I came across your profile and…" className="mt-3" rows={5} maxLength={1000} />
              <div className="mt-3 flex justify-end">
                <Button onClick={send} disabled={sending || !message.trim()} className="gradient-rose text-primary-foreground">Send message</Button>
              </div>
            </section>
          )}

          {/* 300x250 after compose (single mobile in-content ad) */}
          <div className="mt-6 flex justify-center md:hidden">
            <AdBanner size="300x250" />
          </div>

          <div className="mt-6 hidden md:flex md:flex-col md:items-center md:gap-4">
            <AdBanner size="300x250" />
            <AdBanner size="160x600" />
          </div>
        </div>
      </div>

      <ProfileStreamSection currentId={profile.id} region={(profile.region as any) || "bd"} />

      <div className="mt-8 flex justify-center"><AdBanner size="468x60" /></div>


      <Dialog open={unlockOpen} onOpenChange={setUnlockOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Unlock messaging — ৳{UNLOCK_PRICE}</DialogTitle>
            <DialogDescription>One-time unlock for this profile. Send the amount via bKash, then submit.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 rounded-2xl bg-secondary p-4 text-sm">
            <div>1. Open bKash → Send Money to <span className="font-mono font-semibold">{BKASH_MERCHANT}</span></div>
            <div>2. Send <span className="font-semibold">৳{UNLOCK_PRICE}</span></div>
            <div>3. Reference: <span className="font-mono">{user?.id?.slice(0, 8)}</span></div>
            <div>4. Tap below — admin will approve within hours.</div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setUnlockOpen(false)}>Cancel</Button>
            <Button onClick={submitUnlockPayment} className="gradient-rose text-primary-foreground">I've paid</Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
};

function Info({ icon: Icon, label, value }: any) {
  if (!value) return null;
  return (
    <div className="flex gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <div className="min-w-0 flex-1">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="break-words text-sm font-medium capitalize">{value}</div>
      </div>
    </div>
  );
}


export default ProfileDetail;
