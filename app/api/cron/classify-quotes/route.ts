import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: Request) {
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
LIMIT 50
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
              content: `Classify each contractor quote line item into one of: labor, materials, service, subcontractor, equipment, permit, other.\n\nRespond with ONLY a JSON object mapping each ID to its category. Example: {"123": "labor", "456": "materials"}\n\nLine items:\n${descriptions}`
            }]
          })
        });

        const data = await response.json();
        const raw = data.content?.[0]?.text?.trim() || '{}';
        const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const typeMap = JSON.parse(cleaned);

        const classifiedItems = lineItems.map((item: any) => {
          if (item.type) return item;
          const type = typeMap[item.id.toString()] || 'other';
          return { ...item, type };
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

export const dynamic = 'force-dynamic';