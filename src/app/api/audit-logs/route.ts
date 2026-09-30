import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { listAuditLogs } from '@/server/services/auditService';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin role required' }, { status: 403 });
    }

    const logs = await listAuditLogs(50);
    return NextResponse.json({ logs });
  } catch (error) {
    console.error('Audit logs GET error:', error);
    return NextResponse.json({ error: 'Failed to retrieve audit logs' }, { status: 500 });
  }
}
