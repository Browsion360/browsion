import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Broadcast = () => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);

  const send = async () => {
    if (!title.trim()) return toast.error("Title required");
    setBusy(true);
    const { data: users } = await supabase.from("app_users").select("user_id");
    if (!users?.length) { setBusy(false); return toast.error("No users"); }
    const rows = users.map(u => ({ user_id: u.user_id, title: title.trim(), body: body.trim() || null }));
    const { error } = await supabase.from("notifications").insert(rows);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(`Sent to ${rows.length} users`);
    setTitle(""); setBody("");
  };

  return (
    <AppShell>
      <h1 className="font-display text-3xl font-bold">Admin · Broadcast</h1>
      <div className="mt-6 max-w-xl space-y-4 rounded-3xl border border-border bg-card p-6">
        <div><Label>Title</Label><Input value={title} onChange={e => setTitle(e.target.value)} maxLength={120} /></div>
        <div><Label>Body</Label><Textarea value={body} onChange={e => setBody(e.target.value)} maxLength={300} rows={3} /></div>
        <Button disabled={busy} onClick={send} className="w-full gradient-rose text-primary-foreground">Send to all users</Button>
      </div>
    </AppShell>
  );
};

export default Broadcast;
