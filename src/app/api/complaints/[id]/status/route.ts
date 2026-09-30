import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { updateComplaintStatus } from '@/server/services/complaintService';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status, note, assignedTo, resolutionNote } = await request.json();

    const updated = await updateComplaintStatus(
      id,
      { status, note, assignedTo, resolutionNote },
      { id: user.id, name: user.name, role: user.role, department: user.department }
    );

    return NextResponse.json({ success: true, complaint: updated });
  } catch (error: any) {
    console.error('Complaint status update error:', error);
    const status = error.statusCode || (error.message === 'Complaint not found' ? 404 : 500);
    return NextResponse.json({ error: error.message || 'Failed to update complaint status' }, { status });
  }
}
