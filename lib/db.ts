import { neon } from '@neondatabase/serverless';

/**
 * RLS-enforced DB client — use for all authenticated app routes.
 * Sets app.company_id so Postgres RLS policies filter rows automatically.
 */
export async function getDb(companyId: number) {
  const sql = neon(process.env.DATABASE_URL!);
  await sql`SELECT set_config('app.company_id', ${companyId.toString()}, true)`;
  return sql;
}

/**
 * Admin/bypass DB client — use for:
 *   - Cron jobs (cross-company queries)
 *   - Stripe webhooks (no session)
 *   - Auth routes (login, signup, forgot-password, etc.)
 *   - Public routes (lead form, quote respond, company info)
 *   - Super-admin routes
 *
 * Once you create a dedicated Neon role that bypasses RLS,
 * swap DATABASE_ADMIN_URL in here. Until then it uses the same URL
 * and works fine since RLS isn't enabled yet.
 */
export const adminDb = neon(process.env.DATABASE_ADMIN_URL || process.env.DATABASE_URL!);