// Deterministic simulated presence — no backend.
// Same profile shows same status within an hour, ~35% online.

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function isProfileOnline(profileId: string): boolean {
  if (!profileId) return false;
  const hourBucket = Math.floor(Date.now() / 3_600_000);
  const n = hashString(`${profileId}:${hourBucket}`);
  return n % 100 < 35;
}

export function getOnlineMinutesAgo(profileId: string): number {
  // Returns 1-9 minutes for "active recently" feel
  const minuteBucket = Math.floor(Date.now() / 60_000);
  const n = hashString(`${profileId}:m:${Math.floor(minuteBucket / 5)}`);
  return (n % 9) + 1;
}
