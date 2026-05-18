import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, ExternalLink } from "lucide-react";
import type { AdUnit } from "@/hooks/useAdUnits";
import { AdsterraUnloadTest } from "./AdsterraUnloadTest";
import { StickyBannerSettings } from "./StickyBannerSettings";

const FORMATS = ["popunder", "native", "banner", "smartlink"] as const;

const PLACEMENTS: Record<string, string> = {
  popunder: "Site-wide · once per session, on first user click",
  social_bar: "Bottom sticky · mobile (and below md screens)",
  native: "In-feed every 6 cards (Landing, Discover) + ProfileDetail body",
  banner_728x90: "Top header strip (desktop) + in-feed every 15 cards (desktop)",
  banner_320x50: "Top header strip (mobile)",
  banner_300x250: "ProfileDetail sidebar (desktop) + ProfileDetail body (mobile) + in-feed every 10 cards (mobile)",
  banner_160x600: "ProfileDetail sidebar (desktop)",
  banner_160x300: "Reserved · not currently placed",
  banner_468x60: "Above footer (desktop)",
  smartlink: "Fallback URL · used inside locked CTAs (planned)",
};

const empty: Partial<AdUnit> = {
  slot: "",
  label: "",
  provider: "adsterra",
  format: "banner",
  width: null,
  height: null,
  script_url: "",
  container_id: "",
  zone_key: "",
  raw_html: "",
  target_url: "",
  enabled: true,
  notes: "",
  sort_order: 100,
};

const AdminAds = () => {
  const [units, setUnits] = useState<AdUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<AdUnit> | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("ad_units").select("*").order("sort_order");
    if (error) toast.error(error.message);
    setUnits((data ?? []) as AdUnit[]);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const toggle = async (u: AdUnit, val: boolean) => {
    if ((u.slot === "social_bar" || u.format === "social_bar") && val) {
      return toast.error("Social Bar is permanently disabled app-wide");
    }
    const { error } = await supabase.from("ad_units").update({ enabled: val }).eq("id", u.id);
    if (error) return toast.error(error.message);
    setUnits(s => s.map(x => x.id === u.id ? { ...x, enabled: val } : x));
    toast.success(`${u.label} ${val ? "enabled" : "disabled"}`, {
      description: !val ? "Some third-party ad scripts may need a page reload (Ctrl/Cmd+Shift+R) to fully unload." : undefined,
    });
  };

  const remove = async (u: AdUnit) => {
    if (!confirm(`Delete "${u.label}"? This cannot be undone.`)) return;
    const { error } = await supabase.from("ad_units").delete().eq("id", u.id);
    if (error) return toast.error(error.message);
    setUnits(s => s.filter(x => x.id !== u.id));
    toast.success("Deleted");
  };

  const save = async () => {
    if (!editing) return;
    if (!editing.slot || !editing.label || !editing.format) {
      return toast.error("Slot, label and format are required");
    }
    if (editing.slot === "social_bar" || editing.format === "social_bar") {
      return toast.error("Social Bar is permanently disabled app-wide");
    }
    setSaving(true);
    const payload = {
      slot: editing.slot,
      label: editing.label,
      provider: editing.provider || "adsterra",
      format: editing.format,
      width: editing.width || null,
      height: editing.height || null,
      script_url: editing.script_url || null,
      container_id: editing.container_id || null,
      zone_key: editing.zone_key || null,
      raw_html: editing.raw_html || null,
      target_url: editing.target_url || null,
      enabled: editing.enabled ?? true,
      notes: editing.notes || null,
      sort_order: editing.sort_order ?? 100,
    };
    const { error } = editing.id
      ? await supabase.from("ad_units").update(payload).eq("id", editing.id)
      : await supabase.from("ad_units").insert(payload);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    setEditing(null);
    load();
  };

  const testInPopup = (u: Partial<AdUnit>) => {
    const w = u.width ?? 600;
    const h = u.height ?? 400;
    const body = u.raw_html?.trim()
      ? u.raw_html
      : u.format === "banner" && u.zone_key
      ? `<script>atOptions={'key':'${u.zone_key}','format':'iframe','height':${h},'width':${w},'params':{}};<\/script><script src="https://www.highperformanceformat.com/${u.zone_key}/invoke.js"><\/script>`
      : u.format === "native" && u.script_url && u.container_id
      ? `<script async data-cfasync="false" src="${u.script_url}"><\/script><div id="${u.container_id}"></div>`
      : u.script_url
      ? `<script src="${u.script_url}"><\/script>`
      : u.target_url
      ? `<a href="${u.target_url}" target="_blank">Open smartlink</a>`
      : "<p>No code configured.</p>";
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Ad test · ${u.label}</title><style>body{font-family:sans-serif;padding:16px;}</style></head><body><h3>${u.label} · ${u.format}</h3>${body}</body></html>`;
    const win = window.open("", "_blank", "width=900,height=700");
    if (win) { win.document.write(html); win.document.close(); }
  };

  return (
    <AppShell>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Admin · Ads Manager</h1>
          <p className="text-sm text-muted-foreground">{units.length} ad units · changes apply live across the site</p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/dashboard"><Button variant="outline">← Dashboard</Button></Link>
          <Button onClick={() => setEditing({ ...empty })} className="gradient-rose text-primary-foreground">
            <Plus className="mr-1 h-4 w-4" /> New ad unit
          </Button>
        </div>
      </div>

      <div className="mt-6">
        <StickyBannerSettings />
      </div>

      <div className="mt-6">
        <AdsterraUnloadTest />
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading…</div>
        ) : units.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">No ad units yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="p-3">Label</th>
                <th className="p-3">Format</th>
                <th className="p-3">Slot</th>
                <th className="p-3">Provider</th>
                <th className="p-3">Placement</th>
                <th className="p-3">Enabled</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {units.map(u => (
                <tr key={u.id}>
                  <td className="p-3 font-medium">{u.label}</td>
                  <td className="p-3 capitalize">{u.format.replace("_", " ")}{u.width ? ` ${u.width}×${u.height}` : ""}</td>
                  <td className="p-3 font-mono text-xs">{u.slot}</td>
                  <td className="p-3 capitalize">{u.provider}</td>
                  <td className="p-3 max-w-xs text-xs text-muted-foreground">{PLACEMENTS[u.slot] ?? "—"}</td>
                  <td className="p-3">
                    <Switch
                      checked={u.slot === "social_bar" || u.format === "social_bar" ? false : u.enabled}
                      disabled={u.slot === "social_bar" || u.format === "social_bar"}
                      onCheckedChange={(v) => toggle(u, v)}
                    />
                  </td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => testInPopup(u)} title="Test"><ExternalLink className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => setEditing(u)} title="Edit"><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => remove(u)} title="Delete"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit ad unit" : "New ad unit"}</DialogTitle>
            <DialogDescription>
              Fill structured fields for Adsterra, OR paste full HTML in the "Raw HTML" tab to use any provider.
            </DialogDescription>
          </DialogHeader>

          {editing && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Label</Label>
                  <Input value={editing.label ?? ""} onChange={e => setEditing({ ...editing, label: e.target.value })} placeholder="e.g. 728×90 Banner" />
                </div>
                <div>
                  <Label>Slot (unique id)</Label>
                  <Input
                    value={editing.slot ?? ""}
                    onChange={e => setEditing({ ...editing, slot: e.target.value })}
                    placeholder="e.g. banner_728x90"
                    disabled={!!editing.id}
                  />
                </div>
                <div>
                  <Label>Format</Label>
                  <Select
                    value={editing.format}
                    onValueChange={(v: any) => setEditing({ ...editing, format: v })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {FORMATS.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Provider</Label>
                  <Input value={editing.provider ?? "adsterra"} onChange={e => setEditing({ ...editing, provider: e.target.value })} />
                </div>
              </div>

              <Tabs defaultValue="structured">
                <TabsList>
                  <TabsTrigger value="structured">Structured fields</TabsTrigger>
                  <TabsTrigger value="raw">Raw HTML (any provider)</TabsTrigger>
                </TabsList>

                <TabsContent value="structured" className="space-y-3 pt-2">
                  {editing.format === "banner" && (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <div><Label>Width</Label><Input type="number" value={editing.width ?? ""} onChange={e => setEditing({ ...editing, width: e.target.value ? Number(e.target.value) : null })} /></div>
                        <div><Label>Height</Label><Input type="number" value={editing.height ?? ""} onChange={e => setEditing({ ...editing, height: e.target.value ? Number(e.target.value) : null })} /></div>
                      </div>
                      <div>
                        <Label>Zone key (atOptions key)</Label>
                        <Input value={editing.zone_key ?? ""} onChange={e => setEditing({ ...editing, zone_key: e.target.value })} placeholder="ef5bcf6aa5d7e3608b0e851eed3ac9e0" />
                      </div>
                    </>
                  )}
                  {editing.format === "native" && (
                    <>
                      <div>
                        <Label>Invoke script URL</Label>
                        <Input value={editing.script_url ?? ""} onChange={e => setEditing({ ...editing, script_url: e.target.value })} placeholder="https://…/invoke.js" />
                      </div>
                      <div>
                        <Label>Container id</Label>
                        <Input value={editing.container_id ?? ""} onChange={e => setEditing({ ...editing, container_id: e.target.value })} placeholder="container-…" />
                      </div>
                    </>
                  )}
                  {(editing.format === "popunder" || editing.format === "social_bar") && (
                    <div>
                      <Label>Script URL</Label>
                      <Input value={editing.script_url ?? ""} onChange={e => setEditing({ ...editing, script_url: e.target.value })} placeholder="https://…/something.js" />
                    </div>
                  )}
                  {editing.format === "smartlink" && (
                    <div>
                      <Label>Target URL</Label>
                      <Input value={editing.target_url ?? ""} onChange={e => setEditing({ ...editing, target_url: e.target.value })} placeholder="https://…?key=…" />
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="raw" className="pt-2">
                  <Label>Raw HTML — overrides structured fields when filled</Label>
                  <Textarea
                    rows={10}
                    value={editing.raw_html ?? ""}
                    onChange={e => setEditing({ ...editing, raw_html: e.target.value })}
                    placeholder='<script>...</script>'
                    className="font-mono text-xs"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Paste any provider's full code. Banners/native render inside an iframe; popunder/social-bar inject into the page.
                  </p>
                </TabsContent>
              </Tabs>

              <div>
                <Label>Notes (admin only)</Label>
                <Textarea rows={2} value={editing.notes ?? ""} onChange={e => setEditing({ ...editing, notes: e.target.value })} />
              </div>

              <div className="flex items-center justify-between rounded-xl border border-border bg-secondary/40 p-3">
                <div>
                  <div className="text-sm font-medium">Enabled</div>
                  <div className="text-xs text-muted-foreground">If off, this unit is not loaded anywhere.</div>
                </div>
                <Switch checked={!!editing.enabled} onCheckedChange={(v) => setEditing({ ...editing, enabled: v })} />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
                <Button variant="outline" onClick={() => testInPopup(editing)}>Test in popup</Button>
                <Button onClick={save} disabled={saving} className="gradient-rose text-primary-foreground">
                  {saving ? "Saving…" : "Save"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
};

export default AdminAds;
