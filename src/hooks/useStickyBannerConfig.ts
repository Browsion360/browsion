import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type StickyBannerConfig = {
  enabled: boolean;
  max_closes_per_session: number;
  reappear_seconds: number;
  session_minutes: number;
};

export const DEFAULT_STICKY_CONFIG: StickyBannerConfig = {
  enabled: true,
  max_closes_per_session: 3,
  reappear_seconds: 10,
  session_minutes: 15,
};

export function useStickyBannerConfig() {
  const q = useQuery({
    queryKey: ["app_settings", "sticky_banner"],
    queryFn: async (): Promise<StickyBannerConfig> => {
      const { data, error } = await supabase
        .from("app_settings")
        .select("value")
        .eq("key", "sticky_banner")
        .maybeSingle();
      if (error) throw error;
      const v = (data?.value ?? {}) as Partial<StickyBannerConfig>;
      return { ...DEFAULT_STICKY_CONFIG, ...v };
    },
    staleTime: 5 * 60_000,
  });

  useEffect(() => {
    const ch = supabase.channel(`app_settings_rt_${Math.random().toString(36).slice(2)}`);
    ch.on("postgres_changes", { event: "*", schema: "public", table: "app_settings" }, () => {
      q.refetch();
    }).subscribe();
    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return q.data ?? DEFAULT_STICKY_CONFIG;
}
