import JSZip from "jszip";
import * as XLSX from "xlsx";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

export const MAX_PROFILES = 30;
export const MAX_PHOTOS = 5;
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_ZIP_BYTES = 50 * 1024 * 1024;

export const profileSchema = z.object({
  slug: z.string().trim().min(1).max(80).optional(),
  name: z.string().trim().min(1).max(80),
  age: z.coerce.number().int().min(18).max(80),
  height_cm: z.coerce.number().int().min(120).max(220).optional().nullable(),
  weight_kg: z.coerce.number().int().min(30).max(200).optional().nullable(),
  district: z.string().trim().max(80).optional().nullable(),
  current_location: z.string().trim().max(120).optional().nullable(),
  ancestral_address: z.string().trim().max(160).optional().nullable(),
  education: z.string().trim().max(160).optional().nullable(),
  profession: z.string().trim().max(160).optional().nullable(),
  income_range: z.string().trim().max(80).optional().nullable(),
  religion: z.string().trim().max(40).optional().nullable(),
  sect: z.string().trim().max(40).optional().nullable(),
  family_type: z.enum(["nuclear", "joint"]).optional().nullable(),
  father_profession: z.string().trim().max(160).optional().nullable(),
  mother_profession: z.string().trim().max(160).optional().nullable(),
  siblings_count: z.coerce.number().int().min(0).max(15).optional().nullable(),
  marital_status: z.enum(["never", "divorced", "widowed"]).optional().nullable(),
  skin_tone: z.enum(["fair", "medium", "wheatish", "dark"]).optional().nullable(),
  children_info: z.string().trim().max(400).optional().nullable(),
  about: z.string().trim().max(4000).optional().nullable(),
  expectations: z.string().trim().max(4000).optional().nullable(),
  visit_note: z.string().trim().max(400).optional().nullable(),
  photos: z.array(z.string().trim().min(1)).max(MAX_PHOTOS).optional().default([]),
  is_published: z.coerce.boolean().optional().default(true),
  region: z.enum(["bd", "ar", "es", "global"]).optional(),
  country: z.string().trim().max(80).optional().nullable(),
  locale: z.string().trim().max(10).optional().nullable(),
});

export type BulkRegion = "bd" | "ar" | "es" | "global";
const LOCALE_BY_REGION: Record<BulkRegion, string> = { bd: "bn", ar: "ar", es: "es", global: "en" };

export type ProfileInput = z.infer<typeof profileSchema>;

export type PhotoSource = { name: string; getBlob: () => Promise<Blob> };

export type ParsedRow = {
  index: number;
  raw: any;
  data?: ProfileInput;
  errors: string[];
  photoFiles: PhotoSource[];
  photoSource?: "json" | "auto-slug" | "auto-name" | "auto-order" | "mixed";
};

export type ParseResult = {
  rows: ParsedRow[];
  totalImages: number;
  errorCount: number;
  unassignedImages?: string[];
};

export type AutoMatchOpts = {
  enabled: boolean;
  perProfile: number; // 1..MAX_PHOTOS, used in order-fallback
};

const DEFAULT_AUTO: AutoMatchOpts = { enabled: true, perProfile: 3 };

function slugify(name: string, idx: number) {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9\u0980-\u09FF]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return base || `profile-${idx + 1}`;
}

function normalizePhotos(v: any): string[] {
  if (!v) return [];
  if (Array.isArray(v)) return v.map(String).map((s) => s.trim()).filter(Boolean);
  return String(v)
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function coerceEnum<T extends string>(
  v: any,
  rules: { match: RegExp; value: T }[],
  validValues: readonly T[]
): T | null {
  if (v == null || v === "") return null;
  const s = String(v).trim();
  if ((validValues as readonly string[]).includes(s)) return s as T;
  const lc = s.toLowerCase();
  for (const r of rules) if (r.match.test(lc)) return r.value;
  return null;
}

function coerceEnums(r: any) {
  if ("family_type" in r) {
    r.family_type = coerceEnum(
      r.family_type,
      [
        { match: /যৌথ|জয়েন্ট|joint/i, value: "joint" },
        { match: /নিউক্লিয়ার|ছোট|nuclear/i, value: "nuclear" },
      ],
      ["nuclear", "joint"] as const,
    );
  }
  if ("marital_status" in r) {
    r.marital_status = coerceEnum(
      r.marital_status,
      [
        { match: /বিধবা|widow/i, value: "widowed" },
        { match: /তালাক|ডিভোর্স|divorc/i, value: "divorced" },
        { match: /অবিবাহিত|single|never/i, value: "never" },
      ],
      ["never", "divorced", "widowed"] as const,
    );
  }
  if ("skin_tone" in r) {
    r.skin_tone = coerceEnum(
      r.skin_tone,
      [
        { match: /ফর্সা|উজ্জ্বল|fair/i, value: "fair" },
        { match: /গমের|wheat/i, value: "wheatish" },
        { match: /মাঝারি|medium/i, value: "medium" },
        { match: /শ্যাম|কালো|dark/i, value: "dark" },
      ],
      ["fair", "medium", "wheatish", "dark"] as const,
    );
  }
}

function normalizeRow(raw: any) {
  const r: any = { ...raw };
  r.photos = normalizePhotos(raw.photos);
  ["height_cm", "weight_kg", "siblings_count", "age"].forEach((k) => {
    if (r[k] === "" || r[k] == null) delete r[k];
  });
  if (typeof r.is_published === "string") {
    const v = r.is_published.toLowerCase();
    r.is_published = v === "true" || v === "1" || v === "yes";
  }
  coerceEnums(r);
  return r;
}

/**
 * Sanitize JSON-ish text: strip BOM, // line comments, /* block comments,
 * and trailing commas — while preserving content inside string literals.
 */
function stripJsonish(input: string): string {
  let s = input.replace(/^\uFEFF/, "");
  let out = "";
  let i = 0;
  const n = s.length;
  let inStr = false;
  let strCh = "";
  while (i < n) {
    const c = s[i];
    const next = s[i + 1];
    if (inStr) {
      out += c;
      if (c === "\\" && i + 1 < n) { out += s[i + 1]; i += 2; continue; }
      if (c === strCh) inStr = false;
      i++;
      continue;
    }
    if (c === '"' || c === "'") { inStr = true; strCh = c; out += c; i++; continue; }
    if (c === "/" && next === "/") {
      i += 2;
      while (i < n && s[i] !== "\n") i++;
      continue;
    }
    if (c === "/" && next === "*") {
      i += 2;
      while (i < n && !(s[i] === "*" && s[i + 1] === "/")) i++;
      i += 2;
      continue;
    }
    out += c;
    i++;
  }
  // Strip trailing commas before ] or }
  out = out.replace(/,(\s*[}\]])/g, "$1");
  // Insert missing commas between adjacent string literals separated only by whitespace/newlines
  // (JSON forbids raw newlines inside strings, so this is safe).
  out = out.replace(/"(\s*\n\s*)"/g, '",$1"');
  // Insert missing commas between } and { / [ across whitespace
  out = out.replace(/([}\]"])(\s*\n\s*)(["{\[])/g, (_m, a, ws, b) => `${a},${ws}${b}`);
  // Auto-close unbalanced brackets (best-effort, outside of strings).
  let depthSq = 0, depthCu = 0, ins = false, sc = "";
  for (let k = 0; k < out.length; k++) {
    const ch = out[k];
    if (ins) {
      if (ch === "\\") { k++; continue; }
      if (ch === sc) ins = false;
      continue;
    }
    if (ch === '"' || ch === "'") { ins = true; sc = ch; continue; }
    if (ch === "[") depthSq++;
    else if (ch === "]") depthSq--;
    else if (ch === "{") depthCu++;
    else if (ch === "}") depthCu--;
  }
  while (depthCu-- > 0) out += "}";
  while (depthSq-- > 0) out += "]";
  return out;
}

export async function parseZip(file: File, auto: AutoMatchOpts = DEFAULT_AUTO): Promise<ParseResult> {
  if (file.size > MAX_ZIP_BYTES) throw new Error(`ZIP too large (max ${MAX_ZIP_BYTES / 1024 / 1024} MB)`);
  const zip = await JSZip.loadAsync(file);

  // find data file
  const jsonEntry = Object.values(zip.files).find((f) => /^profiles\.json$/i.test(f.name) && !f.dir);
  const xlsxEntry = Object.values(zip.files).find((f) => /^profiles\.(xlsx|csv)$/i.test(f.name) && !f.dir);
  if (!jsonEntry && !xlsxEntry) throw new Error("ZIP must contain profiles.json or profiles.xlsx at the root");

  let rawRows: any[] = [];
  if (jsonEntry) {
    const text = await jsonEntry.async("string");
    const cleaned = stripJsonish(text);
    let parsed: any;
    try {
      parsed = JSON.parse(cleaned);
    } catch (e: any) {
      throw new Error(`profiles.json is not valid JSON: ${e.message}`);
    }
    rawRows = Array.isArray(parsed) ? parsed : [parsed];
  } else if (xlsxEntry) {
    const buf = await xlsxEntry.async("arraybuffer");
    const wb = XLSX.read(buf, { type: "array" });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    rawRows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
  }

  if (rawRows.length > MAX_PROFILES) throw new Error(`Too many profiles (${rawRows.length}). Max ${MAX_PROFILES} per ZIP.`);

  // build image map: filename (basename) -> zip entry inside images/
  const imageMap = new Map<string, JSZip.JSZipObject>();
  Object.values(zip.files).forEach((f) => {
    if (f.dir) return;
    const m = f.name.match(/^images\/(.+)$/i);
    if (m) imageMap.set(m[1].toLowerCase(), f);
    // also tolerate flat filenames
    const base = f.name.split("/").pop()!;
    if (!imageMap.has(base.toLowerCase()) && /\.(jpe?g|png|webp|heic)$/i.test(base)) {
      imageMap.set(base.toLowerCase(), f);
    }
  });

  const sources = new Map<string, PhotoSource>();
  imageMap.forEach((entry, key) => {
    sources.set(key, { name: key, getBlob: () => entry.async("blob") });
  });
  return buildRows(rawRows, sources, auto);
}

function naturalSort(a: string, b: string) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
}

function isImageName(n: string) {
  return /\.(jpe?g|png|webp|heic)$/i.test(n);
}

function nameSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\u0980-\u09FF]+/gi, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Auto-match images to profiles using slug-prefix → name-prefix → order fallback.
 * Mutates rows in place: sets photoFiles + photoSource, removes "Image not found" errors when filled.
 */
function autoMatchPhotos(
  rows: ParsedRow[],
  imageMap: Map<string, PhotoSource>,
  opts: AutoMatchOpts,
): { unassigned: string[] } {
  if (!opts.enabled) return { unassigned: [] };

  // Pool of available image keys (basenames, lowercase) — remove ones already used by JSON exact-match
  const used = new Set<string>();
  rows.forEach((r) => r.photoFiles.forEach((pf) => used.add(pf.name.toLowerCase())));

  const allKeys = Array.from(imageMap.keys()).filter(isImageName).sort(naturalSort);
  const remaining = new Set(allKeys.filter((k) => !used.has(k)));

  const take = (key: string) => {
    const src = imageMap.get(key);
    remaining.delete(key);
    used.add(key);
    return src!;
  };

  // Tier 1 + 2: slug / name prefix
  for (const row of rows) {
    if (!row.data) continue;
    const need = MAX_PHOTOS - row.photoFiles.length;
    if (need <= 0) continue;
    const slug = (row.data.slug || "").toLowerCase();
    const nslug = nameSlug(row.data.name || "");
    const candidates: string[] = [];
    for (const key of Array.from(remaining)) {
      const base = key.replace(/\.[a-z0-9]+$/i, "");
      if (slug && (base === slug || base.startsWith(slug + "-") || base.startsWith(slug + "_"))) {
        candidates.push(key);
        continue;
      }
      if (nslug && (base === nslug || base.startsWith(nslug + "-") || base.startsWith(nslug + "_"))) {
        candidates.push(key);
      }
    }
    candidates.sort(naturalSort);
    const taken = candidates.slice(0, Math.min(need, MAX_PHOTOS));
    if (taken.length) {
      const prevSrc = row.photoSource;
      row.photoSource = row.photoFiles.length
        ? "mixed"
        : slug && taken.every((k) => k.startsWith(slug)) ? "auto-slug" : "auto-name";
      taken.forEach((k) => row.photoFiles.push(take(k)));
    }
  }

  // Tier 3: order-based distribution for rows still empty
  const emptyRows = rows.filter((r) => r.data && r.photoFiles.length === 0);
  if (emptyRows.length && remaining.size) {
    const per = Math.max(1, Math.min(MAX_PHOTOS, opts.perProfile || DEFAULT_AUTO.perProfile));
    const ordered = Array.from(remaining).sort(naturalSort);
    let cursor = 0;
    for (const row of emptyRows) {
      const slice = ordered.slice(cursor, cursor + per);
      cursor += per;
      if (!slice.length) break;
      slice.forEach((k) => row.photoFiles.push(take(k)));
      row.photoSource = "auto-order";
      if (cursor >= ordered.length) break;
    }
  }

  // Re-validate: drop "Image not found" / "photos: ..." errors when row now has at least 1 photo
  rows.forEach((row) => {
    if (row.photoFiles.length > 0) {
      row.errors = row.errors.filter(
        (e) => !/^Image not found/i.test(e) && !/^photos: /i.test(e) && !/photos.*Required/i.test(e),
      );
    } else if (row.data && !row.errors.some((e) => /photo/i.test(e))) {
      row.errors.push("No photos found for this profile (upload images or list them in JSON)");
    }
  });

  return { unassigned: Array.from(remaining) };
}

function buildRows(rawRows: any[], imageMap: Map<string, PhotoSource>, auto: AutoMatchOpts = DEFAULT_AUTO): ParseResult {
  const rows: ParsedRow[] = [];
  for (let i = 0; i < rawRows.length; i++) {
    const errors: string[] = [];
    const normalized = normalizeRow(rawRows[i]);
    const photoFiles: PhotoSource[] = [];
    const parsed = profileSchema.safeParse(normalized);
    let data: ProfileInput | undefined;
    let photoSource: ParsedRow["photoSource"] | undefined;
    if (!parsed.success) {
      parsed.error.issues.forEach((iss) => {
        errors.push(`${iss.path.join(".") || "row"}: ${iss.message}`);
      });
    } else {
      data = parsed.data;
      data.slug = data.slug || slugify(data.name, i);
      for (const p of data.photos || []) {
        const entry = imageMap.get(p.toLowerCase());
        if (!entry) {
          // soft error — auto-match may resolve it
          errors.push(`Image not found: ${p}`);
        } else {
          photoFiles.push(entry);
        }
      }
      if (photoFiles.length > 0) photoSource = "json";
    }
    rows.push({ index: i, raw: rawRows[i], data, errors, photoFiles, photoSource });
  }

  const { unassigned } = autoMatchPhotos(rows, imageMap, auto);

  let totalImages = 0;
  let errorCount = 0;
  rows.forEach((r) => {
    totalImages += r.photoFiles.length;
    if (r.errors.length) errorCount += 1;
  });

  return { rows, totalImages, errorCount, unassignedImages: unassigned };
}

export async function parseLoose(
  jsonText: string,
  images: File[],
  auto: AutoMatchOpts = DEFAULT_AUTO,
): Promise<ParseResult> {
  if (!jsonText.trim()) throw new Error("JSON is empty");
  let parsed: any;
  try {
    parsed = JSON.parse(stripJsonish(jsonText));
  } catch (e: any) {
    throw new Error(`Invalid JSON: ${e.message}`);
  }
  const rawRows: any[] = Array.isArray(parsed) ? parsed : [parsed];
  if (rawRows.length > MAX_PROFILES) throw new Error(`Too many profiles (${rawRows.length}). Max ${MAX_PROFILES}.`);

  const imageMap = new Map<string, PhotoSource>();
  for (const f of images) {
    const base = f.name.split("/").pop()!.toLowerCase();
    imageMap.set(base, { name: f.name, getBlob: () => Promise.resolve(f) });
  }
  return buildRows(rawRows, imageMap, auto);
}

function extOf(name: string) {
  const m = name.match(/\.([a-z0-9]+)$/i);
  return m ? m[1].toLowerCase() : "jpg";
}

function contentType(ext: string) {
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  if (ext === "heic") return "image/heic";
  return "image/jpeg";
}

export type ProgressEvent = {
  phase: "uploading" | "inserting" | "notifying" | "done";
  current: number;
  total: number;
  label?: string;
};

export async function runImport(
  result: ParseResult,
  opts: { notifyUsers: boolean; onProgress?: (e: ProgressEvent) => void; region?: BulkRegion } = { notifyUsers: false }
) {
  const valid = result.rows.filter((r) => r.errors.length === 0 && r.data);
  const total = valid.length;
  if (!total) throw new Error("No valid rows to import");

  const region: BulkRegion = opts.region ?? "bd";
  const locale = LOCALE_BY_REGION[region];

  const onProgress = opts.onProgress ?? (() => {});
  const insertRows: any[] = [];
  const failures: { name: string; error: string }[] = [];

  for (let i = 0; i < valid.length; i++) {
    const row = valid[i];
    const data = row.data!;
    onProgress({ phase: "uploading", current: i + 1, total, label: data.name });

    const uploadedPaths: string[] = [];
    let failed = false;
    for (let p = 0; p < row.photoFiles.length; p++) {
      const ph = row.photoFiles[p];
      const blob = await ph.getBlob();
      if (blob.size > MAX_IMAGE_BYTES) {
        failures.push({ name: data.name, error: `Image ${ph.name} exceeds ${MAX_IMAGE_BYTES / 1024 / 1024}MB` });
        failed = true;
        break;
      }
      const ext = extOf(ph.name);
      const path = `bulk/${Date.now()}-${data.slug}-${p + 1}.${ext}`;
      const { error } = await supabase.storage
        .from("patri-photos")
        .upload(path, blob, { contentType: contentType(ext), upsert: false });
      if (error) {
        failures.push({ name: data.name, error: `Upload failed for ${ph.name}: ${error.message}` });
        failed = true;
        break;
      }
      uploadedPaths.push(path);
    }
    if (failed) continue;

    const { slug, ...rest } = data;
    // Region tagging: for non-BD regions, treat the location field as country
    const rowRegion = (rest.region as BulkRegion) || region;
    const rowLocale = rest.locale || locale;
    let rowCountry = rest.country ?? null;
    let rowDistrict = rest.district ?? null;
    if (rowRegion !== "bd") {
      if (!rowCountry && rowDistrict) rowCountry = rowDistrict;
      rowDistrict = null;
    }
    insertRows.push({
      ...rest,
      district: rowDistrict,
      country: rowCountry,
      region: rowRegion,
      locale: rowLocale,
      photos: uploadedPaths,
    });
  }

  onProgress({ phase: "inserting", current: 0, total: insertRows.length });
  let insertedCount = 0;
  if (insertRows.length) {
    const { data: inserted, error } = await supabase.from("patri_profiles").insert(insertRows).select("id");
    if (error) throw new Error(`Insert failed: ${error.message}`);
    insertedCount = inserted?.length ?? insertRows.length;
  }
  onProgress({ phase: "inserting", current: insertedCount, total: insertRows.length });

  if (opts.notifyUsers && insertedCount > 0) {
    onProgress({ phase: "notifying", current: 0, total: 1 });
    const { data: users } = await supabase.from("app_users").select("user_id");
    if (users?.length) {
      const notifs = users.map((u) => ({
        user_id: u.user_id,
        title: "New profiles added",
        body: `${insertedCount} new profile${insertedCount > 1 ? "s" : ""} just got published.`,
      }));
      await supabase.from("notifications").insert(notifs);
    }
    onProgress({ phase: "notifying", current: 1, total: 1 });
  }

  onProgress({ phase: "done", current: insertedCount, total });
  return { insertedCount, failures };
}
