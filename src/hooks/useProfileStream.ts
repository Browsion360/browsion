import { useCallback, useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { PubProfile } from "@/hooks/usePublishedProfiles";

const PAGE_SIZE = 4;
const COLS =
  "id,slug,name,age,height_cm,district,education,profession,religion,sect,marital_status,family_type,about,expectations,photos,created_at,weight_kg,current_location,ancestral_address,children_info,visit_note,region,country";

export function useProfileStream(excludeId?: string, region?: string) {
  const query = useInfiniteQuery({
    queryKey: ["profile-stream", excludeId ?? null, region ?? null],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      let q = supabase
        .from("patri_profiles")
        .select(COLS)
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .range(pageParam * PAGE_SIZE, pageParam * PAGE_SIZE + PAGE_SIZE - 1);
      if (excludeId) q = q.neq("id", excludeId);
      if (region) q = q.eq("region", region);
      const { data } = await q;
      return (data ?? []) as PubProfile[];
    },
    getNextPageParam: (last, all) => (last.length === PAGE_SIZE ? all.length : undefined),
    staleTime: 5 * 60_000,
  });

  const profiles = useMemo(() => {
    const seen = new Set<string>();
    const out: PubProfile[] = [];
    for (const p of (query.data?.pages ?? []).flat()) {
      if (!seen.has(p.id)) { seen.add(p.id); out.push(p); }
    }
    return out;
  }, [query.data]);

  const loadMore = useCallback(() => {
    if (query.hasNextPage && !query.isFetchingNextPage) query.fetchNextPage();
  }, [query]);

  return {
    profiles,
    loading: query.isLoading || query.isFetchingNextPage,
    hasMore: !!query.hasNextPage,
    loadMore,
  };
}
