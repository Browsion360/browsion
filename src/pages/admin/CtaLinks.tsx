import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { CTA_KINDS, CTA_META, type CtaKind, type CtaLink } from "@/lib/ctaLinks";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

const AdminCtaLinks = () => {
  const [globals, setGlobals] = useState<Partial<CtaLink>[]>([]);
  const [profiles, setProfiles] = useState<{ id: string; name: string }[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<string>("");
  const [overrides, setOverrides] = useState<Partial<CtaLink>[]>([]);
  const [stats, setStats] = useState<Record<string, { d7: number; all: number }>>({});
  const [topProfiles, setTopProfiles] = useState<{ profile_id: string; name: string; clicks: number }[]>([]);
  const [busy, setBusy] = useState(false);

  const loadGlobals = async () => {
    const { data } = await supabase.from("cta_links").select("*").is("profile_id", null).order("sort_order");
    const rows: Partial<CtaLink>[] = (data ?? []) as any;
    // ensure all 5 kinds present
    const merged = CTA_KINDS.map((k, i) => rows.find(r => r.kind === k) ?? { kind: k, label: CTA_META[k].defaultLabel, url: "", is_active: false, sort_order: i + 1, profile_id: null });
    setGlobals(merged);
  };

  const loadProfiles = async () => {
    const { data } = await supabase.from("patri_profiles").select("id,name").order("name");
    setProfiles((data ?? []) as any);
  };

  const loadOverrides = async (pid: string) => {
    if (!pid) { setOverrides([]); return; }
    const { data } = await supabase.from("cta_links").select("*").eq("profile_id", pid);
    const rows: Partial<CtaLink>[] = (data ?? []) as any;
    const merged = CTA_KINDS.map((k, i) => rows.find(r => r.kind === k) ?? { kind: k, label: "", url: "", is_active: true, sort_order: i + 1, profile_id: pid });
    setOverrides(merged);
  };

  const loadStats = async () => {
    const { data: all } = await supabase.from("cta_clicks").select("kind,profile_id,clicked_at");
    const rows = (all ?? []) as { kind: string; profile_id: string | null; clicked_at: string }[];
    const since = Date.now() - 7 * 86400000;
    const acc: Record<string, { d7: number; all: number }> = {};
    const byProfile = new Map<string, number>();
    for (const r of rows) {
      const k = r.kind;
      acc[k] ??= { d7: 0, all: 0 };
      acc[k].all++;
      if (new Date(r.clicked_at).getTime() >= since) acc[k].d7++;
      if (r.profile_id) byProfile.set(r.profile_id, (byProfile.get(r.profile_id) ?? 0) + 1);
    }
    setStats(acc);
    const top = Array.from(byProfile.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);
    if (top.length) {
      const ids = top.map(t => t[0]);
      const { data: ps } = await supabase.from("patri_profiles").select("id,name").in("id", ids);
      const nameMap = new Map((ps ?? []).map((p: any) => [p.id, p.name]));
      setTopProfiles(top.map(([pid, c]) => ({ profile_id: pid, name: nameMap.get(pid) ?? pid.slice(0, 6), clicks: c })));
    } else setTopProfiles([]);
  };

  useEffect(() => { loadGlobals(); loadProfiles(); loadStats(); }, []);
  useEffect(() => { loadOverrides(selectedProfile); }, [selectedProfile]);

  const upsertRow = async (row: Partial<CtaLink>) => {
    setBusy(true);
    const payload: any = {
      kind: row.kind,
      label: row.label ?? "",
      url: row.url ?? "",
      profile_id: row.profile_id ?? null,
      is_active: !!row.is_active,
      sort_order: row.sort_order ?? 0,
    };
    // upsert by (kind, profile_id)
    if (row.id) {
      const { error } = await supabase.from("cta_links").update(payload).eq("id", row.id);
      if (error) toast.error(error.message); else toast.success("Saved");
    } else {
      const { error } = await supabase.from("cta_links").insert(payload);
      if (error) toast.error(error.message); else toast.success("Saved");
    }
    setBusy(false);
    if (row.profile_id) loadOverrides(row.profile_id); else loadGlobals();
  };

  const deleteRow = async (row: Partial<CtaLink>) => {
    if (!row.id) return;
    if (!confirm("Reset/remove this row?")) return;
    const { error } = await supabase.from("cta_links").delete().eq("id", row.id);
    if (error) return toast.error(error.message);
    if (row.profile_id) loadOverrides(row.profile_id); else loadGlobals();
  };

  const renderRows = (rows: Partial<CtaLink>[], setRows: (r: Partial<CtaLink>[]) => void) => (
    <div className="space-y-3">
      {rows.map((r, i) => {
        const meta = CTA_META[r.kind as CtaKind];
        return (
          <div key={`${r.kind}-${i}`} className="grid gap-2 rounded-2xl border border-border bg-card p-4 md:grid-cols-[auto_1fr_1fr_auto_auto] md:items-end">
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-full" style={{ backgroundColor: meta.bg }}>
                <img src={meta.icon} alt="" className="h-5 w-5" />
              </div>
              <div className="text-sm font-semibold capitalize">{r.kind}</div>
            </div>
            <div>
              <Label className="text-xs">Label</Label>
              <Input value={r.label ?? ""} placeholder={meta.defaultLabel} onChange={e => setRows(rows.map((x, j) => j === i ? { ...x, label: e.target.value } : x))} />
            </div>
            <div>
              <Label className="text-xs">URL or number</Label>
              <Input value={r.url ?? ""} placeholder={r.kind === "whatsapp" || r.kind === "call" ? "8801XXXXXXXXX" : "https://..."} onChange={e => setRows(rows.map((x, j) => j === i ? { ...x, url: e.target.value } : x))} />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={!!r.is_active} onCheckedChange={v => setRows(rows.map((x, j) => j === i ? { ...x, is_active: v } : x))} />
              <span className="text-xs text-muted-foreground">Active</span>
            </div>
            <div className="flex gap-1">
              <Button size="sm" disabled={busy} onClick={() => upsertRow(r)} className="gradient-rose text-primary-foreground">Save</Button>
              {r.id && <Button size="icon" variant="ghost" onClick={() => deleteRow(r)}><Trash2 className="h-4 w-4" /></Button>}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <AppShell>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Admin · Contact CTA Links</h1>
          <p className="text-sm text-muted-foreground">Manage WhatsApp / Imo / Messenger / Facebook / Call buttons. Per-profile overrides win over global.</p>
        </div>
      </div>

      {/* Stats */}
      <section className="mt-6 grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-4">
          <h2 className="font-display text-lg font-semibold">Click stats</h2>
          <div className="mt-3 grid grid-cols-5 gap-2 text-center">
            {CTA_KINDS.map(k => (
              <div key={k} className="rounded-xl bg-secondary/60 p-2">
                <div className="grid h-8 w-8 place-items-center mx-auto rounded-full" style={{ backgroundColor: CTA_META[k].bg }}>
                  <img src={CTA_META[k].icon} alt="" className="h-4 w-4" />
                </div>
                <div className="mt-1 text-xs text-muted-foreground capitalize">{k}</div>
                <div className="text-sm font-bold">{stats[k]?.all ?? 0}</div>
                <div className="text-[10px] text-muted-foreground">7d: {stats[k]?.d7 ?? 0}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <h2 className="font-display text-lg font-semibold">Top profiles by clicks</h2>
          {topProfiles.length === 0 ? <p className="mt-2 text-sm text-muted-foreground">No clicks yet.</p> :
            <ul className="mt-2 space-y-1 text-sm">
              {topProfiles.map(t => (
                <li key={t.profile_id} className="flex justify-between"><span>{t.name}</span><span className="font-bold">{t.clicks}</span></li>
              ))}
            </ul>
          }
        </div>
      </section>

      {/* Global */}
      <section className="mt-8">
        <h2 className="mb-3 font-display text-xl font-bold">Global defaults</h2>
        {renderRows(globals, setGlobals)}
      </section>

      {/* Per-profile overrides */}
      <section className="mt-8">
        <h2 className="mb-3 font-display text-xl font-bold">Per-profile overrides</h2>
        <Select value={selectedProfile} onValueChange={setSelectedProfile}>
          <SelectTrigger className="max-w-md"><SelectValue placeholder="Select a profile…" /></SelectTrigger>
          <SelectContent>{profiles.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
        </Select>
        {selectedProfile && <div className="mt-4">{renderRows(overrides, setOverrides)}</div>}
      </section>
    </AppShell>
  );
};

export default AdminCtaLinks;
