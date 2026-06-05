import { neon } from '@neondatabase/serverless';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function GET(request: NextRequest, { params }: Props) {
  try {
   const { slug } = await params;

    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try { jwt.verify(token, process.env.JWT_SECRET!); }
    catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }

    const searchParams = request.nextUrl.searchParams;
    const range = searchParams.get('range') || '30d';

    const sql = neon(process.env.DATABASE_URL!);

    // Get company ID
    const companies = await sql`
      SELECT id FROM companies WHERE slug = ${slug}
    `;

    if (companies.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Company not found' },
        { status: 404 }
      );
    }

    const companyId = companies[0].id;

    // Calculate date range
    const now = new Date();
    const daysAgo = range === '7d' ? 7 : range === '30d' ? 30 : 90;
    const startDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    // Get all projects
    const projects = await sql`
      SELECT 
        l.id,
        l.status,
        l.category,
        l.created_at,
        l.lead_source,
        p.assigned_to,
        p.scheduled_date
      FROM leads l
      LEFT JOIN projects p ON l.id = p.lead_id
      WHERE l.company_id = ${companyId}
      AND l.deleted = false
      ORDER BY l.created_at DESC
    `;

    // Total projects
    const totalProjects = projects.length;

    // Active projects (not completed/cancelled)
    const activeProjects = projects.filter(
      (p: any) => p.status !== 'completed' && p.status !== 'cancelled'
    ).length;

    // Completed this month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const completedThisMonth = projects.filter(
      (p: any) => p.status === 'completed' && new Date(p.created_at) >= startOfMonth
    ).length;

    // Status breakdown
    const statusCounts: Record<string, number> = {};
    projects.forEach((p: any) => {
      const status = p.status || 'new';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    const statusBreakdown = Object.entries(statusCounts).map(([name, value], index) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color: ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'][index % 6]
    }));

   // Projects over time (last N days)
const projectsOverTime = [];
for (let i = daysAgo - 1; i >= 0; i--) {
  const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
  const dateStr = date.toISOString().split('T')[0];
  const count = projects.filter((p: any) => {
    const createdAt = new Date(p.created_at);
    const createdStr = createdAt.toISOString().split('T')[0];
    return createdStr === dateStr;
  }).length;
  projectsOverTime.push({
    date: `${date.getMonth() + 1}/${date.getDate()}`,
    count
  });
}

    // Top categories
    const categoryCounts: Record<string, number> = {};
    projects.forEach((p: any) => {
      if (p.category) {
        categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
      }
    });

    const topCategories = Object.entries(categoryCounts)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Team performance
    const teamCounts: Record<string, number> = {};
    projects.forEach((p: any) => {
      if (p.assigned_to) {
        teamCounts[p.assigned_to] = (teamCounts[p.assigned_to] || 0) + 1;
      }
    });

    const teamPerformance = Object.entries(teamCounts)
      .map(([member, count]) => ({ member, count }))
      .sort((a, b) => b.count - a.count);

    // Lead sources
    const sourceCounts: Record<string, number> = {};
    projects.forEach((p: any) => {
      if (p.lead_source) {
        sourceCounts[p.lead_source] = (sourceCounts[p.lead_source] || 0) + 1;
      }
    });

    const leadSources = Object.entries(sourceCounts)
      .map(([source, value]) => ({ source, value }))
      .sort((a, b) => b.value - a.value);

    return NextResponse.json({
      success: true,
      data: {
        totalProjects,
        activeProjects,
        completedThisMonth,
        statusBreakdown,
        projectsOverTime,
        topCategories,
        teamPerformance,
        leadSources
      }
    });

  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
