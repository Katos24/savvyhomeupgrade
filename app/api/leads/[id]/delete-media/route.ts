import { neon } from '@neondatabase/serverless'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const { id } = await params

    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    jwt.verify(token, process.env.JWT_SECRET!)

    const sql = neon(process.env.DATABASE_URL!)

    // Fetch photos from leads, documents from projects
    const rows = await sql`
      SELECT 
        l.before_photos,
        l.after_photos,
        p.documents,
        p.id as project_id
      FROM leads l
      LEFT JOIN projects p ON l.id = p.lead_id
      WHERE l.id = ${id}
    `

    if (rows.length === 0) return NextResponse.json({ error: 'Lead not found' }, { status: 404 })

    const parse = (val: any) => {
      if (!val) return []
      if (typeof val === 'string') { try { return JSON.parse(val) } catch { return [] } }
      return val
    }

    let before = parse(rows[0].before_photos)
    let after = parse(rows[0].after_photos)
    let documents = parse(rows[0].documents)
    const projectId = rows[0].project_id

    // PHOTO DELETE
    if (body.photoUrl) {
      before = before.filter((p: any) => (typeof p === 'string' ? p : p.url) !== body.photoUrl)
      after = after.filter((p: any) => (typeof p === 'string' ? p : p.url) !== body.photoUrl)
    }

    // DOCUMENT DELETE
    if (body.type === 'document' && typeof body.index === 'number') {
      documents.splice(body.index, 1)
    }

    // Always update photos on leads
    await sql`
      UPDATE leads
      SET
        before_photos = ${JSON.stringify(before)},
        after_photos = ${JSON.stringify(after)}
      WHERE id = ${id}
    `

    // Update documents on projects if project exists
    if (projectId) {
      await sql`
        UPDATE projects
        SET documents = ${JSON.stringify(documents)}
        WHERE id = ${projectId}
      `
    }

    return NextResponse.json({ success: true, before, after, documents })

  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}