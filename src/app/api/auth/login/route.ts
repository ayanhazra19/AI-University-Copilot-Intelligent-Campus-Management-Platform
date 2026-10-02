import { NextResponse } from 'next/server';
import { authenticateWithPassword } from '@/server/services/authService';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const identifier = body.email || body.username || body.userId;
    const { password, requiredRole, disallowRole } = body;

    if (!identifier || !password) {
      return NextResponse.json({ error: 'User name / email and password are required' }, { status: 400 });
    }

    const result = await authenticateWithPassword(identifier, password, requiredRole, disallowRole);

    if (!result.success || !result.user || !result.token) {
      return NextResponse.json({ error: result.error }, { status: result.status || 401 });
    }

    const response = NextResponse.json({ user: result.user });
    response.cookies.set('campusiq_token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error during login' }, { status: 500 });
  }
}
