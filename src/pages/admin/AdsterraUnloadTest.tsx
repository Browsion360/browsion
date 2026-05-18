import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, AlertTriangle, Loader2, Trash2, ShieldCheck } from "lucide-react";
import { scanForAdArtifacts, purgeAdArtifacts, type ScanResult } from "@/lib/adCleanup";
import { toast } from "sonner";

type Phase = "idle" | "loading" | "loaded" | "purging" | "verified" | "leaked";

/**
 * Verifies the Social Bar / in-page push blocker can remove any leftover DOM artifacts
 * without loading third-party scripts again.
 */
export function AdsterraUnloadTest() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [before, setBefore] = useState<ScanResult | null>(null);
  const [after, setAfter] = useState<ScanResult | null>(null);
  const [originalTitle] = useState(() => document.title);

  const runTest = async () => {
    setPhase("loading");
    setBefore(null);
    setAfter(null);

    // 1. Inject harmless mock artifacts that match Adsterra Social Bar leftovers.
    const wrap = document.createElement("div");
    wrap.id = "ads-social-bar";
    wrap.className = "adsterra-social-bar in-page-push";
    wrap.textContent = "Mock Social Bar artifact";
    document.body.appendChild(wrap);
    const frame = document.createElement("iframe");
    frame.src = "about:blank#adsterra";
    frame.title = "Mock Social Bar iframe";
    wrap.appendChild(frame);

    // 2. Scan immediately, then purge and verify it does not come back.
    await new Promise((r) => setTimeout(r, 50));

    const beforeScan = scanForAdArtifacts(originalTitle);
    setBefore(beforeScan);
    setPhase("loaded");

    // 3. Purge
    setPhase("purging");
    await new Promise((r) => setTimeout(r, 200));
    const removed = purgeAdArtifacts();
    document.title = originalTitle;

    // 4. Wait briefly, then re-scan to detect anything that re-injected itself
    await new Promise((r) => setTimeout(r, 1500));
    const afterScan = scanForAdArtifacts(originalTitle);
    setAfter(afterScan);

    const passed = afterScan.total === 0 && !afterScan.titleHijacked;
    setPhase(passed ? "verified" : "leaked");

    if (passed) toast.success(`Unload OK · removed ${removed} node(s)`);
    else toast.error(`Leaked ${afterScan.total} artifact(s) after purge`);
  };

  const reset = () => {
    purgeAdArtifacts();
    document.title = originalTitle;
    setPhase("idle");
    setBefore(null);
    setAfter(null);
  };

  const StatusBadge = () => {
    if (phase === "verified")
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/15 px-3 py-1 text-xs font-semibold text-green-600">
          <CheckCircle2 className="h-3.5 w-3.5" /> PASS · fully unloaded
        </span>
      );
    if (phase === "leaked")
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/15 px-3 py-1 text-xs font-semibold text-destructive">
          <XCircle className="h-3.5 w-3.5" /> FAIL · artifacts leaked
        </span>
      );
    if (phase === "loading" || phase === "purging" || phase === "loaded")
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-600">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />{" "}
          {phase === "loading" ? "Loading script…" : phase === "loaded" ? "Script loaded" : "Purging…"}
        </span>
      );
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
        <AlertTriangle className="h-3.5 w-3.5" /> Not run
      </span>
    );
  };

  const ScanBlock = ({ title, scan }: { title: string; scan: ScanResult }) => (
    <div className="rounded-xl border border-border bg-secondary/40 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</span>
        <span className={`text-sm font-bold ${scan.total > 0 || scan.titleHijacked ? "text-destructive" : "text-green-600"}`}>
          {scan.total} artifact{scan.total === 1 ? "" : "s"}
          {scan.titleHijacked && " · title hijacked"}
        </span>
      </div>
      {scan.bySelector.length > 0 ? (
        <ul className="space-y-0.5 text-xs">
          {scan.bySelector.map((b) => (
            <li key={b.selector} className="flex justify-between font-mono text-muted-foreground">
              <span className="truncate pr-2">{b.selector}</span>
              <span>×{b.count}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-xs text-muted-foreground">No matching selectors found.</div>
      )}
      {scan.titleHijacked && (
        <div className="mt-2 rounded bg-destructive/10 p-2 text-[11px] text-destructive">
          Title was changed: <span className="font-mono">"{scan.currentTitle}"</span>
        </div>
      )}
    </div>
  );

  const busy = phase === "loading" || phase === "purging";

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-bold">Adsterra unload test</h2>
          <p className="text-xs text-muted-foreground">
            Social Bar is permanently disabled. This injects safe mock leftovers, purges them instantly, and verifies nothing remains. No reload required.
          </p>
        </div>
        <StatusBadge />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={runTest} disabled={busy} className="gradient-rose text-primary-foreground">
          {busy ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-1 h-4 w-4" />}
          Run unload test
        </Button>
        <Button variant="outline" onClick={reset} disabled={busy}>
          <Trash2 className="mr-1 h-4 w-4" /> Reset / purge now
        </Button>
      </div>

      {(before || after) && (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {before && <ScanBlock title="After script loaded" scan={before} />}
          {after && <ScanBlock title="After purge" scan={after} />}
        </div>
      )}
    </div>
  );
}
