import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { PLAN_LABEL } from "@/lib/plan";
import { toast } from "sonner";

const AdminPayments = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);

  const load = async () => {
    const { data } = await supabase.from("payment_requests").select("*").order("created_at", { ascending: false }).limit(100);
    setItems(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const decide = async (row: any, status: "approved" | "rejected") => {
    const updates: any = { status, reviewed_at: new Date().toISOString(), reviewed_by: user?.id };
    const { error } = await supabase.from("payment_requests").update(updates).eq("id", row.id);
    if (error) return toast.error(error.message);

    if (status === "approved") {
      if (row.note?.startsWith("unlock:")) {
        const profile_id = row.note.split(":")[1];
        await supabase.from("unlocks").insert({ user_id: row.user_id, profile_id });
        await supabase.from("notifications").insert({ user_id: row.user_id, title: "Unlock confirmed", body: "You can now message this profile." });
      } else {
        const expiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        await supabase.from("app_users").update({ plan: row.plan, plan_expiry: expiry }).eq("user_id", row.user_id);
        await supabase.from("notifications").insert({ user_id: row.user_id, title: "Plan activated", body: `Your ${PLAN_LABEL[row.plan as keyof typeof PLAN_LABEL]} plan is now active for 7 days.` });
      }
    } else {
      await supabase.from("notifications").insert({ user_id: row.user_id, title: "Payment rejected", body: "Please contact support if this looks wrong." });
    }
    toast.success(`Marked ${status}`);
    load();
  };

  return (
    <AppShell>
      <h1 className="font-display text-3xl font-bold">Admin · Payments</h1>
      <div className="mt-6 space-y-3">
        {items.length === 0 && <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">No payment requests.</div>}
        {items.map(p => (
          <div key={p.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4">
            <div>
              <div className="font-medium">৳{p.amount} · {p.note?.startsWith("unlock") ? "Profile unlock" : PLAN_LABEL[p.plan as keyof typeof PLAN_LABEL]}</div>
              <div className="text-xs text-muted-foreground">User: {p.user_id.slice(0,8)} · {p.sender_number ?? "—"} · TXN: {p.txn_id ?? "—"}</div>
              <div className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleString()}</div>
            </div>
            {p.status === "pending" ? (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => decide(p, "rejected")}>Reject</Button>
                <Button size="sm" className="gradient-rose text-primary-foreground" onClick={() => decide(p, "approved")}>Approve</Button>
              </div>
            ) : (
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${p.status === "approved" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{p.status}</span>
            )}
          </div>
        ))}
      </div>
    </AppShell>
  );
};

export default AdminPayments;
