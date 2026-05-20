import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { DISTRICTS } from "@/lib/format";
import { REGIONS, REGION_LIST, getRegion } from "@/lib/regions";
import { toast } from "sonner";
import { X } from "lucide-react";
import { ProfileCtaEditor } from "@/components/admin/ProfileCtaEditor";

const empty = {
  name: "", age: 25, height_cm: null as number | null, weight_kg: null as number | null, skin_tone: "" as any,
  education: "", profession: "", income_range: "", district: "", country: "",
  region: "bd", locale: "bn",
  current_location: "", ancestral_address: "",
  religion: "", sect: "", family_type: "" as any,
  father_profession: "", mother_profession: "", siblings_count: null as number | null,
  marital_status: "never" as any, children_info: "",
  about: "", expectations: "", visit_note: "",
  is_published: false, photos: [] as string[],
};

const ProfileForm = () => {
  const { id } = useParams();
  const editing = !!id;
  const navigate = useNavigate();
  const [f, setF] = useState<any>(empty);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!id) return;
    supabase.from("patri_profiles").select("*").eq("id", id).maybeSingle().then(({ data }) => { if (data) setF(data); });
  }, [id]);

  const upd = (k: string, v: any) => setF((s: any) => ({ ...s, [k]: v }));

  const upload = async (file: File) => {
    if (!file) return;
    if (f.photos.length >= 3) { toast.error("Max 3 photos"); return; }
    setUploading(true);
    const path = `${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
    const { error } = await supabase.storage.from("patri-photos").upload(path, file);
    setUploading(false);
    if (error) return toast.error(error.message);
    upd("photos", [...f.photos, path]);
  };

  const removePhoto = (i: number) => upd("photos", f.photos.filter((_: any, idx: number) => idx !== i));

  const save = async () => {
    if (!f.name || !f.age) { toast.error("Name and age are required"); return; }
    setBusy(true);
    const payload = { ...f };
    Object.keys(payload).forEach(k => { if (payload[k] === "") payload[k] = null; });
    const { error } = editing
      ? await supabase.from("patri_profiles").update(payload).eq("id", id!)
      : await supabase.from("patri_profiles").insert(payload);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(editing ? "Profile updated" : "Profile created");
    navigate("/admin/dashboard");
  };

  return (
    <AppShell>
      <h1 className="font-display text-3xl font-bold">{editing ? "Edit profile" : "Create profile"}</h1>
      <div className="mt-6 grid gap-5 rounded-3xl border border-border bg-card p-6 md:grid-cols-2">
        <Field label="Name *"><Input value={f.name} onChange={e => upd("name", e.target.value)} maxLength={80} /></Field>
        <Field label="Age *"><Input type="number" value={f.age ?? ""} onChange={e => upd("age", parseInt(e.target.value))} /></Field>
        <Field label="Height (cm)"><Input type="number" value={f.height_cm ?? ""} onChange={e => upd("height_cm", e.target.value ? parseInt(e.target.value) : null)} /></Field>
        <Field label="Weight (kg)"><Input type="number" value={f.weight_kg ?? ""} onChange={e => upd("weight_kg", e.target.value ? parseInt(e.target.value) : null)} /></Field>
        <Field label="Current location"><Input value={f.current_location ?? ""} onChange={e => upd("current_location", e.target.value)} placeholder="e.g. Dubai, UAE" /></Field>
        <Field label="Ancestral address"><Input value={f.ancestral_address ?? ""} onChange={e => upd("ancestral_address", e.target.value)} placeholder="e.g. Gulshan-2" /></Field>
        <Field label="Children info" full><Input value={f.children_info ?? ""} onChange={e => upd("children_info", e.target.value)} placeholder="e.g. Two children, settled" /></Field>
        <Field label="Visit note (banner)" full><Input value={f.visit_note ?? ""} onChange={e => upd("visit_note", e.target.value)} placeholder="e.g. Visiting Bangladesh on the 25th" /></Field>
        <Field label="Skin tone">
          <Select value={f.skin_tone ?? ""} onValueChange={v => upd("skin_tone", v)}>
            <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
            <SelectContent>
              {["fair","medium","wheatish","dark"].map(x => <SelectItem key={x} value={x} className="capitalize">{x}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Education"><Input value={f.education ?? ""} onChange={e => upd("education", e.target.value)} /></Field>
        <Field label="Profession"><Input value={f.profession ?? ""} onChange={e => upd("profession", e.target.value)} /></Field>
        <Field label="Monthly income range"><Input value={f.income_range ?? ""} onChange={e => upd("income_range", e.target.value)} placeholder="e.g. ৳50k-৳80k" /></Field>
        <Field label="Region *">
          <Select value={f.region ?? "bd"} onValueChange={v => {
            const r = getRegion(v);
            setF((s: any) => ({ ...s, region: v, locale: r.locale, district: v === "bd" ? s.district : "", country: v === "bd" ? "" : s.country }));
          }}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {REGION_LIST.map(r => <SelectItem key={r} value={r}>{REGIONS[r].flag} {REGIONS[r].label}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
        {f.region === "bd" ? (
          <Field label="District">
            <Select value={f.district ?? ""} onValueChange={v => upd("district", v)}>
              <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
              <SelectContent>{DISTRICTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
        ) : (
          <Field label="Country">
            <Select value={f.country ?? ""} onValueChange={v => upd("country", v)}>
              <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
              <SelectContent>{getRegion(f.region).countries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
        )}
        <Field label="Religion"><Input value={f.religion ?? ""} onChange={e => upd("religion", e.target.value)} /></Field>
        <Field label="Sect"><Input value={f.sect ?? ""} onChange={e => upd("sect", e.target.value)} /></Field>
        <Field label="Family type">
          <Select value={f.family_type ?? ""} onValueChange={v => upd("family_type", v)}>
            <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
            <SelectContent><SelectItem value="nuclear">Nuclear</SelectItem><SelectItem value="joint">Joint</SelectItem></SelectContent>
          </Select>
        </Field>
        <Field label="Marital status">
          <Select value={f.marital_status ?? "never"} onValueChange={v => upd("marital_status", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="never">Never married</SelectItem>
              <SelectItem value="divorced">Divorced</SelectItem>
              <SelectItem value="widowed">Widowed</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Father's profession"><Input value={f.father_profession ?? ""} onChange={e => upd("father_profession", e.target.value)} /></Field>
        <Field label="Mother's profession"><Input value={f.mother_profession ?? ""} onChange={e => upd("mother_profession", e.target.value)} /></Field>
        <Field label="Siblings"><Input type="number" value={f.siblings_count ?? ""} onChange={e => upd("siblings_count", e.target.value ? parseInt(e.target.value) : null)} /></Field>
        <Field label="About (max 200)" full>
          <Textarea value={f.about ?? ""} onChange={e => upd("about", e.target.value)} maxLength={200} rows={3} />
        </Field>
        <Field label="Expectations (max 150)" full>
          <Textarea value={f.expectations ?? ""} onChange={e => upd("expectations", e.target.value)} maxLength={150} rows={2} />
        </Field>
        <Field label="Photos (1–3)" full>
          <div className="flex flex-wrap gap-3">
            {f.photos.map((p: string, i: number) => {
              const url = supabase.storage.from("patri-photos").getPublicUrl(p).data.publicUrl;
              return (
                <div key={i} className="relative">
                  <img src={url} className="h-24 w-24 rounded-xl object-cover" alt="" />
                  <button onClick={() => removePhoto(i)} className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-destructive text-destructive-foreground"><X className="h-3 w-3" /></button>
                </div>
              );
            })}
            {f.photos.length < 3 && (
              <label className="grid h-24 w-24 cursor-pointer place-items-center rounded-xl border-2 border-dashed border-border text-xs text-muted-foreground hover:border-primary">
                {uploading ? "Uploading…" : "+ Upload"}
                <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && upload(e.target.files[0])} />
              </label>
            )}
          </div>
        </Field>
        <Field label="Published" full>
          <div className="flex items-center gap-3"><Switch checked={f.is_published} onCheckedChange={v => upd("is_published", v)} /> <span className="text-sm text-muted-foreground">Visible to users</span></div>
        </Field>
      </div>
      <div className="mt-6 flex gap-2">
        <Button variant="outline" onClick={() => navigate("/admin/dashboard")}>Cancel</Button>
        <Button disabled={busy} onClick={save} className="gradient-rose text-primary-foreground">{editing ? "Save changes" : "Create profile"}</Button>
      </div>
    </AppShell>
  );
};

const Field = ({ label, children, full }: any) => (
  <div className={full ? "md:col-span-2" : ""}>
    <Label className="mb-1.5 block">{label}</Label>
    {children}
  </div>
);

export default ProfileForm;
