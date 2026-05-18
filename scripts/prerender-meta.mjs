// Post-build: emit per-region static index.html with crawler-visible meta.
// Crawlers (FB/Twitter/WhatsApp) don't run JS, so per-region og:image must be
// in the served HTML at the route they hit.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(__dirname, "../dist");
const templatePath = resolve(distDir, "index.html");

if (!existsSync(templatePath)) {
  console.error("[prerender-meta] dist/index.html not found — run vite build first.");
  process.exit(1);
}

const SITE_ORIGIN = "https://prothomalap.adxgram.com";
const DEFAULT_OG = "https://storage.googleapis.com/gpt-engineer-file-uploads/FifkNoCeE1NWP7V5VKkH7vz6RJZ2/social-images/social-1778100211454-prothom_alap_social_imagte.webp";

const REGIONS = {
  bd: {
    title: "ProthomAlap — বাঙ্গালি পাত্রীদের মিলন মেলা",
    description: "বাংলাদেশী এবং কলকাতার পাত্রীদের মিলনমেলা। আপনার নতুন জীবন শুরু হতে পারে প্রথম আলাপ হতেই। ProthomAlap ✅",
    ogImage: DEFAULT_OG,
    locale: "bn_BD",
  },
  ar: {
    title: "Arabian Bride Biodata · ProthomAlap",
    description: "Verified bride biodata from across the Arab world. Saudi, UAE, Qatar, Egypt and more.",
    ogImage: `${SITE_ORIGIN}/social/arabian-social-share.webp`,
    locale: "ar_AR",
  },
  es: {
    title: "Perfiles de Novias en Español · ProthomAlap",
    description: "Biodatos verificados de novias en español — España y América Latina. Navega gratis.",
    ogImage: DEFAULT_OG,
    locale: "es_ES",
  },
  global: {
    title: "Global Bride Biodata · ProthomAlap",
    description: "Verified bride biodata from around the world. Browse freely without sign-up.",
    ogImage: DEFAULT_OG,
    locale: "en_US",
  },
};

const template = readFileSync(templatePath, "utf8");

function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function patch(html, region, route) {
  const cfg = REGIONS[region];
  const canonical = `${SITE_ORIGIN}${route}`;
  const t = escapeHtml(cfg.title);
  const d = escapeHtml(cfg.description);
  const img = escapeHtml(cfg.ogImage);

  let out = html;
  // <title>
  out = out.replace(/<title>[\s\S]*?<\/title>/i, `<title>${t}</title>`);
  // description
  out = out.replace(/<meta\s+name=["']description["']\s+content=["'][^"']*["']\s*\/?>/i,
    `<meta name="description" content="${d}">`);
  // og:title / og:description / og:image
  out = out.replace(/<meta\s+property=["']og:title["']\s+content=["'][^"']*["']\s*\/?>/i,
    `<meta property="og:title" content="${t}">`);
  out = out.replace(/<meta\s+property=["']og:description["']\s+content=["'][^"']*["']\s*\/?>/i,
    `<meta property="og:description" content="${d}">`);
  out = out.replace(/<meta\s+property=["']og:image["']\s+content=["'][^"']*["']\s*\/?>/i,
    `<meta property="og:image" content="${img}">`);
  // twitter
  out = out.replace(/<meta\s+name=["']twitter:title["']\s+content=["'][^"']*["']\s*\/?>/i,
    `<meta name="twitter:title" content="${t}">`);
  out = out.replace(/<meta\s+name=["']twitter:description["']\s+content=["'][^"']*["']\s*\/?>/i,
    `<meta name="twitter:description" content="${d}">`);
  out = out.replace(/<meta\s+name=["']twitter:image["']\s+content=["'][^"']*["']\s*\/?>/i,
    `<meta name="twitter:image" content="${img}">`);

  // Inject canonical + og:locale + og:url before </head>
  const inject = `    <link rel="canonical" href="${canonical}">\n    <meta property="og:url" content="${canonical}">\n    <meta property="og:locale" content="${cfg.locale}">\n  </head>`;
  out = out.replace(/<\/head>/i, inject);

  return out;
}

function emit(region, route) {
  const html = patch(template, region, route);
  // route like "/ar" → dist/ar/index.html ; "/ar/explore" → dist/ar/explore/index.html
  const targetDir = resolve(distDir, "." + route);
  mkdirSync(targetDir, { recursive: true });
  const targetFile = resolve(targetDir, "index.html");
  writeFileSync(targetFile, html, "utf8");
  console.log(`[prerender-meta] wrote ${targetFile.replace(distDir, "dist")}`);
}

for (const region of Object.keys(REGIONS)) {
  emit(region, `/${region}`);
  emit(region, `/${region}/explore`);
}

console.log("[prerender-meta] done.");
