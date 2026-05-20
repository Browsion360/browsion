import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { CTA_KINDS, CTA_META, type CtaKind, type CtaLink } from "@/lib/ctaLinks";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

export function ProfileCtaEditor({ profileId }: { profileId: string }) {
  const [rows, setRows] = useState<Partial<CtaLink>[]>([]);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("cta_links").select("*").eq("profile_id", profileId);
    const existing: Partial<CtaLink>[] = (data ?? []) as any;
    const merged = CTA_KINDS.map((k, i) =>
      existing.find(r => r.kind === k) ?? {
        kind: k, label: "", url: "", is_active: true, sort_order: i + 1, profile_id: profileId,
      }
    );
    setRows(merged);
    setLoading(false);
  };

  useEffect(() => { if (profileId) load(); }, [profileId]);

  const update = (i: number, patch: Partial<CtaLink>) =>
    setRows(rs => rs.map((r, j) => j === i ? { ...r, ...patch } : r));

  const saveRow = async (row: Partial<CtaLink>) => {
    setBusy(true);
    const payload: any = {
      kind: row.kind,
      label: row.label ?? "",
      url: row.url ?? "",
      profile_id: profileId,
      is_active: !!row.is_active,
      sort_order: row.sort_order ?? 0,
    };
    const { error } = row.id
      ? await supabase.from("cta_links").update(payload).eq("id", row.id)
      : await supabase.from("cta_links").insert(payload);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    load();
  };

  const saveAll = async () => {
    setBusy(true);
    for (const r of rows) {
      if (!r.url?.trim() && !r.id) continue; // skip empty new rows
      const payload: any = {
        kind: r.kind, label: r.label ?? "", url: r.url ?? "",
        profile_id: profileId, is_active: !!r.is_active, sort_order: r.sort_order ?? 0,
      };
      if (r.id) await supabase.from("cta_links").update(payload).eq("id", r.id);
      else await supabase.from("cta_links").insert(payload);
    }
    setBusy(false);
    toast.success("All contact links saved");
    load();
  };

  const removeRow = async (row: Partial<CtaLink>) => {
    if (!row.id) return;
    if (!confirm("Remove this override? Global default will be used.")) return;
    const { error } = await supabase.from("cta_links").delete().eq("id", row.id);
    if (error) return toast.error(error.message);
    load();
  };

  if (loading) return <div className="text-sm text-muted-foreground">Loading contact links…</div>;

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Set this profile's own contact numbers/links. Leave blank to use the global default.
      </p>
      {rows.map((r, i) => {
        const meta = CTA_META[r.kind as CtaKind];
        return (
          <div key={r.kind} className="grid gap-2 rounded-xl border border-border bg-background/60 p-3 sm:grid-cols-[auto_1fr_auto_auto] sm:items-center">
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-full" style={{ backgroundColor: meta.bg }}>
                <img src={meta.icon} alt="" className="h-4 w-4" />
              </div>
              <div className="text-sm font-semibold capitalize">{r.kind}</div>
            </div>
            <Input
              value={r.url ?? ""}
              placeholder={r.kind === "whatsapp" || r.kind === "call" ? "8801XXXXXXXXX" : "https://..."}
              onChange={e => update(i, { url: e.target.value })}
            />
            <div className="flex items-center gap-2">
              <Switch checked={!!r.is_active} onCheckedChange={v => update(i, { is_active: v })} />
              <span className="text-xs text-muted-foreground">Active</span>
            </div>
            <div className="flex gap-1">
              <Button size="sm" variant="outline" disabled={busy} onClick={() => saveRow(r)}>Save</Button>
              {r.id && <Button size="icon" variant="ghost" onClick={() => removeRow(r)}><Trash2 className="h-4 w-4" /></Button>}
            </div>
          </div>
        );
      })}
      <div className="pt-1">
        <Button size="sm" disabled={busy} onClick={saveAll} className="gradient-rose text-primary-foreground">
          Save all contact links
        </Button>
      </div>
    </div>
  );
}
