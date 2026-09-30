import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { listNotices, createNotice } from '@/server/services/noticeService';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    const notices = await listNotices({ category, search });
    return NextResponse.json({ notices });
  } catch (error) {
    console.error('Notices GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch notices' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin role required' }, { status: 403 });
    }

    const { title, content, category, targetRole, department, isImportant } = await request.json();

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const notice = await createNotice(
      { title, content, category, targetRole, department, isImportant },
      { id: user.id, name: user.name, role: user.role }
    );

    return NextResponse.json({ success: true, notice });
  } catch (error) {
    console.error('Notices POST error:', error);
    return NextResponse.json({ error: 'Failed to create notice' }, { status: 500 });
  }
}
