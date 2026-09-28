import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { del } from '@vercel/blob';
import { getJwtSecret } from '@/lib/auth';

const parse = (val: any): any[] => {
  if (!val) return [];
  if (typeof val === 'string') { try { return JSON.parse(val); } catch { return []; } }
  return Array.isArray(val) ? val : [];
};
const urlOf = (x: any): string | undefined => (typeof x === 'string' ? x : x?.url);

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const leadId = parseInt(id, 10);
    if (Number.isNaN(leadId)) return NextResponse.json({ success: false, error: 'Bad lead id' }, { status: 400 });

    const token = (await cookies()).get('auth-token')?.value;
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    let decoded: any;
    try { decoded = jwt.verify(token, getJwtSecret()); }
    catch { return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 }); }

    const body = await request.json();
    const sql = neon(process.env.DATABASE_URL!);

    const rows = await sql`
      SELECT l.company_id, l.before_photos AS l_before, l.after_photos AS l_after, l.file_urls,
             p.id AS project_id, p.before_photos AS p_before, p.after_photos AS p_after, p.documents
      FROM leads l
      LEFT JOIN projects p ON p.lead_id = l.id
      WHERE l.id = ${leadId}
      LIMIT 1
    `;
    if (!rows.length) return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 });
    const row = rows[0];
    if (row.company_id !== decoded.companyId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    let lBefore = parse(row.l_before);
    let lAfter = parse(row.l_after);
    let pBefore = parse(row.p_before);
    let pAfter = parse(row.p_after);
    let documents = parse(row.documents);
    let fileUrls = parse(row.file_urls);

    // Every blob URL (full size + thumbnail) that should be removed from storage.
    const removed: (string | undefined)[] = [];
    const dropFrom = (list: any[], url: string) => {
      list.filter((x) => urlOf(x) === url).forEach((x) => {
        removed.push(urlOf(x));
        if (typeof x === 'object') removed.push(x.thumbnail);
      });
      return list.filter((x) => urlOf(x) !== url);
    };

    if (body.photoUrl) {
      lBefore = dropFrom(lBefore, body.photoUrl);
      lAfter = dropFrom(lAfter, body.photoUrl);
      pBefore = dropFrom(pBefore, body.photoUrl);
      pAfter = dropFrom(pAfter, body.photoUrl);
    }
    if (body.docUrl) {
      documents = dropFrom(documents, body.docUrl);
    } else if (body.type === 'document' && typeof body.index === 'number' && documents[body.index]) {
      documents = dropFrom(documents, urlOf(documents[body.index])!);
    }
    if (body.customerFileUrl) {
      fileUrls = dropFrom(fileUrls, body.customerFileUrl);
    }

    // Nothing matched: say so instead of reporting a fake success.
    if (removed.filter(Boolean).length === 0) {
      return NextResponse.json({ success: false, error: 'File not found' }, { status: 404 });
    }

    await sql`
      UPDATE leads
      SET before_photos = ${JSON.stringify(lBefore)},
          after_photos = ${JSON.stringify(lAfter)},
          file_urls = ${JSON.stringify(fileUrls)},
          updated_at = NOW()
      WHERE id = ${leadId}
    `;

    if (row.project_id) {
      await sql`
        UPDATE projects
        SET before_photos = ${JSON.stringify(pBefore)},
            after_photos = ${JSON.stringify(pAfter)},
            documents = ${JSON.stringify(documents)},
            notes = COALESCE(notes, '[]'::jsonb) || ${JSON.stringify([{
              type: 'media_deleted',
              text: 'A file was deleted',
              user_name: body.user_name || 'User',
              timestamp: new Date().toISOString(),
            }])}::jsonb,
            updated_at = NOW()
        WHERE id = ${row.project_id}
      `;
    }

    // Storage cleanup last, and non-fatal: the record is already gone.
    const blobUrls = removed.filter((u): u is string => !!u && u.includes('blob.vercel-storage.com'));
    if (blobUrls.length) {
      try { await del(blobUrls); } catch (e) { console.error('blob delete failed:', e); }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('delete-media error:', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}