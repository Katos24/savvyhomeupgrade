// lib/timezone.ts
// Calendar math in a company's own time zone. The server runs on UTC, so
// "today" computed with plain Date methods rolls over at 8pm Eastern.

const DEFAULT_TZ = 'America/New_York';

/** A valid IANA zone name, or the default (Eastern) if missing/invalid. */
export function safeTz(tz: string | null | undefined): string {
  if (!tz) return DEFAULT_TZ;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz });
    return tz;
  } catch {
    return DEFAULT_TZ;
  }
}

/** Today's date as YYYY-MM-DD in the given zone. */
export function todayInZone(tz: string | null | undefined): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: safeTz(tz), year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date());
}

// How far the zone is ahead of UTC at a given instant, in ms.
function zoneOffsetMs(instant: number, tz: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz, hourCycle: 'h23',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).formatToParts(new Date(instant));
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  const asUtc = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'), get('second'));
  return asUtc - instant;
}

/** The real moment local midnight happens on YYYY-MM-DD in the zone. */
export function startOfDayInZone(dateStr: string, tz: string | null | undefined): Date {
  const zone = safeTz(tz);
  const [y, m, d] = dateStr.slice(0, 10).split('-').map(Number);
  const guess = Date.UTC(y, m - 1, d);
  // Two passes handle days where the offset changes (daylight saving).
  let result = guess - zoneOffsetMs(guess, zone);
  result = guess - zoneOffsetMs(result, zone);
  return new Date(result);
}

/** The last millisecond of YYYY-MM-DD in the zone. */
export function endOfDayInZone(dateStr: string, tz: string | null | undefined): Date {
  const [y, m, d] = dateStr.slice(0, 10).split('-').map(Number);
  const next = new Date(Date.UTC(y, m - 1, d + 1)).toISOString().slice(0, 10);
  return new Date(startOfDayInZone(next, tz).getTime() - 1);
}

/** Start of today, this week (Sunday) and this month, as real moments. */
export function periodStartsInZone(tz: string | null | undefined) {
  const today = todayInZone(tz);
  const [y, m, d] = today.split('-').map(Number);
  const todayUtc = new Date(Date.UTC(y, m - 1, d));
  const weekStartStr = new Date(Date.UTC(y, m - 1, d - todayUtc.getUTCDay())).toISOString().slice(0, 10);
  const monthStartStr = `${y}-${String(m).padStart(2, '0')}-01`;
  return {
    todayStart: startOfDayInZone(today, tz),
    weekStart: startOfDayInZone(weekStartStr, tz),
    monthStart: startOfDayInZone(monthStartStr, tz),
  };
}

/** The calendar date (YYYY-MM-DD) a given moment falls on in the zone. */
export function dateInZone(d: Date | string, tz: string | null | undefined): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: safeTz(tz), year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date(d));
}