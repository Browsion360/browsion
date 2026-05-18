import { useEffect, useState } from "react";
import { resolveCtaLinks, type CtaLink } from "@/lib/ctaLinks";

const cache = new Map<string, CtaLink[]>();

export function useCtaLinks(profileId?: string | null) {
  const key = profileId ?? "__global__";
  const [links, setLinks] = useState<CtaLink[]>(cache.get(key) ?? []);
  const [loading, setLoading] = useState(!cache.has(key));

  useEffect(() => {
    let alive = true;
    if (cache.has(key)) {
      setLinks(cache.get(key)!);
      setLoading(false);
      return;
    }
    setLoading(true);
    resolveCtaLinks(profileId ?? null).then((r) => {
      if (!alive) return;
      cache.set(key, r);
      setLinks(r);
      setLoading(false);
    });
    return () => { alive = false; };
  }, [key, profileId]);

  return { links, loading };
}
