import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { getJwtSecret } from '@/lib/auth';

// Reuse single connection across warm lambdas
const sql = neon(process.env.DATABASE_URL!);

/** Helper to authenticate the request and return user's company_id */
async function authenticateUser(): Promise<{ userId: string; companyId: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, getJwtSecret()) as { userId: string };
    const users = await sql`
      SELECT company_id FROM users WHERE id = ${decoded.userId} LIMIT 1
    `;
    if (!users.length) return null;
    return { userId: decoded.userId, companyId: users[0].company_id };
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const auth = await authenticateUser();
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: 'project_id is required' },
        { status: 400 }
      );
    }

    // Ensure project belongs to the user's company
    const projects = await sql`
      SELECT p.id FROM projects p
      JOIN leads l ON p.lead_id = l.id
      WHERE p.id = ${projectId} AND l.company_id = ${auth.companyId}
      LIMIT 1
    `;
    if (!projects.length) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
    }

    // Fetch all tasks for the project
    const tasks = await sql`
      SELECT 
        id,
        project_id,
        company_id,
        label,
        completed,
        task_order,
        completed_at,
        completed_by,
        created_at
      FROM tasks
      WHERE project_id = ${projectId} AND company_id = ${auth.companyId}
      ORDER BY task_order ASC, created_at ASC
    `;

    return NextResponse.json({
      success: true,
      tasks: tasks || []
    });

  } catch (error) {
    console.error('❌ GET tasks error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const auth = await authenticateUser();
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    // ==================== CREATE TASK ====================
    if (action === 'create') {
      const { project_id, label, task_order } = body;

      if (!project_id || !label) {
        return NextResponse.json(
          { success: false, error: 'Missing required fields' },
          { status: 400 }
        );
      }

      // Verify project ownership
      const projects = await sql`
        SELECT p.id FROM projects p
        JOIN leads l ON p.lead_id = l.id
        WHERE p.id = ${project_id} AND l.company_id = ${auth.companyId}
        LIMIT 1
      `;
      if (!projects.length) {
        return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
      }

      const [task] = await sql`
        INSERT INTO tasks (
          project_id,
          company_id,
          label,
          completed,
          task_order,
          created_at
        ) VALUES (
          ${project_id},
          ${auth.companyId},
          ${label},
          false,
          ${task_order || 0},
          NOW()
        )
        RETURNING *
      `;

      return NextResponse.json({ success: true, task });
    }

    // ==================== TOGGLE COMPLETE ====================
    else if (action === 'toggle') {
      const { task_id, completed, completed_by } = body;

      if (task_id === undefined) {
        return NextResponse.json(
          { success: false, error: 'task_id is required' },
          { status: 400 }
        );
      }

      const completedAt = completed ? new Date().toISOString() : null;

      await sql`
        UPDATE tasks
        SET 
          completed = ${completed},
          completed_at = ${completedAt},
          completed_by = ${completed_by || null},
          updated_at = NOW()
        WHERE id = ${task_id} AND company_id = ${auth.companyId}
      `;

      return NextResponse.json({ success: true });
    }

    // ==================== UPDATE TASK ====================
    else if (action === 'update') {
      const { task_id, label } = body;

      if (!task_id || !label) {
        return NextResponse.json(
          { success: false, error: 'task_id and label are required' },
          { status: 400 }
        );
      }

      await sql`
        UPDATE tasks
        SET 
          label = ${label},
          updated_at = NOW()
        WHERE id = ${task_id} AND company_id = ${auth.companyId}
      `;

      return NextResponse.json({ success: true });
    }

    // ==================== DELETE TASK ====================
    else if (action === 'delete') {
      const { task_id } = body;

      if (!task_id) {
        return NextResponse.json(
          { success: false, error: 'task_id is required' },
          { status: 400 }
        );
      }

      await sql`
        DELETE FROM tasks
        WHERE id = ${task_id} AND company_id = ${auth.companyId}
      `;

      return NextResponse.json({ success: true });
    }

    // ==================== UNKNOWN ACTION ====================
    else {
      return NextResponse.json(
        { success: false, error: 'Invalid action' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('❌ POST tasks error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update task' },
      { status: 500 }
    );
  }
}