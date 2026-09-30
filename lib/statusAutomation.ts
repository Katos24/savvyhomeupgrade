import { DEFAULT_STATUSES } from '@/lib/formCategories';

export type AutoEvent = 'lead_converted' | 'quote_sent' | 'quote_accepted' | 'job_scheduled' | 'job_started';

const EVENT_TO_STAGE: Record<AutoEvent, string> = {
  lead_converted: 'active',
  quote_sent: 'quoted',
  quote_accepted: 'approved',
  job_scheduled: 'scheduled',
  job_started: 'in-progress',
};

/** Set by hand to end a job. Automation doesn't reopen these. */
const TERMINAL = ['completed', 'cancelled', 'lost'];

/**
 * Moves a lead forward when something real happens to the job.
 *
 * Hooked to state changes rather than user actions on purpose: a contractor
 * who marks a quote accepted by hand gets the same automation as one whose
 * customer clicked Accept in the email.
 *
 * Never throws — a status that didn't move is a nuisance, a failed quote
 * send is a real problem.
 */
export async function autoAdvanceStatus(
  sql: any,
  leadId: number,
  event: AutoEvent
): Promise<string | null> {
  try {
    const targetValue = EVENT_TO_STAGE[event];
    if (!targetValue) return null;

    const rows = await sql`
      SELECT l.status, c.status_options
      FROM leads l
      JOIN companies c ON l.company_id = c.id
      WHERE l.id = ${leadId}
      LIMIT 1
    `;
    const row = rows[0];
    if (!row) return null;

    // Neon returns jsonb as a parsed array in most paths but as a string in
    // some. Tolerating both is cheaper than debugging a silent no-op.
    let options: any[] = [];
    const raw = row.status_options;
    if (Array.isArray(raw)) {
      options = raw;
    } else if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) options = parsed;
      } catch {}
    }

 // Signup doesn't write status_options, so a company that has never
    // opened the pipeline settings has NULL here. Without this fallback the
    // app would show default stages while automation silently did nothing.
    if (options.length === 0) options = DEFAULT_STATUSES;

    const currentIndex = options.findIndex((s) => s.value === row.status);
    const targetIndex = options.findIndex((s) => s.value === targetValue);

    // The contractor removed this stage from their pipeline.
    if (targetIndex === -1) return null;
    // Unknown current status — don't guess where it sits in the order.
    if (currentIndex === -1) return null;
    // Already there or further along. Automation never walks a job backwards.
    if (targetIndex <= currentIndex) return null;
    if (TERMINAL.includes(row.status)) return null;

    await sql`UPDATE leads SET status = ${targetValue}, updated_at = NOW() WHERE id = ${leadId}`;
    await sql`UPDATE projects SET status = ${targetValue}, updated_at = NOW() WHERE lead_id = ${leadId}`;

    return options[targetIndex].label || targetValue;
  } catch (err) {
    console.error('autoAdvanceStatus failed:', err);
    return null;
  }
}


/**
 * Adds an entry to a job's Activity log (projects.notes), by lead id.
 * Same read-append-write as the payments route's addActivityToProject.
 * Never throws — a missing log line shouldn't fail the real action.
 */
export async function logAutoMove(sql: any, leadId: number, text: string): Promise<void> {
  try {
    const rows = await sql`SELECT id, notes FROM projects WHERE lead_id = ${leadId} LIMIT 1`;
    const project = rows[0];
    if (!project) return;

    let notes: any[] = [];
    const raw = project.notes;
    if (Array.isArray(raw)) notes = raw;
    else if (typeof raw === 'string' && raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) notes = parsed;
      } catch {}
    }

    notes.push({
      type: 'status_change',
      text,
      user_name: 'System',
      user_email: '',
      timestamp: new Date().toISOString(),
    });

    await sql`UPDATE projects SET notes = ${JSON.stringify(notes)}, updated_at = NOW() WHERE id = ${project.id}`;
  } catch (err) {
    console.error('logAutoMove failed:', err);
  }
}