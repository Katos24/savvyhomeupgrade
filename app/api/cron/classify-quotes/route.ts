import { NextRequest, NextResponse } from 'next/server';
import { adminDb as sql } from '@/lib/db';

export async function GET(request: NextRequest) {
      try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find projects with unclassified quote line items
    const projects = await sql`
      SELECT p.id, p.quote_data 
FROM projects p
JOIN leads l ON p.lead_id = l.id
JOIN companies c ON l.company_id = c.id
WHERE p.quote_data IS NOT NULL
  AND p.quote_data != '[]'::jsonb
  AND p.quote_data::text NOT LIKE '%"type"%'
  AND c.plan_tier IN ('basic', 'pro')
LIMIT 5
    `;

    if (projects.length === 0) {
      return NextResponse.json({ success: true, classified: 0 });
    }

    let totalClassified = 0;

    for (const project of projects) {
      try {
        let lineItems: any[] = [];
        try {
          lineItems = typeof project.quote_data === 'string'
            ? JSON.parse(project.quote_data)
            : project.quote_data;
        } catch {
          continue;
        }

        const unclassified = lineItems.filter((item: any) => !item.type);
        if (unclassified.length === 0) continue;

        const descriptions = unclassified
          .map((item: any) => `${item.id}: ${item.description}`)
          .join('\n');

        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.ANTHROPIC_API_KEY!,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 200,
            messages: [{
              role: 'user',
content: `You are a senior QuickBooks bookkeeper. Map these contractor quote line items to QBO Chart of Accounts. Use 'Services' for labor, 'Job Supplies' for materials. If ambiguous use 'REVIEW_REQUIRED'.\n\nRespond with ONLY valid JSON, no markdown.\nFormat: {"id": {"type": "labor", "qbo_account": "Services"}}\n\nLine items:\n${descriptions}`
            }]
          })
        });

        const data = await response.json();
        const raw = data.content?.[0]?.text?.trim() || '{}';
const jsonMatch = raw.match(/\{[\s\S]*\}/);
const typeMap = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

        const classifiedItems = lineItems.map((item: any) => {
  if (item.type && item.qbo_account) return item;
  const classification = typeMap[item.id.toString()];
  if (!classification) return { ...item, type: 'other' };
  return {
    ...item,
    type: classification.type || 'other',
    qbo_account: classification.qbo_account || '',
  };
});

        await sql`
          UPDATE projects
          SET quote_data = ${JSON.stringify(classifiedItems)},
              updated_at = NOW()
          WHERE id = ${project.id}
        `;

        totalClassified++;
      } catch (err) {
        console.error(`Failed to classify project ${project.id}:`, err);
        continue;
      }
    }

    return NextResponse.json({ success: true, classified: totalClassified });

  } catch (error) {
    console.error('Classify quotes cron error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';