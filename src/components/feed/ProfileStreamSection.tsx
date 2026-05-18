import { useCallback, useEffect, useRef } from "react";
import { useProfileStream } from "@/hooks/useProfileStream";
import { InlineProfileBiodata, ProfileDivider } from "@/components/feed/InlineProfileBiodata";
import { InFeedAd } from "@/components/ads/InFeedAd";
import { getRegion, type Region } from "@/lib/regions";

export function ProfileStreamSection({ currentId, syncUrl = true, region: regionSlug }: { currentId: string; syncUrl?: boolean; region?: Region }) {
  const region = getRegion(regionSlug);
  const { profiles, loading, hasMore, loadMore } = useProfileStream(currentId, regionSlug);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return;
    const el = sentinelRef.current;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) loadMore();
      },
      { rootMargin: "600px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasMore, loading, loadMore]);

  const handleInView = useCallback((id: string) => {
    if (!syncUrl) return;
    const profile = profiles.find((p) => p.id === id);
    const newPath = profile?.slug ? `/p/${profile.slug}` : `/profile/${id}`;
    const search = regionSlug ? `?r=${regionSlug}` : "";
    if (window.location.pathname !== newPath) {
      window.history.replaceState(null, "", newPath + search);
    }
  }, [syncUrl, profiles, regionSlug]);

  if (profiles.length === 0 && !loading) return null;

  const homeHref = regionSlug && regionSlug !== "bd" ? `/${regionSlug}` : "/";

  return (
    <section aria-label={region.labels.moreProfiles} className="mt-12" dir={region.dir}>
      {profiles.map((p, i) => (
        <div key={p.id}>
          <ProfileDivider region={regionSlug} />
          <InlineProfileBiodata profile={p} onInView={syncUrl ? handleInView : undefined} region={regionSlug} />
          {(i + 1) % 3 === 0 && (
            <div className="my-6">
              <InFeedAd index={i} />
            </div>
          )}
        </div>
      ))}
      <div ref={sentinelRef} aria-hidden className="h-1 w-full" />
      {loading && (
        <div className="py-8 text-center text-sm text-muted-foreground" aria-live="polite">
          {region.labels.loadingMore}
        </div>
      )}
      {!hasMore && profiles.length > 0 && (
        <div className="py-8 text-center text-sm text-muted-foreground">
          {region.labels.endOfList} · <a href={homeHref} className="font-semibold text-primary hover:underline">{region.labels.allProfiles} →</a>
        </div>
      )}
    </section>
  );
}
