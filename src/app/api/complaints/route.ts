import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { listComplaints, createComplaint } from '@/server/services/complaintService';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const category = searchParams.get('category');
    const studentOnly = searchParams.get('studentOnly');

    // 1. Student RBAC: strictly restricted to their own submitted complaints
    if (user.role === 'STUDENT') {
      const studentId = user.student?.id;
      if (!studentId) {
        return NextResponse.json({ complaints: [], categories: [] });
      }

      const result = await listComplaints({
        status,
        priority,
        category,
        studentId,
      });

      return NextResponse.json(result);
    }

    // 2. Faculty RBAC: restricted to academic / course / departmental scope
    if (user.role === 'FACULTY') {
      const allowedDepartments = ['Academic Affairs', 'Examination Cell'];
      if (user.department) allowedDepartments.push(user.department);

      let targetDepartment: string | string[] = allowedDepartments;
      if (department && department !== 'ALL') {
        if (allowedDepartments.includes(department)) {
          targetDepartment = department;
        } else {
          // Deny access to departments outside faculty purview
          return NextResponse.json({ complaints: [], categories: [] });
        }
      }

      const result = await listComplaints({
        department: targetDepartment,
        status,
        priority,
        category,
      });

      return NextResponse.json(result);
    }

    // 3. Admin RBAC: campus-wide complaint access
    if (user.role === 'ADMIN') {
      const result = await listComplaints({
        department,
        status,
        priority,
        category,
        studentId: studentOnly === 'true' && user.student?.id ? user.student.id : undefined,
      });

      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Forbidden: Unrecognized role' }, { status: 403 });
  } catch (error) {
    console.error('Complaints GET error:', error);
    return NextResponse.json({ error: 'Failed to retrieve complaints' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, location, category, subcategory, priority, department } = body;

    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
    }

    const result = await createComplaint(
      {
        title,
        description,
        location,
        category,
        subcategory,
        priority,
        department,
      },
      {
        id: user.id,
        name: user.name,
        role: user.role,
        studentId: user.student?.id,
      }
    );

    return NextResponse.json({
      success: true,
      complaint: result.complaint,
      classification: result.classification,
    });
  } catch (error) {
    console.error('Complaints POST error:', error);
    return NextResponse.json({ error: 'Failed to create complaint' }, { status: 500 });
  }
}
