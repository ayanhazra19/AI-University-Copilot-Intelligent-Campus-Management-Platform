import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getStudentAcademicProfile } from '@/server/services/academicService';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await getStudentAcademicProfile(user.id);
    if (!data) {
      return NextResponse.json({ error: 'No student profile found' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Academics API error:', error);
    return NextResponse.json({ error: 'Failed to fetch academic details' }, { status: 500 });
  }
}
