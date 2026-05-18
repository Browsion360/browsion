import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { timeAgo } from "@/lib/format";
import { Bell } from "lucide-react";

const Notifications = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase.from("notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(100);
      setItems(data ?? []);
      const unread = (data ?? []).filter(n => !n.read).map(n => n.id);
      if (unread.length) await supabase.from("notifications").update({ read: true }).in("id", unread);
    };
    load();
  }, [user?.id]);

  return (
    <AppShell>
      <h1 className="font-display text-3xl font-bold md:text-4xl">Notifications</h1>
      {items.length === 0 ? (
        <div className="mt-16 rounded-3xl border border-dashed border-border bg-card p-12 text-center">
          <Bell className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-4 text-sm text-muted-foreground">You're all caught up.</p>
        </div>
      ) : (
        <ul className="mt-6 space-y-2">
          {items.map(n => (
            <li key={n.id} className="rounded-2xl border border-border bg-card p-4 shadow-card">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-medium">{n.title}</div>
                  {n.body && <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>}
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">{timeAgo(n.created_at)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
};

export default Notifications;
