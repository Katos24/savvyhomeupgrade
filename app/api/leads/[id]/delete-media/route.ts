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

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    jwt.verify(token, process.env.JWT_SECRET!)

    const sql = neon(process.env.DATABASE_URL!)

    const lead = await sql`
      SELECT before_photos, after_photos, documents
      FROM leads
      WHERE id = ${id}
    `

    if (lead.length === 0) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    const parse = (val: any) => {
      if (!val) return []
      if (typeof val === 'string') return JSON.parse(val)
      return val
    }

    let before = parse(lead[0].before_photos)
    let after = parse(lead[0].after_photos)
    let documents = parse(lead[0].documents)

    // PHOTO DELETE
    if (body.photoUrl) {
      before = before.filter((p: any) => (typeof p === 'string' ? p : p.url) !== body.photoUrl)
      after = after.filter((p: any) => (typeof p === 'string' ? p : p.url) !== body.photoUrl)
    }

    // DOCUMENT DELETE
    if (body.type === 'document' && typeof body.index === 'number') {
      documents.splice(body.index, 1)
    }

    await sql`
      UPDATE leads
      SET
        before_photos = ${JSON.stringify(before)},
        after_photos = ${JSON.stringify(after)},
        documents = ${JSON.stringify(documents)}
      WHERE id = ${id}
    `

    return NextResponse.json({
      success: true,
      before,
      after,
      documents
    })

  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}