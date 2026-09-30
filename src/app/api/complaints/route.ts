import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { listComplaints, createComplaint } from '@/server/services/complaintService';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const category = searchParams.get('category');
    const studentOnly = searchParams.get('studentOnly');

    const user = await getCurrentUser();
    let studentId: string | undefined = undefined;

    if (user?.role === 'STUDENT' || studentOnly === 'true') {
      if (user?.student?.id) {
        studentId = user.student.id;
      }
    }

    const result = await listComplaints({
      department,
      status,
      priority,
      category,
      studentId,
    });

    return NextResponse.json(result);
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
