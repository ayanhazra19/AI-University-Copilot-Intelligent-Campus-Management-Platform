import { NextResponse } from 'next/server';
import { authenticateWithPassword } from '@/server/services/authService';

export async function POST(request: Request) {
  try {
    const { email, password, requiredRole } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const result = await authenticateWithPassword(email, password, requiredRole);

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
