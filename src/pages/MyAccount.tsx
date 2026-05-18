import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { effectivePlan, PLAN_LABEL } from "@/lib/plan";
import { Link, useNavigate } from "react-router-dom";
import { setLocale, getLocale } from "@/i18n";
import { toast } from "sonner";

const MyAccount = () => {
  const { user, appUser, isAdmin, signOut, refresh } = useAuth();
  const plan = effectivePlan(appUser?.plan ?? "free", appUser?.plan_expiry);
  const [payments, setPayments] = useState<any[]>([]);
  const [locale, setLoc] = useState<"en" | "bn">(getLocale());
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    supabase.from("payment_requests").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20)
      .then(({ data }) => setPayments(data ?? []));
  }, [user?.id]);

  const changeLocale = async (l: "en" | "bn") => {
    setLoc(l); setLocale(l);
    if (user) await supabase.from("app_users").update({ locale: l }).eq("user_id", user.id);
    toast.success("Language updated");
  };

  return (
    <AppShell>
      <h1 className="font-display text-3xl font-bold md:text-4xl">My Account</h1>

      <section className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-card">
        <div className="flex items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-2xl gradient-rose text-2xl font-bold text-primary-foreground">
            {(user?.email?.[0] ?? "?").toUpperCase()}
          </div>
          <div>
            <div className="font-display text-xl font-semibold">{appUser?.display_name ?? "—"}</div>
            <div className="text-sm text-muted-foreground">{user?.email}</div>
          </div>
        </div>
      </section>

      <section className="mt-4 rounded-3xl border border-primary/20 bg-primary/5 p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-primary">Current plan</div>
            <div className="mt-1 font-display text-2xl font-bold">{PLAN_LABEL[plan]}</div>
            {appUser?.plan_expiry && plan !== "free" && (
              <div className="mt-1 text-xs text-muted-foreground">
                Expires {new Date(appUser.plan_expiry).toLocaleDateString()}
              </div>
            )}
          </div>
          <Link to="/pricing"><Button size="sm" className="gradient-rose text-primary-foreground">Upgrade</Button></Link>
        </div>
      </section>

      <section className="mt-4 rounded-3xl border border-border bg-card p-6">
        <h2 className="font-display text-lg font-semibold">Language</h2>
        <div className="mt-3 flex gap-2">
          <Button size="sm" variant={locale === "en" ? "default" : "outline"} onClick={() => changeLocale("en")}>English</Button>
          <Button size="sm" variant={locale === "bn" ? "default" : "outline"} onClick={() => changeLocale("bn")}>বাংলা</Button>
        </div>
      </section>

      <section className="mt-4 rounded-3xl border border-border bg-card p-6">
        <h2 className="font-display text-lg font-semibold">Payment history</h2>
        {payments.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No payments yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-border">
            {payments.map(p => (
              <li key={p.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <div className="font-medium">{p.note?.startsWith("unlock") ? "Profile unlock" : `${PLAN_LABEL[p.plan as keyof typeof PLAN_LABEL]} plan`}</div>
                  <div className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleString()} · ৳{p.amount}</div>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  p.status === "approved" ? "bg-green-100 text-green-800" :
                  p.status === "rejected" ? "bg-red-100 text-red-800" :
                  "bg-amber-100 text-amber-800"
                }`}>{p.status}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link to="/preferences"><Button variant="outline">Edit preferences</Button></Link>
        {isAdmin && <Link to="/admin/dashboard"><Button variant="outline">Admin dashboard</Button></Link>}
        <Button variant="ghost" onClick={async () => { await signOut(); navigate("/"); }}>Sign out</Button>
      </div>
    </AppShell>
  );
};

export default MyAccount;
