import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: 'project_id is required' },
        { status: 400 }
      );
    }

    const sql = neon(process.env.DATABASE_URL!);

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
      WHERE project_id = ${projectId}
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
    const body = await request.json();
    const { action } = body;

    const sql = neon(process.env.DATABASE_URL!);

    // ==================== CREATE TASK ====================
    if (action === 'create') {
      const { project_id, company_id, label, task_order } = body;

      if (!project_id || !company_id || !label) {
        return NextResponse.json(
          { success: false, error: 'Missing required fields' },
          { status: 400 }
        );
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
          ${company_id},
          ${label},
          false,
          ${task_order || 0},
          NOW()
        )
        RETURNING *
      `;

      console.log('✅ Task created:', task.id);
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
        WHERE id = ${task_id}
      `;

      console.log('✅ Task toggled:', task_id, completed);
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
        WHERE id = ${task_id}
      `;

      console.log('✅ Task updated:', task_id);
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
        WHERE id = ${task_id}
      `;

      console.log('✅ Task deleted:', task_id);
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