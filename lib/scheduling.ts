// Canonical per-assignee scheduling-conflict logic. This exact overlap
// formula was independently written twice before this file existed —
// once server-side in leads/update/route.ts's update_project conflict
// check, once client-side in SchedulingCalendarModal.tsx's local
// getConflict(). Both were correct, but two copies of the same math is
// exactly the pattern that let the deposit bugs drift out of sync earlier
// this session. This is the one place it should live going forward.

export type ExistingBooking = {
  assignees: string[];
  scheduled_time: string; // "HH:MM", 24h
  scheduled_end_time: string | null;
  project_id?: number;
  customer_name?: string;
  category?: string;
};

export function toMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

/** True if [newStart, newEnd] conflicts with [existingStart, existingEnd]
 *  once bufferMinutes padding applies on both sides. Inclusive (<=/>=) so
 *  an exact-time duplicate with no end time (a single point) still
 *  registers — strict </> never fires when two points are exactly equal. */
export function rangesConflict(
  newStart: number,
  newEnd: number,
  existingStart: number,
  existingEnd: number,
  bufferMinutes: number
): boolean {
  return newStart <= existingEnd + bufferMinutes && newEnd + bufferMinutes >= existingStart;
}

/** The first existing booking (if any) that both shares this assignee AND
 *  conflicts in time. Null means genuinely free. */
export function findAssigneeConflict(
  name: string,
  newStart: number,
  newEnd: number,
  bookings: ExistingBooking[],
  bufferMinutes: number
): ExistingBooking | null {
  for (const booking of bookings) {
    if (!booking.assignees.includes(name)) continue;
    const existingStart = toMinutes(booking.scheduled_time);
    const existingEnd = booking.scheduled_end_time ? toMinutes(booking.scheduled_end_time) : existingStart;
    if (rangesConflict(newStart, newEnd, existingStart, existingEnd, bufferMinutes)) {
      return booking;
    }
  }
  return null;
}

/** Availability for a whole candidate list at once — what a picker needs
 *  in a single call instead of one lookup per name. */
export function getAssigneeAvailability(
  candidateNames: string[],
  newStart: number,
  newEnd: number,
  bookings: ExistingBooking[],
  bufferMinutes: number
): Record<string, { available: boolean; conflict: ExistingBooking | null }> {
  const result: Record<string, { available: boolean; conflict: ExistingBooking | null }> = {};
  for (const name of candidateNames) {
    const conflict = findAssigneeConflict(name, newStart, newEnd, bookings, bufferMinutes);
    result[name] = { available: !conflict, conflict };
  }
  return result;
}