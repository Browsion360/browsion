import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { photoUrl } from "@/lib/format";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";

const AdminDashboard = () => {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("patri_profiles").select("*").order("created_at", { ascending: false });
    setProfiles(data ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const togglePublish = async (id: string, val: boolean) => {
    const { error } = await supabase.from("patri_profiles").update({ is_published: val }).eq("id", id);
    if (error) return toast.error(error.message);
    setProfiles(p => p.map(x => x.id === id ? { ...x, is_published: val } : x));
    if (val) {
      // fan out new-profile notification (best-effort)
      const { data: users } = await supabase.from("app_users").select("user_id");
      if (users?.length) {
        const rows = users.map(u => ({ user_id: u.user_id, title: "New profile added", body: "Come see today's picks." }));
        await supabase.from("notifications").insert(rows);
      }
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this profile?")) return;
    const { error } = await supabase.from("patri_profiles").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setProfiles(p => p.filter(x => x.id !== id));
  };

  return (
    <AppShell>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Admin · Profiles</h1>
          <p className="text-sm text-muted-foreground">{profiles.length} total</p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/payments"><Button variant="outline">Payments</Button></Link>
          <Link to="/admin/broadcast"><Button variant="outline">Broadcast</Button></Link>
          <Link to="/admin/bulk-import"><Button variant="outline">📥 Bulk import</Button></Link>
          <Link to="/admin/cta-links"><Button variant="outline">🔗 CTA Links</Button></Link>
          <Link to="/admin/ads"><Button variant="outline">📺 Ads</Button></Link>
          <Link to="/admin/create-profile"><Button className="gradient-rose text-primary-foreground"><Plus className="mr-1 h-4 w-4" /> New profile</Button></Link>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
        {loading ? <div className="p-8 text-center text-muted-foreground">Loading…</div> :
        profiles.length === 0 ? <div className="p-12 text-center text-muted-foreground">No profiles yet. Create your first one.</div> :
        <table className="w-full text-sm">
          <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="p-3">Photo</th><th className="p-3">Name</th><th className="p-3">Age</th><th className="p-3">District</th><th className="p-3">Published</th><th className="p-3">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-border">
            {profiles.map(p => (
              <tr key={p.id}>
                <td className="p-3">{p.photos?.[0] ? <img src={photoUrl(p.photos[0])!} alt="" className="h-10 w-10 rounded-lg object-cover" /> : <div className="h-10 w-10 rounded-lg bg-muted" />}</td>
                <td className="p-3 font-medium">{p.name}</td>
                <td className="p-3">{p.age}</td>
                <td className="p-3">{p.district ?? "—"}</td>
                <td className="p-3"><Switch checked={p.is_published} onCheckedChange={(v) => togglePublish(p.id, v)} /></td>
                <td className="p-3">
                  <div className="flex gap-1">
                    <Link to={`/admin/edit-profile/${p.id}`}><Button size="icon" variant="ghost"><Pencil className="h-4 w-4" /></Button></Link>
                    <Button size="icon" variant="ghost" onClick={() => remove(p.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>}
      </div>
    </AppShell>
  );
};

export default AdminDashboard;
