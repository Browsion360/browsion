import { useCallback, useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type PubProfile = {
  id: string;
  slug: string | null;
  name: string;
  age: number;
  height_cm: number | null;
  district: string | null;
  education: string | null;
  profession: string | null;
  religion: string | null;
  sect: string | null;
  marital_status: string | null;
  family_type: string | null;
  about: string | null;
  expectations: string | null;
  photos: string[];
  created_at: string;
  weight_kg: number | null;
  current_location: string | null;
  ancestral_address: string | null;
  children_info: string | null;
  visit_note: string | null;
  region?: string | null;
  country?: string | null;
};

export type ProfileFilters = {
  ageMin?: number;
  ageMax?: number;
  district?: string;
  religion?: string;
  region?: string;
  country?: string;
};

const PAGE_SIZE = 12;
const COLS =
  "id,slug,name,age,height_cm,district,education,profession,religion,sect,marital_status,family_type,about,expectations,photos,created_at,weight_kg,current_location,ancestral_address,children_info,visit_note,region,country";

export function usePublishedProfiles(filters: ProfileFilters = {}) {
  const key = useMemo(
    () => ["published-profiles", filters.ageMin ?? null, filters.ageMax ?? null, filters.district ?? null, filters.religion ?? null, filters.region ?? null, filters.country ?? null],
    [filters.ageMin, filters.ageMax, filters.district, filters.religion, filters.region, filters.country]
  );

  const query = useInfiniteQuery({
    queryKey: key,
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      let q = supabase
        .from("patri_profiles")
        .select(COLS)
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .range(pageParam * PAGE_SIZE, pageParam * PAGE_SIZE + PAGE_SIZE - 1);
      if (filters.ageMin) q = q.gte("age", filters.ageMin);
      if (filters.ageMax) q = q.lte("age", filters.ageMax);
      if (filters.district && filters.district !== "any") q = q.eq("district", filters.district);
      if (filters.religion && filters.religion !== "any") q = q.eq("religion", filters.religion);
      if (filters.region) q = q.eq("region", filters.region);
      if (filters.country && filters.country !== "any") q = q.eq("country", filters.country);
      const { data } = await q;
      return (data ?? []) as PubProfile[];
    },
    getNextPageParam: (last, all) => (last.length === PAGE_SIZE ? all.length : undefined),
    staleTime: 5 * 60_000,
  });

  const data = useMemo(() => (query.data?.pages ?? []).flat(), [query.data]);
  const loadMore = useCallback(() => {
    if (query.hasNextPage && !query.isFetchingNextPage) query.fetchNextPage();
  }, [query]);

  return {
    data,
    loading: query.isLoading || query.isFetchingNextPage,
    isInitialLoading: query.isLoading,
    hasMore: !!query.hasNextPage,
    loadMore,
  };
}
