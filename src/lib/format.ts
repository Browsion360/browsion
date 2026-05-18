import { supabase } from "@/integrations/supabase/client";

export function photoUrl(
  path: string | null | undefined,
  opts: { width?: number; quality?: number } = {}
): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const width = opts.width ?? 600;
  const quality = opts.quality ?? 70;
  const { data } = supabase.storage.from("patri-photos").getPublicUrl(path, {
    transform: { width, quality, resize: "cover" },
  });
  return data.publicUrl;
}

export function cmToFtIn(cm: number | null | undefined): string {
  if (!cm) return "";
  const totalIn = Math.round(cm / 2.54);
  const ft = Math.floor(totalIn / 12);
  const inch = totalIn % 12;
  return `${ft}'${inch}"`;
}

export function timeAgo(iso: string): string {
  const d = (Date.now() - new Date(iso).getTime()) / 1000;
  if (d < 60) return "just now";
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return `${Math.floor(d / 86400)}d ago`;
}

export const DISTRICTS = [
  "Dhaka","Chattogram","Sylhet","Rajshahi","Khulna","Barishal","Rangpur","Mymensingh",
  "Cumilla","Narayanganj","Gazipur","Bogura","Jashore","Cox's Bazar","Faridpur","Kushtia"
];
