import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { DISTRICTS } from "@/lib/format";
import { toast } from "sonner";

const Preferences = () => {
  const { user, appUser, refresh } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [age, setAge] = useState<[number, number]>([22, 35]);
  const [district, setDistrict] = useState("any");
  const [education, setEducation] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (appUser) {
      setName(appUser.display_name ?? "");
      setAge([appUser.pref_age_min ?? 22, appUser.pref_age_max ?? 35]);
      setDistrict(appUser.pref_district ?? "any");
      setEducation(appUser.pref_education ?? "");
    }
  }, [appUser]);

  const save = async () => {
    if (!user) return;
    setBusy(true);
    const { error } = await supabase.from("app_users").update({
      display_name: name || null,
      pref_age_min: age[0], pref_age_max: age[1],
      pref_district: district === "any" ? null : district,
      pref_education: education || null,
    }).eq("user_id", user.id);
    setBusy(false);
    if (error) return toast.error(error.message);
    await refresh();
    toast.success("Preferences saved");
    navigate("/discover");
  };

  return (
    <AppShell>
      <h1 className="font-display text-3xl font-bold md:text-4xl">Your preferences</h1>
      <p className="text-sm text-muted-foreground">These help us show you a more relevant feed. You can change them anytime.</p>

      <div className="mt-6 max-w-xl space-y-6 rounded-3xl border border-border bg-card p-6 shadow-card">
        <div>
          <Label>Your name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" maxLength={80} />
        </div>
        <div>
          <Label>Preferred age range</Label>
          <div className="mb-2 mt-1 flex justify-between text-sm text-muted-foreground"><span>{age[0]}</span><span>{age[1]}</span></div>
          <Slider min={18} max={60} step={1} value={age} onValueChange={(v) => setAge([v[0], v[1]] as [number, number])} />
        </div>
        <div>
          <Label>Preferred district</Label>
          <Select value={district} onValueChange={setDistrict}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any</SelectItem>
              {DISTRICTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Preferred education</Label>
          <Input value={education} onChange={(e) => setEducation(e.target.value)} placeholder="e.g. Bachelor's or higher" maxLength={120} />
        </div>
        <Button onClick={save} disabled={busy} className="w-full gradient-rose text-primary-foreground">Save & continue</Button>
      </div>
    </AppShell>
  );
};

export default Preferences;
