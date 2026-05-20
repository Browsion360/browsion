import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DEFAULT_STICKY_CONFIG, type StickyBannerConfig } from "@/hooks/useStickyBannerConfig";

export function StickyBannerSettings() {
  const [cfg, setCfg] = useState<StickyBannerConfig>(DEFAULT_STICKY_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("app_settings")
        .select("value")
        .eq("key", "sticky_banner")
        .maybeSingle();
      if (error) toast.error(error.message);
      const v = (data?.value ?? {}) as Partial<StickyBannerConfig>;
      setCfg({ ...DEFAULT_STICKY_CONFIG, ...v });
      setLoading(false);
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("app_settings")
      .upsert({ key: "sticky_banner", value: cfg as any, is_public: true }, { onConflict: "key" });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Sticky banner settings saved");
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-3">
        <h2 className="text-lg font-semibold">Sticky Bottom Banner</h2>
        <p className="text-sm text-muted-foreground">
          Floating banner at the bottom of every page. Reappears after close, until the per-session limit is reached.
        </p>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-xl border border-border bg-secondary/40 p-3">
            <div>
              <div className="text-sm font-medium">Enabled</div>
              <div className="text-xs text-muted-foreground">Show the sticky bottom banner site-wide.</div>
            </div>
            <Switch checked={cfg.enabled} onCheckedChange={(v) => setCfg(s => ({ ...s, enabled: v }))} />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <Label>Max closes per session</Label>
              <Input
                type="number"
                min={1}
                max={20}
                value={cfg.max_closes_per_session}
                onChange={e => setCfg(s => ({ ...s, max_closes_per_session: Math.max(1, Number(e.target.value) || 1) }))}
              />
              <p className="mt-1 text-xs text-muted-foreground">After this many closes, banner stays hidden for the rest of the session.</p>
            </div>
            <div>
              <Label>Reappear delay (seconds)</Label>
              <Input
                type="number"
                min={1}
                max={600}
                value={cfg.reappear_seconds}
                onChange={e => setCfg(s => ({ ...s, reappear_seconds: Math.max(1, Number(e.target.value) || 1) }))}
              />
              <p className="mt-1 text-xs text-muted-foreground">How long to wait before showing the banner again after the user closes it.</p>
            </div>
            <div>
              <Label>Session timeout (minutes)</Label>
              <Input
                type="number"
                min={1}
                max={1440}
                value={cfg.session_minutes}
                onChange={e => setCfg(s => ({ ...s, session_minutes: Math.max(1, Number(e.target.value) || 1) }))}
              />
              <p className="mt-1 text-xs text-muted-foreground">After this much inactivity, a new session starts and the close counter resets.</p>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={save} disabled={saving} className="gradient-rose text-primary-foreground">
              {saving ? "Saving…" : "Save settings"}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Banner content uses the ad unit with slot <code className="font-mono">sticky_bottom</code> if present, otherwise falls back to <code className="font-mono">banner_320x50</code>.
          </p>
        </div>
      )}
    </div>
  );
}
