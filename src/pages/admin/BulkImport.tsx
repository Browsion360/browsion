import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Upload, FileJson, FileSpreadsheet, CheckCircle2, AlertCircle, ArrowLeft, X, Image as ImageIcon, Sparkles, Copy, Download } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { parseZip, parseLoose, runImport, MAX_PROFILES, type ParseResult, type ProgressEvent } from "@/lib/bulkImport";
import { downloadJsonTemplate, downloadXlsxTemplate } from "@/lib/bulkTemplate";
import { AI_PROMPTS, type PromptRegion } from "@/lib/aiPrompt";

const BulkImport = () => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const jsonFileRef = useRef<HTMLInputElement>(null);
  const imagesRef = useRef<HTMLInputElement>(null);
  const [parsing, setParsing] = useState(false);
  const [result, setResult] = useState<ParseResult | null>(null);
  const [zipName, setZipName] = useState<string>("");
  const [notify, setNotify] = useState(false);
  const [progress, setProgress] = useState<ProgressEvent | null>(null);
  const [importing, setImporting] = useState(false);
  const [done, setDone] = useState<{ insertedCount: number; failures: { name: string; error: string }[] } | null>(null);
  const [jsonText, setJsonText] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [autoMatch, setAutoMatch] = useState(true);
  const [perProfile, setPerProfile] = useState(3);
  const [promptRegion, setPromptRegion] = useState<PromptRegion>("bd");
  const activePrompt = AI_PROMPTS[promptRegion];

  const handleFile = async (file: File) => {
    setParsing(true);
    setResult(null);
    setDone(null);
    setZipName(file.name);
    try {
      const r = await parseZip(file, { enabled: autoMatch, perProfile });
      setResult(r);
      if (r.errorCount === 0) toast.success(`${r.rows.length} profiles ready to import`);
      else toast.error(`${r.errorCount} row${r.errorCount > 1 ? "s have" : " has"} errors — fix and re-upload`);
    } catch (e: any) {
      toast.error(e.message || "Failed to parse ZIP");
    } finally {
      setParsing(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const handleJsonFile = async (file: File) => {
    const text = await file.text();
    setJsonText(text);
  };

  const addImages = (files: FileList | File[]) => {
    const incoming = Array.from(files).filter((f) => /^image\//i.test(f.type) || /\.(jpe?g|png|webp|heic)$/i.test(f.name));
    setImages((prev) => {
      const map = new Map(prev.map((f) => [f.name, f]));
      incoming.forEach((f) => map.set(f.name, f));
      return Array.from(map.values());
    });
  };

  const parseLooseInput = async () => {
    setParsing(true);
    setResult(null);
    setDone(null);
    setZipName("");
    try {
      if (!jsonText.trim()) throw new Error("Paste JSON or choose a JSON file");
      if (!images.length) throw new Error("Add at least one image");
      const r = await parseLoose(jsonText, images, { enabled: autoMatch, perProfile });
      setResult(r);
      if (r.errorCount === 0) toast.success(`${r.rows.length} profiles ready to import`);
      else toast.error(`${r.errorCount} row${r.errorCount > 1 ? "s have" : " has"} errors`);
    } catch (e: any) {
      toast.error(e.message || "Parse failed");
    } finally {
      setParsing(false);
    }
  };

  const startImport = async () => {
    if (!result) return;
    setImporting(true);
    setDone(null);
    try {
      const out = await runImport(result, { notifyUsers: notify, onProgress: setProgress, region: promptRegion });
      setDone(out);
      toast.success(`Imported ${out.insertedCount} profile${out.insertedCount === 1 ? "" : "s"}`);
    } catch (e: any) {
      toast.error(e.message || "Import failed");
    } finally {
      setImporting(false);
    }
  };

  const validCount = result ? result.rows.filter((r) => r.errors.length === 0).length : 0;

  return (
    <AppShell>
      <div className="flex items-center gap-3">
        <Link to="/admin/dashboard"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div>
          <h1 className="font-display text-3xl font-bold">Bulk import profiles</h1>
          <p className="text-sm text-muted-foreground">Upload one ZIP with up to {MAX_PROFILES} profiles + their photos</p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        {/* Left: upload */}
        <div className="space-y-4">
          <Tabs defaultValue="zip">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="zip">ZIP upload</TabsTrigger>
              <TabsTrigger value="loose">JSON + images</TabsTrigger>
            </TabsList>
            <TabsContent value="zip">
              <div
                onDrop={onDrop}
                onDragOver={(e) => e.preventDefault()}
                className="rounded-2xl border-2 border-dashed border-border bg-card p-8 text-center transition-colors hover:border-primary/50"
              >
                <Upload className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="mt-3 font-medium">Drop your ZIP here</p>
                <p className="text-xs text-muted-foreground">or click to browse · max 50 MB · max {MAX_PROFILES} profiles</p>
                <input
                  ref={inputRef}
                  type="file"
                  accept=".zip,application/zip,application/x-zip-compressed"
                  hidden
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
                <Button className="mt-4" variant="outline" onClick={() => inputRef.current?.click()} disabled={parsing || importing}>
                  {parsing ? "Parsing…" : zipName ? `Replace (${zipName})` : "Choose ZIP"}
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="loose">
              <div className="rounded-2xl border border-border bg-card p-4 space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">profiles.json</label>
                    <input
                      ref={jsonFileRef}
                      type="file"
                      accept=".json,application/json"
                      hidden
                      onChange={(e) => e.target.files?.[0] && handleJsonFile(e.target.files[0])}
                    />
                    <Button size="sm" variant="outline" onClick={() => jsonFileRef.current?.click()}>
                      <FileJson className="mr-1 h-4 w-4" /> Choose JSON
                    </Button>
                  </div>
                  <Textarea
                    value={jsonText}
                    onChange={(e) => setJsonText(e.target.value)}
                    placeholder='Paste JSON here, e.g. [{ "name": "...", "age": 28, "photos": ["a.jpg"] }]'
                    className="min-h-[140px] font-mono text-xs"
                  />
                </div>
                <div
                  onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files) addImages(e.dataTransfer.files); }}
                  onDragOver={(e) => e.preventDefault()}
                  className="rounded-xl border-2 border-dashed border-border p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" /> Images ({images.length})
                    </div>
                    <input
                      ref={imagesRef}
                      type="file"
                      accept="image/*"
                      multiple
                      hidden
                      onChange={(e) => e.target.files && addImages(e.target.files)}
                    />
                    <Button size="sm" variant="outline" onClick={() => imagesRef.current?.click()}>
                      <Upload className="mr-1 h-4 w-4" /> Add images
                    </Button>
                  </div>
                  {images.length > 0 && (
                    <ul className="mt-3 max-h-40 overflow-auto text-xs space-y-1">
                      {images.map((f) => (
                        <li key={f.name} className="flex items-center justify-between rounded px-2 py-1 hover:bg-secondary/50">
                          <span className="truncate">{f.name}</span>
                          <span className="flex items-center gap-2 text-muted-foreground">
                            {(f.size / 1024).toFixed(0)} KB
                            <button onClick={() => setImages((p) => p.filter((x) => x.name !== f.name))}>
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <p className="mt-2 text-xs text-muted-foreground">Drop images here or click "Add images". Auto-match nicher option diye on rakhle filename match kora lagbe na.</p>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-secondary/30 p-3">
                  <label className="flex items-center gap-2 text-sm">
                    <Switch checked={autoMatch} onCheckedChange={setAutoMatch} />
                    Auto-match images (slug → name → upload order)
                  </label>
                  <label className="flex items-center gap-2 text-xs text-muted-foreground">
                    Photos per profile (order fallback)
                    <select
                      className="rounded-md border border-border bg-background px-2 py-1 text-sm"
                      value={perProfile}
                      onChange={(e) => setPerProfile(Number(e.target.value))}
                      disabled={!autoMatch}
                    >
                      {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <Button
                  className="w-full"
                  onClick={parseLooseInput}
                  disabled={parsing || importing || !jsonText.trim() || !images.length}
                >
                  {parsing ? "Parsing…" : "Parse"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          {result && (
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <span className="font-semibold">{result.rows.length}</span> profiles ·
                  <span className="ml-1 font-semibold">{result.totalImages}</span> images ·
                  {result.errorCount > 0 ? (
                    <span className="ml-1 text-destructive font-semibold">{result.errorCount} with errors</span>
                  ) : (
                    <span className="ml-1 text-emerald-500 font-semibold">no errors</span>
                  )}
                </div>
              </div>

              <div className="mt-4 max-h-[420px] overflow-auto rounded-xl border border-border">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-secondary text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <tr><th className="p-2">#</th><th className="p-2">Name</th><th className="p-2">Age</th><th className="p-2">District</th><th className="p-2">Photos</th><th className="p-2">Source</th><th className="p-2">Status</th></tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {result.rows.map((r) => (
                      <tr key={r.index} className={r.errors.length ? "bg-destructive/5" : ""}>
                        <td className="p-2 text-muted-foreground">{r.index + 1}</td>
                        <td className="p-2 font-medium">{r.data?.name ?? r.raw?.name ?? "—"}</td>
                        <td className="p-2">{r.data?.age ?? r.raw?.age ?? "—"}</td>
                        <td className="p-2">{r.data?.district ?? r.raw?.district ?? "—"}</td>
                        <td className="p-2">{r.photoFiles.length}</td>
                        <td className="p-2">
                          {r.photoSource ? (
                            <span className="inline-block rounded-full bg-secondary px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                              {r.photoSource.replace("auto-", "")}
                            </span>
                          ) : <span className="text-xs text-muted-foreground">—</span>}
                        </td>
                        <td className="p-2">
                          {r.errors.length === 0 ? (
                            <span className="inline-flex items-center gap-1 text-emerald-500"><CheckCircle2 className="h-4 w-4" /> ready</span>
                          ) : (
                            <span className="inline-flex items-start gap-1 text-destructive" title={r.errors.join("\n")}>
                              <AlertCircle className="h-4 w-4 mt-0.5" />
                              <span className="text-xs">{r.errors[0]}{r.errors.length > 1 ? ` (+${r.errors.length - 1})` : ""}</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {result.unassignedImages && result.unassignedImages.length > 0 && (
                <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-2 text-xs text-amber-700 dark:text-amber-300">
                  {result.unassignedImages.length} image{result.unassignedImages.length > 1 ? "s" : ""} unused: {result.unassignedImages.slice(0, 5).join(", ")}{result.unassignedImages.length > 5 ? "…" : ""}
                </div>
              )}

              <div className="mt-4 rounded-xl border border-primary/30 bg-primary/5 p-3 text-xs">
                Importing as: <b>{promptRegion === "bd" ? "🇧🇩 Bangladesh" : promptRegion === "ar" ? "🇸🇦 Arabic" : promptRegion === "es" ? "🇪🇸 Spanish" : "🌍 Global"}</b>
                {promptRegion !== "bd" && <span className="text-muted-foreground"> · location field will be saved as country</span>}
                <span className="ml-1 text-muted-foreground">— change via the region tabs in the AI prompt panel.</span>
              </div>

              <div className="mt-3 flex items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-sm">
                  <Switch checked={notify} onCheckedChange={setNotify} />
                  Notify all users after import
                </label>
                <Button
                  className="gradient-rose text-primary-foreground"
                  onClick={startImport}
                  disabled={importing || validCount === 0 || result.errorCount > 0}
                >
                  {importing ? "Importing…" : `Import ${validCount} profile${validCount === 1 ? "" : "s"}`}
                </Button>
              </div>

              {progress && importing && (
                <div className="mt-3">
                  <div className="text-xs text-muted-foreground mb-1">
                    {progress.phase === "uploading" && `Uploading photos for ${progress.label}… (${progress.current}/${progress.total})`}
                    {progress.phase === "inserting" && "Saving profiles…"}
                    {progress.phase === "notifying" && "Sending notifications…"}
                  </div>
                  <Progress value={progress.total ? (progress.current / progress.total) * 100 : 0} />
                </div>
              )}

              {done && (
                <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3 text-sm">
                  <div className="font-semibold text-emerald-500">Imported {done.insertedCount} profiles</div>
                  {done.failures.length > 0 && (
                    <ul className="mt-2 list-disc pl-5 text-destructive">
                      {done.failures.map((f, i) => <li key={i}><b>{f.name}:</b> {f.error}</li>)}
                    </ul>
                  )}
                  <Button className="mt-3" variant="outline" onClick={() => navigate("/admin/dashboard")}>View in dashboard</Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: instructions */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-4">
            <h2 className="font-semibold">ZIP layout</h2>
            <pre className="mt-2 overflow-auto rounded-lg bg-secondary/60 p-3 text-xs leading-relaxed">
{`patri-bulk.zip
├── profiles.json   (or profiles.xlsx)
└── images/
    ├── sonia-1.jpg
    ├── sonia-2.jpg
    └── …`}
            </pre>
            <p className="mt-3 text-xs text-muted-foreground">
              Each row's <code>photos</code> field lists filenames inside <code>images/</code>. The first photo becomes the cover.
              Max {MAX_PROFILES} profiles, 5 photos each, 5 MB per image.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={downloadJsonTemplate}><FileJson className="mr-1 h-4 w-4" /> JSON template</Button>
              <Button size="sm" variant="outline" onClick={downloadXlsxTemplate}><FileSpreadsheet className="mr-1 h-4 w-4" /> Excel template</Button>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 text-sm">
            <h2 className="font-semibold flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> AI prompt</h2>
            <p className="mt-2 text-muted-foreground text-xs">
              Biodata text/voice transcript ChatGPT, Gemini ba Claude-e paste korun. Region select kore prompt copy korun — output direct "JSON + images" tab-e paste kora jabe.
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {(Object.keys(AI_PROMPTS) as PromptRegion[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setPromptRegion(r)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                    promptRegion === r
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-secondary/50 text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  {r === "bd" ? "🇧🇩 Bangla" : r === "global" ? "🌍 Global" : r === "ar" ? "🇸🇦 Arabic" : "🇪🇸 Spanish"}
                </button>
              ))}
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" className="mt-3 gradient-rose text-primary-foreground"><Sparkles className="mr-1 h-4 w-4" /> View AI prompt</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                  <DialogTitle>{activePrompt.name}</DialogTitle>
                  <p className="text-xs text-muted-foreground">v{activePrompt.version} · {activePrompt.filename}</p>
                </DialogHeader>
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const blob = new Blob([activePrompt.prompt], { type: "text/plain;charset=utf-8" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = activePrompt.filename;
                      document.body.appendChild(a);
                      a.click();
                      a.remove();
                      URL.revokeObjectURL(url);
                      toast.success("Prompt downloaded");
                    }}
                  >
                    <Download className="mr-1 h-4 w-4" /> Download .txt
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      await navigator.clipboard.writeText(activePrompt.prompt);
                      toast.success("Prompt copied to clipboard");
                    }}
                  >
                    <Copy className="mr-1 h-4 w-4" /> Copy
                  </Button>
                </div>
                <pre dir={activePrompt.dir} className="overflow-auto rounded-lg bg-secondary/60 p-3 text-xs whitespace-pre-wrap leading-relaxed">
                  {activePrompt.prompt}
                </pre>
              </DialogContent>
            </Dialog>
            <p className="mt-3 text-xs text-muted-foreground">
              Enums: <code>marital_status</code> = never | divorced | widowed · <code>family_type</code> = nuclear | joint · <code>skin_tone</code> = fair | medium | wheatish | dark
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default BulkImport;
