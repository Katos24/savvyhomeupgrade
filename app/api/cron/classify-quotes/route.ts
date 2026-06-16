import { NextRequest, NextResponse } from 'next/server';
import { adminDb as sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('classify-quotes cron started');

    // Find projects with unclassified quote line items — basic/pro only
    const projects = await sql`
      SELECT p.id, p.quote_data 
      FROM projects p
      JOIN leads l ON p.lead_id = l.id
      JOIN companies c ON l.company_id = c.id
      WHERE p.quote_data IS NOT NULL
        AND p.quote_data != '[]'::jsonb
        AND EXISTS (
          SELECT 1 FROM jsonb_array_elements(p.quote_data) item
          WHERE (item->>'type') IS NULL
        )
        AND c.plan_tier IN ('basic', 'pro')
      LIMIT 20
    `;

    if (projects.length === 0) {
      console.log('No unclassified projects found');
      return NextResponse.json({ success: true, classified: 0 });
    }

    console.log(`Found ${projects.length} projects to classify`);
    let totalClassified = 0;

    for (const project of projects) {
      try {
        // Parse line items
        let lineItems: any[] = [];
        try {
          lineItems = typeof project.quote_data === 'string'
            ? JSON.parse(project.quote_data)
            : project.quote_data;
        } catch {
          console.error(`Failed to parse quote_data for project ${project.id}`);
          continue;
        }

        // Only process items missing type AND with valid description
        const unclassified = lineItems.filter((item: any) =>
          !item.type && item.description && item.description.trim()
        );

        if (unclassified.length === 0) continue;

        // Sanitize descriptions before sending to AI
        const descriptions = unclassified
          .map((item: any) => `${item.id}: ${item.description.replace(/[^\w\s,.-]/g, ' ').trim()}`)
          .join('\n');

        // Call Anthropic API
        let apiResponse;
        try {
          apiResponse = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': process.env.ANTHROPIC_API_KEY!,
              'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
              model: 'claude-haiku-4-5-20251001',
              max_tokens: 500,
              messages: [{
                role: 'user',
                content: `You are a senior QuickBooks bookkeeper. Map these contractor quote line items to QBO Chart of Accounts. Use 'Services' for labor, 'Job Supplies' for materials. If ambiguous use 'REVIEW_REQUIRED'.\n\nRespond with ONLY valid JSON, no markdown.\nFormat: {"id": {"type": "labor", "qbo_account": "Services"}}\n\nLine items:\n${descriptions}`
              }]
            })
          });
        } catch (fetchErr) {
          console.error(`Fetch failed for project ${project.id}:`, fetchErr);
          continue;
        }

        if (!apiResponse.ok) {
          console.error(`API error for project ${project.id}: ${apiResponse.status}`);
          continue;
        }

        const data = await apiResponse.json();

        if (!data.content?.[0]?.text) {
          console.error(`Empty API response for project ${project.id}`);
          continue;
        }

        const raw = data.content[0].text.trim();

        // Extract and parse JSON safely
        let typeMap: any = {};
        try {
          const jsonMatch = raw.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const sanitized = jsonMatch[0]
              .replace(/[\u0000-\u001F\u007F]/g, ' ')
              .replace(/\n/g, ' ')
              .replace(/\r/g, ' ')
              .replace(/\t/g, ' ');
            typeMap = JSON.parse(sanitized);
          }
        } catch (parseErr) {
          console.error(`JSON parse failed for project ${project.id}:`, raw.slice(0, 200));
          continue;
        }

        // Apply classifications to line items
        const classifiedItems = lineItems.map((item: any) => {
          if (item.type && item.qbo_account) return item;
          const classification = typeMap[item.id.toString()];
          if (!classification) return { ...item, type: 'other', qbo_account: 'REVIEW_REQUIRED' };
          return {
            ...item,
            type: classification.type || 'other',
            qbo_account: classification.qbo_account || 'REVIEW_REQUIRED',
          };
        });

        // Save back to database
        try {
          await sql`
            UPDATE projects
            SET quote_data = ${JSON.stringify(classifiedItems)},
                updated_at = NOW()
            WHERE id = ${project.id}
          `;
          totalClassified++;
          console.log(`Classified project ${project.id} — ${unclassified.length} items`);
        } catch (dbErr) {
          console.error(`DB update failed for project ${project.id}:`, dbErr);
          continue;
        }

      } catch (err) {
        console.error(`Unexpected error for project ${project.id}:`, err);
        continue;
      }
    }

    console.log(`classify-quotes cron done — ${totalClassified} projects classified`);
    return NextResponse.json({ success: true, classified: totalClassified });

  } catch (error) {
    console.error('Classify quotes cron error:', error);
    return NextResponse.json({ error: 'Failed', details: String(error) }, { status: 500 });
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';