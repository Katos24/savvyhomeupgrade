import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// One query, one place. Every page.tsx that needs `company` should call this
// instead of writing its own SELECT with its own column list — that's the
// exact pattern that silently broke Google Reviews and the Booking Form
// this session: two different pages each picked a different subset of
// columns, and each subset quietly went stale as the schema grew.
//
// Trade-off, stated plainly: this pulls every column on every call, even
// columns a given page doesn't use. For a single `companies` row per
// request, that's very unlikely to matter — but I haven't seen your table's
// full column count or any large/blob columns on it, so I can't promise
// that with certainty. If `companies` ever grows a heavy column (large
// JSON blobs, long text fields you don't paginate), revisit this.
export async function getCompanyBySlug(slug: string) {
  const rows = await sql`SELECT * FROM companies WHERE slug = ${slug} LIMIT 1`;
  return rows[0] ?? null;
}

// Convenience wrapper for the common "get row or trigger notFound()" shape.
// Returns null so callers keep control of how they handle "not found"
// (some of your pages call notFound(), Settings calls redirect() — that
// policy difference stays in each page, only the query itself is shared).
export async function getCompanyByIdOrSlug(idOrSlug: string | number) {
  if (typeof idOrSlug === 'number') {
    const rows = await sql`SELECT * FROM companies WHERE id = ${idOrSlug} LIMIT 1`;
    return rows[0] ?? null;
  }
  return getCompanyBySlug(idOrSlug);
}