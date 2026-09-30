import { NextResponse } from 'next/server';
import { adminDb as sql } from '@/lib/db';
import { autoAdvanceStatus, logAutoMove } from '@/lib/statusAutomation';

// Runs once a day (see vercel.json). Moves every job whose scheduled date
// has arrived from Scheduled → In Progress.
//
// Timing: scheduled for 10:00 UTC. At that moment it is already the same
// calendar day in every US time zone (6am Eastern … midnight Hawaii), so
// "today" is the same date for every US company — no per-company time
// zone needed.
//
// Safety comes from autoAdvanceStatus: it never moves a job backwards,
// never touches Completed/Cancelled/Lost, and skips companies that
// deleted the In Progress stage.

export const maxDuration = 60;

export async function GET(request: Request) {
  // Vercel sends this header on cron calls; blocks anyone else hitting the URL.
  const auth = request.headers.get('authorization');
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Today's date in US Eastern — the same calendar date as every other US
  // zone at the time this runs. Includes past dates too, so a missed run
  // (or a job scheduled while the cron was down) still gets caught.
  const due = await sql`
    SELECT l.id
    FROM leads l
    LEFT JOIN projects p ON p.lead_id = l.id
    WHERE l.status = 'scheduled'
      AND l.deleted = false
      AND COALESCE(p.scheduled_date, l.scheduled_date) IS NOT NULL
      AND COALESCE(p.scheduled_date, l.scheduled_date)::date
          <= (NOW() AT TIME ZONE 'America/New_York')::date
  `;

  let moved = 0;
  for (const row of due) {
        const result = await autoAdvanceStatus(sql, row.id, 'job_started');
    if (result) {
      moved++;
      await logAutoMove(sql, row.id, `Moved to ${result} automatically — scheduled date arrived`);
    }
  }

  console.log(`start-scheduled-jobs: ${moved} of ${due.length} due jobs moved to In Progress`);
  return NextResponse.json({ success: true, checked: due.length, moved });
}