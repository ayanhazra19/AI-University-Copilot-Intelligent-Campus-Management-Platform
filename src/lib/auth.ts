import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { prisma } from './prisma';

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.trim() === '') {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        '[FATAL SECURITY ERROR] JWT_SECRET environment variable is missing in production. Application will not start without a secure secret.'
      );
    }
    console.warn(
      '[SECURITY WARNING] JWT_SECRET is unset. Using temporary development secret. Set JWT_SECRET in .env for production.'
    );
    return 'campusiq_dev_only_jwt_secret_token_insecure_do_not_use_in_prod';
  }
  return secret;
}

export interface UserTokenPayload {
  id: string;
  email: string;
  role: 'STUDENT' | 'FACULTY' | 'ADMIN';
  name: string;
}

export function signToken(payload: UserTokenPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '7d' });
}

export function verifyToken(token: string): UserTokenPayload | null {
  try {
    return jwt.verify(token, getJwtSecret()) as UserTokenPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('campusiq_token')?.value;
    if (!token) return null;

    const payload = verifyToken(token);
    if (!payload) return null;

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      include: {
        student: true,
        faculty: true,
      },
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as 'STUDENT' | 'FACULTY' | 'ADMIN',
      department: user.department,
      avatar: user.avatar,
      student: user.student,
      faculty: user.faculty,
    };
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
}
