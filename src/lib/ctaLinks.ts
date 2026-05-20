import { supabase } from "@/integrations/supabase/client";
import waIcon from "@/assets/cta/whatsapp.png";
import imoIcon from "@/assets/cta/imo.png";
import msgrIcon from "@/assets/cta/messenger.png";
import fbIcon from "@/assets/cta/facebook.png";
import callIcon from "@/assets/cta/call.png";
import tgIcon from "@/assets/cta/telegram.png";

export type CtaKind = "whatsapp" | "telegram" | "imo" | "messenger" | "facebook" | "call" | "custom";

export type CtaLink = {
  id: string;
  kind: CtaKind;
  label: string;
  url: string;
  profile_id: string | null;
  is_active: boolean;
  sort_order: number;
};

export const CTA_KINDS: CtaKind[] = ["whatsapp", "telegram", "imo", "messenger", "facebook", "call"];

export const CTA_META: Record<CtaKind, { icon: string; bg: string; defaultLabel: string }> = {
  whatsapp: { icon: waIcon, bg: "#25D366", defaultLabel: "WhatsApp নাম্বার দেখুন" },
  telegram: { icon: tgIcon, bg: "#229ED9", defaultLabel: "Telegram এ মেসেজ" },
  imo: { icon: imoIcon, bg: "#1F4FA0", defaultLabel: "Imo তে কথা বলুন" },
  messenger: { icon: msgrIcon, bg: "#0084FF", defaultLabel: "Messenger এ মেসেজ" },
  facebook: { icon: fbIcon, bg: "#1877F2", defaultLabel: "Facebook এ Add দিন" },
  call: { icon: callIcon, bg: "#22C55E", defaultLabel: "ফোন করুন" },
  custom: { icon: callIcon, bg: "#E11D48", defaultLabel: "যোগাযোগ" },
};

/** Normalize URLs: bare digits → wa.me / tel:; otherwise return as-is. */
export function normalizeUrl(kind: CtaKind, raw: string): string {
  const v = (raw ?? "").trim();
  if (!v) return "";
  const digits = v.replace(/[^\d]/g, "");
  if (kind === "whatsapp" && /^[\d+\s-]+$/.test(v) && digits.length >= 7) {
    return `https://wa.me/${digits}`;
  }
  if (kind === "call" && /^[\d+\s-]+$/.test(v) && digits.length >= 5) {
    return `tel:${digits}`;
  }
  if (!/^https?:\/\//i.test(v) && kind !== "call") return `https://${v}`;
  return v;
}

/** Resolve active links for a profile: per-profile override wins over global. */
export async function resolveCtaLinks(profileId?: string | null): Promise<CtaLink[]> {
  const { data, error } = await supabase
    .from("cta_links")
    .select("*")
    .eq("is_active", true)
    .or(profileId ? `profile_id.is.null,profile_id.eq.${profileId}` : "profile_id.is.null");
  if (error || !data) return [];
  // pick override > global per kind
  const byKind = new Map<CtaKind, CtaLink>();
  for (const row of data as CtaLink[]) {
    if (!row.url?.trim()) continue;
    const existing = byKind.get(row.kind);
    if (!existing || (row.profile_id && !existing.profile_id)) byKind.set(row.kind, row);
  }
  return Array.from(byKind.values()).sort((a, b) => a.sort_order - b.sort_order);
}

const PRIMARY_PRIORITY: CtaKind[] = ["whatsapp", "call", "imo", "messenger", "facebook", "custom"];

export function pickPrimary(links: CtaLink[]): { primary: CtaLink | null; secondary: CtaLink[]; hasOverride: boolean } {
  if (!links.length) return { primary: null, secondary: [], hasOverride: false };
  let primary: CtaLink | null = null;
  for (const k of PRIMARY_PRIORITY) {
    const found = links.find((l) => l.kind === k);
    if (found) { primary = found; break; }
  }
  if (!primary) primary = links[0];
  const secondary = links.filter((l) => l.id !== primary!.id).slice(0, 3);
  const hasOverride = links.some((l) => !!l.profile_id);
  return { primary, secondary, hasOverride };
}

export async function trackCtaClick(link: CtaLink, profileId?: string | null, userId?: string | null) {
  try {
    await supabase.from("cta_clicks").insert({
      cta_link_id: link.id,
      kind: link.kind,
      profile_id: profileId ?? null,
      user_id: userId ?? null,
    });
  } catch {
    /* fire-and-forget */
  }
}
