// Helper to build clean profile URLs.
// Prefers slug (e.g. /p/rahima-khatun-dhaka-25) and falls back to UUID.

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function profilePath(profile: { slug?: string | null; id: string }): string {
  if (profile.slug && profile.slug.length > 0) return `/p/${profile.slug}`;
  return `/profile/${profile.id}`;
}

export function isUuid(s: string): boolean {
  return UUID_RE.test(s);
}
