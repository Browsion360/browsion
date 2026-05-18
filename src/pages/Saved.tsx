import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ProfileCard } from "@/components/feed/ProfileCard";
import { ProfileGridSkeleton } from "@/components/feed/ProfileCardSkeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { effectivePlan } from "@/lib/plan";
import { toast } from "sonner";
import { Heart } from "lucide-react";

const Saved = () => {
  const { user, appUser } = useAuth();
  const plan = effectivePlan(appUser?.plan ?? "free", appUser?.plan_expiry);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [favIds, setFavIds] = useState<Set<string>>(new Set());
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    const { data: favs } = await supabase.from("favourites").select("profile_id").eq("user_id", user.id);
    const ids = (favs ?? []).map((f: any) => f.profile_id);
    setFavIds(new Set(ids));
    if (ids.length === 0) { setProfiles([]); setLoading(false); return; }
    const [{ data: ps }, { data: u }] = await Promise.all([
      supabase.from("patri_profiles").select("*").in("id", ids),
      supabase.from("unlocks").select("profile_id").eq("user_id", user.id),
    ]);
    setProfiles(ps ?? []);
    setUnlockedIds(new Set((u ?? []).map((r: any) => r.profile_id)));
    setLoading(false);
  };
  useEffect(() => { load(); }, [user?.id]);

  const remove = async (id: string) => {
    if (!user) return;
    await supabase.from("favourites").delete().eq("user_id", user.id).eq("profile_id", id);
    setProfiles(p => p.filter(x => x.id !== id));
    setFavIds(s => { const n = new Set(s); n.delete(id); return n; });
  };

  return (
    <AppShell>
      <h1 className="font-display text-3xl font-bold md:text-4xl">Saved</h1>
      <p className="text-sm text-muted-foreground">Your favourite profiles in one place.</p>

      {loading ? (
        <div className="mt-6"><ProfileGridSkeleton count={3} /></div>
      ) : profiles.length === 0 ? (
        <div className="mt-16 rounded-3xl border border-dashed border-border bg-card p-12 text-center">
          <Heart className="mx-auto h-10 w-10 text-muted-foreground" />
          <h2 className="mt-4 font-display text-xl font-semibold">No favourites yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {plan === "explorer" ? "Tap the heart on any profile to save it here." : "Upgrade to Explorer to save up to 5 profiles."}
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {profiles.map(p => (
            <ProfileCard key={p.id} profile={p} isFavourite={favIds.has(p.id)} isUnlocked={unlockedIds.has(p.id)} blurPhoto={plan === "free"} onToggleFavourite={remove} />
          ))}
        </div>
      )}
    </AppShell>
  );
};

export default Saved;
