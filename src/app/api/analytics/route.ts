import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getCampusAnalyticsOverview, askCampusAnalytics } from '@/server/services/analyticsService';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }
    if (user.role !== 'ADMIN' && user.role !== 'FACULTY') {
      return NextResponse.json({ error: 'Forbidden: Faculty or Admin access required' }, { status: 403 });
    }

    const data = await getCampusAnalyticsOverview();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Analytics GET error:', error);
    return NextResponse.json({ error: 'Failed to compute campus analytics' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }
    if (user.role !== 'ADMIN' && user.role !== 'FACULTY') {
      return NextResponse.json({ error: 'Forbidden: Faculty or Admin access required' }, { status: 403 });
    }

    const { question } = await request.json();
    if (!question || typeof question !== 'string') {
      return NextResponse.json({ error: 'Question text is required' }, { status: 400 });
    }

    const result = await askCampusAnalytics(question);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Analytics NL POST error:', error);
    return NextResponse.json({ error: 'Failed to process natural language analytics query' }, { status: 500 });
  }
}
