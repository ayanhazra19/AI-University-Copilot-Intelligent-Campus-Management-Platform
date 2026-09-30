import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { listUserNotifications, markNotificationsAsRead } from '@/server/services/notificationService';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ notifications: [], unreadCount: 0 });
    }

    const result = await listUserNotifications(user.id);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Notifications GET error:', error);
    return NextResponse.json({ notifications: [], unreadCount: 0 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    await markNotificationsAsRead(user.id, body.id, Boolean(body.all));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Notifications PUT error:', error);
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
  }
}
