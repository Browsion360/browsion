import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { ProfileCard } from "@/components/feed/ProfileCard";
import { ProfileGridSkeleton } from "@/components/feed/ProfileCardSkeleton";
import { InFeedAd } from "@/components/ads/InFeedAd";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SlidersHorizontal, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { effectivePlan } from "@/lib/plan";
import { DISTRICTS } from "@/lib/format";
import { toast } from "sonner";

const PAGE = 20;

const Discover = () => {
  const navigate = useNavigate();
  const { user, appUser } = useAuth();
  const plan = effectivePlan(appUser?.plan ?? "free", appUser?.plan_expiry);
  // Ads handled by InFeedAd (auto-disabled for premium / blocked routes)

  const [favIds, setFavIds] = useState<Set<string>>(new Set());
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());

  const [ageRange, setAgeRange] = useState<[number, number]>([18, 45]);
  const [district, setDistrict] = useState<string>("any");
  const [marital, setMarital] = useState<string>("any");

  const profilesQuery = useInfiniteQuery({
    queryKey: ["discover", ageRange[0], ageRange[1], district, marital],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      let q = supabase.from("patri_profiles").select("*").eq("is_published", true)
        .gte("age", ageRange[0]).lte("age", ageRange[1])
        .order("created_at", { ascending: false })
        .range((pageParam as number) * PAGE, (pageParam as number) * PAGE + PAGE - 1);
      if (district !== "any") q = q.eq("district", district);
      if (marital !== "any") q = q.eq("marital_status", marital as "never" | "divorced" | "widowed");
      const { data, error } = await q;
      if (error) { toast.error(error.message); throw error; }
      return data ?? [];
    },
    getNextPageParam: (last, all) => (last.length === PAGE ? all.length : undefined),
    staleTime: 5 * 60_000,
  });

  const profiles = useMemo(() => (profilesQuery.data?.pages ?? []).flat(), [profilesQuery.data]);
  const loading = profilesQuery.isFetchingNextPage;
  const isInitial = profilesQuery.isLoading;
  const hasMore = !!profilesQuery.hasNextPage;

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: f }, { data: u }] = await Promise.all([
        supabase.from("favourites").select("profile_id").eq("user_id", user.id),
        supabase.from("unlocks").select("profile_id").eq("user_id", user.id),
      ]);
      setFavIds(new Set((f ?? []).map((r: any) => r.profile_id)));
      setUnlockedIds(new Set((u ?? []).map((r: any) => r.profile_id)));
    })();
  }, [user?.id]);

  const newToday = useMemo(
    () => profiles.filter(p => Date.now() - new Date(p.created_at).getTime() < 86400000).slice(0, 5),
    [profiles]
  );

  const toggleFav = async (id: string) => {
    if (!user) {
      toast("Login to save favourites");
      navigate("/auth", { state: { from: "/discover" } });
      return;
    }
    if (favIds.has(id)) {
      await supabase.from("favourites").delete().eq("user_id", user.id).eq("profile_id", id);
      setFavIds(s => { const n = new Set(s); n.delete(id); return n; });
    } else {
      const { error } = await supabase.from("favourites").insert({ user_id: user.id, profile_id: id });
      if (error) return toast.error(error.message);
      setFavIds(s => new Set(s).add(id));
    }
  };

  const items: React.ReactNode[] = [];
  profiles.forEach((p, i) => {
    items.push(
      <ProfileCard
        key={p.id}
        profile={p}
        isFavourite={favIds.has(p.id)}
        isUnlocked={unlockedIds.has(p.id)}
        blurPhoto={false}
        onToggleFavourite={toggleFav}
        priority={i < 3}
      />
    );
    if ((i + 1) % 6 === 0 || (i + 1) % 10 === 0 || (i + 1) % 15 === 0) {
      items.push(
        <div key={`ad-${i}`} className="sm:col-span-2 lg:col-span-3">
          <InFeedAd index={i} />
        </div>
      );
    }
  });

  return (
    <AppShell>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold md:text-4xl">Discover</h1>
          <p className="text-sm text-muted-foreground">Curated brides, updated daily.</p>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm"><SlidersHorizontal className="mr-2 h-4 w-4" /> Filters</Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader><SheetTitle>Filters</SheetTitle></SheetHeader>
            <div className="mt-6 space-y-6">
              <div>
                <div className="mb-2 flex justify-between text-sm font-medium">
                  <span>Age</span><span>{ageRange[0]} – {ageRange[1]}</span>
                </div>
                <Slider min={18} max={60} step={1} value={ageRange} onValueChange={(v) => setAgeRange([v[0], v[1]] as [number, number])} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">District</label>
                <Select value={district} onValueChange={setDistrict}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any district</SelectItem>
                    {DISTRICTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Marital status</label>
                <Select value={marital} onValueChange={setMarital}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="never">Never married</SelectItem>
                    <SelectItem value="divorced">Divorced</SelectItem>
                    <SelectItem value="widowed">Widowed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {plan !== "explorer" && (
                <div className="rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-4 text-sm">
                  <div className="font-semibold text-primary">Want more filters?</div>
                  <div className="mt-1 text-muted-foreground">Upgrade to Explorer for height, skin tone & family type filters.</div>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {newToday.length > 0 && (
        <section className="mt-6 rounded-3xl border border-primary/20 bg-primary/5 p-5">
          <div className="mb-3 flex items-center gap-2 text-primary">
            <Sparkles className="h-4 w-4" /> <span className="text-xs font-semibold uppercase tracking-wider">New today</span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {newToday.map(p => (
              <a key={p.id} href={p.slug ? `/p/${p.slug}` : `/profile/${p.id}`} className="shrink-0 rounded-2xl border border-border bg-card px-3 py-2 text-sm hover:border-primary">
                <div className="font-medium">{p.name}, {p.age}</div>
                <div className="text-xs text-muted-foreground">{p.district ?? "—"}</div>
              </a>
            ))}
          </div>
        </section>
      )}

      {isInitial ? (
        <section className="mt-6">
          <ProfileGridSkeleton count={6} />
        </section>
      ) : (
        <section className="mt-6" aria-labelledby="discover-grid-heading">
          <h2 id="discover-grid-heading" className="sr-only">Profiles</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items}
          </div>
        </section>
      )}

      <div className="mt-8 flex justify-center">
        {hasMore ? (
          <Button onClick={() => profilesQuery.fetchNextPage()} disabled={loading} variant="outline">
            {loading ? "আরও আসছে…" : "Load more"}
          </Button>
        ) : !isInitial && (
          <span className="text-sm text-muted-foreground">{profiles.length === 0 ? "No profiles yet — check back soon." : "You've reached the end."}</span>
        )}
      </div>
    </AppShell>
  );
};

export default Discover;
