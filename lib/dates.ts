// A calendar date from the database ("2026-09-30" or "2026-09-30T00:00:00.000Z")
// → that same date in local time. new Date() alone reads it as UTC midnight,
// which is the previous evening in the US.
export function toLocalDate(d?: string | null): Date | null {
  if (!d) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(d));
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const parsed = new Date(d);
  return isNaN(parsed.getTime()) ? null : parsed;
}