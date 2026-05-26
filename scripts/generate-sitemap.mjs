// Generates public/sitemap.xml with static routes + published profile slugs.
// Runs in prebuild via package.json.
import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE_URL = "https://browsion.com";

// Load Supabase URL/key from .env (best-effort)
function loadEnv() {
  const envPath = resolve(__dirname, "../.env");
  if (!existsSync(envPath)) return {};
  const out = {};
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) out[m[1]] = m[2].replace(/^"|"$/g, "");
  }
  return out;
}

const env = { ...loadEnv(), ...process.env };
const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SUPABASE_KEY = env.VITE_SUPABASE_PUBLISHABLE_KEY;

const staticEntries = [
  { path: "/", changefreq: "daily", priority: "1.0" },
  { path: "/bd", changefreq: "daily", priority: "0.9" },
  { path: "/ar", changefreq: "daily", priority: "0.9" },
  { path: "/es", changefreq: "daily", priority: "0.9" },
  { path: "/global", changefreq: "daily", priority: "0.9" },
  { path: "/discover", changefreq: "daily", priority: "0.8" },
  { path: "/explore", changefreq: "daily", priority: "0.8" },
  { path: "/pricing", changefreq: "weekly", priority: "0.6" },
  { path: "/auth", changefreq: "monthly", priority: "0.4" },
];

async function fetchProfiles() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.warn("[sitemap] Missing Supabase env — skipping profile entries");
    return [];
  }
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/patri_profiles?select=id,slug,updated_at&is_published=eq.true`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    );
    if (!res.ok) {
      console.warn(`[sitemap] profile fetch failed: ${res.status}`);
      return [];
    }
    const rows = await res.json();
    return rows.map((r) => ({
      path: r.slug ? `/p/${r.slug}` : `/profile/${r.id}`,
      lastmod: r.updated_at ? new Date(r.updated_at).toISOString() : undefined,
      changefreq: "weekly",
      priority: "0.7",
    }));
  } catch (e) {
    console.warn("[sitemap] profile fetch error:", e?.message ?? e);
    return [];
  }
}

function render(entries) {
  const urls = entries.map((e) => [
    "  <url>",
    `    <loc>${BASE_URL}${e.path}</loc>`,
    e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
    e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
    e.priority ? `    <priority>${e.priority}</priority>` : null,
    "  </url>",
  ].filter(Boolean).join("\n"));
  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
  ].join("\n");
}

const profileEntries = await fetchProfiles();
const all = [...staticEntries, ...profileEntries];
writeFileSync(resolve(__dirname, "../public/sitemap.xml"), render(all));
console.log(`[sitemap] wrote ${all.length} entries (${profileEntries.length} profiles)`);
