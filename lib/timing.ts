// Customer timing on the booking form.
//
// Stored in the existing lead columns (no new columns):
//   leads.preferred_date  → how soon: 'asap' | 'week' | 'month' | 'flexible'
//   leads.preferred_time  → best times, comma list: 'weekday_mornings,evenings'
//
// Older leads still hold a real date ('2026-10-07') and a time ('14:00') in
// those columns. The label helpers below show those the old way, so nothing
// already saved looks broken.
//
// This is what the customer asked for, never a booking. Nothing copies it
// into the schedule.

export const TIMELINE_OPTIONS = [
  { value: 'asap', label: 'ASAP' },
  { value: 'week', label: 'Within a week' },
  { value: 'month', label: 'Within a month' },
  { value: 'flexible', label: 'Just getting prices' },
] as const;

export const BEST_TIME_OPTIONS = [
  { value: 'weekday_mornings', label: 'Weekday mornings' },
  { value: 'weekday_afternoons', label: 'Weekday afternoons' },
  { value: 'evenings', label: 'Evenings' },
  { value: 'weekends', label: 'Weekends' },
] as const;

const TIMELINE_VALUES: readonly string[] = TIMELINE_OPTIONS.map((o) => o.value);
const BEST_TIME_VALUES: readonly string[] = BEST_TIME_OPTIONS.map((o) => o.value);

const LEGACY_DATE_RE = /^\d{4}-\d{2}-\d{2}/;
const LEGACY_TIME_RE = /^\d{1,2}:\d{2}/;

/** Server-side: keep only a known "how soon" value. */
export function cleanTimeline(v: unknown): string | null {
  return typeof v === 'string' && TIMELINE_VALUES.includes(v) ? v : null;
}

/** Server-side: keep only known best-time values, in a fixed order, as a comma list. */
export function cleanBestTimes(v: unknown): string | null {
  const parts = Array.isArray(v) ? v : typeof v === 'string' ? v.split(',') : [];
  const set = new Set(parts.map((p) => String(p).trim()));
  const kept = BEST_TIME_VALUES.filter((x) => set.has(x));
  return kept.length ? kept.join(',') : null;
}

/** Form helper: the selected best-time values as an array. */
export function bestTimesArray(v: string | null | undefined): string[] {
  if (!v) return [];
  const set = new Set(v.split(',').map((s) => s.trim()));
  return BEST_TIME_VALUES.filter((x) => set.has(x));
}

/** Form helper: toggle one best-time value in the comma list. */
export function toggleBestTime(current: string | null | undefined, value: string): string {
  const set = new Set(bestTimesArray(current));
  if (set.has(value)) set.delete(value);
  else set.add(value);
  return BEST_TIME_VALUES.filter((x) => set.has(x)).join(',');
}

/** "ASAP", "Within a week"… or, for an old lead, "Requested Oct 7, 2026". */
export function timelineLabel(v: unknown): string | null {
  if (v === null || v === undefined || v === '') return null;
  const s = v instanceof Date ? v.toISOString() : String(v);
  const opt = TIMELINE_OPTIONS.find((o) => o.value === s);
  if (opt) return opt.label;
  const m = LEGACY_DATE_RE.exec(s);
  if (m) {
    const [y, mo, d] = s.slice(0, 10).split('-').map(Number);
    const date = new Date(Date.UTC(y, mo - 1, d));
    return `Requested ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}`;
  }
  return null;
}

/** "Weekday mornings, Evenings"… or, for an old lead, "2:00 PM". */
export function bestTimesLabel(v: unknown): string | null {
  if (v === null || v === undefined || v === '') return null;
  const s = String(v);
  if (LEGACY_TIME_RE.test(s)) {
    const [h, m] = s.split(':').map(Number);
    if (Number.isFinite(h) && Number.isFinite(m)) {
      return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
    }
    return s;
  }
  const labels = bestTimesArray(s).map((x) => BEST_TIME_OPTIONS.find((o) => o.value === x)!.label);
  return labels.length ? labels.join(', ') : null;
}

/** One line for cards, emails and CSV: "ASAP · Weekday mornings, Evenings". */
export function timingSummary(preferredDate: unknown, preferredTime: unknown): string | null {
  const parts = [timelineLabel(preferredDate), bestTimesLabel(preferredTime)].filter(Boolean);
  return parts.length ? parts.join(' · ') : null;
}