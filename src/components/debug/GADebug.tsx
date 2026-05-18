import { useEffect, useState } from "react";

type Status = "checking" | "ok" | "blocked";

export const GADebug = () => {
  const enabled = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("gadebug") === "1";
  const [scriptStatus, setScriptStatus] = useState<Status>("checking");
  const [collectStatus, setCollectStatus] = useState<Status>("checking");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    const t = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    fetch("https://www.googletagmanager.com/gtag/js?id=G-R5MGTXGXW3", { mode: "no-cors", cache: "no-store" })
      .then(() => setScriptStatus("ok"))
      .catch(() => setScriptStatus("blocked"));
    fetch("https://www.google-analytics.com/g/collect?v=2&tid=G-R5MGTXGXW3&en=debug_ping&debug_mode=1", {
      method: "POST",
      mode: "no-cors",
      keepalive: true,
    })
      .then(() => setCollectStatus("ok"))
      .catch(() => setCollectStatus("blocked"));
  }, [enabled]);

  if (!enabled) return null;

  const hasGtag = typeof window !== "undefined" && typeof (window as any).gtag === "function";
  const dlLen = (window as any).dataLayer?.length ?? 0;

  const row = (label: string, value: string, color?: string) => (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
      <span style={{ opacity: 0.7 }}>{label}</span>
      <span style={{ color: color ?? "#fff", fontWeight: 600 }}>{value}</span>
    </div>
  );

  return (
    <div
      style={{
        position: "fixed",
        top: 8,
        right: 8,
        zIndex: 99999,
        background: "rgba(0,0,0,0.85)",
        color: "#fff",
        font: "12px/1.4 ui-monospace,monospace",
        padding: "10px 12px",
        borderRadius: 8,
        maxWidth: 260,
        boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
      }}
      data-tick={tick}
    >
      <div style={{ fontWeight: 700, marginBottom: 6 }}>GA Debug</div>
      {row("hostname", window.location.hostname)}
      {row("gtag()", hasGtag ? "yes" : "no", hasGtag ? "#4ade80" : "#f87171")}
      {row("dataLayer", String(dlLen))}
      {row("script", scriptStatus, scriptStatus === "ok" ? "#4ade80" : scriptStatus === "blocked" ? "#f87171" : "#fbbf24")}
      {row("collect", collectStatus, collectStatus === "ok" ? "#4ade80" : collectStatus === "blocked" ? "#f87171" : "#fbbf24")}
      <div style={{ marginTop: 6, opacity: 0.6, fontSize: 10 }}>?gadebug=1</div>
    </div>
  );
};

export default GADebug;
