import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { getSchedulingConfig } from '@/lib/schedulingConfig';

const sql = neon(process.env.DATABASE_URL!);

const TIME_SLOTS = [
  '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
  '19:00', '19:30', '20:00', '20:30', '21:00', '21:30',
  '22:00', '22:30', '23:00',
];

const toMinutes = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const url = new URL(request.url);
    const date = url.searchParams.get('date');
    const start = url.searchParams.get('start'); // optional — presence switches mode
    if (!date) {
      return NextResponse.json({ success: false, error: 'date is required' }, { status: 400 });
    }

    const companies = await sql`
      SELECT id, business_type, max_concurrent_bookings
      FROM companies
      WHERE slug = ${slug}
      LIMIT 1
    `;
    if (!companies.length) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }
    const company = companies[0];
    const maxConcurrent = company.max_concurrent_bookings || 1;
    const { bufferMinutes } = getSchedulingConfig(company.business_type);

    const bookings = await sql`
      SELECT scheduled_time, scheduled_end_time
      FROM projects
      WHERE company_id = ${company.id}
        AND scheduled_date::date = ${date}::date
        AND status != 'cancelled'
        AND scheduled_time IS NOT NULL
    `;

    // Count of existing bookings whose buffered range overlaps [rangeStart, rangeEnd].
    const conflictCount = (rangeStart: number, rangeEnd: number) =>
      bookings.filter((b: any) => {
        const existingStart = toMinutes(b.scheduled_time);
        const existingEnd = b.scheduled_end_time ? toMinutes(b.scheduled_end_time) : existingStart;
        return rangeStart < existingEnd + bufferMinutes && rangeEnd + bufferMinutes > existingStart;
      }).length;

    if (!start) {
      // Mode 1: which start times have room at all (treated as a point).
      const slots = TIME_SLOTS.map((time) => {
        const t = toMinutes(time);
        return { time, available: conflictCount(t, t) < maxConcurrent };
      });
      return NextResponse.json({ success: true, mode: 'start', slots, bufferMinutes, maxConcurrent });
    }

    // Mode 2: given a chosen start, which end times keep the WHOLE range clear.
    const startMin = toMinutes(start);
    const slots = TIME_SLOTS
      .filter((t) => t > start)
      .map((time) => {
        const endMin = toMinutes(time);
        return { time, available: conflictCount(startMin, endMin) < maxConcurrent };
      });

    return NextResponse.json({ success: true, mode: 'end', slots, bufferMinutes, maxConcurrent });
  } catch (error) {
    console.error('Availability error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch availability' }, { status: 500 });
  }
}