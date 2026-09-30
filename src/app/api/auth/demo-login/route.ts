import { NextResponse } from 'next/server';
import { authenticateDemoPersona } from '@/server/services/authService';

export async function POST(request: Request) {
  try {
    const { role } = await request.json();
    const result = await authenticateDemoPersona(role);

    if (!result.success || !result.user || !result.token) {
      return NextResponse.json({ error: result.error || 'Demo login failed' }, { status: result.status || 400 });
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
    console.error('Demo login error:', error);
    return NextResponse.json({ error: 'Internal server error during demo login' }, { status: 500 });
  }
}
