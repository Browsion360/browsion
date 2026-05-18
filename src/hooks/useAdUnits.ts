import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type AdUnit = {
  id: string;
  slot: string;
  label: string;
  provider: string;
  format: "popunder" | "social_bar" | "native" | "banner" | "smartlink";
  width: number | null;
  height: number | null;
  script_url: string | null;
  container_id: string | null;
  zone_key: string | null;
  raw_html: string | null;
  target_url: string | null;
  enabled: boolean;
  notes: string | null;
  sort_order: number;
};

const CACHE_KEY = "ad_units_v2";
const LEGACY_CACHE_KEY = "ad_units_v1";
const PERMANENTLY_DISABLED_SLOTS = new Set(["social_bar"]);

function isPermanentlyDisabled(u: AdUnit) {
  return PERMANENTLY_DISABLED_SLOTS.has(u.slot) || u.format === "social_bar";
}

function readCache(): AdUnit[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AdUnit[];
    // Only keep enabled units and app-wide blocked units out of stale cache.
    return Array.isArray(parsed) ? parsed.filter(u => u && u.enabled !== false && !isPermanentlyDisabled(u)) : null;
  } catch { return null; }
}
function writeCache(units: AdUnit[]) {
  try {
    localStorage.removeItem(LEGACY_CACHE_KEY);
    localStorage.setItem(CACHE_KEY, JSON.stringify(units.filter(u => !isPermanentlyDisabled(u))));
  } catch {}
}

export function useAdUnits() {
  const q = useQuery({
    queryKey: ["ad_units"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ad_units")
        .select("*")
        .eq("enabled", true)
        .order("sort_order");
      if (error) throw error;
      const units = ((data ?? []) as AdUnit[]).filter(u => !isPermanentlyDisabled(u));
      writeCache(units);
      return units;
    },
    initialData: readCache() ?? undefined,
    staleTime: 10 * 60_000,
  });

  useEffect(() => {
    const ch = supabase.channel(`ad_units_rt_${Math.random().toString(36).slice(2)}`);
    ch.on("postgres_changes", { event: "*", schema: "public", table: "ad_units" }, () => {
      q.refetch();
    }).subscribe();
    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const units = (q.data ?? []).filter(u => !isPermanentlyDisabled(u));
  return {
    units,
    getBySlot: (slot: string) => units.find(u => u.slot === slot && u.enabled) ?? null,
    getByFormatSize: (w: number, h: number) =>
      units.find(u => u.format === "banner" && u.width === w && u.height === h && u.enabled) ?? null,
    loading: q.isLoading,
  };
}

export function bannerSlot(size: string) {
  return `banner_${size}`; // e.g. banner_728x90
}
